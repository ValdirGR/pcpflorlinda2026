"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ProductionChartProps {
  data: { date: string; total: number }[];
  type?: "dia" | "referencia";
}

export function ProductionChart({ data, type = "dia" }: ProductionChartProps) {
  const title = type === "dia" ? "Produção por Dia" : "Produção por Referência";
  const tooltipLabel = type === "dia" ? "Produção" : "Produzidas";

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {title}
      </h3>
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: "#64748b" }}
              tickLine={false}
              axisLine={{ stroke: "#e2e8f0" }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#64748b" }}
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
              formatter={(value: any) => [
                `${Number(value).toLocaleString("pt-BR")} peças`,
                tooltipLabel,
              ]}
            />
            <Bar
              dataKey="total"
              fill="url(#barGradient)"
              radius={[6, 6, 0, 0]}
              maxBarSize={40}
            />
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#f43f5e" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[300px] flex items-center justify-center text-gray-400">
          Nenhum dado de produção disponível
        </div>
      )}
    </div>
  );
}
