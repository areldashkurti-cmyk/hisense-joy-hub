
CREATE OR REPLACE FUNCTION public.enforce_claim_payout_amount()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rate numeric;
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.payout_amount IS DISTINCT FROM OLD.payout_amount THEN
    IF public.has_role(auth.uid(), 'admin'::app_role) THEN
      RETURN NEW;
    END IF;
    NEW.payout_amount := OLD.payout_amount;
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF public.has_role(auth.uid(), 'admin'::app_role) THEN
      RETURN NEW;
    END IF;

    SELECT p.payout_rate INTO v_rate
    FROM public.products p
    WHERE p.active
      AND (
        (NEW.product_id IS NOT NULL AND p.id = NEW.product_id)
        OR upper(trim(p.model_number)) = upper(trim(NEW.model_number))
        OR upper(trim(coalesce(p.compatible_model, ''))) = upper(trim(NEW.model_number))
      )
    ORDER BY (NEW.product_id IS NOT NULL AND p.id = NEW.product_id) DESC
    LIMIT 1;

    NEW.payout_amount := coalesce(v_rate, 0);
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.enforce_claim_payout_amount() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS enforce_claim_payout_amount_trg ON public.claims;
CREATE TRIGGER enforce_claim_payout_amount_trg
BEFORE INSERT OR UPDATE ON public.claims
FOR EACH ROW EXECUTE FUNCTION public.enforce_claim_payout_amount();

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
