-- Create tables for the multi-creator management system
-- IMPORTANT: Order matters due to foreign key constraints

-- 1. Creators table (referenced by all others)
CREATE TABLE IF NOT EXISTS creators (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Payments table (must be created before sales due to foreign key)
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  transfer_date DATE NOT NULL,
  reference TEXT,
  bank TEXT,
  notes TEXT,
  created_by TEXT,
  month TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Sales table (references payments)
CREATE TABLE IF NOT EXISTS sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  sale_date DATE NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  payment_method TEXT,
  quantity INTEGER DEFAULT 1,
  status TEXT DEFAULT 'active',
  commission DECIMAL(10, 2),
  month TEXT,
  payment_id UUID REFERENCES payments(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. Stock items table
CREATE TABLE IF NOT EXISTS stock_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  article TEXT NOT NULL,
  price DECIMAL(10, 2),
  quantity INTEGER DEFAULT 0,
  category TEXT,
  sku TEXT,
  low_stock_threshold INTEGER DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(creator_id, sku)
);

-- 5. Participations table
CREATE TABLE IF NOT EXISTS participations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  due_date DATE NOT NULL,
  status TEXT DEFAULT 'en_attente',
  payment_date DATE,
  payment_method TEXT,
  reference TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(creator_id, month)
);

-- 6. Settings table
CREATE TABLE IF NOT EXISTS settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 7. Import history table
CREATE TABLE IF NOT EXISTS import_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name TEXT NOT NULL,
  sales_count INTEGER,
  assigned_count INTEGER,
  unassigned_count INTEGER,
  months TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sales_creator_id ON sales(creator_id);
CREATE INDEX IF NOT EXISTS idx_sales_month ON sales(month);
CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(status);
CREATE INDEX IF NOT EXISTS idx_stock_creator_id ON stock_items(creator_id);
CREATE INDEX IF NOT EXISTS idx_payments_creator_id ON payments(creator_id);
CREATE INDEX IF NOT EXISTS idx_participations_creator_id ON participations(creator_id);
CREATE INDEX IF NOT EXISTS idx_participations_month ON participations(month);

-- Enable RLS (Row Level Security)
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE participations ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow all for now)
CREATE POLICY "Allow all access to creators" ON creators FOR ALL USING (true);
CREATE POLICY "Allow all access to stock_items" ON stock_items FOR ALL USING (true);
CREATE POLICY "Allow all access to sales" ON sales FOR ALL USING (true);
CREATE POLICY "Allow all access to payments" ON payments FOR ALL USING (true);
CREATE POLICY "Allow all access to participations" ON participations FOR ALL USING (true);
CREATE POLICY "Allow all access to settings" ON settings FOR ALL USING (true);
CREATE POLICY "Allow all access to import_history" ON import_history FOR ALL USING (true);
