-- Replace existing distributor list with the new official set
DELETE FROM public.distributors;

INSERT INTO public.distributors (code, name, active) VALUES
  ('20143098JS', 'Distributor 20143098JS', true),
  ('581392AS',   'Distributor 581392AS',   true),
  ('514990CR',   'Distributor 514990CR',   true),
  ('518143PL',   'Distributor 518143PL',   true),
  ('514992PO',   'Distributor 514992PO',   true),
  ('518163CF',   'Distributor 518163CF',   true),
  ('518444DA',   'Distributor 518444DA',   true),
  ('514797RS',   'Distributor 514797RS',   true),
  ('518731VI',   'Distributor 518731VI',   true),
  ('515218BA',   'Distributor 515218BA',   true);
