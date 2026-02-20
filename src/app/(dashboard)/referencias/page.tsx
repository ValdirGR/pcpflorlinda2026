import prisma from "@/lib/prisma";
import Link from "next/link";
import { Plus, Pencil, Trash2, Eye, Search, AlertTriangle } from "lucide-react";
import { getStatusColor, getStatusLabel, calcPercentage, getEtapaDisplayColor, getEtapaDisplayInfo, isOverdue, isDeadlineNear } from "@/lib/utils";
import { auth } from "@/auth";
import { ReferenciasFilter } from "@/components/referencias/filter";
import { DeleteReferenciaButton } from "@/components/referencias/delete-button";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ colecao_id?: string; status?: string; busca?: string }>;
}

export default async function ReferenciasPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const session = await auth();
  const nivel = session?.user?.nivel || "visualizador";

  const colecoes = await prisma.colecao.findMany({
    where: {
      status: { not: "desabilitada" },
    },
    orderBy: { nome: "asc" },
  });

  const where: any = {
    colecao: { status: { not: "desabilitada" } },
  };
  if (params.colecao_id) where.colecao_id = parseInt(params.colecao_id);
  if (params.status) where.status = params.status;
  if (params.busca) {
    where.OR = [
      { nome: { contains: params.busca } },
      { codigo: { contains: params.busca } },
    ];
  }

  const referencias = await prisma.referencia.findMany({
    where,
    include: {
      colecao: { select: { nome: true, codigo: true } },
      etapas: {
        select: { nome: true, status: true, data_fim: true },
        orderBy: { created_at: "asc" },
      },
    },
    orderBy: { created_at: "desc" },
  });

  const refData = referencias.map((r) => {
    const etapaInfo = getEtapaDisplayInfo(r.etapas as any);
    return {
      ...r,
      tem_etapa_atrasada: r.etapas.some(
        (e) => e.status !== "concluida" && e.data_fim && new Date(e.data_fim) < new Date()
      ),
      etapas_ativas: r.etapas.filter((e) => e.status !== "concluida").length,
      etapaInfo,
      nivelAcesso: nivel,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Referências</h2>
        {nivel !== "visualizador" && (
          <Link
            href="/referencias/novo"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-linear-to-r from-pink-500 to-rose-500 text-white rounded-lg font-medium text-sm hover:from-pink-600 hover:to-rose-600 shadow-sm shadow-pink-500/20 transition-all"
          >
            <Plus className="h-4 w-4" />
            Nova Referência
          </Link>
        )}
      </div>

      <ReferenciasFilter
        colecoes={colecoes.map((c) => ({ id: c.id, nome: c.nome, codigo: c.codigo }))}
        currentColecao={params.colecao_id || ""}
        currentStatus={params.status || ""}
        currentBusca={params.busca || ""}
      />

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Coleção
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Progresso
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Etapas
                </th>
                <th className="sticky right-0 bg-gray-50/80 text-right px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {refData.map((ref) => {
                const pct = calcPercentage(
                  ref.quantidade_produzida || 0,
                  ref.previsao_producao || 0
                );
                return (
                  <tr
                    key={ref.id}
                    className="group hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm font-medium text-pink-600">
                        {ref.codigo}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">{ref.nome}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500">
                        {ref.colecao.nome}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 w-24 bg-gray-100 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${pct >= 100 ? "bg-green-500" : "bg-pink-500"
                              }`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-16">
                          {ref.quantidade_produzida || 0}/{ref.previsao_producao || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          ref.status || "normal"
                        )}`}
                      >
                        {getStatusLabel(ref.status || "normal")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {ref.etapaInfo ? (
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`inline-block w-2 h-2 rounded-full ${ref.etapaInfo.status === "concluida"
                              ? "bg-green-500"
                              : ref.etapaInfo.status === "em_andamento"
                                ? (ref.etapaInfo.dataFim && isOverdue(ref.etapaInfo.dataFim) ? "bg-red-500" : (ref.etapaInfo.dataFim && isDeadlineNear(ref.etapaInfo.dataFim, 5) ? "bg-yellow-500" : "bg-blue-500"))
                                : "bg-orange-500"
                              }`}
                          />
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${getEtapaDisplayColor(
                              ref.etapaInfo.status,
                              ref.etapaInfo.dataFim
                            )}`}
                          >
                            {ref.etapaInfo.nome}
                          </span>
                          {ref.tem_etapa_atrasada && (
                            <AlertTriangle className="h-3 w-3 text-red-500 ml-1" />
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                    <td className="sticky right-0 bg-white group-hover:bg-gray-50/50 px-3 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-0">
                        <Link
                          href={`/referencias/${ref.id}`}
                          className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-md transition-colors"
                          title="Detalhes"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        {nivel !== "visualizador" && (
                          <Link
                            href={`/referencias/${ref.id}/editar`}
                            className="p-1.5 text-gray-400 hover:text-pink-500 hover:bg-pink-50 rounded-md transition-colors"
                            title="Editar"
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                        )}
                        {nivel !== "visualizador" && (
                          <DeleteReferenciaButton
                            id={ref.id}
                            codigo={ref.codigo}
                            nome={ref.nome}
                            temEtapas={ref.etapas.length > 0}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {refData.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    Nenhuma referência encontrada
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50 text-sm text-gray-500">
          {refData.length} referência(s)
        </div>
      </div>
    </div >
  );
}
