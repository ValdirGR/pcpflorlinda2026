"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const statusOptions = [
    { label: "Todos", value: "todos", color: "bg-gray-100 text-gray-700 hover:bg-gray-200" },
    { label: "Atrasados", value: "atrasado", color: "bg-red-100 text-red-700 hover:bg-red-200" },
    { label: "Atenção", value: "atencao", color: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200" },
    { label: "Pendentes", value: "pendente", color: "bg-orange-100 text-orange-700 hover:bg-orange-200" },
    { label: "Em Andamento (Em Dia)", value: "em_andamento_dia", color: "bg-blue-100 text-blue-700 hover:bg-blue-200" },
    { label: "Concluídos", value: "concluido", color: "bg-green-100 text-green-700 hover:bg-green-200" },
];

export function CollectionStatusFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentStatus = searchParams.get("status") || "todos";

    const handleFilter = (status: string) => {
        const params = new URLSearchParams(searchParams);
        if (status === "todos") {
            params.delete("status");
        } else {
            params.set("status", status);
        }
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="flex flex-wrap gap-2 mb-6">
            {statusOptions.map((option) => (
                <button
                    key={option.value}
                    onClick={() => handleFilter(option.value)}
                    className={cn(
                        "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                        option.color,
                        currentStatus === option.value && "ring-2 ring-offset-2 ring-gray-300"
                    )}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
}
