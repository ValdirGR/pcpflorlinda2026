import prisma from "@/lib/prisma";
import Link from "next/link";
import { formatDate, getStatusColor, getStatusLabel, calcPercentage, isOverdue } from "@/lib/utils";
import { ArrowLeft, Pencil, Tag, AlertTriangle } from "lucide-react";
import { auth } from "@/auth";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ColecaoDetalhePage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  const nivel = session?.user?.nivel || "visualizador";

  const colecao = await prisma.colecao.findUnique({
    where: { id: parseInt(id) },
    include: {
      referencias: {
        include: {
          etapas: {
            where: { status: { in: ["pendente", "em_andamento"] } },
            select: { data_fim: true },
          },
        },
        orderBy: { codigo: "asc" },
      },
    },
  });

  if (!colecao) notFound();

  const totalProd = colecao.referencias.reduce(
    (acc, r) => acc + (r.quantidade_produzida || 0),
    0
  );
  const totalPrev = colecao.referencias.reduce(
    (acc, r) => acc + (r.previsao_producao || 0),
    0
  );
  const pct = calcPercentage(totalProd, totalPrev);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/colecoes"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-900">
                {colecao.nome}
              </h2>
              <span className="text-sm text-gray-400">{colecao.codigo}</span>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  colecao.status || "normal"
                )}`}
              >
                {getStatusLabel(colecao.status || "normal")}
              </span>
            </div>
          </div>
        </div>
        {nivel !== "visualizador" && (
          <Link
            href={`/colecoes/${colecao.id}/editar`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-lg text-sm font-medium hover:bg-pink-600 transition-colors"
          >
            <Pencil className="h-4 w-4" />
            Editar
          </Link>
        )}
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">Período</p>
          <p className="text-sm font-medium text-gray-900">
            {formatDate(colecao.data_inicio)} — {formatDate(colecao.data_fim)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">Referências</p>
          <p className="text-2xl font-bold text-gray-900">
            {colecao.referencias.length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">Produção</p>
          <p className="text-sm font-medium text-gray-900">
            {totalProd.toLocaleString("pt-BR")} / {totalPrev.toLocaleString("pt-BR")}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">Progresso</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-100 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  pct >= 100 ? "bg-green-500" : "bg-pink-500"
                }`}
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>
            <span className="text-lg font-bold text-gray-900">{pct}%</span>
          </div>
        </div>
      </div>

      {/* References grid */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Referências desta Coleção
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {colecao.referencias.map((ref) => {
            const refPct = calcPercentage(
              ref.quantidade_produzida || 0,
              ref.previsao_producao || 0
            );
            const hasOverdue = ref.etapas.some(
              (e) => e.data_fim && isOverdue(e.data_fim)
            );

            return (
              <Link
                key={ref.id}
                href={`/referencias/${ref.id}`}
                className="group p-4 rounded-lg border border-gray-100 hover:border-pink-200 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="font-mono text-sm font-medium text-pink-600">
                    {ref.codigo}
                  </span>
                  <div className="flex items-center gap-1">
                    {hasOverdue && (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(
                        ref.status || "normal"
                      )}`}
                    >
                      {getStatusLabel(ref.status || "normal")}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-900 truncate">{ref.nome}</p>
                <div className="mt-3">
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${
                        refPct >= 100 ? "bg-green-500" : "bg-pink-500"
                      }`}
                      style={{ width: `${Math.min(refPct, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>
                      {ref.quantidade_produzida || 0}/{ref.previsao_producao || 0}
                    </span>
                    <span>{refPct}%</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {colecao.referencias.length === 0 && (
          <p className="text-center text-gray-400 py-8">
            Nenhuma referência nesta coleção
          </p>
        )}
      </div>
    </div>
  );
}
