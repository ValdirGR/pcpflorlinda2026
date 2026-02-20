import prisma from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { formatDate, getStatusColor, getStatusLabel, calcPercentage, isOverdue, getEtapaDisplayColor, getEtapaDisplayInfo, isDeadlineNear } from "@/lib/utils";
import { ArrowLeft, Pencil, Tag, AlertTriangle, ImageOff, Camera } from "lucide-react";
import { CollectionStatusFilter } from "@/components/colecoes/status-filter";
import { auth } from "@/auth";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string }>;
}

export default async function ColecaoDetalhePage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { status } = await searchParams;
  const session = await auth();
  const nivel = session?.user?.nivel || "visualizador";

  const colecao = await prisma.colecao.findUnique({
    where: { id: parseInt(id) },
    include: {
      referencias: {
        include: {
          etapas: {
            select: { nome: true, status: true, data_inicio: true, data_fim: true },
            orderBy: { created_at: "asc" },
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

  // Calculate counts and filter references
  const counts = {
    todos: colecao.referencias.length,
    atrasado: 0,
    atencao: 0,
    pendente: 0,
    em_andamento_dia: 0,
    concluido: 0,
  };

  const filteredReferencias = colecao.referencias.filter((ref) => {
    const etapaInfo = getEtapaDisplayInfo(ref.etapas as any);
    const statusEtapa = etapaInfo?.status;

    // Atraso/atenção baseados na última etapa
    const isOverdueItem = etapaInfo?.dataFim && isOverdue(etapaInfo.dataFim);
    const isNearItem = etapaInfo?.dataFim && isDeadlineNear(etapaInfo.dataFim, 5);

    // Determine category for counting
    let category = "";

    if (!etapaInfo) {
      // Sem etapas ou todas concluídas
      if (ref.etapas.length === 0) {
        category = "pendente";
        counts.pendente++;
      } else {
        category = "concluido";
        counts.concluido++;
      }
    } else if (statusEtapa === "pendente") {
      if (isOverdueItem) {
        category = "atrasado";
        counts.atrasado++;
      } else if (isNearItem) {
        category = "atencao";
        counts.atencao++;
      } else {
        category = "pendente";
        counts.pendente++;
      }
    } else if (statusEtapa === "em_andamento") {
      if (isOverdueItem) {
        category = "atrasado";
        counts.atrasado++;
      } else if (isNearItem) {
        category = "atencao";
        counts.atencao++;
      } else {
        category = "em_andamento_dia";
        counts.em_andamento_dia++;
      }
    }

    // Filter based on selected status
    if (!status || status === "todos") return true;
    return status === category;
  });

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
                className={`h-2 rounded-full ${pct >= 100 ? "bg-green-500" : "bg-pink-500"
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

        <CollectionStatusFilter counts={counts} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredReferencias.map((ref) => {
            const refPct = calcPercentage(
              ref.quantidade_produzida || 0,
              ref.previsao_producao || 0
            );
            const hasOverdue = ref.etapas.some(
              (e) => e.status !== "concluida" && e.data_fim && isOverdue(e.data_fim)
            );
            const etapaInfo = getEtapaDisplayInfo(ref.etapas as any);

            return (
              <Link
                key={ref.id}
                href={`/referencias/${ref.id}`}
                className="group rounded-lg border border-gray-100 hover:border-pink-200 hover:shadow-md transition-all overflow-hidden"
              >
                {/* Foto da referência — proporção 600×400 (3:2) */}
                <div className="relative w-full" style={{ aspectRatio: "600 / 400" }}>
                  {ref.foto ? (
                    <Image
                      src={
                        ref.foto.startsWith("http")
                          ? ref.foto
                          : `https://florlinda.store/pcpflorlinda/uploads/referencias/${ref.foto}`
                      }
                      alt={ref.nome}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gray-50 flex flex-col items-center justify-center text-gray-300">
                      <ImageOff className="h-8 w-8 mb-1" />
                      <span className="text-[10px]">Sem foto</span>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-sm font-medium text-pink-600">
                        {ref.codigo}
                      </span>
                      {ref.para_marketing && (
                        <Camera className="h-3.5 w-3.5 text-purple-500" />
                      )}
                    </div>
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

                  {/* Etapa ativa */}
                  {etapaInfo ? (
                    <>
                      <div className="flex items-center gap-1.5 mt-2">
                        <span
                          className={`inline-block w-2 h-2 rounded-full ${etapaInfo.status === "concluida"
                            ? "bg-green-500"
                            : etapaInfo.status === "em_andamento"
                              ? (etapaInfo.dataFim && isOverdue(etapaInfo.dataFim) ? "bg-red-500" : (etapaInfo.dataFim && isDeadlineNear(etapaInfo.dataFim, 5) ? "bg-yellow-500" : "bg-blue-500"))
                              : "bg-orange-500"
                            }`}
                        />
                        <span
                          className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${getEtapaDisplayColor(
                            etapaInfo.status,
                            etapaInfo.dataFim
                          )}`}
                        >
                          {etapaInfo.nome}
                        </span>
                      </div>
                      {etapaInfo.status !== "concluida" && (etapaInfo.dataInicio || etapaInfo.dataFim) && (
                        <div className="mt-1 ml-3.5 text-[10px] text-gray-400">
                          <span>Início: {formatDate(etapaInfo.dataInicio ?? null)}</span>
                          <span className="ml-3">Fim: {formatDate(etapaInfo.dataFim ?? null)}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="inline-block w-2 h-2 rounded-full bg-gray-300" />
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                        Sem etapas
                      </span>
                    </div>
                  )}

                  <div className="mt-3">
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${refPct >= 100 || ref.status === "finalizada" ? "bg-green-500" : "bg-pink-500"
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
