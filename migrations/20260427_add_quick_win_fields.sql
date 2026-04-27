ALTER TABLE ai_opportunities
  ADD COLUMN IF NOT EXISTS is_quick_win      boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS notification_hook text,
  ADD COLUMN IF NOT EXISTS proof_of_value    text;
