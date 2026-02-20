"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { excluirReferencia } from "@/app/actions";

interface DeleteReferenciaButtonProps {
    id: number;
    nome: string;
    temEtapas: boolean;
}

export function DeleteReferenciaButton({ id, nome, temEtapas }: DeleteReferenciaButtonProps) {
    const [isPending, startTransition] = useTransition();

    if (temEtapas) {
        return (
            <button
                disabled
                className="p-2 text-gray-300 cursor-not-allowed rounded-lg border border-transparent"
                title="Não é possível excluir: possui etapas cadastradas"
            >
                <Trash2 className="h-4 w-4" />
            </button>
        );
    }

    const handleDelete = () => {
        if (!confirm(`Tem certeza que deseja excluir a referência "${nome}"?`)) return;

        startTransition(async () => {
            try {
                await excluirReferencia(id);
            } catch (error) {
                console.error("Erro ao excluir:", error);
                alert("Erro ao excluir referência");
            }
        });
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isPending}
            className={`p-2 rounded-lg transition-colors ${isPending
                    ? "text-gray-400 cursor-wait"
                    : "text-gray-400 hover:text-red-500 hover:bg-red-50"
                }`}
            title="Excluir"
        >
            <Trash2 className="h-4 w-4" />
        </button>
    );
}
