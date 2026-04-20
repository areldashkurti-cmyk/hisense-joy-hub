-- =========================================================
-- ENUMS
-- =========================================================
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'contractor');
CREATE TYPE public.claim_status AS ENUM ('pending', 'approved', 'denied', 'paid');
CREATE TYPE public.transaction_type AS ENUM ('credit', 'debit');
CREATE TYPE public.ticket_status AS ENUM ('open', 'in_progress', 'closed');

-- =========================================================
-- DISTRIBUTORS
-- =========================================================
CREATE TABLE public.distributors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================================
-- PROFILES
-- =========================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  distributor_id UUID REFERENCES public.distributors(id) ON DELETE SET NULL,
  street TEXT,
  apt TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'US',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================================
-- USER ROLES (separate table — never on profiles)
-- =========================================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Security-definer role check (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- =========================================================
-- CLAIMS
-- =========================================================
CREATE TABLE public.claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sale_date DATE NOT NULL,
  customer_name TEXT NOT NULL,
  model_number TEXT NOT NULL,
  serial_number TEXT NOT NULL,
  proof_path TEXT,
  status public.claim_status NOT NULL DEFAULT 'pending',
  payout_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  notes TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  decided_at TIMESTAMPTZ
);

CREATE INDEX claims_user_id_idx ON public.claims(user_id);
CREATE INDEX claims_status_idx ON public.claims(status);

-- =========================================================
-- TRANSACTIONS (virtual card ledger)
-- =========================================================
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type public.transaction_type NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  description TEXT NOT NULL,
  related_claim_id UUID REFERENCES public.claims(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX transactions_user_id_idx ON public.transactions(user_id);

-- =========================================================
-- PROMOTIONS
-- =========================================================
CREATE TABLE public.promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  incentive_amount NUMERIC(10,2) NOT NULL,
  starts_at DATE NOT NULL,
  ends_at DATE NOT NULL,
  eligibility TEXT,
  image_url TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================================
-- NEWS POSTS
-- =========================================================
CREATE TABLE public.news_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  body TEXT,
  image_url TEXT,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_banner BOOLEAN NOT NULL DEFAULT false
);

-- =========================================================
-- SUPPORT TICKETS
-- =========================================================
CREATE TABLE public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status public.ticket_status NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================================
-- ENABLE RLS
-- =========================================================
ALTER TABLE public.distributors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- RLS POLICIES
-- =========================================================

-- Distributors: any signed-in user can read; only admins can mutate
CREATE POLICY "Authenticated can view distributors"
  ON public.distributors FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins manage distributors"
  ON public.distributors FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Profiles: own profile only (admins see all)
CREATE POLICY "Users view own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users insert own profile"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- User roles: users can view their own roles; only admins can mutate
CREATE POLICY "Users view own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Claims: own claims only
CREATE POLICY "Users view own claims"
  ON public.claims FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users insert own claims"
  ON public.claims FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins update claims"
  ON public.claims FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Transactions: read-only to owner; admins manage
CREATE POLICY "Users view own transactions"
  ON public.transactions FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage transactions"
  ON public.transactions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Promotions: any signed-in can view active; admins manage
CREATE POLICY "Authenticated can view promotions"
  ON public.promotions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins manage promotions"
  ON public.promotions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- News posts: any signed-in can view; admins manage
CREATE POLICY "Authenticated can view news"
  ON public.news_posts FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins manage news"
  ON public.news_posts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Support tickets: own only; admins see all
CREATE POLICY "Users view own tickets"
  ON public.support_tickets FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users create own tickets"
  ON public.support_tickets FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins update tickets"
  ON public.support_tickets FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========================================================
-- updated_at trigger for profiles
-- =========================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- Auto-create profile + contractor role on signup
-- =========================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _distributor_id UUID;
  _distributor_code TEXT;
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

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================
-- STORAGE BUCKET for proof of purchase (private)
-- =========================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('proof-of-purchase', 'proof-of-purchase', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users upload to own folder"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'proof-of-purchase'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users read own proofs"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'proof-of-purchase'
    AND ((storage.foldername(name))[1] = auth.uid()::text OR public.has_role(auth.uid(), 'admin'))
  );

CREATE POLICY "Users delete own proofs"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'proof-of-purchase'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
