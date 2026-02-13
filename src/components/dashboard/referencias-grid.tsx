"use client";

import Link from "next/link";
import { calcPercentage, getStatusColor, getStatusLabel, getEtapaDisplayColor, isOverdue, isDeadlineNear } from "@/lib/utils";
import { AlertTriangle, Eye } from "lucide-react";

interface ReferenciaData {
  id: number;
  codigo: string;
  nome: string;
  foto: string | null;
  status: string;
  quantidade_produzida: number;
  previsao_producao: number;
  colecao_nome: string;
  etapas_ativas: number;
  tem_etapa_atrasada: boolean;
  etapa_ativa_nome?: string;
  etapa_ativa_status?: string;
  etapa_ativa_urgente?: boolean;
  etapa_ativa_data_fim?: string | null;
  todas_concluidas?: boolean;
}

interface ReferenciasGridProps {
  referencias: ReferenciaData[];
}

export function ReferenciasGrid({ referencias }: ReferenciasGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {referencias.map((ref) => {
        const pct = calcPercentage(ref.quantidade_produzida, ref.previsao_producao);
        return (
          <Link
            key={ref.id}
            href={`/referencias/${ref.id}`}
            className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-pink-200 transition-all duration-300"
          >
            {/* Image */}
            <div className="relative h-40 bg-linear-to-br from-gray-100 to-gray-50 flex items-center justify-center overflow-hidden">
              {ref.foto ? (
                <img
                  src={
                    ref.foto.startsWith("http")
                      ? ref.foto
                      : `https://florlinda.store/pcpflorlinda/uploads/referencias/${ref.foto}`
                  }
                  alt={ref.nome}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <div className="text-4xl text-gray-300 font-bold">
                  {ref.codigo}
                </div>
              )}

              {/* Status badge */}
              <span
                className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium shadow-sm ${getStatusColor(
                  ref.status
                )}`}
              >
                {getStatusLabel(ref.status)}
              </span>

              {/* Alert badge */}
              {ref.tem_etapa_atrasada && (
                <span className="absolute top-2 left-2 p-1.5 bg-red-500 rounded-full shadow-sm">
                  <AlertTriangle className="h-3 w-3 text-white" />
                </span>
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Eye className="h-8 w-8 text-white drop-shadow-lg" />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-pink-500">
                  {ref.codigo}
                </span>
                {ref.etapas_ativas > 0 && (
                  <span className="text-xs text-gray-400">
                    {ref.etapas_ativas} etapa(s)
                  </span>
                )}
              </div>
              <h4 className="font-medium text-gray-900 text-sm truncate">
                {ref.nome}
              </h4>
              <p className="text-xs text-gray-400 mb-2">{ref.colecao_nome}</p>

              {/* Etapa ativa */}
              {ref.etapa_ativa_nome && ref.etapa_ativa_status && (
                <div className="flex items-center gap-1.5 mb-2">
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${ref.etapa_ativa_status === "concluida"
                        ? "bg-green-500"
                        : ref.etapa_ativa_status === "em_andamento"
                          ? (ref.etapa_ativa_data_fim && isOverdue(ref.etapa_ativa_data_fim) ? "bg-red-500" : (ref.etapa_ativa_data_fim && isDeadlineNear(ref.etapa_ativa_data_fim, 5) ? "bg-yellow-500" : "bg-blue-500"))
                          : "bg-orange-500"
                      }`}
                  />
                  <span
                    className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${getEtapaDisplayColor(
                      ref.etapa_ativa_status,
                      ref.etapa_ativa_data_fim
                    )}`}
                  >
                    {ref.etapa_ativa_nome}
                  </span>
                </div>
              )}

              {/* Progress bar */}
              <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1">
                <div
                  className={`h-1.5 rounded-full transition-all ${pct >= 100
                    ? "bg-green-500"
                    : pct >= 50
                      ? "bg-pink-500"
                      : "bg-orange-500"
                    }`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>
                  {ref.quantidade_produzida} / {ref.previsao_producao}
                </span>
                <span>{pct}%</span>
              </div>
            </div>
          </Link>
        );
      })}

      {referencias.length === 0 && (
        <div className="col-span-full text-center text-gray-400 py-12">
          Nenhuma referência cadastrada
        </div>
      )}
    </div>
  );
}
