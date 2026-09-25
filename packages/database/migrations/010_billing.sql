BEGIN;

CREATE TABLE IF NOT EXISTS app.invoices (
  id uuid PRIMARY KEY,
  centre_id uuid NOT NULL,
  student_id uuid NOT NULL,
  family_reference text NOT NULL,
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  currency text NOT NULL DEFAULT 'ZAR' CHECK (currency = 'ZAR'),
  line_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  subtotal numeric(12,2) NOT NULL DEFAULT 0,
  tax_amount numeric(12,2) NOT NULL DEFAULT 0,
  total numeric(12,2) NOT NULL,
  due_at timestamptz NOT NULL,
  status text NOT NULL CHECK (status IN ('draft', 'issued', 'partially_paid', 'paid', 'disputed', 'failed', 'cancelled')),
  document_reference text,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  issued_at timestamptz,
  total_paid numeric(12,2) NOT NULL DEFAULT 0,
  receipt_id text,
  failure_reason text
);

CREATE TABLE IF NOT EXISTS app.payments (
  id uuid PRIMARY KEY,
  centre_id uuid NOT NULL,
  invoice_id uuid NOT NULL REFERENCES app.invoices (id) ON DELETE RESTRICT,
  method text NOT NULL CHECK (method IN ('eft', 'cash', 'other')),
  amount numeric(12,2) NOT NULL,
  currency text NOT NULL DEFAULT 'ZAR' CHECK (currency = 'ZAR'),
  received_at timestamptz NOT NULL,
  reference text NOT NULL,
  status text NOT NULL DEFAULT 'recorded' CHECK (status = 'recorded'),
  recorded_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invoices_centre_student
  ON app.invoices (centre_id, student_id);

CREATE INDEX IF NOT EXISTS idx_invoices_status
  ON app.invoices (status);

CREATE INDEX IF NOT EXISTS idx_payments_invoice
  ON app.payments (invoice_id);

COMMIT;
