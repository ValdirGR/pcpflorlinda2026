"use client";

import { Clock, AlertTriangle } from "lucide-react";
import { getStatusColor, getStatusLabel, isOverdue, formatDate } from "@/lib/utils";

interface EtapaData {
  id: number;
  nome: string;
  status: string;
  data_fim: string | null;
  referencia: string;
  referenciaCodigo: string;
  colecao: string;
}

interface RecentEtapasProps {
  etapas: EtapaData[];
}

export function RecentEtapas({ etapas }: RecentEtapasProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm h-full">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Etapas Pendentes
      </h3>

      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
        {etapas.map((etapa) => {
          const overdue = isOverdue(etapa.data_fim);
          return (
            <div
              key={etapa.id}
              className={`p-3 rounded-lg border ${
                overdue
                  ? "border-red-200 bg-red-50/50"
                  : "border-gray-100 bg-gray-50/50"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900 truncate">
                    {etapa.nome}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {etapa.referenciaCodigo} — {etapa.referencia}
                  </p>
                  <p className="text-xs text-gray-400">{etapa.colecao}</p>
                </div>
                <span
                  className={`flex-shrink-0 ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                    etapa.status
                  )}`}
                >
                  {getStatusLabel(etapa.status)}
                </span>
              </div>
              {etapa.data_fim && (
                <div
                  className={`flex items-center gap-1 mt-2 text-xs ${
                    overdue ? "text-red-600" : "text-gray-400"
                  }`}
                >
                  {overdue ? (
                    <AlertTriangle className="h-3 w-3" />
                  ) : (
                    <Clock className="h-3 w-3" />
                  )}
                  <span>
                    {overdue ? "Vencida" : "Prazo"}: {formatDate(etapa.data_fim)}
                  </span>
                </div>
              )}
            </div>
          );
        })}

        {etapas.length === 0 && (
          <p className="text-center text-gray-400 py-8 text-sm">
            Nenhuma etapa pendente
          </p>
        )}
      </div>
    </div>
  );
}
