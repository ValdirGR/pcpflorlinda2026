"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface StatusData {
    name: string;
    value: number;
    color: string;
}

const STATUS_COLORS: Record<string, string> = {
    normal: "#3b82f6",
    finalizada: "#22c55e",
    em_producao: "#8b5cf6",
    atraso_desenvolvimento: "#eab308",
    atraso_logistica: "#ef4444",
    arquivada: "#94a3b8",
};

const STATUS_LABELS: Record<string, string> = {
    normal: "Normal",
    finalizada: "Finalizada",
    em_producao: "Em Produção",
    atraso_desenvolvimento: "Atraso Desenv.",
    atraso_logistica: "Atraso Logística",
    arquivada: "Arquivada",
};

export function StatusDonutChart({
    data,
    total,
}: {
    data: StatusData[];
    total: number;
}) {
    return (
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Referências por Status
            </h3>
            <p className="text-xs text-gray-400 mb-4">Distribuição geral do mix de produtos</p>
            {data.length > 0 ? (
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <ResponsiveContainer width={200} height={200}>
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={2}
                                    dataKey="value"
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={index} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "#fff",
                                        border: "1px solid #e2e8f0",
                                        borderRadius: "8px",
                                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                    }}
                                    formatter={(value: any, name?: string) => [
                                        `${value} ref.`,
                                        name,
                                    ]}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-gray-900">{total}</p>
                                <p className="text-[10px] text-gray-400">total</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 space-y-2">
                        {data.map((item, i) => (
                            <div key={i} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <span
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: item.color }}
                                    />
                                    <span className="text-gray-600">{item.name}</span>
                                </div>
                                <span className="font-medium text-gray-900">
                                    {item.value}{" "}
                                    <span className="text-gray-400 text-xs">
                                        ({Math.round((item.value / total) * 100)}%)
                                    </span>
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="h-[200px] flex items-center justify-center text-gray-400">
                    Nenhum dado disponível
                </div>
            )}
        </div>
    );
}

export { STATUS_COLORS, STATUS_LABELS };
