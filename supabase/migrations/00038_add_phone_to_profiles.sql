-- Migration: 00038_add_phone_to_profiles.sql
-- Adds missing phone column to profiles table

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;

NOTIFY pgrst, 'reload schema';
