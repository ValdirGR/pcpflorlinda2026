"use client";

import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";

interface FotoUploadProps {
    currentFoto?: string | null;
    currentFotoPath?: string | null;
    name?: string;
}

export function FotoUpload({
    currentFoto,
    currentFotoPath,
    name = "foto",
}: FotoUploadProps) {
    const [preview, setPreview] = useState<string | null>(currentFoto || null);
    const [fotoUrl, setFotoUrl] = useState<string>(currentFoto || "");
    const [fotoPath, setFotoPath] = useState<string>(currentFotoPath || "");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setError(null);

        if (file.size > 350 * 1024) {
            setError("Arquivo muito grande. Máximo: 350KB");
            return;
        }

        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
            setError("Use JPG, PNG ou WebP");
            return;
        }

        const reader = new FileReader();
        reader.onload = (ev) => setPreview(ev.target?.result as string);
        reader.readAsDataURL(file);

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            if (fotoPath && !fotoPath.startsWith("http")) {
                formData.append("oldPath", fotoPath);
            }

            const res = await fetch("/api/upload", { method: "POST", body: formData });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Erro ao fazer upload");
                setPreview(currentFoto || null);
                return;
            }

            setFotoUrl(data.url);
            setFotoPath(data.path);
        } catch {
            setError("Erro de conexão");
            setPreview(currentFoto || null);
        } finally {
            setLoading(false);
        }
    }

    async function handleRemove() {
        if (!confirm("Remover a foto?")) return;

        if (fotoPath && !fotoPath.startsWith("http")) {
            try {
                await fetch("/api/upload", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ path: fotoPath }),
                });
            } catch {
                // Silent delete failure
            }
        }

        setPreview(null);
        setFotoUrl("");
        setFotoPath("");
        setError(null);
        if (inputRef.current) inputRef.current.value = "";
    }

    return (
        <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Foto da Referência
            </label>

            <input type="hidden" name={name} value={fotoUrl} />

            <div className="flex items-start gap-4">
                {/* Preview area */}
                <div className="relative w-40 h-40 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
                    {loading ? (
                        <div className="flex flex-col items-center gap-2 text-gray-400">
                            <Loader2 className="h-8 w-8 animate-spin" />
                            <span className="text-xs">Enviando...</span>
                        </div>
                    ) : preview ? (
                        <>
                            <img
                                src={preview}
                                alt="Preview"
                                className="w-full h-full object-cover"
                            />
                            <button
                                type="button"
                                onClick={handleRemove}
                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-sm"
                                title="Remover foto"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </>
                    ) : (
                        <div className="flex flex-col items-center gap-1 text-gray-300">
                            <ImageIcon className="h-10 w-10" />
                            <span className="text-xs">Sem foto</span>
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="flex flex-col gap-2 pt-1">
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors disabled:opacity-50"
                    >
                        <Upload className="h-4 w-4" />
                        {preview ? "Trocar Foto" : "Adicionar Foto"}
                    </button>
                    <p className="text-xs text-gray-400">
                        JPG, PNG ou WebP • Max 350KB
                    </p>

                    {error && (
                        <p className="text-xs text-red-500 font-medium">{error}</p>
                    )}

                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                </div>
            </div>
        </div>
    );
}
