import prisma from "@/lib/prisma";
import { editarReferencia } from "@/app/actions";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { ReferenciaForm } from "@/components/referencias/referencia-form";

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

  const colecoesData = colecoes.map((c) => ({
    id: c.id,
    nome: c.nome,
    codigo: c.codigo,
  }));

  const referenciaData = {
    id: referencia.id,
    colecao_id: referencia.colecao_id,
    codigo: referencia.codigo,
    nome: referencia.nome,
    foto: referencia.foto,
    previsao_producao: referencia.previsao_producao,
    tempo_producao: referencia.tempo_producao,
    producao_diaria_pessoa: referencia.producao_diaria_pessoa,
    data_distribuicao: referencia.data_distribuicao
      ? referencia.data_distribuicao.toISOString().slice(0, 10)
      : null,
    media_dias_entrega: referencia.media_dias_entrega,
    localizacao_estoque: referencia.localizacao_estoque,
    status: referencia.status ?? "normal",
    para_marketing: !!referencia.para_marketing,
    observacoes: referencia.observacoes,
  };

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

      <ReferenciaForm
        colecoes={colecoesData}
        referencia={referenciaData}
        action={editAction}
        submitLabel="Salvar Alterações"
        cancelHref={`/referencias/${refId}`}
      />
    </div>
  );
}
