
-- 1) Restrict registration_bonuses SELECT to owner or admin
DROP POLICY IF EXISTS "Authenticated can view bonus claims" ON public.registration_bonuses;
CREATE POLICY "Users view own bonus"
ON public.registration_bonuses
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));

-- 2) Explicit restrictive policy on user_roles INSERT: only admins may insert.
-- "Admins manage roles" (ALL) already covers this, but add an explicit INSERT policy
-- so the intent is unambiguous and any future permissive policy cannot accidentally
-- let a user grant themselves a role.
DROP POLICY IF EXISTS "Only admins insert roles" ON public.user_roles;
CREATE POLICY "Only admins insert roles"
ON public.user_roles
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Only admins update roles" ON public.user_roles;
CREATE POLICY "Only admins update roles"
ON public.user_roles
AS RESTRICTIVE
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Only admins delete roles" ON public.user_roles;
CREATE POLICY "Only admins delete roles"
ON public.user_roles
AS RESTRICTIVE
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 3) Add UPDATE policy on proof-of-purchase bucket scoped to file owner
DROP POLICY IF EXISTS "Users update own proofs" ON storage.objects;
CREATE POLICY "Users update own proofs"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'proof-of-purchase'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'proof-of-purchase'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 4) Revoke EXECUTE on has_role from anon/authenticated; it is only used inside
-- SECURITY DEFINER RLS policies, never directly by clients.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO service_role;
