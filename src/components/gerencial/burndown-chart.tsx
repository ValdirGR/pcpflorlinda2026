"use client";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
} from "recharts";

interface BurndownData {
    label: string;
    acumulado: number;
    meta: number;
}

export function BurndownChart({
    data,
    totalMeta,
}: {
    data: BurndownData[];
    totalMeta: number;
}) {
    return (
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Burnup de Produção
            </h3>
            <p className="text-xs text-gray-400 mb-4">
                Produção acumulada vs meta total ({totalMeta.toLocaleString("pt-BR")} peças)
            </p>
            {data.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis
                            dataKey="label"
                            tick={{ fontSize: 10, fill: "#64748b" }}
                            tickLine={false}
                            axisLine={{ stroke: "#e2e8f0" }}
                            interval="preserveStartEnd"
                        />
                        <YAxis
                            tick={{ fontSize: 11, fill: "#64748b" }}
                            tickLine={false}
                            axisLine={{ stroke: "#e2e8f0" }}
                            tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "#fff",
                                border: "1px solid #e2e8f0",
                                borderRadius: "8px",
                                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                            }}
                            formatter={(value: any, name?: string) => [
                                `${Number(value).toLocaleString("pt-BR")} peças`,
                                name === "acumulado" ? "Produzido" : "Meta Ideal",
                            ]}
                        />
                        <Line
                            type="monotone"
                            dataKey="meta"
                            stroke="#94a3b8"
                            strokeWidth={2}
                            strokeDasharray="6 3"
                            dot={false}
                            name="meta"
                        />
                        <Line
                            type="monotone"
                            dataKey="acumulado"
                            stroke="#ec4899"
                            strokeWidth={3}
                            dot={false}
                            name="acumulado"
                        />
                        <ReferenceLine
                            y={totalMeta}
                            stroke="#22c55e"
                            strokeWidth={1}
                            strokeDasharray="4 4"
                            label={{ value: "Meta", position: "right", fontSize: 10, fill: "#22c55e" }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-[320px] flex items-center justify-center text-gray-400">
                    Nenhum dado disponível
                </div>
            )}
        </div>
    );
}
