import prisma from "@/lib/prisma";
import Link from "next/link";
import { formatDate, getStatusColor, getStatusLabel, calcPercentage, isOverdue } from "@/lib/utils";
import { ArrowLeft, Pencil, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { auth } from "@/auth";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ReferenciaDetalhePage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  const nivel = session?.user?.nivel || "visualizador";

  const referencia = await prisma.referencia.findUnique({
    where: { id: parseInt(id) },
    include: {
      colecao: true,
      etapas: { orderBy: { created_at: "asc" } },
      producoes: { orderBy: { data_producao: "desc" }, take: 20 },
    },
  });

  if (!referencia) notFound();

  const pct = calcPercentage(
    referencia.quantidade_produzida || 0,
    referencia.previsao_producao || 0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/referencias"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-900">
                {referencia.codigo}
              </h2>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  referencia.status || "normal"
                )}`}
              >
                {getStatusLabel(referencia.status || "normal")}
              </span>
            </div>
            <p className="text-gray-500">{referencia.nome}</p>
          </div>
        </div>
        {nivel !== "visualizador" && (
          <Link
            href={`/referencias/${referencia.id}/editar`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-lg text-sm font-medium hover:bg-pink-600 transition-colors"
          >
            <Pencil className="h-4 w-4" />
            Editar
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="xl:col-span-2 space-y-6">
          {/* Details card */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Informações
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <p className="text-xs text-gray-400 mb-1">Coleção</p>
                <p className="text-sm font-medium text-gray-900">
                  {referencia.colecao.nome}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Previsão</p>
                <p className="text-sm font-medium text-gray-900">
                  {referencia.previsao_producao?.toLocaleString("pt-BR") || 0} peças
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Produzido</p>
                <p className="text-sm font-medium text-gray-900">
                  {referencia.quantidade_produzida?.toLocaleString("pt-BR") || 0} peças
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Tempo Produção</p>
                <p className="text-sm font-medium text-gray-900">
                  {referencia.tempo_producao ? `${referencia.tempo_producao} min` : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Distribuição</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(referencia.data_distribuicao)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Marketing</p>
                <p className="text-sm font-medium text-gray-900">
                  {referencia.para_marketing ? "Sim" : "Não"}
                </p>
              </div>
            </div>

            {/* Progress */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Progresso da produção</span>
                <span className="font-medium">{pct}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${
                    pct >= 100
                      ? "bg-gradient-to-r from-green-400 to-green-500"
                      : "bg-gradient-to-r from-pink-400 to-rose-500"
                  }`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
            </div>

            {referencia.observacoes && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-1">Observações</p>
                <p className="text-sm text-gray-700">{referencia.observacoes}</p>
              </div>
            )}
          </div>

          {/* Etapas */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Etapas de Produção ({referencia.etapas.length})
            </h3>
            {referencia.etapas.length > 0 ? (
              <div className="space-y-3">
                {referencia.etapas.map((etapa) => {
                  const overdue =
                    etapa.status !== "concluida" && isOverdue(etapa.data_fim);
                  return (
                    <div
                      key={etapa.id}
                      className={`p-4 rounded-lg border ${
                        overdue
                          ? "border-red-200 bg-red-50/30"
                          : etapa.status === "concluida"
                          ? "border-green-200 bg-green-50/30"
                          : "border-gray-100 bg-gray-50/30"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {etapa.status === "concluida" ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : overdue ? (
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                          ) : (
                            <Clock className="h-5 w-5 text-gray-400" />
                          )}
                          <span className="font-medium text-gray-900">
                            {etapa.nome}
                          </span>
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            etapa.status || "pendente"
                          )}`}
                        >
                          {getStatusLabel(etapa.status || "pendente")}
                        </span>
                      </div>
                      <div className="flex gap-6 mt-2 ml-8 text-xs text-gray-500">
                        <span>Início: {formatDate(etapa.data_inicio)}</span>
                        <span className={overdue ? "text-red-500 font-medium" : ""}>
                          Fim: {formatDate(etapa.data_fim)}
                        </span>
                      </div>
                      {etapa.observacoes && (
                        <p className="mt-2 ml-8 text-xs text-gray-400">
                          {etapa.observacoes}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-400 text-sm text-center py-8">
                Nenhuma etapa cadastrada
              </p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Photo */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
              {referencia.foto ? (
                <img
                  src={`/uploads/referencias/${referencia.foto}`}
                  alt={referencia.nome}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-5xl text-gray-200 font-bold">
                  {referencia.codigo}
                </div>
              )}
            </div>
          </div>

          {/* Recent production */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">
              Produção Recente
            </h3>
            {referencia.producoes.length > 0 ? (
              <div className="space-y-2">
                {referencia.producoes.slice(0, 10).map((p) => (
                  <div
                    key={p.id}
                    className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0"
                  >
                    <span className="text-sm text-gray-500">
                      {formatDate(p.data_producao)}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      +{p.quantidade_dia} peças
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm text-center py-4">
                Sem registros
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
