import { adicionarEtapa } from "@/app/actions";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function NovaEtapaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const refId = parseInt(id);
  
  const referencia = await Prisma.referencia.findUnique({
    where: { id: refId },
    select: { codigo: true, nome: true }
  });

  if (!referencia) notFound();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/referencias/${refId}`}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h2 className="text-2xl font-bold text-gray-900">Nova Etapa de Produção</h2>
      </div>

      <div className="bg-white p-4 rounded-lg border border-gray-100 mb-6">
        <p className="text-sm text-gray-500">Adicionando etapa para:</p>
        <p className="font-medium text-gray-900">{referencia.codigo} - {referencia.nome}</p>
      </div>

      <form action={adicionarEtapa} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-6">
        <input type="hidden" name="referencia_id" value={refId} />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Nome da Etapa *
          </label>
          <input
            name="nome"
            required
            placeholder="Ex: Corte, Costura, Acabamento"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400"
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Data Início
            </label>
            <input
              type="date"
              name="data_inicio"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Data Fim (Previsão)
            </label>
            <input
              type="date"
              name="data_fim"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Status
          </label>
          <select
            name="status"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400"
          >
            <option value="pendente">Pendente</option>
            <option value="em_andamento">Em Andamento</option>
            <option value="concluida">Concluída</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Observações
          </label>
          <textarea
            name="observacoes"
            rows={3}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400 resize-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Link
            href={`/referencias/${refId}`}
            className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            className="px-4 py-2.5 text-sm font-medium text-white bg-pink-500 rounded-lg hover:bg-pink-600 transition-colors shadow-sm shadow-pink-500/20"
          >
            Salvar Etapa
          </button>
        </div>
      </form>
    </div>
  );
}
