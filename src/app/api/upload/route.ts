import { NextRequest, NextResponse } from "next/server";
import { supabase, BUCKET_NAME, getPublicUrl } from "@/lib/supabase";

const MAX_SIZE = 350 * 1024; // 350KB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;
        const oldPath = formData.get("oldPath") as string | null;

        if (!file) {
            return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
        }

        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json(
                { error: "Tipo não permitido. Use JPG, PNG ou WebP." },
                { status: 400 }
            );
        }

        if (file.size > MAX_SIZE) {
            return NextResponse.json(
                { error: `Arquivo muito grande. Máximo: ${MAX_SIZE / 1024}KB` },
                { status: 400 }
            );
        }

        // Delete old file if provided (for replacement)
        if (oldPath) {
            await supabase.storage.from(BUCKET_NAME).remove([oldPath]);
        }

        const ext = file.name.split(".").pop() || "jpg";
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

        const arrayBuffer = await file.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);

        const { error: uploadError } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(fileName, buffer, {
                contentType: file.type,
                upsert: false,
            });

        if (uploadError) {
            console.error("Upload error:", uploadError);
            return NextResponse.json({ error: "Erro ao fazer upload" }, { status: 500 });
        }

        const publicUrl = getPublicUrl(fileName);

        return NextResponse.json({ url: publicUrl, path: fileName });
    } catch (error) {
        console.error("Upload route error:", error);
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { path } = await request.json();

        if (!path) {
            return NextResponse.json({ error: "Caminho não informado" }, { status: 400 });
        }

        const { error } = await supabase.storage.from(BUCKET_NAME).remove([path]);

        if (error) {
            console.error("Delete error:", error);
            return NextResponse.json({ error: "Erro ao excluir" }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete route error:", error);
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}
