"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";

type Acao = "criar" | "editar" | "excluir" | "login" | "alterar_status" | "alterar_senha";
type Entidade = "colecao" | "referencia" | "etapa" | "producao" | "usuario" | "sistema" | "email_relatorio";

interface LogParams {
  acao: Acao;
  entidade: Entidade;
  entidadeId?: number;
  descricao: string;
  detalhes?: string;
}

export async function registrarAtividade({
  acao,
  entidade,
  entidadeId,
  descricao,
  detalhes,
}: LogParams) {
  try {
    const session = await auth();
    const usuarioId = session?.user?.id ? parseInt(session.user.id) : null;
    const usuarioNome = session?.user?.name || "Sistema";

    await prisma.logAtividade.create({
      data: {
        usuario_id: usuarioId,
        usuario_nome: usuarioNome,
        acao,
        entidade,
        entidade_id: entidadeId || null,
        descricao,
        detalhes: detalhes || null,
      },
    });
  } catch (error) {
    // Log silencioso - não deve quebrar a operação principal
    console.error("Erro ao registrar atividade:", error);
  }
}
