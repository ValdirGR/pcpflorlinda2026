import prisma from "@/lib/prisma";
import AdminGuard from "@/components/admin/admin-guard";
import Link from "next/link";
import {
  ArrowLeft,
  Activity,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  KeyRound,
  User,
  FolderOpen,
  Tag,
  Factory,
  Layers,
  Settings,
} from "lucide-react";
import { cn, formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    entidade?: string;
    acao?: string;
    usuario?: string;
    page?: string;
  }>;
}

const acaoConfig: Record<string, { label: string; icon: any; color: string }> = {
  criar: { label: "Criação", icon: Plus, color: "bg-green-100 text-green-700" },
  editar: { label: "Edição", icon: Pencil, color: "bg-blue-100 text-blue-700" },
  excluir: { label: "Exclusão", icon: Trash2, color: "bg-red-100 text-red-700" },
  alterar_status: { label: "Status", icon: RefreshCw, color: "bg-yellow-100 text-yellow-700" },
  alterar_senha: { label: "Senha", icon: KeyRound, color: "bg-purple-100 text-purple-700" },
  login: { label: "Login", icon: User, color: "bg-indigo-100 text-indigo-700" },
};

const entidadeConfig: Record<string, { label: string; icon: any; color: string }> = {
  colecao: { label: "Coleção", icon: FolderOpen, color: "text-amber-600" },
  referencia: { label: "Referência", icon: Tag, color: "text-cyan-600" },
  etapa: { label: "Etapa", icon: Layers, color: "text-pink-600" },
  producao: { label: "Produção", icon: Factory, color: "text-indigo-600" },
  usuario: { label: "Usuário", icon: User, color: "text-purple-600" },
  sistema: { label: "Sistema", icon: Settings, color: "text-gray-600" },
};

const PER_PAGE = 30;

export default async function LogAtividadesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const offset = (page - 1) * PER_PAGE;

  const where: any = {};
  if (params.entidade) where.entidade = params.entidade;
  if (params.acao) where.acao = params.acao;
  if (params.usuario) where.usuario_nome = { contains: params.usuario };

  const [logs, total] = await Promise.all([
    prisma.logAtividade.findMany({
      where,
      orderBy: { created_at: "desc" },
      take: PER_PAGE,
      skip: offset,
    }),
    prisma.logAtividade.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PER_PAGE);

  // Build query string for pagination
  const buildQuery = (p: number) => {
    const q = new URLSearchParams();
    if (params.entidade) q.set("entidade", params.entidade);
    if (params.acao) q.set("acao", params.acao);
    if (params.usuario) q.set("usuario", params.usuario);
    q.set("page", String(p));
    return q.toString();
  };

  return (
    <AdminGuard>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Log de Atividades
            </h1>
            <p className="text-sm text-gray-500">
              {total} registro(s) encontrado(s)
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <form className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[160px]">
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Entidade
              </label>
              <select
                name="entidade"
                defaultValue={params.entidade || ""}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400"
              >
                <option value="">Todas</option>
                <option value="colecao">Coleção</option>
                <option value="referencia">Referência</option>
                <option value="etapa">Etapa</option>
                <option value="producao">Produção</option>
                <option value="usuario">Usuário</option>
              </select>
            </div>

            <div className="flex-1 min-w-[160px]">
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Ação
              </label>
              <select
                name="acao"
                defaultValue={params.acao || ""}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400"
              >
                <option value="">Todas</option>
                <option value="criar">Criação</option>
                <option value="editar">Edição</option>
                <option value="excluir">Exclusão</option>
                <option value="alterar_status">Alteração de Status</option>
                <option value="alterar_senha">Alteração de Senha</option>
              </select>
            </div>

            <div className="flex-1 min-w-[160px]">
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Usuário
              </label>
              <input
                type="text"
                name="usuario"
                defaultValue={params.usuario || ""}
                placeholder="Nome do usuário..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
              >
                Filtrar
              </button>
              <Link
                href="/admin/logs"
                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                Limpar
              </Link>
            </div>
          </form>
        </div>

        {/* Lista de logs */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {logs.length === 0 ? (
            <div className="p-12 text-center">
              <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">
                Nenhuma atividade registrada
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {logs.map((log) => {
                const acao = acaoConfig[log.acao] || {
                  label: log.acao,
                  icon: Activity,
                  color: "bg-gray-100 text-gray-700",
                };
                const entidade = entidadeConfig[log.entidade] || {
                  label: log.entidade,
                  icon: Settings,
                  color: "text-gray-600",
                };
                const AcaoIcon = acao.icon;
                const EntidadeIcon = entidade.icon;

                return (
                  <div
                    key={log.id}
                    className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50/50 transition-colors"
                  >
                    {/* Ícone da ação */}
                    <div
                      className={cn(
                        "shrink-0 h-9 w-9 rounded-lg flex items-center justify-center mt-0.5",
                        acao.color
                      )}
                    >
                      <AcaoIcon className="h-4 w-4" />
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        {log.descricao}
                      </p>
                      {log.detalhes && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {log.detalhes}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                          <User className="h-3 w-3" />
                          {log.usuario_nome}
                        </span>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 text-xs",
                            entidade.color
                          )}
                        >
                          <EntidadeIcon className="h-3 w-3" />
                          {entidade.label}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatDateTime(log.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/50">
              <p className="text-sm text-gray-500">
                Página {page} de {totalPages}
              </p>
              <div className="flex gap-2">
                {page > 1 && (
                  <Link
                    href={`/admin/logs?${buildQuery(page - 1)}`}
                    className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Anterior
                  </Link>
                )}
                {page < totalPages && (
                  <Link
                    href={`/admin/logs?${buildQuery(page + 1)}`}
                    className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Próxima
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminGuard>
  );
}
