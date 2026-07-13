
-- 1. Drop sensitive PAN/CVV columns from payment_cards
ALTER TABLE public.payment_cards
  DROP COLUMN IF EXISTS card_number,
  DROP COLUMN IF EXISTS cvv;

-- 2. Restrict EXECUTE on SECURITY DEFINER functions
REVOKE ALL ON FUNCTION public.redeem_bonus_code(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.redeem_bonus_code(text) TO authenticated;

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
