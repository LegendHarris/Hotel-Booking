-- Migration script to update hotels table schema

ALTER TABLE hotels
  ADD country VARCHAR(255) NOT NULL;
ALTER TABLE hotels
  ADD city VARCHAR(255) NOT NULL;
-- Skipping price column modification due to SQL dialect limitations
-- Please manually update the column name and type if needed
ALTER TABLE hotels
  ADD currency VARCHAR(10) NOT NULL DEFAULT 'USD';
