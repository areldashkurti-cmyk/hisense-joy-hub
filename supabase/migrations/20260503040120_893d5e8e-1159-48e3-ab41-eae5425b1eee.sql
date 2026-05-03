-- Products lookup table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  series TEXT NOT NULL,
  category TEXT,
  size TEXT,
  model_number TEXT NOT NULL,
  compatible_model TEXT,
  product_type TEXT,
  ddp_list NUMERIC,
  payout_rate NUMERIC,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_products_series ON public.products(series);
CREATE INDEX idx_products_model ON public.products(model_number);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view active products"
  ON public.products FOR SELECT
  TO authenticated
  USING (active = true OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anon can view active products"
  ON public.products FOR SELECT
  TO anon
  USING (active = true);

CREATE POLICY "Admins manage products"
  ON public.products FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER products_set_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Claim validation columns
DO $$ BEGIN
  CREATE TYPE public.validation_status AS ENUM ('not_run','passed','flagged','failed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.claims
  ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES public.products(id),
  ADD COLUMN IF NOT EXISTS validation_status public.validation_status NOT NULL DEFAULT 'not_run',
  ADD COLUMN IF NOT EXISTS validation_details JSONB,
  ADD COLUMN IF NOT EXISTS invoice_date DATE,
  ADD COLUMN IF NOT EXISTS invoice_dealer TEXT;

-- Seed products
INSERT INTO public.products (series, category, size, model_number, compatible_model, product_type, ddp_list, payout_rate) VALUES
('Hi Pro HD', 'Air Handler Unit', '24k BTU', 'AHU-24U3T24', 'AUH-2424', 'Heat Pump', 1918.0, 25.0),
('Hi Pro HD', 'Side Discharge ODU', '24k BTU', 'AOH-24U3T24P', 'AUWR-2424P', 'Heat Pump', 2082.0, 25.0),
('Hi Pro HD', 'Air Handler Unit', '36k BTU', 'AHU-36U3T24', 'AUH-3624', 'Heat Pump', 1973.0, 25.0),
('Hi Pro HD', 'Side Discharge ODU', '36k BTU', 'AOH-36U3T24P', 'AUWR-3624P', 'Heat Pump', 3132.0, 40.0),
('Hi Pro HD', 'Air Handler Unit', '48k BTU', 'AHU-48U3T24', 'AUH-4824', 'Heat Pump', 2094.0, 25.0),
('Hi Pro HD', 'Side Discharge ODU', '48k BTU', 'AOH-48U3T24P', 'AUWR-4824P', 'Heat Pump', 4686.0, 60.0),
('Hi Pro HD', 'Air Handler Unit', '60k BTU', 'AHU-60U3T24', 'AUH-6024', 'Heat Pump', 2250.0, 25.0),
('Hi Pro HD', 'Side Discharge ODU', '60k BTU', 'AOH-60U3T24P', 'AUWR-6024P', 'Heat Pump', 4835.0, 60.0),
('Hi Ultra HD', 'Air Handler Unit', '24k BTU', 'AHU-24U3T24', 'AUH-2424', 'Heat Pump', 1918.0, 20.0),
('Hi Ultra HD', 'Side Discharge ODU', '24k BTU', 'AOH-24U3T25U', NULL, 'Heat Pump', 1783.0, 20.0),
('Hi Ultra HD', 'Air Handler Unit', '36k BTU', 'AHU-36U3T24', 'AUH-3624', 'Heat Pump', 1973.0, 25.0),
('Hi Ultra HD', 'Side Discharge ODU', '36k BTU', 'AOH-36U3T25U', NULL, 'Heat Pump', 2640.0, 30.0),
('Hi Ultra HD', 'Air Handler Unit', '48k BTU', 'AHU-48U3T24', 'AUH-4824', 'Heat Pump', 2094.0, 25.0),
('Hi Ultra HD', 'Side Discharge ODU', '48k BTU', 'AOH-48U3T25U', NULL, 'Heat Pump', 3973.0, 50.0),
('Hi Ultra HD', 'Air Handler Unit', '60k BTU', 'AHU-60U3T24', 'AUH-6024', 'Heat Pump', 2250.0, 25.0),
('Hi Ultra HD', 'Side Discharge ODU', '60k BTU', 'AOH-60U3T25U', NULL, 'Heat Pump', 4081.0, 50.0),
('Hi Edge HD', 'Air Handler Unit', '18k BTU', 'AH-18U3R25E', NULL, 'Heat Pump', 1665.0, 20.0),
('Hi Edge HD', 'Side Discharge ODU', '18k BTU', 'AOH-18U3R25E', NULL, 'Heat Pump', 1477.0, 15.0),
('Hi Edge HD', 'Air Handler Unit', '24k BTU', 'AH-24U3R25E', NULL, 'Heat Pump', 1674.0, 20.0),
('Hi Edge HD', 'Side Discharge ODU', '24k BTU', 'AOH-24U3R25E', NULL, 'Heat Pump', 1499.0, 15.0),
('Hi Edge HD', 'Air Handler Unit', '30k BTU', 'AH-30U3R25E', NULL, 'Heat Pump', 1715.0, 20.0),
('Hi Edge HD', 'Side Discharge ODU', '30k BTU', 'AOH-30U3R25E', NULL, 'Heat Pump', 1824.0, 20.0),
('Hi Edge HD', 'Air Handler Unit', '36k BTU', 'AH-36U3R25E', NULL, 'Heat Pump', 1717.0, 20.0),
('Hi Edge HD', 'Side Discharge ODU', '36k BTU', 'AOH-36U3R25E', NULL, 'Heat Pump', 2255.0, 25.0),
('Hi Edge HD', 'Air Handler Unit', '48k BTU', 'AH-48U3R25E', NULL, 'Heat Pump', 1845.0, 20.0),
('Hi Edge HD', 'Side Discharge ODU', '48k BTU', 'AOH-48U3R25E', NULL, 'Heat Pump', 3327.0, 40.0),
('Hi Edge HD', 'Air Handler Unit', '60k BTU', 'AH-60U3R25E', NULL, 'Heat Pump', 1940.0, 20.0),
('Hi Edge HD', 'Side Discharge ODU', '60k BTU', 'AOH-60U3R25E', NULL, 'Heat Pump', 3541.0, 45.0),
('SmartSense HD', 'Air Handler Unit', '18k BTU', 'AH-18U3R26SS', NULL, 'Heat Pump', 1402.0, NULL),
('SmartSense HD', 'Side Discharge ODU', '18k BTU', 'AOH-18U3R26SS', NULL, 'Heat Pump', 1304.0, NULL),
('SmartSense HD', 'Air Handler Unit', '24k BTU', 'AH-24U3R26SS', NULL, 'Heat Pump', 1413.0, NULL),
('SmartSense HD', 'Side Discharge ODU', '24k BTU', 'AOH-24U3R26SS', NULL, 'Heat Pump', 1346.0, NULL),
('SmartSense HD', 'Air Handler Unit', '30k BTU', 'AH-30U3R26SS', NULL, 'Heat Pump', 1440.0, NULL),
('SmartSense HD', 'Side Discharge ODU', '30k BTU', 'AOH-30U3R26SS', NULL, 'Heat Pump', 1592.0, NULL),
('SmartSense HD', 'Air Handler Unit', '36k BTU', 'AH-36U3R26SS', NULL, 'Heat Pump', 1482.0, NULL),
('SmartSense HD', 'Side Discharge ODU', '36k BTU', 'AOH-36U3R26SS', NULL, 'Heat Pump', 1942.0, NULL),
('SmartSense HD', 'Air Handler Unit', '48k BTU', 'AH-48U3R26SS', NULL, 'Heat Pump', 1584.0, NULL),
('SmartSense HD', 'Side Discharge ODU', '48k BTU', 'AOH-48U3R26SS', NULL, 'Heat Pump', 3064.0, NULL),
('SmartSense HD', 'Air Handler Unit', '60k BTU', 'AH-60U3R26SS', NULL, 'Heat Pump', 1669.0, NULL),
('SmartSense HD', 'Side Discharge ODU', '60k BTU', 'AOH-60U3R26SS', NULL, 'Heat Pump', 3220.0, NULL),
('Hi Pro', 'Wall Mounted IDU', '9k BTU', 'AS-09U3THE25P', NULL, 'Heat Pump', 537.0, 10.0),
('Hi Pro', 'Wall Mounted ODU', '9k BTU', 'AO-09U3T25P', NULL, 'Heat Pump', 1617.0, 15.0),
('Hi Pro', 'Wall Mounted IDU', '12k BTU', 'AS-12U3THE25P', NULL, 'Heat Pump', 544.0, 10.0),
('Hi Pro', 'Wall Mounted ODU', '12k BTU', 'AO-12U3T25P', NULL, 'Heat Pump', 1639.0, 15.0),
('Hi Pro', 'Wall Mounted IDU', '15k BTU', 'AS-15U3THE25P', NULL, 'Heat Pump', 648.0, 10.0),
('Hi Pro', 'Wall Mounted ODU', '15k BTU', 'AO-15U3T25P', NULL, 'Heat Pump', 1925.0, 15.0),
('Hi Ultra', 'Wall Mounted IDU-Old DL Series', NULL, 'AST-0924DLSI', NULL, 'Heat Pump', 377.0, 5.0),
('Hi Ultra', 'Wall Mounted ODU-Old DL Series', NULL, 'AST-0924TXO', NULL, 'Heat Pump', 1014.0, 15.0),
('Hi Ultra', 'Wall Mounted IDU-Old DL Series', NULL, 'AST-1224DLSI', NULL, 'Heat Pump', 384.0, 5.0),
('Hi Ultra', 'Wall Mounted ODU-Old DL Series', NULL, 'AST-1224TUO', NULL, 'Heat Pump', 1024.0, 15.0),
('Hi Ultra', 'Wall Mounted IDU-Old DL Series', NULL, 'AST-1824DLSI', NULL, 'Heat Pump', 536.0, 10.0),
('Hi Ultra', 'Wall Mounted ODU-Old DL Series', NULL, 'AST-1824TXO', NULL, 'Heat Pump', 1392.0, 20.0),
('Hi Ultra', 'Wall Mounted IDU-Old DL Series', NULL, 'AST-2424DLSI', NULL, 'Heat Pump', 618.0, 10.0),
('Hi Ultra', 'Wall Mounted ODU-Old DL Series', NULL, 'AST-2424TUO', NULL, 'Heat Pump', 1839.0, 25.0),
('Hi Ultra/Hi Multi/Hi UNI', 'Wall Mounted IDU-Black Panel', '9k BTU', 'ASU-09U3THB25U-B', NULL, 'Heat Pump', 424.0, 5.0),
('Hi Ultra/Hi Multi/Hi UNI', 'Wall Mounted IDU', '9k BTU', 'ASU-09U3THB25U', NULL, 'Heat Pump', 403.0, 5.0),
('Hi Ultra', 'Wall Mounted ODU', '9k BTU', 'AO-09U3T25U', NULL, 'Heat Pump', 1087.0, 15.0),
('Hi Ultra/Hi Multi/Hi UNI', 'Wall Mounted IDU-Black Panel', '12k BTU', 'ASU-12U3THB25U-B', NULL, 'Heat Pump', 432.0, 5.0),
('Hi Ultra/Hi Multi/Hi UNI', 'Wall Mounted IDU', '12k BTU', 'ASU-12U3THB25U', NULL, 'Heat Pump', 411.0, 5.0),
('Hi Ultra', 'Wall Mounted ODU', '12k BTU', 'AO-12U3T25U', NULL, 'Heat Pump', 1096.0, 15.0),
('Hi Ultra/Hi Multi/Hi UNI', 'Wall Mounted IDU-Black Panel', '18k BTU', 'ASU-18U3THB25U-B', NULL, 'Heat Pump', 595.0, 10.0),
('Hi Ultra/Hi Multi/Hi UNI', 'Wall Mounted IDU', '18k BTU', 'ASU-18U3THB25U', NULL, 'Heat Pump', 573.0, 10.0),
('Hi Ultra', 'Wall Mounted ODU', '18k BTU', 'AO-18U3T25U', NULL, 'Heat Pump', 1488.0, 20.0),
('Hi Ultra/Hi Multi/Hi UNI', 'Wall Mounted IDU-Black Panel', '24k BTU', 'ASU-24U3THB25U-B', NULL, 'Heat Pump', 682.0, 10.0),
('Hi Ultra/Hi Multi/Hi UNI', 'Wall Mounted IDU', '24k BTU', 'ASU-24U3THB25U', NULL, 'Heat Pump', 660.0, 10.0),
('Hi Ultra', 'Wall Mounted ODU', '24k BTU', 'AO-24U3T25U', NULL, 'Heat Pump', 1966.0, 25.0),
('Hi Edge', 'Wall Mounted IDU', '9k BTU', 'AS-09U3RHB25E', NULL, 'Heat Pump', 330.0, 5.0),
('Hi Edge', 'Wall Mounted ODU', '9k BTU', 'AO-09U3R25E', NULL, 'Heat Pump', 850.0, 10.0),
('Hi Edge', 'Wall Mounted IDU', '12k BTU', 'AS-12U3RHB25E', NULL, 'Heat Pump', 332.0, 5.0),
('Hi Edge', 'Wall Mounted ODU', '12k BTU', 'AO-12U3R25E', NULL, 'Heat Pump', 870.0, 10.0),
('Hi Edge', 'Wall Mounted IDU', '18k BTU', 'AS-18U3RHB25E', NULL, 'Heat Pump', 491.0, 10.0),
('Hi Edge', 'Wall Mounted ODU', '18k BTU', 'AO-18U3R25E', NULL, 'Heat Pump', 1190.0, 15.0),
('Hi Edge', 'Wall Mounted IDU', '24k BTU', 'AS-24U3RHB25E', NULL, 'Heat Pump', 526.0, 10.0),
('Hi Edge', 'Wall Mounted ODU', '24k BTU', 'AO-24U3R25E', NULL, 'Heat Pump', 1573.0, 15.0),
('Hi Edge', 'Wall Mounted IDU', '30k BTU', 'AS-30U3RHB25E', NULL, 'Heat Pump', 835.0, 15.0),
('Hi Edge', 'Wall Mounted ODU', '30k BTU', 'AO-30U3R25E', NULL, 'Heat Pump', 1655.0, 20.0),
('Hi Edge', 'Wall Mounted IDU', '36k BTU', 'AS-36U3RHB25E', NULL, 'Heat Pump', 894.0, 15.0),
('Hi Edge', 'Wall Mounted ODU', '36k BTU', 'AO-36U3R25E', NULL, 'Heat Pump', 1809.0, 25.0),
('Hi Multi', 'Multi ODU', '18k BTU', 'AMO2-18U3T25U', NULL, 'Heat Pump', 1790.0, 25.0),
('Hi Multi', 'Multi ODU', '27k BTU', 'AMO3-27U3T25U', NULL, 'Heat Pump', 2768.0, 35.0),
('Hi Multi', 'Multi ODU', '36k BTU', 'AMO4-36U3T25U', NULL, 'Heat Pump', 2934.0, 40.0),
('Hi Multi', 'Multi ODU', '45k BTU', 'AMO5-45U3T25U', NULL, 'Heat Pump', 3500.0, 45.0),
('Hi UNI', 'UNI ODU', '18k BTU', 'AOU-18U3T25U', NULL, 'Heat Pump', 1620.0, 25.0),
('Hi UNI', 'UNI ODU', '24k BTU', 'AOU-24U3T25U', NULL, 'Heat Pump', 1955.0, 25.0),
('Hi UNI', 'UNI ODU', '30k BTU', 'AOU-30U3T25U', NULL, 'Heat Pump', 2440.0, 35.0),
('Hi UNI', 'UNI ODU', '36k BTU', 'AOU-36U3T25U', NULL, 'Heat Pump', 2935.0, 40.0),
('Hi UNI', 'UNI ODU', '48k BTU', 'AOU-48U3T25U', NULL, 'Heat Pump', 4040.0, 55.0),
('Hi Uni', 'UNI ODU', '60k BTU', 'AOU-60U3T25U', NULL, 'Heat Pump', 4922.0, 65.0),
('Hi Multi/Hi UNI', 'Cassette Panel for 9k-12k', NULL, 'PE-QEA/LD', NULL, 'Heat Pump', 110.0, NULL),
('Hi Multi/Hi UNI', 'Cassette Panel for 18k-36k', NULL, 'PE-QFA/CD', NULL, 'Heat Pump', 133.0, NULL),
('Hi Pak', 'Packaged HP', '24k BTU', 'AR-24U3R25U', NULL, 'Heat Pump', 4288.0, NULL),
('Hi Pak', 'Packaged HP', '36k BTU', 'AR-36U3R25U', NULL, 'Heat Pump', 4384.0, NULL),
('Hi Pak', 'Entry Level Packaged HP', '48k BTU', 'AR-48U3R25E', NULL, 'Heat Pump', 4467.0, NULL),
('Hi Pak', 'Packaged HP', '48k BTU', 'AR-48U3R25U', NULL, 'Heat Pump', 9066.0, NULL),
('Hi Pak', 'Packaged HP', '60k BTU', 'AR-60U3R25U', NULL, 'Heat Pump', 9164.0, NULL),
('A2L Heat kit HD', '4.8 KW-240V (1PH/1 Step) 20.0 AMPS-4800 WATT Single Circuit', NULL, 'WTM0502BX', NULL, NULL, NULL, NULL),
('A2L Heat kit HD', '7.5 KW-240V (1PH/1 Step) 31.3 AMPS-7500 WATT Single Circuit', NULL, 'WTM0802BX', NULL, NULL, NULL, NULL),
('A2L Heat kit HD', '9.6 KW-240V (1PH/1 Step) 40.0 AMPS- 9600 WATT Single Circuit', NULL, 'WTM1002BX', NULL, NULL, NULL, NULL),
('A2L Heat kit HD', '14.4 KW-240V (1PH/2 Step) 60.0 AMPS- 14400 WATT Dual Circuit', NULL, 'WTM1502BX', NULL, NULL, NULL, NULL),
('A2L Heat kit HD', '19.2 KW-240V (1PH/2 Step) 80.0 AMPS- 19200 WATT Dual Circuit', NULL, 'WTM2002BX', NULL, NULL, NULL, NULL),
('A2L Heat kit HD', '14.4 KW-240V (1PH/2 Step) 60.0 AMPS- 14400 WATT Single Circuit', NULL, 'WTM1502SX', NULL, NULL, NULL, NULL),
('A2L Heat kit HD', '19.2 KW-240V (1PH/2 Step) 80.0 AMPS- 19200 WATT Single Circuit', NULL, 'WTM2002SX', NULL, NULL, NULL, NULL),
('A2L Heat kit for Hi Pak', '5 KW-240V-1P / 1 Stage for 2 Ton & 3 Ton & Edge 4 Ton', NULL, 'WHPU0502B SP', NULL, NULL, NULL, NULL),
('A2L Heat kit for Hi Pak', '7.5 KW-240V-1P / 1 Stage for 2 Ton & 3 Ton & Edge 4 Ton', NULL, 'WHPU0752B SP', NULL, NULL, NULL, NULL),
('A2L Heat kit for Hi Pak', '10 KW-240V-1P / 1 Stage for 2 Ton & 3 Ton & Edge 4 Ton', NULL, 'WHPU1002B SP', NULL, NULL, NULL, NULL),
('A2L Heat kit for Hi Pak', '12.5 KW-240V-1P / 2 Stage for 2 Ton & 3 Ton & Edge 4 Ton', NULL, 'WHPU1252B SP', NULL, NULL, NULL, NULL),
('A2L Heat kit for Hi Pak', '15KW-240V-1P / 2 Stage for 2 Ton & 3 Ton & Edge 4 Ton', NULL, 'WHPU1502B SP', NULL, NULL, NULL, NULL),
('A2L Heat kit for Hi Pak', '5 KW-240V-1P / 1 Stage for 4 Ton & 5 Ton', NULL, 'WHPU0502BL SP', NULL, NULL, NULL, NULL),
('A2L Heat kit for Hi Pak', '7.5 KW-240V-1P / 1 Stage for 4 Ton & 5 Ton', NULL, 'WHPU0752BL SP', NULL, NULL, NULL, NULL),
('A2L Heat kit for Hi Pak', '10 KW-240V-1P / 1 Stage for 4 Ton & 5 Ton', NULL, 'WHPU1002BL SP', NULL, NULL, NULL, NULL),
('A2L Heat kit for Hi Pak', '12.5 KW-240V-1P / 2 Stage for 4 Ton & 5 Ton', NULL, 'WHPU1252BL SP', NULL, NULL, NULL, NULL),
('A2L Heat kit for Hi Pak', '15KW-240V-1P / 2 Stage for 4 Ton & 5 Ton', NULL, 'WHPU1502BL SP', NULL, NULL, NULL, NULL),
('A2L Heat kit for Hi Pak', '20KW-240V-1P / 2 Stage for 4 Ton & 5 Ton', NULL, 'WHPU2002BL SP', NULL, NULL, NULL, NULL),
('Accessories', 'Bluetooth Error Checker', NULL, 'HI-CHECKER 3.0', NULL, NULL, NULL, NULL),
('Accessories', 'YXE-C01U1(E) WIRED Controller, Signal Receiver, connecting directly to indoor unit', NULL, 'HS-WC01U', NULL, NULL, 195.0, NULL),
('Accessories', 'YXE-C02U1(E) WIRED Controller for central Control', NULL, 'HS-WC02U', NULL, NULL, 195.0, NULL),
('Accessories', 'YJE-C01T(E),  WIRED CONTROLLER BY B544€', NULL, 'HS-WC01T', NULL, NULL, 313.0, NULL),
('Accessories', 'Communicating box used in central control system, B544(E) is the adapter of BACnet, Modbus, and Twin System', NULL, 'HS-CB544', NULL, NULL, 489.0, NULL),
('Accessories', 'Wired  Controller', NULL, 'HS-WC03', NULL, '24V Thermostat', 144.0, NULL),
('SmartSense', 'IDU', '9k BTU', 'AS-09U1RDL25SS', 'AS-09UW1RGE00', 'Heat Pump', 255.0, NULL),
('SmartSense', 'ODU', '9k BTU', 'AO-09U1R25SS', 'AS-09UW1RGEDL00', 'Heat Pump', 636.0, NULL),
('SmartSense', 'IDU', '12k BTU', 'AS-12U1RDL25SS1', 'AS-12UW1RGE00', 'Heat Pump', 265.0, NULL),
('SmartSense', 'ODU', '12k BTU', 'AO-12U1R25SS1', 'AS-12UW1RGEDL00', 'Heat Pump', 643.0, NULL),
('Only for Service', 'Air Handler Unit', '24k BTU', 'AUH-24UX3SDH2', NULL, 'Heat Pump', 1635.0, 25.0),
('Only for Service', 'Side Discharge ODU', '24k BTU', 'AUWR-24U3SF2', NULL, 'Heat Pump', 1699.0, 25.0),
('Only for Service', 'Air Handler Unit', '36k BTU', 'AUH-36UX3SDH2', NULL, 'Heat Pump', 1682.0, 25.0),
('Only for Service', 'Side Discharge ODU', '36k BTU', 'AUWR-36U3SA2', NULL, 'Heat Pump', 2247.0, 30.0),
('Only for Service', 'Air Handler Unit', '48k BTU', 'AUH-48UX3SEH2', NULL, 'Heat Pump', 1786.0, 25.0),
('Only for Service', 'Side Discharge ODU', '48k BTU', 'AUWR-48U3SP2', NULL, 'Heat Pump', 3822.0, 50.0),
('Only for Service', 'Air Handler Unit', '60k BTU', 'AUH-60UX3SEH2', NULL, 'Heat Pump', 1920.0, 25.0),
('Only for Service', 'Side Discharge ODU', '60k BTU', 'AUWR-60U3SP2', NULL, 'Heat Pump', 3943.0, 50.0),
('SmartSense 2.0', 'Wall Mounted IDU', '9k BTU', 'AS-09U3RHC26SS', NULL, 'Heat Pump', 332.0, NULL),
('SmartSense 2.0', 'Wall Mounted ODU', '9k BTU', 'AO-09U3R26SS', NULL, 'Heat Pump', 606.0, NULL),
('SmartSense 2.0', 'Wall Mounted IDU', '12k BTU', 'AS-12U3RHC26SS', NULL, 'Heat Pump', 341.0, NULL),
('SmartSense 2.0', 'Wall Mounted ODU', '12k BTU', 'AO-12U3R26SS', NULL, 'Heat Pump', 625.0, NULL),
('SmartSense 2.0', 'Wall Mounted IDU', '18k BTU', 'AS-18U3RHC26SS', NULL, 'Heat Pump', 445.0, NULL),
('SmartSense 2.0', 'Wall Mounted ODU', '18k BTU', 'AO-18U3R26SS', NULL, 'Heat Pump', 909.0, NULL),
('SmartSense 2.0', 'Wall Mounted IDU', '24k BTU', 'AS-24U3RHC26SS', NULL, 'Heat Pump', 512.0, NULL),
('SmartSense 2.0', 'Wall Mounted ODU', '24k BTU', 'AO-24U3R26SS', NULL, 'Heat Pump', 1099.0, NULL),
('SmartSense 2.0', 'Wall Mounted IDU', '9k BTU', 'AS-09U1RHC26SS', NULL, 'Heat Pump', 332.0, NULL),
('SmartSense 2.0', 'Wall Mounted ODU', '9k BTU', 'AO-09U1R26SS', NULL, 'Heat Pump', 606.0, NULL),
('SmartSense 2.0', 'Wall Mounted IDU', '12k BTU', 'AS-12U1RHC26SS', NULL, 'Heat Pump', 341.0, NULL),
('SmartSense 2.0', 'Wall Mounted ODU', '12k BTU', 'AO-12U1R26SS', NULL, 'Heat Pump', 625.0, NULL);