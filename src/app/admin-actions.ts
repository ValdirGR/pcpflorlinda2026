"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hash } from "bcryptjs";
import type { usuarios_nivel } from "@prisma/client";

// Helper: verify if the current user is admin
async function requireAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as any).nivel !== "admin") {
    throw new Error("Acesso não autorizado");
  }
  return session;
}

// ========================
// CRUD de Usuários
// ========================

export async function listarUsuarios(filtros?: {
  busca?: string;
  nivel?: string;
  status?: string;
}) {
  await requireAdmin();

  const where: any = {};

  if (filtros?.busca) {
    where.OR = [
      { nome: { contains: filtros.busca } },
      { email: { contains: filtros.busca } },
    ];
  }

  if (filtros?.nivel && filtros.nivel !== "todos") {
    where.nivel = filtros.nivel;
  }

  if (filtros?.status && filtros.status !== "todos") {
    where.ativo = filtros.status === "ativo";
  }

  return prisma.usuario.findMany({
    where,
    select: {
      id: true,
      nome: true,
      email: true,
      nivel: true,
      ativo: true,
      created_at: true,
      updated_at: true,
    },
    orderBy: { created_at: "desc" },
  });
}

export async function obterUsuario(id: number) {
  await requireAdmin();

  return prisma.usuario.findUnique({
    where: { id },
    select: {
      id: true,
      nome: true,
      email: true,
      nivel: true,
      ativo: true,
      created_at: true,
      updated_at: true,
      perfis: {
        include: {
          perfil: true,
        },
      },
    },
  });
}

export async function criarUsuario(formData: FormData) {
  await requireAdmin();

  const email = formData.get("email") as string;
  const senha = formData.get("senha") as string;
  const confirmarSenha = formData.get("confirmar_senha") as string;

  // Validações
  if (!email || !senha) {
    throw new Error("Email e senha são obrigatórios");
  }

  if (senha.length < 6) {
    throw new Error("A senha deve ter pelo menos 6 caracteres");
  }

  if (senha !== confirmarSenha) {
    throw new Error("As senhas não coincidem");
  }

  const existente = await prisma.usuario.findUnique({
    where: { email },
  });

  if (existente) {
    throw new Error("Já existe um usuário com este email");
  }

  const senhaHash = await hash(senha, 12);

  await prisma.usuario.create({
    data: {
      nome: formData.get("nome") as string,
      email,
      senha: senhaHash,
      nivel: (formData.get("nivel") as usuarios_nivel) || "visualizador",
      ativo: formData.get("ativo") === "true",
    },
  });

  revalidatePath("/admin/usuarios");
  revalidatePath("/admin");
  redirect("/admin/usuarios");
}

export async function editarUsuario(id: number, formData: FormData) {
  const session = await requireAdmin();

  const email = formData.get("email") as string;

  // Verificar se email já existe em outro usuário
  const existente = await prisma.usuario.findFirst({
    where: {
      email,
      NOT: { id },
    },
  });

  if (existente) {
    throw new Error("Já existe outro usuário com este email");
  }

  await prisma.usuario.update({
    where: { id },
    data: {
      nome: formData.get("nome") as string,
      email,
      nivel: (formData.get("nivel") as usuarios_nivel) || "visualizador",
      ativo: formData.get("ativo") === "true",
    },
  });

  revalidatePath("/admin/usuarios");
  revalidatePath(`/admin/usuarios/${id}`);
  revalidatePath("/admin");
  redirect(`/admin/usuarios/${id}`);
}

export async function alterarSenhaUsuario(id: number, formData: FormData) {
  await requireAdmin();

  const novaSenha = formData.get("nova_senha") as string;
  const confirmarSenha = formData.get("confirmar_senha") as string;

  if (!novaSenha || novaSenha.length < 6) {
    throw new Error("A nova senha deve ter pelo menos 6 caracteres");
  }

  if (novaSenha !== confirmarSenha) {
    throw new Error("As senhas não coincidem");
  }

  const senhaHash = await hash(novaSenha, 12);

  await prisma.usuario.update({
    where: { id },
    data: { senha: senhaHash },
  });

  revalidatePath(`/admin/usuarios/${id}`);
  return { success: true, message: "Senha alterada com sucesso" };
}

export async function toggleStatusUsuario(id: number) {
  const session = await requireAdmin();

  // Não permitir desativar a si mesmo
  if (String(id) === session.user?.id) {
    throw new Error("Você não pode desativar sua própria conta");
  }

  const usuario = await prisma.usuario.findUnique({
    where: { id },
    select: { ativo: true },
  });

  if (!usuario) {
    throw new Error("Usuário não encontrado");
  }

  await prisma.usuario.update({
    where: { id },
    data: { ativo: !usuario.ativo },
  });

  revalidatePath("/admin/usuarios");
  revalidatePath("/admin");
  return { success: true };
}

export async function excluirUsuario(id: number) {
  const session = await requireAdmin();

  // Não permitir excluir a si mesmo
  if (String(id) === session.user?.id) {
    throw new Error("Você não pode excluir sua própria conta");
  }

  // Excluir relacionamentos primeiro
  await prisma.usuarioPerfil.deleteMany({
    where: { usuario_id: id },
  });

  await prisma.usuario.delete({
    where: { id },
  });

  revalidatePath("/admin/usuarios");
  revalidatePath("/admin");
  redirect("/admin/usuarios");
}

// ========================
// Estatísticas Admin
// ========================

export async function obterEstatisticasAdmin() {
  await requireAdmin();

  const [
    totalUsuarios,
    usuariosAtivos,
    usuariosInativos,
    admins,
    usuarios,
    visualizadores,
    totalColecoes,
    totalReferencias,
    totalProducao,
    totalPerfis,
  ] = await Promise.all([
    prisma.usuario.count(),
    prisma.usuario.count({ where: { ativo: true } }),
    prisma.usuario.count({ where: { ativo: false } }),
    prisma.usuario.count({ where: { nivel: "admin" } }),
    prisma.usuario.count({ where: { nivel: "usuario" } }),
    prisma.usuario.count({ where: { nivel: "visualizador" } }),
    prisma.colecao.count(),
    prisma.referencia.count(),
    prisma.producao.count(),
    prisma.perfil.count(),
  ]);

  const ultimosUsuarios = await prisma.usuario.findMany({
    select: {
      id: true,
      nome: true,
      email: true,
      nivel: true,
      ativo: true,
      created_at: true,
    },
    orderBy: { created_at: "desc" },
    take: 5,
  });

  return {
    totalUsuarios,
    usuariosAtivos,
    usuariosInativos,
    admins,
    usuarios,
    visualizadores,
    totalColecoes,
    totalReferencias,
    totalProducao,
    totalPerfis,
    ultimosUsuarios,
  };
}

// ========================
// Perfis
// ========================

export async function listarPerfis() {
  await requireAdmin();

  return prisma.perfil.findMany({
    include: {
      _count: {
        select: {
          usuarios: true,
          permissoes: true,
        },
      },
      permissoes: {
        include: {
          permissao: true,
        },
      },
    },
    orderBy: { created_at: "desc" },
  });
}

export async function listarPermissoes() {
  await requireAdmin();

  return prisma.permissao.findMany({
    orderBy: { nome: "asc" },
  });
}
