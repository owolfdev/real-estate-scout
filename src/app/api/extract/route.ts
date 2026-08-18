import { NextResponse } from "next/server";
import { extractProperty } from "@/lib/openai";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 60;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const text = String(form.get("text") || "");
  const lat = form.get("lat") ? Number(form.get("lat")) : null;
  const lng = form.get("lng") ? Number(form.get("lng")) : null;
  const image = form.get("image");

  let imageBase64: string | undefined;
  let imageMime: string | undefined;
  if (image instanceof File && image.size > 0) {
    const buffer = Buffer.from(await image.arrayBuffer());
    imageBase64 = buffer.toString("base64");
    imageMime = image.type || "image/jpeg";
  }

  if (!text.trim() && !imageBase64) {
    return NextResponse.json(
      { error: "Add notes or a sign photo first." },
      { status: 400 },
    );
  }

  try {
    const extract = await extractProperty({ text, imageBase64, imageMime, lat, lng });
    return NextResponse.json({ extract });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Extraction failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
