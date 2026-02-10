"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { useState } from "react";

interface FilterProps {
  colecoes: { id: number; nome: string; codigo: string }[];
  currentColecao: string;
  currentStatus: string;
  currentBusca: string;
}

export function ReferenciasFilter({
  colecoes,
  currentColecao,
  currentStatus,
  currentBusca,
}: FilterProps) {
  const router = useRouter();
  const [busca, setBusca] = useState(currentBusca);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams();
    if (key === "colecao_id" && value) params.set("colecao_id", value);
    else if (currentColecao) params.set("colecao_id", currentColecao);

    if (key === "status" && value) params.set("status", value);
    else if (currentStatus) params.set("status", currentStatus);

    if (key === "busca" && value) params.set("busca", value);
    else if (currentBusca && key !== "busca") params.set("busca", currentBusca);

    router.push(`/referencias?${params.toString()}`);
  };

  const clearFilters = () => {
    setBusca("");
    router.push("/referencias");
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-gray-500 mb-1.5">
            Coleção
          </label>
          <select
            value={currentColecao}
            onChange={(e) => updateFilter("colecao_id", e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400"
          >
            <option value="">Todas as Coleções</option>
            {colecoes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome} ({c.codigo})
              </option>
            ))}
          </select>
        </div>

        <div className="w-48">
          <label className="block text-xs font-medium text-gray-500 mb-1.5">
            Status
          </label>
          <select
            value={currentStatus}
            onChange={(e) => updateFilter("status", e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400"
          >
            <option value="">Todos</option>
            <option value="normal">Normal</option>
            <option value="finalizada">Finalizada</option>
            <option value="arquivada">Arquivada</option>
            <option value="atraso_desenvolvimento">Atraso Desenvolvimento</option>
            <option value="atraso_logistica">Atraso Logística</option>
            <option value="em_producao">Em Produção</option>
          </select>
        </div>

        <div className="w-64">
          <label className="block text-xs font-medium text-gray-500 mb-1.5">
            Buscar
          </label>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateFilter("busca", busca);
            }}
            className="relative"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Código ou nome..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400"
            />
          </form>
        </div>

        {(currentColecao || currentStatus || currentBusca) && (
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-1 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-4 w-4" />
            Limpar
          </button>
        )}
      </div>
    </div>
  );
}
