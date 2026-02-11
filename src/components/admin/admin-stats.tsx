"use client";

import {
  Users,
  UserCheck,
  UserX,
  Shield,
  FolderOpen,
  Tag,
  Factory,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminStatsProps {
  stats: {
    totalUsuarios: number;
    usuariosAtivos: number;
    usuariosInativos: number;
    admins: number;
    usuarios: number;
    visualizadores: number;
    totalColecoes: number;
    totalReferencias: number;
    totalProducao: number;
  };
}

const cards = [
  {
    key: "totalUsuarios" as const,
    label: "Total Usuários",
    icon: Users,
    color: "from-blue-500 to-blue-600",
    bg: "bg-blue-50",
    text: "text-blue-600",
  },
  {
    key: "usuariosAtivos" as const,
    label: "Ativos",
    icon: UserCheck,
    color: "from-green-500 to-green-600",
    bg: "bg-green-50",
    text: "text-green-600",
  },
  {
    key: "usuariosInativos" as const,
    label: "Inativos",
    icon: UserX,
    color: "from-red-500 to-red-600",
    bg: "bg-red-50",
    text: "text-red-600",
  },
  {
    key: "admins" as const,
    label: "Administradores",
    icon: Shield,
    color: "from-purple-500 to-purple-600",
    bg: "bg-purple-50",
    text: "text-purple-600",
  },
];

const systemCards = [
  {
    key: "totalColecoes" as const,
    label: "Coleções",
    icon: FolderOpen,
    color: "from-amber-500 to-amber-600",
    bg: "bg-amber-50",
    text: "text-amber-600",
  },
  {
    key: "totalReferencias" as const,
    label: "Referências",
    icon: Tag,
    color: "from-cyan-500 to-cyan-600",
    bg: "bg-cyan-50",
    text: "text-cyan-600",
  },
  {
    key: "totalProducao" as const,
    label: "Registros Produção",
    icon: Factory,
    color: "from-indigo-500 to-indigo-600",
    bg: "bg-indigo-50",
    text: "text-indigo-600",
  },
];

export function AdminStats({ stats }: AdminStatsProps) {
  return (
    <div className="space-y-6">
      {/* User Stats */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-3">Usuários</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card) => (
            <div
              key={card.key}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{card.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats[card.key]}
                  </p>
                </div>
                <div
                  className={cn(
                    "h-12 w-12 rounded-xl flex items-center justify-center",
                    card.bg
                  )}
                >
                  <card.icon className={cn("h-6 w-6", card.text)} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Stats */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-3">Sistema</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {systemCards.map((card) => (
            <div
              key={card.key}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{card.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats[card.key]}
                  </p>
                </div>
                <div
                  className={cn(
                    "h-12 w-12 rounded-xl flex items-center justify-center",
                    card.bg
                  )}
                >
                  <card.icon className={cn("h-6 w-6", card.text)} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-medium text-gray-500 mb-4">
          Distribuição por Nível
        </h3>
        <div className="space-y-3">
          {[
            { label: "Administradores", value: stats.admins, total: stats.totalUsuarios, color: "bg-purple-500" },
            { label: "Usuários", value: stats.usuarios, total: stats.totalUsuarios, color: "bg-blue-500" },
            { label: "Visualizadores", value: stats.visualizadores, total: stats.totalUsuarios, color: "bg-gray-400" },
          ].map((item) => {
            const pct = stats.totalUsuarios > 0 ? Math.round((item.value / item.total) * 100) : 0;
            return (
              <div key={item.label}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">{item.label}</span>
                  <span className="font-medium text-gray-900">
                    {item.value} ({pct}%)
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all", item.color)}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
