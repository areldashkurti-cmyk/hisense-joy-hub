CREATE TABLE public.distributor_promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  distributor_scope text NOT NULL DEFAULT 'all' CHECK (distributor_scope IN ('all','selected')),
  extra_amount numeric NOT NULL CHECK (extra_amount > 0),
  start_date date NOT NULL,
  end_date date NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT distributor_promotions_dates CHECK (end_date >= start_date)
);
CREATE TABLE public.distributor_promotion_products (
  promotion_id uuid NOT NULL REFERENCES public.distributor_promotions(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  PRIMARY KEY (promotion_id, product_id)
);
CREATE TABLE public.distributor_promotion_distributors (
  promotion_id uuid NOT NULL REFERENCES public.distributor_promotions(id) ON DELETE CASCADE,
  distributor_id uuid NOT NULL REFERENCES public.distributors(id) ON DELETE CASCADE,
  PRIMARY KEY (promotion_id, distributor_id)
);
CREATE TABLE public.distributor_promotion_dealers (
  promotion_id uuid NOT NULL REFERENCES public.distributor_promotions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  PRIMARY KEY (promotion_id, user_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.distributor_promotions, public.distributor_promotion_products, public.distributor_promotion_distributors, public.distributor_promotion_dealers TO authenticated;
GRANT ALL ON public.distributor_promotions, public.distributor_promotion_products, public.distributor_promotion_distributors, public.distributor_promotion_dealers TO service_role;

ALTER TABLE public.distributor_promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.distributor_promotion_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.distributor_promotion_distributors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.distributor_promotion_dealers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage distributor promotions" ON public.distributor_promotions FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));
CREATE POLICY "Admins manage promo products" ON public.distributor_promotion_products FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));
CREATE POLICY "Admins manage promo distributors" ON public.distributor_promotion_distributors FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));
CREATE POLICY "Admins manage promo dealers" ON public.distributor_promotion_dealers FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));

CREATE TRIGGER distributor_promotions_updated_at BEFORE UPDATE ON public.distributor_promotions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.claims
  ADD COLUMN standard_amount numeric,
  ADD COLUMN promotion_id uuid REFERENCES public.distributor_promotions(id) ON DELETE SET NULL,
  ADD COLUMN extra_amount numeric NOT NULL DEFAULT 0,
  ADD COLUMN total_amount numeric,
  ADD COLUMN promotion_name text;

UPDATE public.claims SET standard_amount = payout_amount, total_amount = payout_amount WHERE standard_amount IS NULL;

-- All promotions a user is eligible for on a given date (single source of eligibility truth)
CREATE OR REPLACE FUNCTION public.eligible_promotions(_user_id uuid, _on date)
RETURNS TABLE(promotion_id uuid, product_id uuid, name text, extra_amount numeric, end_date date)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT dp.id, pp.product_id, dp.name, dp.extra_amount, dp.end_date
  FROM public.distributor_promotions dp
  JOIN public.distributor_promotion_products pp ON pp.promotion_id = dp.id
  JOIN public.profiles pr ON pr.id = _user_id
  WHERE dp.active
    AND _on BETWEEN dp.start_date AND dp.end_date
    AND (dp.distributor_scope = 'all'
         OR EXISTS (SELECT 1 FROM public.distributor_promotion_distributors d
                    WHERE d.promotion_id = dp.id AND d.distributor_id = pr.distributor_id))
    AND (NOT EXISTS (SELECT 1 FROM public.distributor_promotion_dealers x WHERE x.promotion_id = dp.id)
         OR EXISTS (SELECT 1 FROM public.distributor_promotion_dealers x WHERE x.promotion_id = dp.id AND x.user_id = _user_id))
$$;

-- Stacking rule lives here: currently "highest extra amount wins"
CREATE OR REPLACE FUNCTION public.best_promotion_for(_user_id uuid, _product_id uuid, _on date)
RETURNS TABLE(promotion_id uuid, name text, extra_amount numeric)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT e.promotion_id, e.name, e.extra_amount
  FROM public.eligible_promotions(_user_id, _on) e
  WHERE e.product_id = _product_id
  ORDER BY e.extra_amount DESC, e.end_date ASC
  LIMIT 1
$$;

-- What the signed-in user may see today
CREATE OR REPLACE FUNCTION public.get_my_promotions()
RETURNS TABLE(promotion_id uuid, product_id uuid, model_number text, series text, name text, extra_amount numeric, end_date date)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT DISTINCT ON (e.product_id) e.promotion_id, e.product_id, p.model_number, p.series, e.name, e.extra_amount, e.end_date
  FROM public.eligible_promotions(auth.uid(), current_date) e
  JOIN public.products p ON p.id = e.product_id AND p.active
  WHERE auth.uid() IS NOT NULL
  ORDER BY e.product_id, e.extra_amount DESC, e.end_date ASC
$$;

REVOKE EXECUTE ON FUNCTION public.eligible_promotions(uuid, date) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.best_promotion_for(uuid, uuid, date) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_my_promotions() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_promotions() TO authenticated;

CREATE OR REPLACE FUNCTION public.enforce_claim_payout_amount()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
DECLARE
  v_rate numeric;
  v_pid uuid;
  v_promo record;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF public.has_role(auth.uid(), 'admin'::app_role) THEN
      RETURN NEW;
    END IF;
    NEW.payout_amount := OLD.payout_amount;
    NEW.standard_amount := OLD.standard_amount;
    NEW.extra_amount := OLD.extra_amount;
    NEW.total_amount := OLD.total_amount;
    NEW.promotion_id := OLD.promotion_id;
    NEW.promotion_name := OLD.promotion_name;
    RETURN NEW;
  END IF;

  IF public.has_role(auth.uid(), 'admin'::app_role) THEN
    NEW.standard_amount := coalesce(NEW.standard_amount, NEW.payout_amount);
    NEW.total_amount := coalesce(NEW.total_amount, NEW.payout_amount);
    RETURN NEW;
  END IF;

  SELECT p.id, p.payout_rate INTO v_pid, v_rate
  FROM public.products p
  WHERE p.active
    AND (
      (NEW.product_id IS NOT NULL AND p.id = NEW.product_id)
      OR upper(trim(p.model_number)) = upper(trim(NEW.model_number))
      OR upper(trim(coalesce(p.compatible_model, ''))) = upper(trim(NEW.model_number))
    )
  ORDER BY (NEW.product_id IS NOT NULL AND p.id = NEW.product_id) DESC
  LIMIT 1;

  NEW.standard_amount := coalesce(v_rate, 0);
  NEW.promotion_id := NULL;
  NEW.promotion_name := NULL;
  NEW.extra_amount := 0;

  IF v_pid IS NOT NULL THEN
    SELECT * INTO v_promo FROM public.best_promotion_for(NEW.user_id, v_pid, NEW.sale_date);
    IF FOUND THEN
      NEW.promotion_id := v_promo.promotion_id;
      NEW.promotion_name := v_promo.name;
      NEW.extra_amount := v_promo.extra_amount;
    END IF;
  END IF;

  NEW.total_amount := NEW.standard_amount + NEW.extra_amount;
  NEW.payout_amount := NEW.total_amount;
  RETURN NEW;
END;
$function$;