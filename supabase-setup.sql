-- Create numbers table
CREATE TABLE numbers (
  id BIGSERIAL PRIMARY KEY,
  number TEXT NOT NULL,
  page INT NOT NULL,
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE numbers ENABLE ROW LEVEL SECURITY;

-- Create policy for public access
CREATE POLICY "Public access for all" ON numbers
  FOR ALL
  TO authenticated, anon
  USING (true)
  WITH CHECK (true);

-- Insert initial data for page 1
INSERT INTO numbers (number, page, status)
SELECT 
  CASE 
    WHEN i < 10 THEN CONCAT('1-0', i) 
    ELSE CONCAT('1-', i) 
  END as number,
  1 as page,
  NULL as status
FROM generate_series(1, 54) as i
ON CONFLICT DO NOTHING;

-- Insert initial data for page 2
INSERT INTO numbers (number, page, status)
SELECT 
  CASE 
    WHEN i < 10 THEN CONCAT('2-0', i) 
    ELSE CONCAT('2-', i) 
  END as number,
  2 as page,
  NULL as status
FROM generate_series(1, 54) as i
ON CONFLICT DO NOTHING;

-- Insert initial data for page 3
INSERT INTO numbers (number, page, status)
SELECT 
  CASE 
    WHEN i < 10 THEN CONCAT('3-0', i) 
    ELSE CONCAT('3-', i) 
  END as number,
  3 as page,
  NULL as status
FROM generate_series(1, 54) as i
ON CONFLICT DO NOTHING;
