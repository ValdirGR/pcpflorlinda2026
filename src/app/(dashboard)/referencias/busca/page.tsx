import prisma from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Eye, Pencil, Trash2 } from "lucide-react";
import { getStatusColor, getStatusLabel, calcPercentage } from "@/lib/utils";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ termo?: string }>;
}

export default async function BuscaReferenciasPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const session = await auth();
  const nivel = session?.user?.nivel || "visualizador";
  const termo = params.termo || "";

  let referencias: any[] = [];
  if (termo) {
    referencias = await prisma.referencia.findMany({
      where: {
        OR: [
          { codigo: { contains: termo } },
          { nome: { contains: termo } },
        ],
      },
      include: {
        colecao: { select: { nome: true } },
      },
      orderBy: { codigo: "asc" },
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/referencias"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h2 className="text-2xl font-bold text-gray-900">
          Resultados da Busca
        </h2>
      </div>

      {termo && (
        <div className="bg-blue-50 border border-blue-100 text-blue-700 px-4 py-3 rounded-lg text-sm">
          Resultados para: <strong>&quot;{termo}&quot;</strong> — {referencias.length}{" "}
          referência(s) encontrada(s)
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Código
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Nome
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Coleção
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Progresso
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Status
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {referencias.map((ref) => {
                const pct = calcPercentage(
                  ref.quantidade_produzida || 0,
                  ref.previsao_producao || 0
                );
                return (
                  <tr key={ref.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm font-medium text-pink-600">
                        {ref.codigo}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {ref.nome}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {ref.colecao.nome}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 w-20 bg-gray-100 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${
                              pct >= 100 ? "bg-green-500" : "bg-pink-500"
                            }`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">
                          {ref.quantidade_produzida || 0}/{ref.previsao_producao || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          ref.status || "normal"
                        )}`}
                      >
                        {getStatusLabel(ref.status || "normal")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/referencias/${ref.id}`}
                          className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        {nivel !== "visualizador" && (
                          <Link
                            href={`/referencias/${ref.id}/editar`}
                            className="p-2 text-gray-400 hover:text-pink-500 hover:bg-pink-50 rounded-lg"
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {referencias.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    {termo
                      ? "Nenhuma referência encontrada para o termo pesquisado"
                      : "Digite um termo para buscar"}
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
