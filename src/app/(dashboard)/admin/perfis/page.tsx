import { listarPerfis, listarPermissoes } from "@/app/admin-queries";
import AdminGuard from "@/components/admin/admin-guard";
import Link from "next/link";
import { ArrowLeft, KeyRound, Shield, Users, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PerfisPage() {
  const [perfis, permissoes] = await Promise.all([
    listarPerfis(),
    listarPermissoes(),
  ]);

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
            <h1 className="text-2xl font-bold text-gray-900">
              Perfis e Permissões
            </h1>
            <p className="text-gray-500 mt-1">
              Visualize os perfis de acesso e suas permissões
            </p>
          </div>
        </div>

        {/* Níveis do Sistema */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-purple-500" />
            <h2 className="font-semibold text-gray-900">Níveis de Acesso do Sistema</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Os níveis de acesso são definidos diretamente no cadastro do usuário.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border border-purple-200 bg-purple-50/50">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Shield className="h-4 w-4 text-purple-600" />
                </div>
                <h3 className="font-medium text-purple-900">Administrador</h3>
              </div>
              <ul className="text-sm text-purple-700 space-y-1 ml-10">
                <li>• Acesso total ao sistema</li>
                <li>• Gerenciar usuários</li>
                <li>• Gerenciar perfis</li>
                <li>• Configurações do sistema</li>
                <li>• CRUD completo de dados</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border border-blue-200 bg-blue-50/50">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <h3 className="font-medium text-blue-900">Usuário</h3>
              </div>
              <ul className="text-sm text-blue-700 space-y-1 ml-10">
                <li>• Criar e editar dados</li>
                <li>• Gerenciar coleções</li>
                <li>• Gerenciar referências</li>
                <li>• Registrar produção</li>
                <li>• Visualizar relatórios</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border border-gray-200 bg-gray-50/50">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Lock className="h-4 w-4 text-gray-600" />
                </div>
                <h3 className="font-medium text-gray-900">Visualizador</h3>
              </div>
              <ul className="text-sm text-gray-700 space-y-1 ml-10">
                <li>• Somente leitura</li>
                <li>• Visualizar dashboard</li>
                <li>• Visualizar coleções</li>
                <li>• Visualizar referências</li>
                <li>• Visualizar relatórios</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Perfis Cadastrados */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <KeyRound className="h-5 w-5 text-indigo-500" />
            <h2 className="font-semibold text-gray-900">Perfis Cadastrados</h2>
          </div>

          {perfis.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <KeyRound className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-sm font-medium">Nenhum perfil cadastrado</p>
              <p className="text-xs text-gray-400 mt-1">
                Perfis podem ser criados para agrupar permissões específicas
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {perfis.map((perfil) => (
                <div
                  key={perfil.id}
                  className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{perfil.nome}</h3>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {perfil._count.usuarios} usuário{perfil._count.usuarios !== 1 ? "s" : ""}
                      </span>
                      <span className="flex items-center gap-1">
                        <Lock className="h-3 w-3" />
                        {perfil._count.permissoes} permiss{perfil._count.permissoes !== 1 ? "ões" : "ão"}
                      </span>
                    </div>
                  </div>
                  {perfil.descricao && (
                    <p className="text-sm text-gray-500 mb-3">{perfil.descricao}</p>
                  )}
                  {perfil.permissoes.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {perfil.permissoes.map((pp) => (
                        <span
                          key={pp.permissao.id}
                          className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium"
                        >
                          {pp.permissao.nome}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Permissões Disponíveis */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="h-5 w-5 text-amber-500" />
            <h2 className="font-semibold text-gray-900">Permissões Disponíveis</h2>
          </div>

          {permissoes.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Lock className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-sm font-medium">Nenhuma permissão cadastrada</p>
              <p className="text-xs text-gray-400 mt-1">
                As permissões podem ser criadas e associadas a perfis
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {permissoes.map((permissao) => (
                <div
                  key={permissao.id}
                  className="p-3 border border-gray-100 rounded-lg"
                >
                  <h4 className="text-sm font-medium text-gray-900">
                    {permissao.nome}
                  </h4>
                  {permissao.descricao && (
                    <p className="text-xs text-gray-500 mt-1">
                      {permissao.descricao}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminGuard>
  );
}
