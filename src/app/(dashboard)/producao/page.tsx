import prisma from "@/lib/prisma";
import Link from "next/link";
import { Plus, Eye, Pencil, Trash2 } from "lucide-react";
import { formatDate, getStatusColor, getStatusLabel } from "@/lib/utils";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export default async function ProducaoPage() {
  const session = await auth();
  const nivel = session?.user?.nivel || "visualizador";

  const producao = await prisma.producao.findMany({
    include: {
      referencia: {
        select: {
          nome: true,
          codigo: true,
          colecao: { select: { nome: true } },
        },
      },
    },
    orderBy: { data_producao: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Produção</h2>
        {nivel !== "visualizador" && (
          <Link
            href="/producao/novo"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg font-medium text-sm hover:from-pink-600 hover:to-rose-600 shadow-sm shadow-pink-500/20 transition-all"
          >
            <Plus className="h-4 w-4" />
            Registrar Produção
          </Link>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Referência
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Coleção
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Quantidade
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Observações
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {producao.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {formatDate(p.data_producao)}
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <span className="text-sm font-medium text-gray-900">
                        {p.referencia.codigo}
                      </span>
                      <p className="text-xs text-gray-400">
                        {p.referencia.nome}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {p.referencia.colecao.nome}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-semibold text-gray-900">
                      {p.quantidade_dia.toLocaleString("pt-BR")}
                    </span>
                    <span className="text-xs text-gray-400 ml-1">peças</span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        p.status || "normal"
                      )}`}
                    >
                      {getStatusLabel(p.status || "normal")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-[200px] truncate">
                    {p.observacoes || "—"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {nivel !== "visualizador" && (
                        <Link
                          href={`/producao/${p.id}/editar`}
                          className="p-2 text-gray-400 hover:text-pink-500 hover:bg-pink-50 rounded-lg transition-colors"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                      )}
                      {nivel === "admin" && (
                        <Link
                          href={`/producao/${p.id}/excluir`}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {producao.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-gray-400"
                  >
                    Nenhum registro de produção
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
