import prisma from "@/lib/prisma";
import { getEtapaDisplayInfo } from "@/lib/utils";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { ProductionChart } from "@/components/dashboard/production-chart";
import { CollectionProgress } from "@/components/dashboard/collection-progress";
import { RecentEtapas } from "@/components/dashboard/recent-etapas";
import { ReferenciasGrid } from "@/components/dashboard/referencias-grid";

export const dynamic = "force-dynamic";

async function getDashboardData() {
  const [colecoes, referencias, producao, etapas] = await Promise.all([
    prisma.colecao.findMany({
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
      orderBy: { created_at: "desc" },
    }),
    prisma.referencia.findMany({
      include: {
        colecao: { select: { nome: true, codigo: true } },
        etapas: {
          select: { nome: true, status: true, data_fim: true },
          orderBy: { created_at: "asc" },
        },
      },
      orderBy: { created_at: "desc" },
    }),
    prisma.producao.findMany({
      include: {
        referencia: {
          select: { nome: true, codigo: true },
        },
      },
      orderBy: { data_producao: "desc" },
      take: 30,
    }),
    prisma.etapaProducao.findMany({
      where: {
        status: { in: ["pendente", "em_andamento"] },
      },
      include: {
        referencia: {
          select: { nome: true, codigo: true, colecao: { select: { nome: true } } },
        },
      },
      orderBy: { data_fim: "asc" },
      take: 10,
    }),
  ]);

  // Stats
  const totalColecoes = colecoes.length;
  const totalReferencias = referencias.length;
  const totalProduzidas = referencias.reduce(
    (acc, r) => acc + (r.quantidade_produzida || 0),
    0
  );
  const totalPrevistas = referencias.reduce(
    (acc, r) => acc + (r.previsao_producao || 0),
    0
  );
  const refFinalizadas = referencias.filter(
    (r) => r.status === "finalizada"
  ).length;
  const etapasAtrasadas = etapas.filter(
    (e) => e.data_fim && new Date(e.data_fim) < new Date()
  ).length;

  // Production by day (last 30 records)
  const prodByDay = producao.reduce(
    (acc: Record<string, number>, p) => {
      const day = new Date(p.data_producao).toLocaleDateString("pt-BR");
      acc[day] = (acc[day] || 0) + p.quantidade_dia;
      return acc;
    },
    {} as Record<string, number>
  );

  let chartData: { date: string; total: number }[];
  let chartType: "dia" | "referencia" = "dia";

  if (Object.keys(prodByDay).length > 0) {
    chartData = Object.entries(prodByDay)
      .map(([date, total]) => ({ date, total }))
      .reverse()
      .slice(-14);
  } else {
    // Fallback: show production per reference (top 14 with production)
    chartType = "referencia";
    chartData = referencias
      .filter((r) => (r.quantidade_produzida || 0) > 0)
      .sort((a, b) => (b.quantidade_produzida || 0) - (a.quantidade_produzida || 0))
      .slice(0, 14)
      .map((r) => ({
        date: r.codigo,
        total: r.quantidade_produzida || 0,
      }));
  }

  // Collection progress
  const collectionProgress = colecoes.map((c) => {
    const totalProd = c.referencias.reduce(
      (acc, r) => acc + (r.quantidade_produzida || 0),
      0
    );
    const totalPrev = c.referencias.reduce(
      (acc, r) => acc + (r.previsao_producao || 0),
      0
    );
    return {
      id: c.id,
      nome: c.nome,
      codigo: c.codigo,
      status: c.status || "normal",
      totalReferencias: c._count.referencias,
      produzidas: totalProd,
      previstas: totalPrev,
      percentual: totalPrev > 0 ? Math.round((totalProd / totalPrev) * 100) : 0,
    };
  });

  return {
    stats: {
      totalColecoes,
      totalReferencias,
      totalProduzidas,
      totalPrevistas,
      refFinalizadas,
      etapasAtrasadas,
    },
    chartData,
    chartType,
    collectionProgress,
    etapas: etapas.map((e) => ({
      id: e.id,
      nome: e.nome,
      status: e.status || "pendente",
      data_fim: e.data_fim ? e.data_fim.toISOString() : null,
      referencia: e.referencia.nome,
      referenciaCodigo: e.referencia.codigo,
      colecao: e.referencia.colecao.nome,
    })),
    referencias: referencias.slice(0, 12).map((r) => {
      const etapaInfo = getEtapaDisplayInfo(r.etapas as any);
      return {
        id: r.id,
        codigo: r.codigo,
        nome: r.nome,
        foto: r.foto,
        status: r.status || "normal",
        quantidade_produzida: r.quantidade_produzida || 0,
        previsao_producao: r.previsao_producao || 0,
        colecao_nome: r.colecao.nome,
        etapas_ativas: r.etapas.filter((e) => e.status !== "concluida").length,
        tem_etapa_atrasada: r.etapas.some(
          (e) => e.status !== "concluida" && e.data_fim && new Date(e.data_fim) < new Date()
        ),
        etapa_ativa_nome: etapaInfo?.nome,
        etapa_ativa_status: etapaInfo?.status,
        etapa_ativa_urgente: etapaInfo?.urgente,
        todas_concluidas: etapaInfo?.todasConcluidas,
      };
    }),
  };
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-6">
      <StatsCards stats={data.stats} />

      <CollectionProgress collections={data.collectionProgress} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <ProductionChart data={data.chartData} type={data.chartType} />
        </div>
        <div>
          <RecentEtapas etapas={data.etapas} />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Referências Recentes
        </h2>
        <ReferenciasGrid referencias={data.referencias} />
      </div>
    </div>
  );
}
