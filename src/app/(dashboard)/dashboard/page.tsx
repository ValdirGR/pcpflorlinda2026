import prisma from "@/lib/prisma";
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
          where: {
            status: { in: ["pendente", "em_andamento"] },
          },
          orderBy: { data_fim: "asc" },
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

  const chartData = Object.entries(prodByDay)
    .map(([date, total]) => ({ date, total }))
    .reverse()
    .slice(-14);

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
    referencias: referencias.slice(0, 12).map((r) => ({
      id: r.id,
      codigo: r.codigo,
      nome: r.nome,
      foto: r.foto,
      status: r.status || "normal",
      quantidade_produzida: r.quantidade_produzida || 0,
      previsao_producao: r.previsao_producao || 0,
      colecao_nome: r.colecao.nome,
      etapas_ativas: r.etapas.length,
      tem_etapa_atrasada: r.etapas.some(
        (e) => e.data_fim && new Date(e.data_fim) < new Date()
      ),
    })),
  };
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-6">
      <StatsCards stats={data.stats} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <ProductionChart data={data.chartData} />
        </div>
        <div>
          <RecentEtapas etapas={data.etapas} />
        </div>
      </div>

      <CollectionProgress collections={data.collectionProgress} />

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Referências Recentes
        </h2>
        <ReferenciasGrid referencias={data.referencias} />
      </div>
    </div>
  );
}
