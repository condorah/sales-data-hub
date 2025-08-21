-- Update sales_data table to include product information and new columns
ALTER TABLE public.sales_data 
ADD COLUMN product_code TEXT,
ADD COLUMN product_description TEXT,
ADD COLUMN quantity_sold INTEGER DEFAULT 0,
ADD COLUMN value_sold DECIMAL(15,2) DEFAULT 0,
ADD COLUMN profit_value DECIMAL(15,2) DEFAULT 0,
ADD COLUMN quantity_percentage DECIMAL(5,2) DEFAULT 0,
ADD COLUMN value_percentage DECIMAL(5,2) DEFAULT 0,
ADD COLUMN profit_percentage DECIMAL(5,2) DEFAULT 0;

-- Create index for better performance on product searches
CREATE INDEX idx_sales_data_product_code ON public.sales_data(product_code);
CREATE INDEX idx_sales_data_product_description ON public.sales_data(product_description);

-- Update existing records to have default values for new columns
UPDATE public.sales_data 
SET product_code = 'N/A', 
    product_description = 'Produto Legado',
    quantity_sold = 0,
    value_sold = total,
    profit_value = 0,
    quantity_percentage = 0,
    value_percentage = 0,
    profit_percentage = 0
WHERE product_code IS NULL;