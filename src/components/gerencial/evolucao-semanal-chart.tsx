"use client";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart,
} from "recharts";

interface EvolucaoData {
    semana: string;
    total: number;
}

export function EvolucaoSemanalChart({ data }: { data: EvolucaoData[] }) {
    return (
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Evolução Semanal
            </h3>
            <p className="text-xs text-gray-400 mb-4">Produção total por semana</p>
            {data.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#ec4899" stopOpacity={0.3} />
                                <stop offset="100%" stopColor="#ec4899" stopOpacity={0.02} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis
                            dataKey="semana"
                            tick={{ fontSize: 10, fill: "#64748b" }}
                            tickLine={false}
                            axisLine={{ stroke: "#e2e8f0" }}
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
                            formatter={(value: any) => [
                                `${Number(value).toLocaleString("pt-BR")} peças`,
                                "Produção",
                            ]}
                        />
                        <Area
                            type="monotone"
                            dataKey="total"
                            stroke="#ec4899"
                            strokeWidth={2.5}
                            fill="url(#areaGradient)"
                            dot={{ fill: "#ec4899", strokeWidth: 0, r: 3 }}
                            activeDot={{ r: 5, fill: "#ec4899" }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-[280px] flex items-center justify-center text-gray-400">
                    Nenhum dado disponível
                </div>
            )}
        </div>
    );
}
