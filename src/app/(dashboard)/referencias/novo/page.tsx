import prisma from "@/lib/prisma";
import { criarReferencia } from "@/app/actions";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ReferenciaForm } from "@/components/referencias/referencia-form";

export const dynamic = "force-dynamic";

export default async function NovaReferenciaPage() {
  const colecoes = await prisma.colecao.findMany({ orderBy: { nome: "asc" } });

  const colecoesData = colecoes.map((c) => ({
    id: c.id,
    nome: c.nome,
    codigo: c.codigo,
  }));

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/referencias" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h2 className="text-2xl font-bold text-gray-900">Nova Referência</h2>
      </div>

      <ReferenciaForm
        colecoes={colecoesData}
        action={criarReferencia}
        submitLabel="Criar Referência"
        cancelHref="/referencias"
      />
    </div>
  );
}
