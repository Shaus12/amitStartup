import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = `
אתה מנתח עסקי בכיר של BizMap — פלטפורמת ניתוח עסקי מבוססת AI.
תפקידך לייצר ניתוח עסקי מעמיק, אישי ומרשים על בסיס המידע שנאסף בשיחה.

הניתוח חייב להרגיש כאילו נכתב על ידי יועץ עסקי מנוסה שבאמת מבין את העסק.
לא גנרי. לא שבלוני. מותאם לחלוטין לעסק הספציפי.

החזר JSON בדיוק בפורמט הבא — ללא טקסט נוסף:

{
  "businessName": "שם העסק",
  "ownerName": "שם הבעלים",
  
  "summary": "פסקת סיכום מנהלים — 3-4 משפטים שמתארים את המצב הנוכחי של העסק, הפוטנציאל שלו, והנושא המרכזי שהניתוח יעסוק בו. כתוב בגוף שני, ישיר ואישי.",
  
  "totalHoursWasted": 0,
  "totalMoneyWasted": 0,
  
  "pains": [
    {
      "title": "כותרת קצרה של הכאב",
      "description": "הסבר מפורט — מה קורה, למה זה בעיה, מה ההשפעה על העסק. 2-3 משפטים.",
      "hoursPerMonth": 0,
      "costPerMonth": 0,
      "quote": "ציטוט מילולי מהשיחה שקשור לכאב הזה — משפט שהבעלים אמר"
    }
  ],
  
  "digitalMaturityScore": 0.0,
  "maturityAxes": [
    { "name": "ניהול נתונים ומידע", "score": 0, "explanation": "משפט קצר למה הציון כזה" },
    { "name": "אוטומציה של תהליכים", "score": 0, "explanation": "" },
    { "name": "תקשורת עם לקוחות", "score": 0, "explanation": "" },
    { "name": "דוחות ומדידה", "score": 0, "explanation": "" },
    { "name": "ניהול תהליכים פנימיים", "score": 0, "explanation": "" }
  ],
  
  "benchmarkScore": 0.0,
  "benchmarkContext": "משפט שמסביר מה המשמעות של הציון מול עסקים דומים",
  "benchmarkSampleSize": 0,
  "benchmarkIndustry": "תיאור התעשייה",
  
  "opportunities": [
    {
      "title": "כותרת ההזדמנות",
      "description": "תיאור מפורט של ההזדמנות",
      "before": "מה קורה היום — תאר את המצב הנוכחי בצורה קונקרטית",
      "after": "מה יקרה אחרי היישום — תאר את השיפור בצורה קונקרטית",
      "hoursPerMonth": 0,
      "costPerMonth": 0,
      "difficulty": "קל",
      "timeToImplement": "3-5 ימים",
      "tools": ["כלי 1", "כלי 2"],
      "isQuickWin": true,
      "priority": 1
    }
  ],
  
  "quickWins": [
    {
      "title": "כותרת ה-Quick Win",
      "description": "מה לעשות בדיוק — הוראות ספציפיות",
      "timeToImplement": "שעה אחת",
      "impact": "מה ישתנה מיד"
    }
  ],
  
  "plan90Days": [
    {
      "period": "שבוע 1-2",
      "title": "כותרת השלב",
      "actions": ["פעולה 1", "פעולה 2"],
      "outcome": "מה יהיה בסוף השלב הזה"
    }
  ],
  
  "userQuotes": [
    "ציטוט 1 — משפט שהבעלים אמר שמתאר כאב או מטרה",
    "ציטוט 2",
    "ציטוט 3"
  ]
}

RULES:
- totalHoursWasted = סכום כל hoursPerMonth מה-pains
- totalMoneyWasted = סכום כל costPerMonth מה-pains
- digitalMaturityScore = ממוצע של כל ה-maturityAxes scores (1-10)
- benchmarkScore = digitalMaturityScore + 1.5 עד 2.5 (המתחרים טובים יותר)
- Generate 5-8 opportunities, sorted by priority (1 = most important)
- Generate 2-3 quickWins (subset of opportunities with isQuickWin=true)
- Generate 3-4 plan90Days periods
- Generate 3-4 userQuotes — use EXACT words from the conversation
- All text in Hebrew except tool names
- Be specific with numbers — don't use round numbers like 10, 20, 30
  use realistic numbers like 14, 23, 37
- hoursPerMonth per pain: realistic estimate based on what they described
- costPerMonth = hoursPerMonth × average hourly rate for their industry
`;

export async function POST(req: Request) {
  try {
    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    // Fetch the onboarding_chat_sessions row
    const { data: session, error: sessionError } = await supabaseAdmin
      .from("onboarding_chat_sessions")
      .select("collected_data")
      .eq("id", sessionId)
      .eq("user_id", user.id)
      .single();

    if (sessionError || !session) {
      console.error("Error fetching session:", sessionError);
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const collectedData = session.collected_data;
    if (!collectedData) {
      return NextResponse.json({ error: "No collected data found in session" }, { status: 400 });
    }

    // Call Anthropic Claude
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const userMessage = `הנה המידע שנאסף על העסק בשיחה:
${JSON.stringify(collectedData, null, 2)}

צור ניתוח מעמיק ומלא לפי הפורמט המבוקש.`;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 8000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    let aiReply = "";
    if (response.content[0].type === "text") {
      aiReply = response.content[0].text;
    }

    // Parse Claude's JSON response — strip markdown code fences if present
    let parsedContent;
    try {
      // Remove ```json ... ``` wrappers if model added them
      let cleaned = aiReply.trim();
      if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```[\w]*\n?/, "").replace(/\n?```$/, "").trim();
      }
      // Find outermost JSON object
      const start = cleaned.indexOf("{");
      const end = cleaned.lastIndexOf("}");
      if (start === -1 || end === -1) throw new Error("No JSON object found in response");
      parsedContent = JSON.parse(cleaned.slice(start, end + 1));
    } catch (parseError) {
      console.error("Failed to parse analysis report JSON:", parseError);
      console.error("Raw reply:", aiReply);
      return NextResponse.json({ error: "Failed to parse analysis report" }, { status: 500 });
    }

    // Save to analysis_reports table
    const { data: report, error: reportError } = await supabaseAdmin
      .from("analysis_reports")
      .insert({
        user_id: user.id,
        content: parsedContent,
      })
      .select("id")
      .single();

    if (reportError) {
      console.error("Error saving analysis report:", reportError);
      return NextResponse.json({ error: "Failed to save analysis report" }, { status: 500 });
    }

    const { error: userUpdateError } = await supabaseAdmin
      .from("users")
      .update({ onboarding_completed: true })
      .eq("id", user.id);

    if (userUpdateError) {
      console.error("Error marking onboarding completed:", userUpdateError);
      return NextResponse.json({ error: "Failed to update user onboarding status" }, { status: 500 });
    }

    return NextResponse.json({
      reportId: report.id,
      content: parsedContent,
    });
  } catch (err: any) {
    console.error("POST analysis-report/generate error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
