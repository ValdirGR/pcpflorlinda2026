import prisma from "@/lib/prisma";
import AdminGuard from "@/components/admin/admin-guard";
import { adicionarEmailRelatorio, removerEmailRelatorio, toggleEmailRelatorio } from "@/app/admin-actions";
import { Mail, Plus, Trash2, ArrowLeft, ToggleLeft, ToggleRight } from "lucide-react";
import Link from "next/link";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function EmailsRelatorioPage() {
  const emails = await prisma.configEmailRelatorio.findMany({
    orderBy: { created_at: "desc" },
  });

  return (
    <AdminGuard>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-500" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                E-mails do Relatório Diário
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Gerencie os destinatários do relatório gerencial enviado de seg a sex às 7h
              </p>
            </div>
          </div>
        </div>

        {/* Add Form */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Adicionar Destinatário
          </h3>
          <form action={adicionarEmailRelatorio} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              name="nome"
              placeholder="Nome do destinatário"
              required
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
            <input
              type="email"
              name="email"
              placeholder="email@exemplo.com"
              required
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="px-6 py-2.5 bg-pink-500 text-white rounded-lg text-sm font-medium hover:bg-pink-600 transition-colors whitespace-nowrap"
            >
              <span className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Adicionar
              </span>
            </button>
          </form>
        </div>

        {/* Email List */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Destinatários ({emails.length})
            </h3>
            <span className="text-xs text-gray-400">
              {emails.filter((e) => e.ativo).length} ativos
            </span>
          </div>

          {emails.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <Mail className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Nenhum e-mail cadastrado</p>
              <p className="text-xs mt-1">Adicione destinatários acima para receber o relatório diário</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {emails.map((registro) => (
                <div
                  key={registro.id}
                  className={`flex items-center justify-between px-6 py-4 ${
                    !registro.ativo ? "opacity-50 bg-gray-50/50" : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium ${
                        registro.ativo
                          ? "bg-pink-50 text-pink-600"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {registro.nome.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{registro.nome}</p>
                      <p className="text-xs text-gray-500">{registro.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        registro.ativo
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {registro.ativo ? "Ativo" : "Inativo"}
                    </span>
                    <span className="text-[10px] text-gray-400 hidden sm:inline">
                      {formatDateTime(registro.created_at)}
                    </span>

                    {/* Toggle */}
                    <form action={async () => {
                      "use server";
                      await toggleEmailRelatorio(registro.id);
                    }}>
                      <button
                        type="submit"
                        title={registro.ativo ? "Desativar" : "Ativar"}
                        className="p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        {registro.ativo ? (
                          <ToggleRight className="h-5 w-5 text-green-500" />
                        ) : (
                          <ToggleLeft className="h-5 w-5" />
                        )}
                      </button>
                    </form>

                    {/* Delete */}
                    <form action={async () => {
                      "use server";
                      await removerEmailRelatorio(registro.id);
                    }}>
                      <button
                        type="submit"
                        title="Remover"
                        className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <p className="text-sm text-blue-700">
            <strong>Sobre o Relatório:</strong> Um PDF com o resumo gerencial das coleções é enviado
            automaticamente de segunda a sexta, às 7h (horário de Brasília), para todos os
            destinatários ativos listados acima.
          </p>
        </div>
      </div>
    </AdminGuard>
  );
}
