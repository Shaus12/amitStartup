CREATE TABLE IF NOT EXISTS gift_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  priority integer NOT NULL DEFAULT 1,
  active boolean NOT NULL DEFAULT true,
  trigger_conditions jsonb NOT NULL DEFAULT '[]'::jsonb,
  selection_prompt text NOT NULL,
  generation_prompt text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS business_gifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  template_id uuid NOT NULL REFERENCES gift_templates(id) ON DELETE RESTRICT,
  gift_type text NOT NULL,
  content text NOT NULL,
  viewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_business_gifts_business_created
  ON business_gifts (business_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_business_gifts_unviewed
  ON business_gifts (business_id, viewed_at)
  WHERE viewed_at IS NULL;

INSERT INTO gift_templates (
  name,
  category,
  priority,
  active,
  trigger_conditions,
  selection_prompt,
  generation_prompt
)
SELECT
  'ניתוח עסקי ראשוני',
  'כללי',
  1,
  true,
  '["general"]'::jsonb,
  'בחר תבנית זו כברירת מחדל אם אין התאמה ברורה לתבנית אחרת',
  'בהתבסס על הנתונים הבאים על העסק, כתוב מסמך ניתוח עסקי קצר בעברית הכולל:
1. סיכום העסק בשורה אחת
2. 3 החוזקות הגדולות של העסק
3. 3 האתגרים המרכזיים
4. 5 המלצות מעשיות לשיפור מיידי
5. משפט מסכם מעורר השראה

כתוב בטון מקצועי אך חם. התאם הכל לפרטי העסק הספציפי.'
WHERE NOT EXISTS (
  SELECT 1
  FROM gift_templates
  WHERE name = 'ניתוח עסקי ראשוני'
);
