"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { excluirReferencia } from "@/app/actions";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { toast } from "sonner";

interface DeleteReferenciaButtonProps {
    id: number;
    codigo: string;
    nome: string;
    temEtapas: boolean;
}

export function DeleteReferenciaButton({ id, codigo, nome, temEtapas }: DeleteReferenciaButtonProps) {
    const [isPending, startTransition] = useTransition();
    const [showFirst, setShowFirst] = useState(false);
    const [showSecond, setShowSecond] = useState(false);

    // Só mostra o botão se NÃO tiver etapas cadastradas
    if (temEtapas) return null;

    const handleFirstConfirm = () => {
        setShowFirst(false);
        setShowSecond(true);
    };

    const handleSecondConfirm = () => {
        setShowSecond(false);
        startTransition(async () => {
            try {
                await excluirReferencia(id);
                toast.success(`Referência "${nome}" (${codigo}) excluída com sucesso!`);
            } catch (error) {
                console.error("Erro ao excluir:", error);
                toast.error("Erro ao excluir referência: " + (error as Error).message);
            }
        });
    };

    return (
        <>
            <button
                onClick={() => setShowFirst(true)}
                disabled={isPending}
                className={`p-1.5 rounded-md transition-colors ${
                    isPending
                        ? "text-gray-400 cursor-wait"
                        : "text-red-400 hover:text-red-600 hover:bg-red-50"
                }`}
                title="Excluir referência"
            >
                <Trash2 className="h-4 w-4" />
            </button>

            {/* Primeira confirmação */}
            <ConfirmDialog
                isOpen={showFirst}
                onClose={() => setShowFirst(false)}
                onConfirm={handleFirstConfirm}
                title="Excluir referência?"
                message={`Deseja excluir a referência "${nome}" (código: ${codigo})? Esta ação não poderá ser desfeita.`}
                confirmLabel="Sim, excluir"
                cancelLabel="Cancelar"
                variant="danger"
            />

            {/* Segunda confirmação (dupla confirmação) */}
            <ConfirmDialog
                isOpen={showSecond}
                onClose={() => setShowSecond(false)}
                onConfirm={handleSecondConfirm}
                title="Confirmar exclusão definitiva"
                message={`Tem certeza ABSOLUTA? A referência "${nome}" será removida permanentemente do sistema.`}
                confirmLabel="Confirmar exclusão definitiva"
                cancelLabel="Voltar"
                variant="danger"
                isLoading={isPending}
            />
        </>
    );
}
