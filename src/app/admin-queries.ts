import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

// Helper: verify if the current user is admin (for server components)
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as any).nivel !== "admin") {
    redirect("/dashboard");
  }
  return session;
}

// ========================
// Queries de Dados (para Server Components)
// ========================

export async function listarUsuarios() {
  await requireAdmin();

  return prisma.usuario.findMany({
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
    },
  });
}

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
    ultimosUsuarios,
  };
}
