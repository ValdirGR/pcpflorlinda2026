import { obterEstatisticasAdmin } from "@/app/admin-queries";
import AdminGuard from "@/components/admin/admin-guard";
import { AdminStats } from "@/components/admin/admin-stats";
import Link from "next/link";
import {
  Users,
  Settings,
  ArrowRight,
  Clock,
  Shield,
  User,
  Eye,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

const nivelColors: Record<string, string> = {
  admin: "bg-purple-100 text-purple-700",
  usuario: "bg-blue-100 text-blue-700",
  visualizador: "bg-gray-100 text-gray-700",
};

const nivelLabels: Record<string, string> = {
  admin: "Admin",
  usuario: "Usuário",
  visualizador: "Visualizador",
};

export default async function AdminPage() {
  const stats = await obterEstatisticasAdmin();

  return (
    <AdminGuard>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Administração</h1>
          <p className="text-gray-500 mt-1">
            Gerencie usuários, perfis e configurações do sistema
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/admin/usuarios"
            className="group flex items-center justify-between p-5 bg-white rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Usuários</h3>
                <p className="text-sm text-gray-500">Gerenciar contas</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-purple-500 transition-colors" />
          </Link>

          <Link
            href="/admin/logs"
            className="group flex items-center justify-between p-5 bg-white rounded-xl border border-gray-200 hover:border-emerald-300 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                <Activity className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Log de Atividades</h3>
                <p className="text-sm text-gray-500">Histórico de ações</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-emerald-500 transition-colors" />
          </Link>

          <Link
            href="/admin/configuracoes"
            className="group flex items-center justify-between p-5 bg-white rounded-xl border border-gray-200 hover:border-slate-300 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-slate-100 transition-colors">
                <Settings className="h-6 w-6 text-slate-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Configurações</h3>
                <p className="text-sm text-gray-500">Config. do sistema</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-slate-500 transition-colors" />
          </Link>
        </div>

        {/* Stats */}
        <AdminStats stats={stats} />

        {/* Últimos Usuários */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <h3 className="text-sm font-medium text-gray-700">
                Últimos Usuários Cadastrados
              </h3>
            </div>
            <Link
              href="/admin/usuarios"
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              Ver todos →
            </Link>
          </div>
          <div className="space-y-3">
            {stats.ultimosUsuarios.map((usuario) => (
              <div
                key={usuario.id}
                className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white",
                      usuario.ativo
                        ? "bg-gradient-to-br from-purple-400 to-indigo-500"
                        : "bg-gray-300"
                    )}
                  >
                    {usuario.nome.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <Link
                      href={`/admin/usuarios/${usuario.id}`}
                      className="text-sm font-medium text-gray-900 hover:text-purple-600"
                    >
                      {usuario.nome}
                    </Link>
                    <p className="text-xs text-gray-500">{usuario.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-medium",
                      nivelColors[usuario.nivel]
                    )}
                  >
                    {nivelLabels[usuario.nivel] || usuario.nivel}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatDateTime(usuario.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
