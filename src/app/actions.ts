"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type {
  colecoes_status,
  referencias_status,
  etapas_producao_status,
  producao_status,
} from "@prisma/client";

export async function criarColecao(formData: FormData) {
  await prisma.colecao.create({
    data: {
      nome: formData.get("nome") as string,
      codigo: formData.get("codigo") as string,
      data_inicio: new Date(formData.get("data_inicio") as string || new Date().toISOString()),
      data_fim: new Date(formData.get("data_fim") as string || new Date().toISOString()),
      prazo_inicial_estilo: formData.get("prazo_inicial_estilo")
        ? new Date(formData.get("prazo_inicial_estilo") as string)
        : null,
      prazo_final_estilo: formData.get("prazo_final_estilo")
        ? new Date(formData.get("prazo_final_estilo") as string)
        : null,
      data_envio_prevista: formData.get("data_envio_prevista")
        ? new Date(formData.get("data_envio_prevista") as string)
        : null,
      quantidade_total_producao: formData.get("quantidade_total_producao")
        ? parseInt(formData.get("quantidade_total_producao") as string)
        : 0,
      status: (formData.get("status") as colecoes_status) || "normal",
      status_estilo: formData.get("status_estilo") as string | null,
    },
  });

  revalidatePath("/colecoes");
  revalidatePath("/dashboard");
  redirect("/colecoes");
}

export async function editarColecao(id: number, formData: FormData) {
  await prisma.colecao.update({
    where: { id },
    data: {
      nome: formData.get("nome") as string,
      codigo: formData.get("codigo") as string,
      data_inicio: new Date(formData.get("data_inicio") as string || new Date().toISOString()),
      data_fim: new Date(formData.get("data_fim") as string || new Date().toISOString()),
      prazo_inicial_estilo: formData.get("prazo_inicial_estilo")
        ? new Date(formData.get("prazo_inicial_estilo") as string)
        : null,
      prazo_final_estilo: formData.get("prazo_final_estilo")
        ? new Date(formData.get("prazo_final_estilo") as string)
        : null,
      data_envio_prevista: formData.get("data_envio_prevista")
        ? new Date(formData.get("data_envio_prevista") as string)
        : null,
      quantidade_total_producao: formData.get("quantidade_total_producao")
        ? parseInt(formData.get("quantidade_total_producao") as string)
        : 0,
      status: (formData.get("status") as colecoes_status) || "normal",
      status_estilo: formData.get("status_estilo") as string | null,
    },
  });

  revalidatePath("/colecoes");
  revalidatePath(`/colecoes/${id}`);
  revalidatePath("/dashboard");
  redirect(`/colecoes/${id}`);
}

export async function excluirColecao(id: number) {
  const refs = await prisma.referencia.findMany({
    where: { colecao_id: id },
    select: { id: true },
  });

  for (const ref of refs) {
    await prisma.etapaProducao.deleteMany({ where: { referencia_id: ref.id } });
    await prisma.producao.deleteMany({ where: { referencia_id: ref.id } });
  }

  await prisma.referencia.deleteMany({ where: { colecao_id: id } });
  await prisma.colecao.delete({ where: { id } });

  revalidatePath("/colecoes");
  revalidatePath("/dashboard");
  redirect("/colecoes");
}

export async function criarReferencia(formData: FormData) {
  await prisma.referencia.create({
    data: {
      colecao_id: parseInt(formData.get("colecao_id") as string),
      codigo: formData.get("codigo") as string,
      nome: formData.get("nome") as string,
      tempo_producao: formData.get("tempo_producao")
        ? parseInt(formData.get("tempo_producao") as string)
        : 0,
      previsao_producao: formData.get("previsao_producao")
        ? parseInt(formData.get("previsao_producao") as string)
        : 0,
      producao_diaria_pessoa: formData.get("producao_diaria_pessoa")
        ? parseInt(formData.get("producao_diaria_pessoa") as string)
        : 0,
      data_distribuicao: formData.get("data_distribuicao")
        ? new Date(formData.get("data_distribuicao") as string)
        : null,
      media_dias_entrega: formData.get("media_dias_entrega")
        ? parseInt(formData.get("media_dias_entrega") as string)
        : null,
      localizacao_estoque: (formData.get("localizacao_estoque") as string) || null,
      status: (formData.get("status") as referencias_status) || "normal",
      para_marketing: formData.get("para_marketing") === "on",
      observacoes: (formData.get("observacoes") as string) || null,
    },
  });

  revalidatePath("/referencias");
  revalidatePath("/dashboard");
  redirect("/referencias");
}

export async function editarReferencia(id: number, formData: FormData) {
  await prisma.referencia.update({
    where: { id },
    data: {
      colecao_id: parseInt(formData.get("colecao_id") as string),
      codigo: formData.get("codigo") as string,
      nome: formData.get("nome") as string,
      tempo_producao: formData.get("tempo_producao")
        ? parseInt(formData.get("tempo_producao") as string)
        : 0,
      previsao_producao: formData.get("previsao_producao")
        ? parseInt(formData.get("previsao_producao") as string)
        : 0,
      producao_diaria_pessoa: formData.get("producao_diaria_pessoa")
        ? parseInt(formData.get("producao_diaria_pessoa") as string)
        : 0,
      data_distribuicao: formData.get("data_distribuicao")
        ? new Date(formData.get("data_distribuicao") as string)
        : null,
      media_dias_entrega: formData.get("media_dias_entrega")
        ? parseInt(formData.get("media_dias_entrega") as string)
        : null,
      localizacao_estoque: (formData.get("localizacao_estoque") as string) || null,
      status: (formData.get("status") as referencias_status) || "normal",
      para_marketing: formData.get("para_marketing") === "on",
      observacoes: (formData.get("observacoes") as string) || null,
    },
  });

  revalidatePath("/referencias");
  revalidatePath(`/referencias/${id}`);
  revalidatePath("/dashboard");
  redirect(`/referencias/${id}`);
}

export async function atualizarStatusReferencia(id: number, status: referencias_status) {
  await prisma.referencia.update({
    where: { id },
    data: { status },
  });

  revalidatePath("/referencias");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function criarProducao(formData: FormData) {
  const referencia_id = parseInt(formData.get("referencia_id") as string);
  const quantidade_dia = parseInt(formData.get("quantidade_dia") as string);

  await prisma.producao.create({
    data: {
      referencia_id,
      quantidade_dia,
      data_producao: new Date(formData.get("data_producao") as string),
      status: (formData.get("status") as producao_status) || "normal",
      observacoes: (formData.get("observacoes") as string) || null,
    },
  });

  await prisma.referencia.update({
    where: { id: referencia_id },
    data: {
      quantidade_produzida: { increment: quantidade_dia },
    },
  });

  revalidatePath("/producao");
  revalidatePath("/referencias");
  revalidatePath("/dashboard");
  redirect("/producao");
}

export async function adicionarEtapa(formData: FormData) {
  const referencia_id = parseInt(formData.get("referencia_id") as string);

  await prisma.etapaProducao.create({
    data: {
      referencia_id,
      nome: formData.get("nome") as string,
      status: (formData.get("status") as etapas_producao_status) || "pendente",
      data_inicio: formData.get("data_inicio")
        ? new Date(formData.get("data_inicio") as string)
        : null,
      data_fim: formData.get("data_fim")
        ? new Date(formData.get("data_fim") as string)
        : null,
      observacoes: (formData.get("observacoes") as string) || null,
    },
  });

  revalidatePath(`/referencias/${referencia_id}`);
  revalidatePath("/dashboard");
  redirect(`/referencias/${referencia_id}`);
}

export async function atualizarEtapa(id: number, formData: FormData) {
  const referencia_id = parseInt(formData.get("referencia_id") as string);

  await prisma.etapaProducao.update({
    where: { id },
    data: {
      status: formData.get("status") as etapas_producao_status,
      data_inicio: formData.get("data_inicio")
        ? new Date(formData.get("data_inicio") as string)
        : null,
      data_fim: formData.get("data_fim")
        ? new Date(formData.get("data_fim") as string)
        : null,
      observacoes: (formData.get("observacoes") as string) || null,
    },
  });

  revalidatePath(`/referencias/${referencia_id}`);
  revalidatePath("/dashboard");
  redirect(`/referencias/${referencia_id}`);
}
