"use client";

import { useState, useMemo } from "react";
import { calcPercentage } from "@/lib/utils";
import { EtapasPorColecaoChart } from "@/components/gerencial/etapas-por-colecao-chart";
import { GanttColecoesChart } from "@/components/gerencial/gantt-colecoes-chart";
import { BurndownChart } from "@/components/gerencial/burndown-chart";
import { HeatmapReferencias } from "@/components/gerencial/heatmap-referencias";
import { StatusDonutChart, STATUS_COLORS, STATUS_LABELS } from "@/components/gerencial/status-donut-chart";
import { EvolucaoSemanalChart } from "@/components/gerencial/evolucao-semanal-chart";
import { RankingAtrasadasChart } from "@/components/gerencial/ranking-atrasadas-chart";
import { GaugeCapacidade } from "@/components/gerencial/gauge-capacidade";
import { Filter, X } from "lucide-react";

// =============================================
// TYPES
// =============================================
export interface ColecaoRaw {
    id: number;
    nome: string;
    codigo: string;
    data_inicio: string;
    data_fim: string;
    referencias: ReferenciaRaw[];
}

export interface ReferenciaRaw {
    id: number;
    codigo: string;
    nome: string;
    previsao_producao: number;
    quantidade_produzida: number | null;
    status: string;
    etapas: EtapaRaw[];
}

export interface EtapaRaw {
    nome: string;
    status: string | null;
    data_inicio: string | null;
    data_fim: string | null;
}

export interface EtapaAtrasadaRaw {
    id: number;
    nome: string;
    data_fim: string | null;
    referencia: { codigo: string; nome: string };
}

export interface ProducaoRaw {
    quantidade_dia: number;
    data_producao: string;
}

interface GerencialContentProps {
    colecoes: ColecaoRaw[];
    referencias: { id: number; codigo: string; nome: string; previsao_producao: number; quantidade_produzida: number | null; status: string }[];
    etapasAtrasadas: EtapaAtrasadaRaw[];
    producoes: ProducaoRaw[];
}

// =============================================
// STATUS OPTIONS
// =============================================
const STATUS_OPTIONS: Record<string, string> = {
    normal: "Normal",
    finalizada: "Finalizada",
    em_producao: "Em Produção",
    atraso_desenvolvimento: "Atraso Desenv.",
    atraso_logistica: "Atraso Logística",
    arquivada: "Arquivada",
};

export function GerencialContent({ colecoes, referencias, etapasAtrasadas, producoes }: GerencialContentProps) {
    const [selectedColecao, setSelectedColecao] = useState<string>("todas");
    const [selectedStatus, setSelectedStatus] = useState<string>("todos");

    // =============================================
    // FILTERED DATA
    // =============================================
    const filtered = useMemo(() => {
        // Filter collections
        const filteredColecoes = selectedColecao === "todas"
            ? colecoes
            : colecoes.filter((c) => String(c.id) === selectedColecao);

        // Get all ref IDs from filtered collections
        const refIds = new Set(filteredColecoes.flatMap((c) => c.referencias.map((r) => r.id)));

        // Filter references
        let filteredRefs = referencias.filter((r) => refIds.has(r.id));
        if (selectedStatus !== "todos") {
            filteredRefs = filteredRefs.filter((r) => r.status === selectedStatus);
        }
        const filteredRefIds = new Set(filteredRefs.map((r) => r.id));

        // Filter etapas atrasadas (by ref code matching filtered refs)
        const filteredRefCodigos = new Set(filteredRefs.map((r) => r.codigo));
        const filteredEtapas = etapasAtrasadas.filter((e) => filteredRefCodigos.has(e.referencia.codigo));

        const now = new Date();

        // ============================
        // 1. ETAPAS POR COLEÇÃO
        // ============================
        const etapasPorColecao = filteredColecoes.map((c) => {
            let pendente = 0;
            let em_andamento = 0;
            let concluida = 0;
            const refs = selectedStatus !== "todos"
                ? c.referencias.filter((r) => r.status === selectedStatus)
                : c.referencias;
            refs.forEach((r) => {
                r.etapas.forEach((e) => {
                    if (e.status === "concluida") concluida++;
                    else if (e.status === "em_andamento") em_andamento++;
                    else pendente++;
                });
            });
            return { colecao: c.codigo || c.nome.substring(0, 15), pendente, em_andamento, concluida };
        });

        // ============================
        // 2. GANTT
        // ============================
        const allDates = filteredColecoes.flatMap((c) => [
            new Date(c.data_inicio).getTime(),
            new Date(c.data_fim).getTime(),
        ]);
        const minDate = Math.min(...allDates, now.getTime());

        const ganttData = filteredColecoes.map((c) => {
            const inicio = new Date(c.data_inicio).getTime();
            const fim = new Date(c.data_fim).getTime();
            return {
                nome: c.codigo || c.nome.substring(0, 15),
                inicio: inicio - minDate,
                duracao: fim - inicio,
                atrasada: fim < now.getTime(),
                dataInicioLabel: new Date(c.data_inicio).toLocaleDateString("pt-BR"),
                dataFimLabel: new Date(c.data_fim).toLocaleDateString("pt-BR"),
            };
        });
        const hojeGantt = now.getTime() - minDate;

        // ============================
        // 3. BURNUP
        // ============================
        const totalMeta = filteredRefs.reduce((acc, r) => acc + (r.previsao_producao || 0), 0);

        let burndownData: { label: string; acumulado: number; meta: number }[] = [];
        if (producoes.length > 0 && selectedColecao === "todas" && selectedStatus === "todos") {
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
            burndownData = weekKeys.map((week, i) => {
                acumulado += prodByWeek[week];
                return {
                    label: new Date(week).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
                    acumulado,
                    meta: weekKeys.length > 1 ? Math.round((totalMeta / (weekKeys.length - 1)) * i) : totalMeta,
                };
            });
        } else {
            let acumulado = 0;
            let metaAcumulada = 0;
            burndownData = filteredColecoes.map((c) => {
                const refs = selectedStatus !== "todos" ? c.referencias.filter((r) => r.status === selectedStatus) : c.referencias;
                const prodCol = refs.reduce((acc, r) => acc + (r.quantidade_produzida || 0), 0);
                const metaCol = refs.reduce((acc, r) => acc + (r.previsao_producao || 0), 0);
                acumulado += prodCol;
                metaAcumulada += metaCol;
                return { label: c.codigo || c.nome.substring(0, 10), acumulado, meta: metaAcumulada };
            });
        }

        // ============================
        // 4. HEATMAP
        // ============================
        const heatmapData = filteredRefs
            .filter((r) => (r.previsao_producao || 0) > 0)
            .map((r) => ({
                codigo: r.codigo,
                nome: r.nome,
                previsao: r.previsao_producao || 0,
                percentual: calcPercentage(r.quantidade_produzida || 0, r.previsao_producao || 0),
            }));

        // ============================
        // 5. DONUT
        // ============================
        const statusCount: Record<string, number> = {};
        const refsForDonut = selectedColecao === "todas"
            ? referencias.filter((r) => selectedStatus === "todos" || r.status === selectedStatus)
            : filteredRefs;
        refsForDonut.forEach((r) => {
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
        // 6. EVOLUÇÃO
        // ============================
        let evolucaoData: { semana: string; total: number }[] = [];
        if (producoes.length > 0 && selectedColecao === "todas" && selectedStatus === "todos") {
            const prodByWeek: Record<string, number> = {};
            producoes.forEach((p) => {
                const d = new Date(p.data_producao);
                const weekStart = new Date(d);
                weekStart.setDate(d.getDate() - d.getDay());
                const key = weekStart.toISOString().slice(0, 10);
                prodByWeek[key] = (prodByWeek[key] || 0) + p.quantidade_dia;
            });
            evolucaoData = Object.keys(prodByWeek).sort().map((week) => ({
                semana: new Date(week).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
                total: prodByWeek[week],
            }));
        } else {
            evolucaoData = filteredColecoes.map((c) => {
                const refs = selectedStatus !== "todos" ? c.referencias.filter((r) => r.status === selectedStatus) : c.referencias;
                return {
                    semana: c.codigo || c.nome.substring(0, 10),
                    total: refs.reduce((acc, r) => acc + (r.quantidade_produzida || 0), 0),
                };
            });
        }

        // ============================
        // 7. RANKING ATRASADAS
        // ============================
        const rankingData = filteredEtapas
            .filter((e) => e.data_fim)
            .map((e) => ({
                nome: e.referencia.nome,
                codigo: e.referencia.codigo,
                diasAtraso: Math.ceil((now.getTime() - new Date(e.data_fim!).getTime()) / (1000 * 3600 * 24)),
                etapa: e.nome,
            }))
            .sort((a, b) => b.diasAtraso - a.diasAtraso)
            .slice(0, 15);

        // ============================
        // 8. GAUGE
        // ============================
        const totalProduzido = filteredRefs.reduce((acc, r) => acc + (r.quantidade_produzida || 0), 0);
        const faltando = totalMeta - totalProduzido;

        const earliestStart = filteredColecoes.reduce((min, c) => {
            const d = new Date(c.data_inicio).getTime();
            return d < min ? d : min;
        }, now.getTime());
        const diasTrabalhados = Math.max(1, Math.ceil((now.getTime() - earliestStart) / (1000 * 3600 * 24)));
        const mediaRealizada = totalProduzido / diasTrabalhados;

        const latestEnd = filteredColecoes.reduce((max, c) => {
            const d = new Date(c.data_fim).getTime();
            return d > max ? d : max;
        }, now.getTime());
        const diasRestantes = Math.max(1, Math.ceil((latestEnd - now.getTime()) / (1000 * 3600 * 24)));
        const mediaNecessaria = faltando > 0 ? faltando / diasRestantes : mediaRealizada;

        return {
            etapasPorColecao,
            ganttData,
            hojeGantt,
            burndownData,
            totalMeta,
            heatmapData,
            donutData,
            totalReferencias: refsForDonut.length,
            evolucaoData,
            rankingData,
            gaugeData: {
                mediaNecessaria: Math.round(mediaNecessaria),
                mediaRealizada: Math.round(mediaRealizada),
                totalMeta,
                totalProduzido,
            },
        };
    }, [colecoes, referencias, etapasAtrasadas, producoes, selectedColecao, selectedStatus]);

    // Available statuses from data
    const availableStatuses = useMemo(() => {
        const set = new Set(referencias.map((r) => r.status || "normal"));
        return Array.from(set).sort();
    }, [referencias]);

    const hasFilters = selectedColecao !== "todas" || selectedStatus !== "todos";

    return (
        <div className="space-y-6">
            {/* Header + Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Gerencial</h2>
                    <p className="text-sm text-gray-400 mt-1">Visão analítica completa da produção</p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <Filter className="h-4 w-4 text-gray-400 hidden sm:block" />

                    {/* Coleção Filter */}
                    <select
                        value={selectedColecao}
                        onChange={(e) => setSelectedColecao(e.target.value)}
                        className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400 transition-colors"
                    >
                        <option value="todas">Todas as Coleções</option>
                        {colecoes.map((c) => (
                            <option key={c.id} value={String(c.id)}>
                                {c.codigo} — {c.nome}
                            </option>
                        ))}
                    </select>

                    {/* Status Filter */}
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400 transition-colors"
                    >
                        <option value="todos">Todos os Status</option>
                        {availableStatuses.map((s) => (
                            <option key={s} value={s}>
                                {STATUS_OPTIONS[s] || s}
                            </option>
                        ))}
                    </select>

                    {/* Clear Filters */}
                    {hasFilters && (
                        <button
                            onClick={() => { setSelectedColecao("todas"); setSelectedStatus("todos"); }}
                            className="text-xs text-gray-400 hover:text-pink-500 flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-pink-50 transition-colors"
                        >
                            <X className="h-3 w-3" />
                            Limpar
                        </button>
                    )}
                </div>
            </div>

            {/* Row 1: Donut + Gauge */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <StatusDonutChart data={filtered.donutData} total={filtered.totalReferencias} />
                </div>
                <div>
                    <GaugeCapacidade data={filtered.gaugeData} />
                </div>
            </div>

            {/* Row 2: Etapas & Burndown */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <EtapasPorColecaoChart data={filtered.etapasPorColecao} />
                <BurndownChart data={filtered.burndownData} totalMeta={filtered.totalMeta} />
            </div>

            {/* Row 3: Evolução & Heatmap */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <EvolucaoSemanalChart data={filtered.evolucaoData} />
                <HeatmapReferencias data={filtered.heatmapData} />
            </div>

            {/* Row 4: Gantt */}
            <GanttColecoesChart data={filtered.ganttData} hoje={filtered.hojeGantt} />

            {/* Row 5: Ranking */}
            <RankingAtrasadasChart data={filtered.rankingData} />
        </div>
    );
}
