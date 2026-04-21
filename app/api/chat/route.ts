import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase/server";
import { verifyBusinessAccess } from "@/lib/supabase/verify-business-access";
import { callClaudeForChat, generateConstraintQuestion, generateProjectPlan } from "@/lib/ai/analyzeBusinessData";

function parseProjectFromMarkdown(markdown: string) {
  const nameMatch = markdown.match(/📋 \*\*([^*]+)\*\*/);
  const projectName = nameMatch ? nameMatch[1].trim() : "פרויקט חדש";

  const lines = markdown.split('\n');
  const tasks = [];
  let currentTask: any = null;

  for (const line of lines) {
    const taskMatch = line.match(/^\s*\d+\.\s+([^\—\-]+)[\—\-]\s*(.+)$/);
    if (taskMatch) {
      if (currentTask) tasks.push(currentTask);
      currentTask = {
        title: taskMatch[1].trim(),
        hours: taskMatch[2].trim(),
        subtasks: []
      };
      continue;
    }

    const subtaskMatch = line.match(/^\s*-\s+(.+)$/);
    if (subtaskMatch && currentTask) {
      currentTask.subtasks.push({ title: subtaskMatch[1].trim() });
    }
  }
  if (currentTask) tasks.push(currentTask);

  return { projectName, tasks };
}

export async function POST(req: NextRequest) {
  try {
    const { businessId, message, session_id } = await req.json();
    if (!businessId || !message) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const authClient = await createClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();

    const owned = await verifyBusinessAccess(supabase, businessId, user);
    if (!owned) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    let sessionId = session_id as string | undefined;
    let sessionRow: { id: string; title: string | null; created_at: string; updated_at: string } | null = null;

    if (!sessionId) {
      const { data: createdSession, error: createSessionError } = await supabase
        .from("chat_sessions")
        .insert({
          business_id: businessId,
          title: null,
        })
        .select("id, title, created_at, updated_at")
        .single();

      if (createSessionError || !createdSession) {
        return NextResponse.json(
          { error: createSessionError?.message || "Failed to create chat session" },
          { status: 500 }
        );
      }

      sessionId = createdSession.id;
      sessionRow = createdSession;
    } else {
      const { data: existingSession, error: sessionError } = await supabase
        .from("chat_sessions")
        .select("id, title, created_at, updated_at")
        .eq("id", sessionId)
        .eq("business_id", businessId)
        .single();

      if (sessionError || !existingSession) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
      }
      sessionRow = existingSession;
    }

    // 1. Save user message
    await supabase.from("conversation_messages").insert({
      business_id: businessId,
      session_id: sessionId,
      role: "user",
      content: message
    });

    // 2. Fetch context (business knowledge)
    const { data: knowledgeRows } = await supabase
      .from("business_knowledge")
      .select("category, content")
      .eq("business_id", businessId);

    // 3. Fetch recent history
    const { data: messages } = await supabase
      .from("conversation_messages")
      .select("role, content")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: false })
      .limit(30);
      
    const history = (messages || []).reverse();

    // 4. Project Planning State Machine
    const lastAssistantMsg = history.length > 1 ? history[history.length - 2].content : "";
    const lastUserMsg = message;

    let claudeResponse = "";
    let isProjectPlanning = false;

    const projectKeywords = ["פרויקט", "לתכנן", "להתחיל", "לשפר", "לבנות", "לפתח"];
    const isIntent = projectKeywords.some(kw => lastUserMsg.includes(kw));
    
    const step1Text = "מעולה, בוא נבנה את זה יחד. קודם כל — מה המטרה הסופית של הפרויקט? מה תיראה הצלחה בעיניך?";
    const step2Text = "כמה זמן אתה רוצה להקדיש לזה? ומה המועד היעד?";
    const step5Prefix = "יצרתי לך את הפרויקט הבא:";

    // Step 6: Confirmation or Tweaks
    if (lastAssistantMsg.includes(step5Prefix)) {
      isProjectPlanning = true;
      const approvalWords = ["כן", "אשר", "בסדר", "שמור", "מעולה", "יאללה", "סגור", "מושלם"];
      const isApproved = approvalWords.some(w => lastUserMsg.includes(w));

      if (isApproved) {
        const { projectName, tasks } = parseProjectFromMarkdown(lastAssistantMsg);
        
        // Save to DB
        const { data: project } = await supabase.from("projects").insert({
          business_id: businessId,
          title: projectName,
          status: "todo"
        }).select().single();

        if (project) {
          for (const t of tasks) {
            let estHours = 0;
            const hrsMatch = t.hours.match(/(\d+(\.\d+)?)/);
            if (hrsMatch) estHours = parseFloat(hrsMatch[1]);

            const { data: savedTask } = await supabase.from("tasks").insert({
              business_id: businessId,
              project_id: project.id,
              title: t.title,
              estimated_hours: estHours,
              status: "todo"
            }).select().single();

            if (savedTask && t.subtasks.length > 0) {
              const subtaskInserts = t.subtasks.map((s: any) => ({
                business_id: businessId,
                project_id: project.id,
                parent_task_id: savedTask.id,
                title: s.title,
                status: "todo"
              }));
              await supabase.from("tasks").insert(subtaskInserts);
            }
          }
        }
        claudeResponse = "הפרויקט נשמר! תוכל לראות אותו במסך המשימות 🎉";
      } else {
        // Regenerate Plan
        claudeResponse = await generateProjectPlan(
          knowledgeRows || [], 
          history.slice(0, -1).concat({ role: "user", content: "The user requested changes: " + lastUserMsg })
        );
      }
    }
    // Step 5: Build plan after answering constraints
    else if (history.length > 3 && history[history.length - 4].content.includes(step2Text)) {
      isProjectPlanning = true;
      claudeResponse = await generateProjectPlan(knowledgeRows || [], history.slice(0, -1));
    }
    // Step 3: Ask constraints after answering timeline
    else if (lastAssistantMsg.includes(step2Text)) {
      isProjectPlanning = true;
      const goal = history.length >= 3 ? history[history.length - 3].content : "";
      claudeResponse = await generateConstraintQuestion(knowledgeRows || [], goal, lastUserMsg);
    }
    // Step 2: Ask timeline after answering goal
    else if (lastAssistantMsg.includes(step1Text)) {
      isProjectPlanning = true;
      claudeResponse = step2Text;
    }
    // Step 1: Detect intent
    else if (isIntent) {
      isProjectPlanning = true;
      claudeResponse = step1Text;
    }

    // Fallback to normal chat
    if (!isProjectPlanning) {
      claudeResponse = await callClaudeForChat(
        knowledgeRows || [], 
        history.slice(0, -1), 
        message
      );
    }

    // 5. Save Claude response
    const { data: savedMsg, error } = await supabase
      .from("conversation_messages")
      .insert({
        business_id: businessId,
        session_id: sessionId,
        role: "assistant",
        content: claudeResponse
      })
      .select()
      .single();

    await supabase
      .from("chat_sessions")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", sessionId);
      
    if (error) console.error("Could not save assistant message:", error);

    return NextResponse.json({
      response: claudeResponse,
      message: savedMsg,
      session_id: sessionId,
      session: sessionRow,
    });
  } catch (err: any) {
    console.error("Chat error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
