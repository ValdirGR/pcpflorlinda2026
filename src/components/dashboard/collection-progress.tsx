"use client";

import Link from "next/link";
import { getStatusColor, getStatusLabel } from "@/lib/utils";

interface CollectionData {
  id: number;
  nome: string;
  codigo: string;
  status: string;
  totalReferencias: number;
  produzidas: number;
  previstas: number;
  percentual: number;
}

interface CollectionProgressProps {
  collections: CollectionData[];
}

export function CollectionProgress({ collections }: CollectionProgressProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Progresso por Coleção
        </h3>
        <Link
          href="/colecoes"
          className="text-sm text-pink-500 hover:text-pink-600 font-medium"
        >
          Ver todas →
        </Link>
      </div>

      <div className="space-y-4">
        {collections.map((col) => (
          <Link
            key={col.id}
            href={`/colecoes/${col.id}`}
            className="block p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-gray-900">{col.nome}</span>
                <span className="text-xs text-gray-400">{col.codigo}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                    col.status
                  )}`}
                >
                  {getStatusLabel(col.status)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium text-gray-700">
                  {col.produzidas.toLocaleString("pt-BR")} / {col.previstas.toLocaleString("pt-BR")}
                </span>
                <span className="text-xs text-gray-400 ml-2">
                  ({col.totalReferencias} ref.)
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  col.percentual >= 100
                    ? "bg-gradient-to-r from-green-400 to-green-500"
                    : col.percentual >= 50
                    ? "bg-gradient-to-r from-pink-400 to-rose-500"
                    : "bg-gradient-to-r from-orange-400 to-orange-500"
                }`}
                style={{ width: `${Math.min(col.percentual, 100)}%` }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-400">
                {col.percentual}% completo
              </span>
            </div>
          </Link>
        ))}

        {collections.length === 0 && (
          <p className="text-center text-gray-400 py-8">
            Nenhuma coleção cadastrada
          </p>
        )}
      </div>
    </div>
  );
}
