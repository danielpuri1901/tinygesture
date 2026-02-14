import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const gestureId = formData.get("gestureId") as string;
    const type = formData.get("type") as "voice" | "photo";

    if (!file || !gestureId || !type) {
      return NextResponse.json({ error: "Missing file, gestureId, or type" }, { status: 400 });
    }

    // Validate file size (5MB for voice, 10MB for photo)
    const maxSize = type === "voice" ? 5 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: `File too large. Max ${maxSize / 1024 / 1024}MB` }, { status: 400 });
    }

    // Determine file extension
    const ext = type === "voice" ? "webm" : "jpg";
    const path = `${gestureId}/${type}.${ext}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("gestures-media")
      .upload(path, file, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("gestures-media")
      .getPublicUrl(path);

    const publicUrl = urlData.publicUrl;

    // Update gestures table with URL
    const columnName = type === "voice" ? "voice_url" : "photo_url";
    const { error: updateError } = await supabase
      .from("gestures")
      .update({ [columnName]: publicUrl })
      .eq("id", gestureId);

    if (updateError) {
      console.error("Database update error:", updateError);
      // Don't fail - file is uploaded, just log the error
    }

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload" }, { status: 500 });
  }
}
