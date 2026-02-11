"use client";

import { Trash2 } from "lucide-react";
import { excluirEtapa } from "@/app/actions";

interface DeleteEtapaButtonProps {
  id: number;
  referenciaId: number;
}

export function DeleteEtapaButton({ id, referenciaId }: DeleteEtapaButtonProps) {
  const deleteWithId = excluirEtapa.bind(null, id, referenciaId);

  return (
    <form action={deleteWithId}>
      <button
        type="submit"
        className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
        title="Excluir etapa"
        onClick={(e) => {
          if (!confirm("Tem certeza que deseja excluir esta etapa?")) {
            e.preventDefault();
          }
        }}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </form>
  );
}
