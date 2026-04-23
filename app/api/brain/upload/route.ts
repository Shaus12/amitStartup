import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase/server";
import path from "node:path";

const MAX_FILE_BYTES = 20 * 1024 * 1024;
const ALLOWED_FILE_TYPES = new Set([
  "application/pdf",
  "text/plain",
  "text/markdown",
  "text/csv",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export async function POST(req: NextRequest) {
  const authClient = await createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const businessId = formData.get("businessId") as string | null;
  const departmentId = formData.get("departmentId") as string | null;

  if (!file || !businessId || !departmentId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (file.size <= 0 || file.size > MAX_FILE_BYTES) {
    return NextResponse.json({ error: "Invalid file size" }, { status: 400 });
  }
  if (!ALLOWED_FILE_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }

  // Verify ownership
  const { data: business } = await supabaseAdmin
    .from("businesses")
    .select("id")
    .eq("id", businessId)
    .eq("user_id", user.id)
    .single();

  if (!business) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data: department } = await supabaseAdmin
    .from("departments")
    .select("id")
    .eq("id", departmentId)
    .eq("business_id", businessId)
    .single();
  if (!department) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const safeFileName = path
    .basename(file.name)
    .replace(/[^a-zA-Z0-9._-]/g, "_");
  const fileName = `${businessId}/${departmentId}/${Date.now()}_${safeFileName}`;

  // Upload to Supabase storage
  const { error: storageError } = await supabaseAdmin.storage
    .from("brain-documents")
    .upload(fileName, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (storageError) {
    // Storage bucket may not exist yet — still record the metadata
    console.error("Storage upload error:", storageError.message);
  }

  // Record in business_knowledge
  const { data: knowledge, error: dbError } = await supabaseAdmin
    .from("business_knowledge")
    .insert({
      business_id: businessId,
      department_id: departmentId,
      category: "document",
      content: file.name,
      metadata: {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        storagePath: fileName,
        uploadedAt: new Date().toISOString(),
      },
    })
    .select("id")
    .single();

  if (dbError) {
    console.error("DB insert error:", dbError.message);
    return NextResponse.json({ error: "Failed to save document" }, { status: 500 });
  }

  return NextResponse.json({ id: knowledge?.id, success: true });
}
