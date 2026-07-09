ALTER TABLE leads
  DROP CONSTRAINT IF EXISTS leads_source_check;

ALTER TABLE leads
  ADD CONSTRAINT leads_source_check
  CHECK (source IN ('analysis_report', 'dashboard', 'webinar', 'ai_level', 'workshop'));
