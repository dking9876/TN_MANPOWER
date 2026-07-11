-- Add gender, rating, serial_number, and passport dates columns to candidates table
ALTER TABLE candidates ADD COLUMN gender TEXT;
ALTER TABLE candidates ADD COLUMN rating INTEGER;
ALTER TABLE candidates ADD COLUMN serial_number TEXT;
ALTER TABLE candidates ADD COLUMN passport_issue_date DATE;
ALTER TABLE candidates ADD COLUMN passport_expire_date DATE;
