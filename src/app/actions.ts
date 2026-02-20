"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { registrarAtividade } from "@/lib/log-atividade";
import type {
  colecoes_status,
  referencias_status,
  etapas_producao_status,
  producao_status,
} from "@prisma/client";

export async function criarColecao(formData: FormData) {
  const nome = formData.get("nome") as string;
  const codigo = formData.get("codigo") as string;
  const colecao = await prisma.colecao.create({
    data: {
      nome,
      codigo,
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

  await registrarAtividade({
    acao: "criar",
    entidade: "colecao",
    entidadeId: colecao.id,
    descricao: `Criou a coleção "${nome}" (${codigo})`,
  });

  revalidatePath("/colecoes");
  revalidatePath("/dashboard");
  redirect("/colecoes");
}

export async function editarColecao(id: number, formData: FormData) {
  const nome = formData.get("nome") as string;
  const codigo = formData.get("codigo") as string;
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

  await registrarAtividade({
    acao: "editar",
    entidade: "colecao",
    entidadeId: id,
    descricao: `Editou a coleção "${nome}" (${codigo})`,
  });

  revalidatePath("/colecoes");
  revalidatePath(`/colecoes/${id}`);
  revalidatePath("/dashboard");
  redirect(`/colecoes/${id}`);
}

export async function excluirColecao(id: number) {
  const colecao = await prisma.colecao.findUnique({ where: { id }, select: { nome: true, codigo: true } });
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

  await registrarAtividade({
    acao: "excluir",
    entidade: "colecao",
    entidadeId: id,
    descricao: `Excluiu a coleção "${colecao?.nome}" (${colecao?.codigo})`,
    detalhes: `${refs.length} referência(s) também foram excluídas`,
  });

  revalidatePath("/colecoes");
  revalidatePath("/dashboard");
  redirect("/colecoes");
}

export async function criarReferencia(formData: FormData) {
  const fotoValue = formData.get("foto") as string;
  const nome = formData.get("nome") as string;
  const codigo = formData.get("codigo") as string;
  const ref = await prisma.referencia.create({
    data: {
      colecao_id: parseInt(formData.get("colecao_id") as string),
      codigo: formData.get("codigo") as string,
      nome: formData.get("nome") as string,
      foto: fotoValue || null,
      tempo_producao: formData.get("tempo_producao")
        ? parseInt(formData.get("tempo_producao") as string)
        : 0,
      previsao_producao: formData.get("previsao_producao")
        ? parseInt(formData.get("previsao_producao") as string)
        : 0,
      quantidade_produzida: formData.get("quantidade_produzida")
        ? parseInt(formData.get("quantidade_produzida") as string)
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

  await registrarAtividade({
    acao: "criar",
    entidade: "referencia",
    entidadeId: ref.id,
    descricao: `Criou a referência "${nome}" (${codigo})`,
  });

  revalidatePath("/referencias");
  revalidatePath("/dashboard");
  redirect("/referencias");
}

export async function editarReferencia(id: number, formData: FormData) {
  const fotoValue = formData.get("foto") as string;
  const nome = formData.get("nome") as string;
  const codigo = formData.get("codigo") as string;
  await prisma.referencia.update({
    where: { id },
    data: {
      colecao_id: parseInt(formData.get("colecao_id") as string),
      codigo: formData.get("codigo") as string,
      nome: formData.get("nome") as string,
      foto: fotoValue || null,
      tempo_producao: formData.get("tempo_producao")
        ? parseInt(formData.get("tempo_producao") as string)
        : 0,
      previsao_producao: formData.get("previsao_producao")
        ? parseInt(formData.get("previsao_producao") as string)
        : 0,
      quantidade_produzida: formData.get("quantidade_produzida")
        ? parseInt(formData.get("quantidade_produzida") as string)
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

  await registrarAtividade({
    acao: "editar",
    entidade: "referencia",
    entidadeId: id,
    descricao: `Editou a referência "${nome}" (${codigo})`,
  });

  revalidatePath("/referencias");
  revalidatePath(`/referencias/${id}`);
  revalidatePath("/dashboard");
  redirect(`/referencias/${id}`);
}

export async function atualizarStatusReferencia(id: number, status: referencias_status) {
  const ref = await prisma.referencia.findUnique({ where: { id }, select: { nome: true, codigo: true } });
  await prisma.referencia.update({
    where: { id },
    data: { status },
  });

  await registrarAtividade({
    acao: "alterar_status",
    entidade: "referencia",
    entidadeId: id,
    descricao: `Alterou status da referência "${ref?.nome}" para "${status}"`,
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

  const ref = await prisma.referencia.findUnique({ where: { id: referencia_id }, select: { nome: true, codigo: true } });
  await registrarAtividade({
    acao: "criar",
    entidade: "producao",
    entidadeId: referencia_id,
    descricao: `Registrou produção de ${quantidade_dia} peças para "${ref?.nome}" (${ref?.codigo})`,
  });

  revalidatePath("/producao");
  revalidatePath("/referencias");
  revalidatePath("/dashboard");
  redirect("/producao");
}

export async function adicionarEtapa(formData: FormData) {
  const referencia_id = parseInt(formData.get("referencia_id") as string);
  const nomeEtapa = formData.get("nome") as string;

  await prisma.etapaProducao.create({
    data: {
      referencia_id,
      nome: nomeEtapa,
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

  const ref = await prisma.referencia.findUnique({ where: { id: referencia_id }, select: { nome: true, codigo: true } });
  await registrarAtividade({
    acao: "criar",
    entidade: "etapa",
    entidadeId: referencia_id,
    descricao: `Adicionou etapa "${nomeEtapa}" na referência "${ref?.nome}" (${ref?.codigo})`,
  });

  revalidatePath(`/referencias/${referencia_id}`);
  revalidatePath("/dashboard");
  redirect(`/referencias/${referencia_id}`);
}

export async function atualizarEtapa(id: number, formData: FormData) {
  const referencia_id = parseInt(formData.get("referencia_id") as string);
  const nomeEtapa = formData.get("nome") as string;

  await prisma.etapaProducao.update({
    where: { id },
    data: {
      nome: nomeEtapa,
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

  const ref = await prisma.referencia.findUnique({ where: { id: referencia_id }, select: { nome: true, codigo: true } });
  await registrarAtividade({
    acao: "editar",
    entidade: "etapa",
    entidadeId: id,
    descricao: `Atualizou etapa "${nomeEtapa}" na referência "${ref?.nome}" (${ref?.codigo})`,
  });

  revalidatePath(`/referencias/${referencia_id}`);
  revalidatePath("/dashboard");
  redirect(`/referencias/${referencia_id}`);
}

export async function excluirEtapa(id: number, referencia_id: number) {
  const etapa = await prisma.etapaProducao.findUnique({ where: { id }, select: { nome: true } });
  await prisma.etapaProducao.delete({
    where: { id },
  });

  const ref = await prisma.referencia.findUnique({ where: { id: referencia_id }, select: { nome: true, codigo: true } });
  await registrarAtividade({
    acao: "excluir",
    entidade: "etapa",
    entidadeId: id,
    descricao: `Excluiu etapa "${etapa?.nome}" da referência "${ref?.nome}" (${ref?.codigo})`,
  });

  revalidatePath(`/referencias/${referencia_id}`);
  revalidatePath("/dashboard");
}

export async function listarColecoesParaSeletor() {
  const colecoes = await prisma.colecao.findMany({
    where: {
      status: { not: "desabilitada" },
    },
    select: {
      id: true,
      nome: true,
      codigo: true,
    },
    orderBy: {
      created_at: "desc",
    },
  });
  return colecoes;
}

export async function excluirReferencia(id: number) {
  const ref = await prisma.referencia.findUnique({ where: { id }, select: { nome: true, codigo: true } });
  const etapasCount = await prisma.etapaProducao.count({
    where: { referencia_id: id },
  });

  if (etapasCount > 0) {
    throw new Error("Não é possível excluir referências que possuem etapas cadastradas.");
  }

  // Se não tem etapas, deleta a produção (se houver, por consistência) e a referência
  await prisma.producao.deleteMany({
    where: { referencia_id: id },
  });

  await prisma.referencia.delete({
    where: { id },
  });

  await registrarAtividade({
    acao: "excluir",
    entidade: "referencia",
    entidadeId: id,
    descricao: `Excluiu a referência "${ref?.nome}" (${ref?.codigo})`,
  });

  revalidatePath("/referencias");
  revalidatePath("/dashboard");
  return { success: true };
}
