import prisma from "@/lib/prisma";
import { TVView } from "@/components/tv-dashboard/tv-view";
import AdminGuard from "@/components/admin/admin-guard";

export const dynamic = "force-dynamic";

async function getDashboardData() {
  const [colecoes, referencias, producao, etapas, totalLateEtapas] = await Promise.all([
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
        data_fim: { lt: new Date() }
      },
      include: {
        referencia: {
          select: { nome: true, codigo: true, colecao: { select: { nome: true } } },
        },
      },
      orderBy: { data_fim: "asc" },
      take: 20,
    }),
    prisma.etapaProducao.count({
      where: {
        status: { in: ["pendente", "em_andamento"] },
        data_fim: { lt: new Date() }
      }
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
  const refEmProducao = referencias.filter(
    (r) => r.status === "em_producao"
  ).length;
  
  // Revert: Calculate delayed references based ONLY on explicit status to match "Collection Status: Normal" expectations
  const refAtrasadas = referencias.filter(
    (r) => ["atraso_desenvolvimento", "atraso_logistica"].includes(r.status)
  ).length;

  const refAguardando = referencias.filter(
    (r) => r.status === "normal" && (r.quantidade_produzida || 0) === 0
  ).length;
  
  // Use the real count from DB for the specific "Alerts" list, but don't mix it into the high-level "Ref Atrasadas" card
  // This resolves the divergence where users see "Normal" status on collections but "Delayed" indicators on the main cards.
  const etapasAtrasadasCounts = totalLateEtapas;

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
      name: c.nome,
      produced: totalProd,
      total: totalPrev,
      percentage: totalPrev > 0 ? (totalProd / totalPrev) * 100 : 0
    };
  }); // Removed sort to keep 'created_at desc' order

  return {
    stats: {
      totalColecoes,
      totalReferencias,
      totalProduzidas,
      totalPrevistas,
      refFinalizadas,
      refEmProducao,
      refAtrasadas,
      refAguardando,
      etapasAtrasadas: etapasAtrasadasCounts,
    },
    prodByDay: chartData,
    collectionProgress,
    recentProduction: producao,
    recentReferencias: referencias.slice(0, 10), // Pass recent refs as fallback
    lateEtapas: etapas
  };
}

export default async function Page() {
  const data = await getDashboardData();

  return (
    <AdminGuard>
      <div className="p-4 md:p-8 pt-6 space-y-8 min-h-screen bg-slate-900">
        <TVView {...data} />
      </div>
    </AdminGuard>
  );
}
