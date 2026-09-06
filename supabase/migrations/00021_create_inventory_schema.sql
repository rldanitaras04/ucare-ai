-- Migration 00021: Inventory Management Schema
-- Tracks medicines, supplies, stock movements, and dispensing

CREATE TYPE inventory_category AS ENUM (
  'medicine', 'medical_supply', 'dental_supply', 'other'
);

CREATE TYPE stock_movement_type AS ENUM (
  'stock_in', 'stock_out', 'dispensing', 'adjustment', 'return', 'expired', 'damaged'
);

-- Inventory items master
CREATE TABLE inventory_items (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL,
  category          inventory_category NOT NULL DEFAULT 'medicine',
  unit              TEXT NOT NULL DEFAULT 'tablets',
  description       TEXT,
  reorder_level     INTEGER DEFAULT 10,
  is_active         BOOLEAN DEFAULT TRUE,
  
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_inventory_items_category ON inventory_items(category);
CREATE INDEX idx_inventory_items_name ON inventory_items(name);

-- Stock lots (batch tracking)
CREATE TABLE stock_lots (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id           UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  batch_number      TEXT NOT NULL,
  quantity          INTEGER NOT NULL DEFAULT 0,
  unit_cost         NUMERIC(10,2),
  expiry_date       DATE,
  acquisition_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  supplier          TEXT,
  
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_stock_lots_item ON stock_lots(item_id);
CREATE INDEX idx_stock_lots_expiry ON stock_lots(expiry_date);
CREATE INDEX idx_stock_lots_batch ON stock_lots(batch_number);

-- Stock movements
CREATE TABLE stock_movements (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id           UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  lot_id            UUID REFERENCES stock_lots(id) ON DELETE SET NULL,
  movement_type     stock_movement_type NOT NULL,
  quantity          INTEGER NOT NULL,
  reference_id      UUID,
  reference_type    TEXT,
  performed_by      UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  notes             TEXT,
  
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_stock_movements_item ON stock_movements(item_id);
CREATE INDEX idx_stock_movements_lot ON stock_movements(lot_id);
CREATE INDEX idx_stock_movements_type ON stock_movements(movement_type);

-- Enable RLS
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

-- Inventory items policies
CREATE POLICY "Staff can view inventory items"
  ON inventory_items FOR SELECT
  USING (
    user_has_role('doctor') OR user_has_role('dentist')
    OR user_has_role('nurse') OR user_has_role('clinic_staff')
    OR user_has_role('clinic_admin') OR user_has_role('super_admin')
    OR user_has_role('admin')
  );

CREATE POLICY "Clinic admins can manage inventory items"
  ON inventory_items FOR ALL
  USING (
    user_has_role('clinic_admin') OR user_has_role('super_admin') OR user_has_role('admin')
  );

CREATE POLICY "Deny anon inventory_items"
  ON inventory_items FOR ALL USING (auth.role() = 'anon') WITH CHECK (false);

-- Stock lots policies
CREATE POLICY "Staff can view stock lots"
  ON stock_lots FOR SELECT
  USING (
    user_has_role('doctor') OR user_has_role('dentist')
    OR user_has_role('nurse') OR user_has_role('clinic_staff')
    OR user_has_role('clinic_admin') OR user_has_role('super_admin')
    OR user_has_role('admin')
  );

CREATE POLICY "Clinic admins can manage stock lots"
  ON stock_lots FOR ALL
  USING (
    user_has_role('clinic_admin') OR user_has_role('super_admin') OR user_has_role('admin')
  );

CREATE POLICY "Deny anon stock_lots"
  ON stock_lots FOR ALL USING (auth.role() = 'anon') WITH CHECK (false);

-- Stock movements policies
CREATE POLICY "Staff can view stock movements"
  ON stock_movements FOR SELECT
  USING (
    user_has_role('doctor') OR user_has_role('dentist')
    OR user_has_role('nurse') OR user_has_role('clinic_staff')
    OR user_has_role('clinic_admin') OR user_has_role('super_admin')
    OR user_has_role('admin')
  );

CREATE POLICY "Clinic staff can record stock movements"
  ON stock_movements FOR INSERT
  WITH CHECK (
    performed_by = auth.uid()
    AND (user_has_role('clinic_staff') OR user_has_role('clinic_admin')
      OR user_has_role('super_admin') OR user_has_role('admin'))
  );

CREATE POLICY "Clinic admins can manage stock movements"
  ON stock_movements FOR ALL
  USING (
    user_has_role('clinic_admin') OR user_has_role('super_admin') OR user_has_role('admin')
  );

CREATE POLICY "Deny anon stock_movements"
  ON stock_movements FOR ALL USING (auth.role() = 'anon') WITH CHECK (false);

-- updated_at triggers
CREATE OR REPLACE FUNCTION update_inventory_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER inventory_items_updated_at
  BEFORE UPDATE ON inventory_items
  FOR EACH ROW EXECUTE FUNCTION update_inventory_items_updated_at();

CREATE OR REPLACE FUNCTION update_stock_lots_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER stock_lots_updated_at
  BEFORE UPDATE ON stock_lots
  FOR EACH ROW EXECUTE FUNCTION update_stock_lots_updated_at();
