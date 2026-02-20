"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

interface EtapasPorColecaoData {
    colecao: string;
    pendente: number;
    em_andamento: number;
    concluida: number;
}

const COLORS = {
    pendente: "#f97316",
    em_andamento: "#3b82f6",
    concluida: "#22c55e",
};

const LABELS: Record<string, string> = {
    pendente: "Pendente",
    em_andamento: "Em Andamento",
    concluida: "Concluída",
};

export function EtapasPorColecaoChart({ data }: { data: EtapasPorColecaoData[] }) {
    return (
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Etapas por Coleção
            </h3>
            <p className="text-xs text-gray-400 mb-4">Distribuição do status das etapas produtivas</p>
            {data.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={data} barCategoryGap="20%">
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis
                            dataKey="colecao"
                            tick={{ fontSize: 11, fill: "#64748b" }}
                            tickLine={false}
                            axisLine={{ stroke: "#e2e8f0" }}
                            interval={0}
                            angle={-20}
                            textAnchor="end"
                            height={60}
                        />
                        <YAxis
                            tick={{ fontSize: 11, fill: "#64748b" }}
                            tickLine={false}
                            axisLine={{ stroke: "#e2e8f0" }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "#fff",
                                border: "1px solid #e2e8f0",
                                borderRadius: "8px",
                                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                            }}
                            formatter={(value: any, name?: string) => [
                                `${value} etapa(s)`,
                                name ? (LABELS[name] || name) : "",
                            ]}
                        />
                        <Legend
                            formatter={(value: string) => LABELS[value] || value}
                            wrapperStyle={{ fontSize: "12px" }}
                        />
                        <Bar dataKey="concluida" stackId="a" fill={COLORS.concluida} radius={[0, 0, 0, 0]} />
                        <Bar dataKey="em_andamento" stackId="a" fill={COLORS.em_andamento} />
                        <Bar dataKey="pendente" stackId="a" fill={COLORS.pendente} radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-[320px] flex items-center justify-center text-gray-400">
                    Nenhum dado disponível
                </div>
            )}
        </div>
    );
}
