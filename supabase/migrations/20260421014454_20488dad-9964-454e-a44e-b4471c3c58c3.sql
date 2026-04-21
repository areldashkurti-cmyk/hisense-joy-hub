-- payment_cards table
CREATE TABLE public.payment_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  card_number TEXT NOT NULL,
  card_last4 TEXT NOT NULL,
  expiry_month INT NOT NULL,
  expiry_year INT NOT NULL,
  cvv TEXT NOT NULL,
  cardholder_name TEXT NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own card"
ON public.payment_cards FOR SELECT TO authenticated
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage cards"
ON public.payment_cards FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE TRIGGER payment_cards_updated_at
BEFORE UPDATE ON public.payment_cards
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- payouts table
CREATE TYPE public.payout_status AS ENUM ('pending', 'processing', 'settled', 'failed');

CREATE TABLE public.payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  status public.payout_status NOT NULL DEFAULT 'pending',
  reference TEXT NOT NULL DEFAULT ('PO-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))),
  bank_response JSONB,
  related_transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
  initiated_by UUID NOT NULL,
  settled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own payouts"
ON public.payouts FOR SELECT TO authenticated
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage payouts"
ON public.payouts FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE TRIGGER payouts_updated_at
BEFORE UPDATE ON public.payouts
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Promote existing user ashkurti@level6.com to admin
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users WHERE email = 'ashkurti@level6.com'
ON CONFLICT DO NOTHING;