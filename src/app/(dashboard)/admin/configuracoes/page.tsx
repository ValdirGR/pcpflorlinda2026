import { obterEstatisticasAdmin } from "@/app/admin-actions";
import AdminGuard from "@/components/admin/admin-guard";
import Link from "next/link";
import {
  ArrowLeft,
  Server,
  Database,
  Calendar,
  Code,
  FolderOpen,
  Tag,
  Factory,
  Users,
  KeyRound,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ConfiguracoesPage() {
  const stats = await obterEstatisticasAdmin();

  const systemInfo = [
    { label: "Framework", value: "Next.js 16", icon: Code },
    { label: "Banco de Dados", value: "MySQL (Prisma)", icon: Database },
    { label: "Autenticação", value: "NextAuth v5", icon: KeyRound },
    { label: "Ambiente", value: process.env.NODE_ENV || "development", icon: Server },
  ];

  const dataStats = [
    { label: "Coleções", value: stats.totalColecoes, icon: FolderOpen, color: "text-amber-600 bg-amber-50" },
    { label: "Referências", value: stats.totalReferencias, icon: Tag, color: "text-cyan-600 bg-cyan-50" },
    { label: "Registros de Produção", value: stats.totalProducao, icon: Factory, color: "text-indigo-600 bg-indigo-50" },
    { label: "Usuários", value: stats.totalUsuarios, icon: Users, color: "text-purple-600 bg-purple-50" },
    { label: "Perfis", value: stats.totalPerfis, icon: KeyRound, color: "text-pink-600 bg-pink-50" },
  ];

  return (
    <AdminGuard>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
            <p className="text-gray-500 mt-1">
              Informações e configurações gerais do sistema
            </p>
          </div>
        </div>

        {/* Informações do Sistema */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Info className="h-5 w-5 text-blue-500" />
            <h2 className="font-semibold text-gray-900">Informações do Sistema</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {systemInfo.map((info) => (
              <div
                key={info.label}
                className="p-4 border border-gray-100 rounded-lg"
              >
                <div className="flex items-center gap-2 mb-2">
                  <info.icon className="h-4 w-4 text-gray-400" />
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {info.label}
                  </span>
                </div>
                <p className="text-sm font-semibold text-gray-900">{info.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Dados do Sistema */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Database className="h-5 w-5 text-green-500" />
            <h2 className="font-semibold text-gray-900">Dados do Sistema</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {dataStats.map((stat) => (
              <div
                key={stat.label}
                className="flex items-center gap-4 p-4 border border-gray-100 rounded-lg"
              >
                <div
                  className={cn(
                    "h-10 w-10 rounded-lg flex items-center justify-center",
                    stat.color
                  )}
                >
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Data/Hora */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-orange-500" />
            <h2 className="font-semibold text-gray-900">Data e Hora do Servidor</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 border border-gray-100 rounded-lg">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data Atual
              </span>
              <p className="text-sm font-semibold text-gray-900 mt-1">
                {new Date().toLocaleDateString("pt-BR", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="p-4 border border-gray-100 rounded-lg">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hora Atual
              </span>
              <p className="text-sm font-semibold text-gray-900 mt-1">
                {new Date().toLocaleTimeString("pt-BR")}
              </p>
            </div>
          </div>
        </div>

        {/* Placeholder para futuras configurações */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200/50 p-6 text-center">
          <Server className="h-10 w-10 text-purple-400 mx-auto mb-3" />
          <h3 className="font-semibold text-purple-900">Configurações Avançadas</h3>
          <p className="text-sm text-purple-600 mt-1 max-w-md mx-auto">
            Futuras configurações do sistema como backup automático, notificações por email,
            integrações e personalização visual serão adicionadas aqui.
          </p>
        </div>
      </div>
    </AdminGuard>
  );
}
