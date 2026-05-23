import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = `You are BizMap's intelligent business analysis engine conducting 
a deep interview with a business owner in Israel.

You represent the BizMap platform — NOT Claude, NOT an AI assistant. 
You are BizMap's analysis system. Never mention Claude, Anthropic, 
or that you are an AI assistant. If asked, say you are BizMap's 
analysis engine.

LANGUAGE: Hebrew ONLY. Never switch to English except for 
product/tool names (e.g., "Zapier", "Monday.com", "Shopify").

THE INTERVIEW HAS 3 STAGES:
You must progress through all 3 stages before concluding.

━━━ STAGE 1: מכירים את העסק (5-7 exchanges) ━━━
Collect: business name, owner name, what they do exactly, 
how long, team size, revenue range, growth direction.
Signal stage complete by adding [META]{"stage":1,"stageComplete":true}[/META]
at the end of your message when stage 1 is done.

━━━ STAGE 2: מוצאים את הכאב (8-12 exchanges) ━━━
This is the MOST IMPORTANT stage.
Identify the 2-3 biggest pain points and dig DEEP into each one.
Ask about: daily operations, time sinks, what frustrates them most,
their process from lead to delivery, client communication issues,
the golden question: "אם יכולת לאוטומט דבר אחד מחר — מה זה היה?"
DO NOT accept vague answers — always follow up once.
If they say "לא יודע" to automation question, try:
"מה הדבר שאתה עושה הכי הרבה פעמים בשבוע בצורה ידנית?"
Signal stage complete by adding [META]{"stage":2,"stageComplete":true}[/META]

━━━ STAGE 3: בונים את הניתוח (5-8 exchanges) ━━━
Fill in any remaining gaps: tools used, AI comfort level,
sales metrics (leads/month, close rate, deal size if relevant),
goals for next 90 days, biggest opportunity they see.
When you have EVERYTHING needed, output the analysis JSON.
Signal stage complete by adding [META]{"stage":3,"stageComplete":true}[/META]

CONVERSATION RULES:
- Ask ONE question per message — never multiple
- Keep messages SHORT: 2-4 sentences max
- Acknowledge each answer warmly before next question
- Use the owner's name and business name once you know them
- Sound like a smart consultant, not a form or chatbot
- Show genuine curiosity: "מעניין, ספר לי יותר..."
- Connect dots: "אמרת שיש 3 אנשים — מי מטפל בלידים?"
- Light humor when appropriate
- Minimum 25 exchanges total before concluding
- Never rush — depth is more important than speed

MANDATORY TOPICS (must cover all before finishing):
1. What the business does exactly + target customer
2. Team size and structure
3. Revenue range (rough)
4. Growth direction
5. Daily operations — what repeats, what takes most time
6. Tools currently used
7. Biggest operational frustration (with follow-up)
8. Golden question: automation wish
9. Client/customer communication process
10. Goals for next 90 days
11. AI usage and comfort level

CONDITIONAL TOPICS (ask if relevant):
- 3+ people → org structure, departments, internal communication
- Sales business → leads/month, close rate, avg deal size, sales cycle
- Service business → project lifecycle, client onboarding, delivery
- eCommerce → order volume, fulfillment, inventory
- B2B → proposal process, account management
- Revenue inconsistency mentioned → dig into causes and patterns
- Social media mentioned → content creation, posting frequency, conversion

DEPTH RULES:
- "יש לי בעיה עם X" → ask WHAT specifically about X
- "לוקח הרבה זמן" → ask HOW MUCH time exactly per week
- "תנודתי" → ask what causes it and best/worst month difference
- Any tool mentioned → ask how they use it and if it's manual
- Any process mentioned → ask frequency and time spent

WHEN READY TO CONCLUDE:
Write your natural closing message, then on a new line:
[ANALYSIS_READY]
{
  "businessName": "",
  "ownerName": "",
  "tagline": "",
  "businessType": "",
  "industry": "",
  "employeeRange": "",
  "revenueRange": "",
  "growthTrajectory": "",
  "businessAge": "",
  "targetCustomer": "",
  "departments": [{"name": "", "headcount": 0}],
  "tools": [{"name": "", "category": "", "isManual": false}],
  "processes": [{"name": "", "departmentName": "", "frequency": "daily", "isManual": true, "hoursPerWeek": 0}],
  "bottlenecks": [""],
  "painPoints": [""],
  "biggestHeadache": "",
  "automationWish": "",
  "goals": [""],
  "topPriority90Days": "",
  "aiComfortLevel": "",
  "currentAiTools": [""],
  "monthlyLeads": 0,
  "closeRate": "",
  "avgDealSize": "",
  "primaryContact": "",
  "timeSpentComms": "",
  "hasDocumentedSOPs": false,
  "manualTasks": [""],
  "revenueInconsistencyReason": "",
  "projectLifecycle": "",
  "clientCommunicationPain": "",
  "additionalInsights": ""
}
[/ANALYSIS_READY]
[META]{"stage":3,"stageComplete":true}[/META]
`;

export async function GET(req: Request) {
  try {
    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    const { data: session, error } = await supabaseAdmin
      .from("onboarding_chat_sessions")
      .select("messages, status")
      .eq("id", sessionId)
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error("GET session error:", error);
      return NextResponse.json({ error: error.message }, { status: error.code === 'PGRST116' ? 404 : 500 });
    }

    // Estimate stage from message count for progress bar restoration
    const msgs = session.messages || [];
    const userMsgCount = msgs.filter((m: any) => m.role === 'user').length;
    const estimatedStage = userMsgCount <= 7 ? 1 : userMsgCount <= 18 ? 2 : 3;

    return NextResponse.json({
      messages: msgs,
      isComplete: session.status === "completed",
      stage: estimatedStage
    });
  } catch (err: any) {
    console.error("GET onboarding-chat error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure user exists in the public users table before attempting to create related records
    await supabaseAdmin
      .from('users')
      .upsert({
        id: user.id,
        email: user.email,
        created_at: new Date().toISOString()
      }, { onConflict: 'id', ignoreDuplicates: true });

    const body = await req.json();
    const { message, sessionId, messages: history } = body;

    let currentSessionId = sessionId;

    if (message === "DEBUG_SKIP") {
      const dummyCollectedData = {
        businessName: "חנות הפרחים של דוד",
        ownerName: "דוד",
        industry: "קמעונאות",
        currentChallenges: "בזבוז זמן על ניהול באקסל, אין אוטומציה של הצעות מחיר, קשה לעקוב אחרי לקוחות.",
        painPoints: "לקוחות שוכחים לשלם, אין מערכת מסודרת להזמנות",
        goals: "להכפיל מכירות, אוטומציה"
      };
      
      const { data: newSession, error: createError } = await supabaseAdmin
        .from("onboarding_chat_sessions")
        .insert({
          user_id: user.id,
          messages: [{ role: "user", content: "DEBUG_SKIP" }],
          status: "completed",
          collected_data: dummyCollectedData
        })
        .select("id")
        .single();
        
      if (createError) throw createError;
      
      return NextResponse.json({
        reply: "DEBUG SKIP DETECTED.\n\n[META]{\"stage\":3,\"stageComplete\":true}[/META]\n\n[ANALYSIS_READY]\n{}\n[/ANALYSIS_READY]",
        sessionId: newSession.id,
        isComplete: true,
        stage: 3,
        stageComplete: true
      });
    }

    // Resolve session: use existing or create new
    if (currentSessionId) {
      // Verify it exists and belongs to this user
      const { data: existingSession, error: fetchError } = await supabaseAdmin
        .from("onboarding_chat_sessions")
        .select("messages")
        .eq("id", currentSessionId)
        .eq("user_id", user.id)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          // Session not found (stale/deleted) — fall through to create new
          console.warn("Stale sessionId, will create new session:", currentSessionId);
          currentSessionId = null;
        } else {
          throw fetchError;
        }
      } else {
        // Session found — append the new user message
        const currentMessages = existingSession.messages || [];
        await supabaseAdmin
          .from("onboarding_chat_sessions")
          .update({
            messages: [...currentMessages, { role: "user", content: message }],
            updated_at: new Date().toISOString()
          })
          .eq("id", currentSessionId)
          .eq("user_id", user.id);
      }
    }

    // Create a new session if we don't have a valid one
    if (!currentSessionId) {
      // Include full history (AI greeting + prior messages) so resume works on refresh
      const initialMessages = [
        ...(history || []).map((m: any) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content })),
        { role: "user", content: message }
      ];
      const { data: newSession, error: createError } = await supabaseAdmin
        .from("onboarding_chat_sessions")
        .insert({
          user_id: user.id,
          messages: initialMessages,
          status: "in_progress"
        })
        .select("id")
        .single();

      if (createError) {
        throw createError;
      }
      currentSessionId = newSession.id;
    }

    // Call Anthropic
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });

    // Prepare full history for Claude
    // Ensure history follows alternating user/assistant pattern
    // The history parameter is passed from frontend, but we add the new message
    const formattedMessages = history.map((m: any) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content
    }));
    formattedMessages.push({ role: "user", content: message });

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      messages: formattedMessages
    });

    let aiReply = "";
    if (response.content[0].type === "text") {
      aiReply = response.content[0].text;
    }

    let isComplete = false;
    let extractedData = null;
    let stage = 1;
    let stageComplete = false;

    // Parse META tag
    const metaMatch = aiReply.match(/\[META\]([\s\S]*?)\[\/META\]/);
    if (metaMatch && metaMatch[1]) {
      try {
        const metaJson = JSON.parse(metaMatch[1].trim());
        if (metaJson.stage) stage = metaJson.stage;
        if (metaJson.stageComplete !== undefined) stageComplete = metaJson.stageComplete;
      } catch (e) {
        console.error("Failed to parse Claude META JSON", e);
      }
      // Remove META tag from the reply
      aiReply = aiReply.replace(/\[META\][\s\S]*?\[\/META\]/, "").trim();
    }

    // Parse completion tag
    if (aiReply.includes("[ANALYSIS_READY]") && aiReply.includes("[/ANALYSIS_READY]")) {
      isComplete = true;
      const jsonStart = aiReply.indexOf("[ANALYSIS_READY]") + "[ANALYSIS_READY]".length;
      const jsonEnd = aiReply.indexOf("[/ANALYSIS_READY]");
      const jsonString = aiReply.substring(jsonStart, jsonEnd).trim();
      
      try {
        extractedData = JSON.parse(jsonString);
      } catch (e) {
        console.error("Failed to parse Claude JSON", e, jsonString);
      }
    }

    // Fetch updated messages to append Claude's reply
    const { data: beforeReplySession } = await supabaseAdmin
      .from("onboarding_chat_sessions")
      .select("messages")
      .eq("id", currentSessionId)
      .eq("user_id", user.id)
      .single();

    const messagesWithReply = [...(beforeReplySession?.messages || []), { role: "assistant", content: aiReply }];

    // Save Claude's reply
    const updatePayload: any = {
      messages: messagesWithReply,
      updated_at: new Date().toISOString()
    };

    if (isComplete && extractedData) {
      updatePayload.collected_data = extractedData;
      updatePayload.status = "completed";
    }

    await supabaseAdmin
      .from("onboarding_chat_sessions")
      .update(updatePayload)
      .eq("id", currentSessionId)
      .eq("user_id", user.id);

    return NextResponse.json({
      reply: aiReply,
      sessionId: currentSessionId,
      isComplete,
      stage,
      stageComplete
    });

  } catch (err: any) {
    console.error("POST onboarding-chat error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
