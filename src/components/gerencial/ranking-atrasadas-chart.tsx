"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";

interface RankingData {
    nome: string;
    codigo: string;
    diasAtraso: number;
    etapa: string;
}

export function RankingAtrasadasChart({ data }: { data: RankingData[] }) {
    const maxAtraso = Math.max(...data.map((d) => d.diasAtraso), 1);

    return (
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Referências Mais Atrasadas
            </h3>
            <p className="text-xs text-gray-400 mb-4">
                Top {data.length} por dias de atraso na etapa
            </p>
            {data.length > 0 ? (
                <ResponsiveContainer width="100%" height={Math.max(200, data.length * 40 + 40)}>
                    <BarChart data={data} layout="vertical" barSize={18}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                        <XAxis
                            type="number"
                            tick={{ fontSize: 11, fill: "#64748b" }}
                            tickLine={false}
                            axisLine={{ stroke: "#e2e8f0" }}
                            label={{ value: "Dias de atraso", position: "insideBottom", offset: -5, fontSize: 11, fill: "#94a3b8" }}
                        />
                        <YAxis
                            type="category"
                            dataKey="codigo"
                            tick={{ fontSize: 11, fill: "#64748b" }}
                            tickLine={false}
                            axisLine={false}
                            width={80}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "#fff",
                                border: "1px solid #e2e8f0",
                                borderRadius: "8px",
                                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                            }}
                            formatter={(value: any, _?: string, props?: any) => {
                                const item = props?.payload;
                                return [`${value} dias — Etapa: ${item?.etapa}`, item?.nome];
                            }}
                        />
                        <Bar dataKey="diasAtraso" radius={[0, 4, 4, 0]}>
                            {data.map((entry, index) => {
                                const intensity = Math.min(entry.diasAtraso / maxAtraso, 1);
                                const r = Math.round(239 + (185 - 239) * intensity);
                                const g = Math.round(68 + (28 - 68) * intensity);
                                const b = Math.round(68 + (28 - 68) * intensity);
                                return <Cell key={index} fill={`rgb(${r}, ${g}, ${b})`} />;
                            })}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-[200px] flex items-center justify-center text-green-500 text-sm font-medium">
                    🎉 Nenhuma referência atrasada!
                </div>
            )}
        </div>
    );
}
