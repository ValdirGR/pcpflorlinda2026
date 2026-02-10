import prisma from "@/lib/prisma";
import Link from "next/link";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import { getStatusColor, getStatusLabel, formatDate } from "@/lib/utils";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export default async function ColecoesPage() {
  const session = await auth();
  const nivel = session?.user?.nivel || "visualizador";

  const colecoes = await prisma.colecao.findMany({
    include: {
      _count: { select: { referencias: true } },
      referencias: {
        select: {
          quantidade_produzida: true,
          previsao_producao: true,
        },
      },
    },
    orderBy: { created_at: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Coleções</h2>
        {nivel !== "visualizador" && (
          <Link
            href="/colecoes/novo"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg font-medium text-sm hover:from-pink-600 hover:to-rose-600 shadow-sm shadow-pink-500/20 transition-all"
          >
            <Plus className="h-4 w-4" />
            Nova Coleção
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {colecoes.map((colecao) => {
          const totalProd = colecao.referencias.reduce(
            (acc, r) => acc + (r.quantidade_produzida || 0),
            0
          );
          const totalPrev = colecao.referencias.reduce(
            (acc, r) => acc + (r.previsao_producao || 0),
            0
          );
          const pct = totalPrev > 0 ? Math.round((totalProd / totalPrev) * 100) : 0;

          return (
            <div
              key={colecao.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {colecao.nome}
                    </h3>
                    <p className="text-sm text-gray-400">{colecao.codigo}</p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      colecao.status || "normal"
                    )}`}
                  >
                    {getStatusLabel(colecao.status || "normal")}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-gray-400 text-xs">Início</p>
                    <p className="font-medium text-gray-700">
                      {formatDate(colecao.data_inicio)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Fim</p>
                    <p className="font-medium text-gray-700">
                      {formatDate(colecao.data_fim)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Referências</p>
                    <p className="font-medium text-gray-700">
                      {colecao._count.referencias}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Produção</p>
                    <p className="font-medium text-gray-700">
                      {totalProd.toLocaleString("pt-BR")} / {totalPrev.toLocaleString("pt-BR")}
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Progresso</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        pct >= 100
                          ? "bg-green-500"
                          : pct >= 50
                          ? "bg-pink-500"
                          : "bg-orange-500"
                      }`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Link
                    href={`/colecoes/${colecao.id}`}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    Detalhes
                  </Link>
                  {nivel !== "visualizador" && (
                    <Link
                      href={`/colecoes/${colecao.id}/editar`}
                      className="p-2 text-gray-400 hover:text-pink-500 hover:bg-pink-50 rounded-lg transition-colors"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                  )}
                  {nivel === "admin" && (
                    <Link
                      href={`/colecoes/${colecao.id}/excluir`}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {colecoes.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400">
            Nenhuma coleção cadastrada
          </div>
        )}
      </div>
    </div>
  );
}
