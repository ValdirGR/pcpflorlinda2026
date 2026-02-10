import prisma from "@/lib/prisma";
import { editarReferencia } from "@/app/actions";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditarReferenciaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const refId = parseInt(id);
  if (isNaN(refId)) notFound();

  const [referencia, colecoes] = await Promise.all([
    prisma.referencia.findUnique({ where: { id: refId } }),
    prisma.colecao.findMany({ orderBy: { nome: "asc" } }),
  ]);

  if (!referencia) notFound();

  const editAction = editarReferencia.bind(null, refId);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/referencias/${refId}`}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h2 className="text-2xl font-bold text-gray-900">Editar Referência</h2>
      </div>

      <form
        action={editAction}
        className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Coleção *
            </label>
            <select
              name="colecao_id"
              required
              defaultValue={referencia.colecao_id}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400"
            >
              {colecoes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome} ({c.codigo})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Código *
            </label>
            <input
              name="codigo"
              required
              defaultValue={referencia.codigo}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nome *
            </label>
            <input
              name="nome"
              required
              defaultValue={referencia.nome}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Previsão de Produção
            </label>
            <input
              type="number"
              name="previsao_producao"
              defaultValue={referencia.previsao_producao ?? ""}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Tempo de Produção (min)
            </label>
            <input
              type="number"
              name="tempo_producao"
              defaultValue={referencia.tempo_producao ?? ""}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Produção Diária/Pessoa
            </label>
            <input
              type="number"
              name="producao_diaria_pessoa"
              defaultValue={referencia.producao_diaria_pessoa ?? ""}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Data Distribuição
            </label>
            <input
              type="date"
              name="data_distribuicao"
              defaultValue={
                referencia.data_distribuicao
                  ? referencia.data_distribuicao.toISOString().slice(0, 10)
                  : ""
              }
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Média Dias Entrega
            </label>
            <input
              type="number"
              name="media_dias_entrega"
              defaultValue={referencia.media_dias_entrega ?? ""}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Localização Estoque
            </label>
            <input
              name="localizacao_estoque"
              defaultValue={referencia.localizacao_estoque ?? ""}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Status
            </label>
            <select
              name="status"
              defaultValue={referencia.status ?? "normal"}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400"
            >
              <option value="normal">Normal</option>
              <option value="finalizada">Finalizada</option>
              <option value="arquivada">Arquivada</option>
              <option value="atraso_desenvolvimento">
                Atraso Desenvolvimento
              </option>
              <option value="atraso_logistica">Atraso Logística</option>
              <option value="em_producao">Em Produção</option>
            </select>
          </div>
          <div className="flex items-center gap-3 pt-6">
            <input
              type="checkbox"
              name="para_marketing"
              id="para_marketing"
              defaultChecked={!!referencia.para_marketing}
              className="h-4 w-4 text-pink-500 border-gray-300 rounded focus:ring-pink-500"
            />
            <label htmlFor="para_marketing" className="text-sm text-gray-700">
              Para Marketing
            </label>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Observações
            </label>
            <textarea
              name="observacoes"
              rows={3}
              defaultValue={referencia.observacoes ?? ""}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400 resize-none"
            />
          </div>
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
            className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg hover:from-pink-600 hover:to-rose-600 shadow-sm transition-all"
          >
            Salvar Alterações
          </button>
        </div>
      </form>
    </div>
  );
}
