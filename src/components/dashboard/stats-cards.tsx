"use client";

import { Tag, FolderOpen, Factory, CheckCircle2, AlertTriangle, TrendingUp } from "lucide-react";
import { calcPercentage } from "@/lib/utils";

interface StatsProps {
  stats: {
    totalColecoes: number;
    totalReferencias: number;
    totalProduzidas: number;
    totalPrevistas: number;
    refFinalizadas: number;
    etapasAtrasadas: number;
  };
}

export function StatsCards({ stats }: StatsProps) {
  const porcentagemGeral = calcPercentage(stats.totalProduzidas, stats.totalPrevistas);

  const cards = [
    {
      title: "Coleções",
      value: stats.totalColecoes,
      icon: FolderOpen,
      color: "from-blue-500 to-blue-600",
      shadowColor: "shadow-blue-500/20",
    },
    {
      title: "Referências",
      value: stats.totalReferencias,
      icon: Tag,
      color: "from-violet-500 to-violet-600",
      shadowColor: "shadow-violet-500/20",
    },
    {
      title: "Produção Total",
      value: stats.totalProduzidas.toLocaleString("pt-BR"),
      subtitle: `de ${stats.totalPrevistas.toLocaleString("pt-BR")} previstas`,
      icon: Factory,
      color: "from-pink-500 to-rose-500",
      shadowColor: "shadow-pink-500/20",
    },
    {
      title: "Progresso Geral",
      value: `${porcentagemGeral}%`,
      icon: TrendingUp,
      color: "from-emerald-500 to-emerald-600",
      shadowColor: "shadow-emerald-500/20",
    },
    {
      title: "Finalizadas",
      value: stats.refFinalizadas,
      subtitle: `de ${stats.totalReferencias} referências`,
      icon: CheckCircle2,
      color: "from-green-500 to-green-600",
      shadowColor: "shadow-green-500/20",
    },
    {
      title: "Etapas Atrasadas",
      value: stats.etapasAtrasadas,
      icon: AlertTriangle,
      color: stats.etapasAtrasadas > 0 ? "from-red-500 to-red-600" : "from-gray-400 to-gray-500",
      shadowColor: stats.etapasAtrasadas > 0 ? "shadow-red-500/20" : "shadow-gray-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className={`bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow ${card.shadowColor}`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              {card.title}
            </span>
            <div className={`p-2 rounded-lg bg-gradient-to-br ${card.color}`}>
              <card.icon className="h-4 w-4 text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{card.value}</p>
          {card.subtitle && (
            <p className="text-xs text-gray-500 mt-1">{card.subtitle}</p>
          )}
        </div>
      ))}
    </div>
  );
}
