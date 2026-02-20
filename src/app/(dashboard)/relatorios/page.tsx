import prisma from "@/lib/prisma";
import { calcPercentage, formatDate, getStatusColor, getStatusLabel } from "@/lib/utils";
import { BarChart3, AlertTriangle, Clock, TrendingUp } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function RelatoriosPage() {
  const [colecoes, referencias, etapasAtrasadas] = await Promise.all([
    prisma.colecao.findMany({
      where: { status: { not: "desabilitada" } },
      include: {
        _count: { select: { referencias: true } },
        referencias: {
          select: {
            quantidade_produzida: true,
            previsao_producao: true,
            status: true,
          },
        },
      },
      orderBy: { nome: "asc" },
    }),
    prisma.referencia.findMany({
      where: { colecao: { status: { not: "desabilitada" } } },
      select: { status: true },
    }),
    prisma.etapaProducao.findMany({
      where: {
        status: { in: ["pendente", "em_andamento"] },
        data_fim: { lt: new Date() },
        referencia: { colecao: { status: { not: "desabilitada" } } },
      },
      include: {
        referencia: {
          select: {
            codigo: true,
            nome: true,
            colecao: { select: { nome: true } },
          },
        },
      },
      orderBy: { data_fim: "asc" },
    }),
  ]);

  // Status summary
  const statusCount = referencias.reduce(
    (acc: Record<string, number>, r) => {
      const s = r.status || "normal";
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Collection progress
  const colProgress = colecoes.map((c) => {
    const totalProd = c.referencias.reduce(
      (acc, r) => acc + (r.quantidade_produzida || 0),
      0
    );
    const totalPrev = c.referencias.reduce(
      (acc, r) => acc + (r.previsao_producao || 0),
      0
    );
    const finalizadas = c.referencias.filter(
      (r) => r.status === "finalizada"
    ).length;
    return {
      id: c.id,
      nome: c.nome,
      totalRef: c._count.referencias,
      finalizadas,
      produzidas: totalProd,
      previstas: totalPrev,
      pct: calcPercentage(totalProd, totalPrev),
    };
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Relatórios</h2>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <BarChart3 className="h-5 w-5 text-blue-500" />
            </div>
            <h3 className="font-semibold text-gray-900">Status das Referências</h3>
          </div>
          <div className="space-y-3">
            {Object.entries(statusCount).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    status
                  )}`}
                >
                  {getStatusLabel(status)}
                </span>
                <span className="text-sm font-medium text-gray-700">
                  {count} ({Math.round((count / referencias.length) * 100)}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-50 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <h3 className="font-semibold text-gray-900">
              Etapas Atrasadas ({etapasAtrasadas.length})
            </h3>
          </div>
          <div className="space-y-2 max-h-[250px] overflow-y-auto">
            {etapasAtrasadas.slice(0, 10).map((e) => (
              <div
                key={e.id}
                className="p-2 bg-red-50/50 rounded-lg border border-red-100 text-sm"
              >
                <p className="font-medium text-gray-900 text-xs">
                  {e.nome}
                </p>
                <p className="text-xs text-gray-500">
                  {e.referencia.codigo} — {e.referencia.nome}
                </p>
                <p className="text-xs text-red-500 mt-1">
                  Vencida: {formatDate(e.data_fim)}
                </p>
              </div>
            ))}
            {etapasAtrasadas.length === 0 && (
              <p className="text-sm text-gray-400">Nenhuma etapa atrasada</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <h3 className="font-semibold text-gray-900">Resumo Geral</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total Coleções</span>
              <span className="font-medium">{colecoes.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total Referências</span>
              <span className="font-medium">{referencias.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Finalizadas</span>
              <span className="font-medium text-green-600">
                {statusCount["finalizada"] || 0}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Em Produção</span>
              <span className="font-medium text-blue-600">
                {(statusCount["normal"] || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Production by collection */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Produção por Coleção
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Coleção
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Referências
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Finalizadas
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Produção
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase w-48">
                  Progresso
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {colProgress.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/colecoes/${c.id}`}
                      className="font-medium text-gray-900 hover:text-pink-500 text-sm"
                    >
                      {c.nome}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-700">
                    {c.totalRef}
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-green-600">
                    {c.finalizadas}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-700">
                    {c.produzidas.toLocaleString("pt-BR")} / {c.previstas.toLocaleString("pt-BR")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${c.pct >= 100 ? "bg-green-500" : "bg-pink-500"
                            }`}
                          style={{ width: `${Math.min(c.pct, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-500 w-10 text-right">
                        {c.pct}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
