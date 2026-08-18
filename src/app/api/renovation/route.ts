import { NextResponse } from "next/server";
import { generateRenovation } from "@/lib/openai";
import { createClient } from "@/lib/supabase/server";
import { storageBucket } from "@/lib/supabase/tables";

export const maxDuration = 120;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const notes = String(form.get("notes") || "");
  const files = form.getAll("images").filter((item): item is File => item instanceof File);
  const images: { base64: string; mime?: string }[] = [];

  for (const file of files) {
    if (file.size === 0) continue;
    const buffer = Buffer.from(await file.arrayBuffer());
    images.push({
      base64: buffer.toString("base64"),
      mime: file.type || "image/jpeg",
    });
  }

  const existingPaths = form.getAll("storagePaths").map(String).filter(Boolean);
  if (existingPaths.length) {
    const { data } = await supabase.storage
      .from(storageBucket)
      .createSignedUrls(existingPaths, 60);
    for (const item of data ?? []) {
      if (!item.signedUrl) continue;
      const res = await fetch(item.signedUrl);
      const buffer = Buffer.from(await res.arrayBuffer());
      images.push({
        base64: buffer.toString("base64"),
        mime: res.headers.get("content-type") || "image/jpeg",
      });
    }
  }

  if (!images.length && !notes.trim()) {
    return NextResponse.json(
      { error: "Add photos or a brief first." },
      { status: 400 },
    );
  }

  try {
    const plan = await generateRenovation({ notes, images });
    return NextResponse.json({ plan });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
