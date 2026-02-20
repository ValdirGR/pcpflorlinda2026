import prisma from "@/lib/prisma";
import { calcPercentage } from "@/lib/utils";
import { EtapasPorColecaoChart } from "@/components/gerencial/etapas-por-colecao-chart";
import { GanttColecoesChart } from "@/components/gerencial/gantt-colecoes-chart";
import { BurndownChart } from "@/components/gerencial/burndown-chart";
import { HeatmapReferencias } from "@/components/gerencial/heatmap-referencias";
import { StatusDonutChart, STATUS_COLORS, STATUS_LABELS } from "@/components/gerencial/status-donut-chart";
import { EvolucaoSemanalChart } from "@/components/gerencial/evolucao-semanal-chart";
import { RankingAtrasadasChart } from "@/components/gerencial/ranking-atrasadas-chart";
import { GaugeCapacidade } from "@/components/gerencial/gauge-capacidade";

export const dynamic = "force-dynamic";

async function getGerencialData() {
    const [colecoes, referencias, etapas, producoes] = await Promise.all([
        prisma.colecao.findMany({
            where: { status: { not: "desabilitada" } },
            select: {
                id: true,
                nome: true,
                codigo: true,
                data_inicio: true,
                data_fim: true,
                referencias: {
                    select: {
                        id: true,
                        codigo: true,
                        nome: true,
                        previsao_producao: true,
                        quantidade_produzida: true,
                        status: true,
                        etapas: {
                            select: { nome: true, status: true, data_inicio: true, data_fim: true },
                            orderBy: { created_at: "asc" as const },
                        },
                    },
                },
            },
            orderBy: { nome: "asc" },
        }),
        prisma.referencia.findMany({
            where: { colecao: { status: { not: "desabilitada" } } },
            select: {
                id: true,
                codigo: true,
                nome: true,
                previsao_producao: true,
                quantidade_produzida: true,
                status: true,
            },
        }),
        prisma.etapaProducao.findMany({
            where: {
                status: { in: ["pendente", "em_andamento"] },
                data_fim: { lt: new Date() },
                referencia: { colecao: { status: { not: "desabilitada" } } },
            },
            include: {
                referencia: {
                    select: { codigo: true, nome: true },
                },
            },
            orderBy: { data_fim: "asc" },
        }),
        prisma.producao.findMany({
            where: {
                referencia: { colecao: { status: { not: "desabilitada" } } },
            },
            select: {
                quantidade_dia: true,
                data_producao: true,
            },
            orderBy: { data_producao: "asc" },
        }),
    ]);

    // ============================
    // 1. ETAPAS POR COLEÇÃO (barras empilhadas)
    // ============================
    const etapasPorColecao = colecoes.map((c) => {
        let pendente = 0;
        let em_andamento = 0;
        let concluida = 0;
        c.referencias.forEach((r) => {
            r.etapas.forEach((e) => {
                if (e.status === "concluida") concluida++;
                else if (e.status === "em_andamento") em_andamento++;
                else pendente++;
            });
        });
        return {
            colecao: c.codigo || c.nome.substring(0, 15),
            pendente,
            em_andamento,
            concluida,
        };
    });

    // ============================
    // 2. GANTT DE COLEÇÕES
    // ============================
    const now = new Date();
    const allDates = colecoes.flatMap((c) => [
        new Date(c.data_inicio).getTime(),
        new Date(c.data_fim).getTime(),
    ]);
    const minDate = Math.min(...allDates, now.getTime());

    const ganttData = colecoes.map((c) => {
        const inicio = new Date(c.data_inicio).getTime();
        const fim = new Date(c.data_fim).getTime();
        const atrasada = fim < now.getTime();
        return {
            nome: c.codigo || c.nome.substring(0, 15),
            inicio: inicio - minDate,
            duracao: fim - inicio,
            atrasada,
            dataInicioLabel: new Date(c.data_inicio).toLocaleDateString("pt-BR"),
            dataFimLabel: new Date(c.data_fim).toLocaleDateString("pt-BR"),
        };
    });
    const hojeGantt = now.getTime() - minDate;

    // ============================
    // 3. BURNDOWN/BURNUP
    // ============================
    const totalMeta = referencias.reduce((acc, r) => acc + (r.previsao_producao || 0), 0);

    // Group production by week
    const prodByWeek: Record<string, number> = {};
    producoes.forEach((p) => {
        const d = new Date(p.data_producao);
        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - d.getDay());
        const key = weekStart.toISOString().slice(0, 10);
        prodByWeek[key] = (prodByWeek[key] || 0) + p.quantidade_dia;
    });

    const weekKeys = Object.keys(prodByWeek).sort();
    let acumulado = 0;
    const burndownData = weekKeys.map((week, i) => {
        acumulado += prodByWeek[week];
        const metaIdeal = weekKeys.length > 1
            ? Math.round((totalMeta / (weekKeys.length - 1)) * i)
            : totalMeta;
        return {
            label: new Date(week).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
            acumulado,
            meta: metaIdeal,
        };
    });

    // ============================
    // 4. HEATMAP DE REFERÊNCIAS
    // ============================
    const heatmapData = referencias
        .filter((r) => (r.previsao_producao || 0) > 0)
        .map((r) => ({
            codigo: r.codigo,
            nome: r.nome,
            previsao: r.previsao_producao || 0,
            percentual: calcPercentage(r.quantidade_produzida || 0, r.previsao_producao || 0),
        }));

    // ============================
    // 5. DONUT DE STATUS
    // ============================
    const statusCount: Record<string, number> = {};
    referencias.forEach((r) => {
        const s = r.status || "normal";
        statusCount[s] = (statusCount[s] || 0) + 1;
    });

    const donutData = Object.entries(statusCount)
        .map(([status, value]) => ({
            name: STATUS_LABELS[status] || status,
            value,
            color: STATUS_COLORS[status] || "#94a3b8",
        }))
        .sort((a, b) => b.value - a.value);

    // ============================
    // 6. EVOLUÇÃO SEMANAL
    // ============================
    const evolucaoData = weekKeys.map((week) => ({
        semana: new Date(week).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
        total: prodByWeek[week],
    }));

    // ============================
    // 7. RANKING ATRASADAS
    // ============================
    const rankingData = etapas
        .filter((e) => e.data_fim)
        .map((e) => {
            const diasAtraso = Math.ceil(
                (now.getTime() - new Date(e.data_fim!).getTime()) / (1000 * 3600 * 24)
            );
            return {
                nome: e.referencia.nome,
                codigo: e.referencia.codigo,
                diasAtraso,
                etapa: e.nome,
            };
        })
        .sort((a, b) => b.diasAtraso - a.diasAtraso)
        .slice(0, 15);

    // ============================
    // 8. GAUGE DE CAPACIDADE
    // ============================
    const totalProduzido = referencias.reduce(
        (acc, r) => acc + (r.quantidade_produzida || 0),
        0
    );
    const faltando = totalMeta - totalProduzido;

    // Calculate business days remaining (rough approximation)
    const lastProduction = producoes.length > 0
        ? new Date(producoes[producoes.length - 1].data_producao)
        : now;
    const firstProduction = producoes.length > 0
        ? new Date(producoes[0].data_producao)
        : now;
    const diasTrabalhados = Math.max(
        1,
        Math.ceil((lastProduction.getTime() - firstProduction.getTime()) / (1000 * 3600 * 24)) || 1
    );

    // Average daily production based on actual data
    const mediaRealizada = totalProduzido / diasTrabalhados;

    // Days needed at current rate to finish
    const mediaNecessaria = faltando > 0 ? faltando / Math.max(diasTrabalhados * 0.5, 20) : mediaRealizada;

    return {
        etapasPorColecao,
        ganttData,
        hojeGantt,
        burndownData,
        totalMeta,
        heatmapData,
        donutData,
        totalReferencias: referencias.length,
        evolucaoData,
        rankingData,
        gaugeData: {
            mediaNecessaria: Math.round(mediaNecessaria),
            mediaRealizada: Math.round(mediaRealizada),
            totalMeta,
            totalProduzido,
        },
    };
}

export default async function GerencialPage() {
    const data = await getGerencialData();

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Gerencial</h2>
                <p className="text-sm text-gray-400 mt-1">Visão analítica completa da produção</p>
            </div>

            {/* Row 1: Donut + Gauge */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <StatusDonutChart data={data.donutData} total={data.totalReferencias} />
                </div>
                <div>
                    <GaugeCapacidade data={data.gaugeData} />
                </div>
            </div>

            {/* Row 2: Etapas & Burndown */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <EtapasPorColecaoChart data={data.etapasPorColecao} />
                <BurndownChart data={data.burndownData} totalMeta={data.totalMeta} />
            </div>

            {/* Row 3: Evolução & Heatmap */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <EvolucaoSemanalChart data={data.evolucaoData} />
                <HeatmapReferencias data={data.heatmapData} />
            </div>

            {/* Row 4: Gantt */}
            <GanttColecoesChart data={data.ganttData} hoje={data.hojeGantt} />

            {/* Row 5: Ranking */}
            <RankingAtrasadasChart data={data.rankingData} />
        </div>
    );
}
