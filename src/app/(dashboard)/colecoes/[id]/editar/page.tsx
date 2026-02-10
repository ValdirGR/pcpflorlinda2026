import prisma from "@/lib/prisma";
import { editarColecao } from "@/app/actions";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditarColecaoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const colecaoId = parseInt(id);
  if (isNaN(colecaoId)) notFound();

  const colecao = await prisma.colecao.findUnique({
    where: { id: colecaoId },
  });

  if (!colecao) notFound();

  const editAction = editarColecao.bind(null, colecaoId);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/colecoes/${colecaoId}`}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h2 className="text-2xl font-bold text-gray-900">Editar Coleção</h2>
      </div>

      <form
        action={editAction}
        className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nome *
            </label>
            <input
              name="nome"
              required
              defaultValue={colecao.nome}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Código *
            </label>
            <input
              name="codigo"
              required
              defaultValue={colecao.codigo}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Data Início
            </label>
            <input
              type="date"
              name="data_inicio"
              defaultValue={
                colecao.data_inicio
                  ? colecao.data_inicio.toISOString().slice(0, 10)
                  : ""
              }
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Data Fim
            </label>
            <input
              type="date"
              name="data_fim"
              defaultValue={
                colecao.data_fim
                  ? colecao.data_fim.toISOString().slice(0, 10)
                  : ""
              }
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Status
            </label>
            <select
              name="status"
              defaultValue={colecao.status ?? "normal"}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400"
            >
              <option value="normal">Normal</option>
              <option value="atrasado">Atrasado</option>
              <option value="finalizado">Finalizado</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Status Estilo
            </label>
            <input
              name="status_estilo"
              defaultValue={colecao.status_estilo ?? ""}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400"
              placeholder="Status do estilo"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Link
            href={`/colecoes/${colecaoId}`}
            className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg hover:from-pink-600 hover:to-rose-600 shadow-sm transition-all"
          >
            Salvar Alterações
          </button>
        </div>
      </form>
    </div>
  );
}
