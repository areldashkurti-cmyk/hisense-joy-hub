
CREATE TABLE public.bonus_invitation_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  amount NUMERIC NOT NULL DEFAULT 100,
  note TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  redeemed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  redeemed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.bonus_invitation_codes TO authenticated;
GRANT ALL ON public.bonus_invitation_codes TO service_role;

ALTER TABLE public.bonus_invitation_codes ENABLE ROW LEVEL SECURITY;

-- Admins: full access
CREATE POLICY "Admins manage bonus codes"
  ON public.bonus_invitation_codes
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Contractors: may read only rows they have already redeemed (for confirmation display)
CREATE POLICY "Users see their redeemed codes"
  ON public.bonus_invitation_codes
  FOR SELECT
  TO authenticated
  USING (redeemed_by = auth.uid());

CREATE TRIGGER trg_bonus_invitation_codes_updated_at
  BEFORE UPDATE ON public.bonus_invitation_codes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Redemption function: validates the code and atomically marks it redeemed +
-- inserts a registration_bonuses row for the caller. SECURITY DEFINER so
-- contractors don't need broad SELECT on the codes table.
CREATE OR REPLACE FUNCTION public.redeem_bonus_code(_code TEXT)
RETURNS TABLE(amount NUMERIC)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid UUID := auth.uid();
  _row public.bonus_invitation_codes%ROWTYPE;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
  END IF;

  SELECT * INTO _row
  FROM public.bonus_invitation_codes
  WHERE upper(code) = upper(trim(_code))
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid invitation code' USING ERRCODE = 'P0002';
  END IF;

  IF _row.redeemed_by IS NOT NULL THEN
    RAISE EXCEPTION 'This code has already been redeemed' USING ERRCODE = 'P0001';
  END IF;

  IF EXISTS (SELECT 1 FROM public.registration_bonuses WHERE user_id = _uid) THEN
    RAISE EXCEPTION 'You have already claimed a sign-on bonus' USING ERRCODE = 'P0001';
  END IF;

  UPDATE public.bonus_invitation_codes
     SET redeemed_by = _uid, redeemed_at = now()
   WHERE id = _row.id;

  INSERT INTO public.registration_bonuses (user_id, amount, acknowledged)
  VALUES (_uid, _row.amount, true);

  RETURN QUERY SELECT _row.amount;
END;
$$;

REVOKE ALL ON FUNCTION public.redeem_bonus_code(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.redeem_bonus_code(TEXT) TO authenticated;
