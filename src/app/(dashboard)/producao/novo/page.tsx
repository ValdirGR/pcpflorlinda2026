import prisma from "@/lib/prisma";
import { criarProducao } from "@/app/actions";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function NovaProducaoPage() {
  const referencias = await prisma.referencia.findMany({
    include: { colecao: true },
    orderBy: { nome: "asc" },
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/producao" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h2 className="text-2xl font-bold text-gray-900">
          Registrar Produção
        </h2>
      </div>

      <form
        action={criarProducao}
        className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Referência *
            </label>
            <select
              name="referencia_id"
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400"
            >
              <option value="">Selecione...</option>
              {referencias.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.codigo} - {r.nome} ({r.colecao.nome})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Quantidade *
            </label>
            <input
              type="number"
              name="quantidade_dia"
              required
              min={1}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Data da Produção *
            </label>
            <input
              type="date"
              name="data_producao"
              required
              defaultValue={new Date().toISOString().slice(0, 10)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Observações
            </label>
            <textarea
              name="observacoes"
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400 resize-none"
              placeholder="Observações sobre esta produção..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Link
            href="/producao"
            className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg hover:from-pink-600 hover:to-rose-600 shadow-sm transition-all"
          >
            Registrar Produção
          </button>
        </div>
      </form>
    </div>
  );
}
