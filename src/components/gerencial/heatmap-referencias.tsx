"use client";

import {
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    ReferenceLine,
} from "recharts";

interface HeatmapData {
    codigo: string;
    nome: string;
    previsao: number;
    percentual: number;
}

function getColor(pct: number): string {
    if (pct >= 90) return "#22c55e";
    if (pct >= 60) return "#eab308";
    if (pct >= 30) return "#f97316";
    return "#ef4444";
}

export function HeatmapReferencias({ data }: { data: HeatmapData[] }) {
    return (
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Mapa de Performance
            </h3>
            <p className="text-xs text-gray-400 mb-4">
                Previsão de peças × % concluído — vermelho = crítico
            </p>
            {data.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                    <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis
                            type="number"
                            dataKey="previsao"
                            name="Previsão"
                            tick={{ fontSize: 11, fill: "#64748b" }}
                            tickLine={false}
                            axisLine={{ stroke: "#e2e8f0" }}
                            label={{ value: "Previsão (peças)", position: "insideBottom", offset: -5, fontSize: 11, fill: "#94a3b8" }}
                        />
                        <YAxis
                            type="number"
                            dataKey="percentual"
                            name="% Conclusão"
                            tick={{ fontSize: 11, fill: "#64748b" }}
                            tickLine={false}
                            axisLine={{ stroke: "#e2e8f0" }}
                            domain={[0, 110]}
                            label={{ value: "% Concluído", angle: -90, position: "insideLeft", fontSize: 11, fill: "#94a3b8" }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "#fff",
                                border: "1px solid #e2e8f0",
                                borderRadius: "8px",
                                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                            }}
                            formatter={(value: any, name?: string) => {
                                if (name === "Previsão") return [`${Number(value).toLocaleString("pt-BR")} peças`, name];
                                return [`${value}%`, "Conclusão"];
                            }}
                            labelFormatter={(_: any, payload: readonly any[]) => {
                                if (payload?.[0]?.payload) {
                                    return `${payload[0].payload.codigo} — ${payload[0].payload.nome}`;
                                }
                                return "";
                            }}
                        />
                        <ReferenceLine y={100} stroke="#22c55e" strokeDasharray="4 4" strokeWidth={1} />
                        <Scatter data={data} fillOpacity={0.7}>
                            {data.map((entry, index) => (
                                <Cell key={index} fill={getColor(entry.percentual)} r={6} />
                            ))}
                        </Scatter>
                    </ScatterChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-[320px] flex items-center justify-center text-gray-400">
                    Nenhum dado disponível
                </div>
            )}
        </div>
    );
}
