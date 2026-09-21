CREATE TABLE public.event_attendees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name text NOT NULL DEFAULT 'Sep 24 Event',
  first_name text,
  last_name text,
  email text NOT NULL,
  bonus_amount numeric NOT NULL DEFAULT 50,
  credited_user_id uuid,
  credited_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX event_attendees_email_key ON public.event_attendees (lower(email));

GRANT SELECT ON public.event_attendees TO authenticated;
GRANT ALL ON public.event_attendees TO service_role;

ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage event attendees" ON public.event_attendees
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users view own attendee record" ON public.event_attendees
  FOR SELECT TO authenticated
  USING (credited_user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _distributor_id UUID;
  _distributor_code TEXT;
  _attendee public.event_attendees%ROWTYPE;
BEGIN
  _distributor_code := NEW.raw_user_meta_data ->> 'distributor_code';

  IF _distributor_code IS NOT NULL AND length(_distributor_code) > 0 THEN
    SELECT id INTO _distributor_id
    FROM public.distributors
    WHERE upper(code) = upper(_distributor_code) AND active = true
    LIMIT 1;
  END IF;

  INSERT INTO public.profiles (
    id, first_name, last_name, email, phone, distributor_id,
    street, apt, city, state, postal_code, country
  ) VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    NEW.email,
    NEW.raw_user_meta_data ->> 'phone',
    _distributor_id,
    NEW.raw_user_meta_data ->> 'street',
    NEW.raw_user_meta_data ->> 'apt',
    NEW.raw_user_meta_data ->> 'city',
    NEW.raw_user_meta_data ->> 'state',
    NEW.raw_user_meta_data ->> 'postal_code',
    COALESCE(NEW.raw_user_meta_data ->> 'country', 'US')
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'contractor')
  ON CONFLICT DO NOTHING;

  -- Automatic event registration bonus
  IF NEW.email IS NOT NULL THEN
    UPDATE public.event_attendees a
       SET credited_user_id = NEW.id, credited_at = now()
     WHERE lower(a.email) = lower(NEW.email)
       AND a.credited_user_id IS NULL
    RETURNING * INTO _attendee;

    IF FOUND AND _attendee.bonus_amount > 0 THEN
      INSERT INTO public.transactions (user_id, type, amount, description)
      VALUES (NEW.id, 'credit', _attendee.bonus_amount,
              _attendee.event_name || ' registration bonus');
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;