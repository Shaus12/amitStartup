-- Subscriptions table for Grow.business payment integration
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'inactive', -- 'active', 'inactive', 'cancelled', 'past_due'
  plan_name TEXT NOT NULL DEFAULT 'basic',
  amount_ils INTEGER NOT NULL DEFAULT 29,
  grow_transaction_code TEXT,          -- first transaction code
  grow_page_code TEXT,                 -- page code returned by Grow for this session
  payer_email TEXT,
  payer_name TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS subscriptions_business_id_idx ON subscriptions(business_id);
CREATE INDEX IF NOT EXISTS subscriptions_status_idx ON subscriptions(status);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can only read their own subscriptions
CREATE POLICY "Users can read own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can do everything (used by server-side API routes)
CREATE POLICY "Service role full access"
  ON subscriptions FOR ALL
  USING (true)
  WITH CHECK (true);

-- Helper function: updated_at auto-update
CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_subscriptions_updated_at();
