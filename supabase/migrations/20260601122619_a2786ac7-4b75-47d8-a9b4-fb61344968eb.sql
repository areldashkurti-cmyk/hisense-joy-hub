CREATE TABLE public.registration_bonuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  amount numeric NOT NULL DEFAULT 100,
  acknowledged boolean NOT NULL DEFAULT true,
  claimed_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.registration_bonuses TO authenticated;
GRANT ALL ON public.registration_bonuses TO service_role;

ALTER TABLE public.registration_bonuses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view bonus claims"
ON public.registration_bonuses
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Users insert own bonus"
ON public.registration_bonuses
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins manage bonuses"
ON public.registration_bonuses
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
