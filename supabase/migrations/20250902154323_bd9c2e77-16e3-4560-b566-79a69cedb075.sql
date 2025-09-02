
-- 1) Tabelas de dimensões (se ainda não existirem)
CREATE TABLE IF NOT EXISTS public.stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS public.sectors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS public.product_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sector_id uuid NOT NULL REFERENCES public.sectors(id) ON DELETE CASCADE,
  name text NOT NULL,
  UNIQUE (sector_id, name)
);

CREATE TABLE IF NOT EXISTS public.product_subgroups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.product_groups(id) ON DELETE CASCADE,
  name text NOT NULL,
  UNIQUE (group_id, name)
);

-- 2) Tabela principal de vendas (se ainda não existir)
CREATE TABLE IF NOT EXISTS public.sales_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  month text NOT NULL,
  year text NOT NULL,
  session text NOT NULL,
  "group" text NOT NULL,
  subgroup text NOT NULL,
  store text NOT NULL,
  total numeric,
  date timestamptz DEFAULT now(),
  product_code text,
  product_description text,
  quantity_sold numeric,
  value_sold numeric,
  profit_value numeric,
  quantity_percentage numeric,
  value_percentage numeric,
  profit_percentage numeric
);

-- 3) Garante que todas as colunas existam (caso a tabela já existisse)
ALTER TABLE public.sales_data
  ADD COLUMN IF NOT EXISTS month text,
  ADD COLUMN IF NOT EXISTS year text,
  ADD COLUMN IF NOT EXISTS session text,
  ADD COLUMN IF NOT EXISTS "group" text,
  ADD COLUMN IF NOT EXISTS subgroup text,
  ADD COLUMN IF NOT EXISTS store text,
  ADD COLUMN IF NOT EXISTS total numeric,
  ADD COLUMN IF NOT EXISTS date timestamptz,
  ADD COLUMN IF NOT EXISTS product_code text,
  ADD COLUMN IF NOT EXISTS product_description text,
  ADD COLUMN IF NOT EXISTS quantity_sold numeric,
  ADD COLUMN IF NOT EXISTS value_sold numeric,
  ADD COLUMN IF NOT EXISTS profit_value numeric,
  ADD COLUMN IF NOT EXISTS quantity_percentage numeric,
  ADD COLUMN IF NOT EXISTS value_percentage numeric,
  ADD COLUMN IF NOT EXISTS profit_percentage numeric;

ALTER TABLE public.sales_data
  ALTER COLUMN date SET DEFAULT now();

-- 4) Índice único para evitar duplicidades por período/loja/produto
CREATE UNIQUE INDEX IF NOT EXISTS sales_data_unique_per_product
  ON public.sales_data (month, year, session, "group", subgroup, store, product_code);

-- 5) Índices para performance dos filtros do dashboard
CREATE INDEX IF NOT EXISTS idx_sales_data_store ON public.sales_data (store);
CREATE INDEX IF NOT EXISTS idx_sales_data_month ON public.sales_data (month);
CREATE INDEX IF NOT EXISTS idx_sales_data_year ON public.sales_data (year);
CREATE INDEX IF NOT EXISTS idx_sales_data_session ON public.sales_data (session);
CREATE INDEX IF NOT EXISTS idx_sales_data_group ON public.sales_data ("group");
CREATE INDEX IF NOT EXISTS idx_sales_data_subgroup ON public.sales_data (subgroup);
CREATE INDEX IF NOT EXISTS idx_sales_data_product_code ON public.sales_data (product_code);

-- 6) Função para normalizar textos (remove espaços extras e evita valores vazios)
CREATE OR REPLACE FUNCTION public.normalize_sales_data_row()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.store := NULLIF(BTRIM(NEW.store), '');
  NEW.month := NULLIF(BTRIM(NEW.month), '');
  NEW.year := NULLIF(BTRIM(NEW.year), '');
  NEW.session := NULLIF(BTRIM(NEW.session), '');
  NEW."group" := NULLIF(BTRIM(NEW."group"), '');
  NEW.subgroup := NULLIF(BTRIM(NEW.subgroup), '');
  IF NEW.product_code IS NOT NULL THEN
    NEW.product_code := NULLIF(BTRIM(NEW.product_code), '');
  END IF;
  IF NEW.product_description IS NOT NULL THEN
    NEW.product_description := NULLIF(BTRIM(NEW.product_description), '');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sales_data_normalize ON public.sales_data;
CREATE TRIGGER trg_sales_data_normalize
  BEFORE INSERT OR UPDATE ON public.sales_data
  FOR EACH ROW
  EXECUTE FUNCTION public.normalize_sales_data_row();

-- 7) Trigger para garantir dimensões (usa a função já existente ensure_dimensions_for_sales_data)
DROP TRIGGER IF EXISTS trg_sales_data_dimensions ON public.sales_data;
CREATE TRIGGER trg_sales_data_dimensions
  AFTER INSERT ON public.sales_data
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_dimensions_for_sales_data();
