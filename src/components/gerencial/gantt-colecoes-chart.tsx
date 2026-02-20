"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
    Cell,
} from "recharts";

interface GanttData {
    nome: string;
    inicio: number;
    duracao: number;
    atrasada: boolean;
    dataInicioLabel: string;
    dataFimLabel: string;
}

export function GanttColecoesChart({ data, hoje }: { data: GanttData[]; hoje: number }) {
    if (data.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Timeline de Coleções
                </h3>
                <div className="h-[320px] flex items-center justify-center text-gray-400">
                    Nenhum dado disponível
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Timeline de Coleções
            </h3>
            <p className="text-xs text-gray-400 mb-4">Período planejado — linha vermelha = hoje</p>
            <ResponsiveContainer width="100%" height={Math.max(200, data.length * 50 + 40)}>
                <BarChart data={data} layout="vertical" barSize={20}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                    <XAxis
                        type="number"
                        tick={false}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        type="category"
                        dataKey="nome"
                        tick={{ fontSize: 11, fill: "#64748b" }}
                        tickLine={false}
                        axisLine={false}
                        width={120}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "#fff",
                            border: "1px solid #e2e8f0",
                            borderRadius: "8px",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                        formatter={(_: any, __?: string, props?: any) => {
                            const item = props?.payload;
                            return [`${item?.dataInicioLabel} → ${item?.dataFimLabel}`, "Período"];
                        }}
                    />
                    {/* Invisible bar for offset */}
                    <Bar dataKey="inicio" stackId="timeline" fill="transparent" />
                    <Bar dataKey="duracao" stackId="timeline" radius={[0, 4, 4, 0]}>
                        {data.map((entry, index) => (
                            <Cell
                                key={index}
                                fill={entry.atrasada ? "#ef4444" : "#3b82f6"}
                                opacity={0.8}
                            />
                        ))}
                    </Bar>
                    <ReferenceLine x={hoje} stroke="#ef4444" strokeWidth={2} strokeDasharray="4 4" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
