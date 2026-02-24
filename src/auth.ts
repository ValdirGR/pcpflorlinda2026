import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email e senha são obrigatórios");
        }

        const user = await prisma.usuario.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.ativo) {
          throw new Error("Email ou senha inválidos");
        }

        const isValid = await compare(
          credentials.password as string,
          user.senha
        );
        if (!isValid) {
          throw new Error("Email ou senha inválidos");
        }

        return {
          id: String(user.id),
          name: user.nome,
          email: user.email,
          nivel: user.nivel,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.nivel = (user as any).nivel;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).nivel = token.nivel as string;
      }
      return session;
    },
  },
  events: {
    async signIn({ user }) {
      try {
        // Tenta capturar o IP do request
        let ip: string | null = null;
        try {
          const hdrs = await headers();
          ip =
            hdrs.get("x-forwarded-for")?.split(",")[0].trim() ||
            hdrs.get("x-real-ip") ||
            null;
        } catch {
          // headers() pode não estar disponível no contexto de eventos
        }

        await prisma.logAtividade.create({
          data: {
            usuario_id: user.id ? parseInt(user.id) : null,
            usuario_nome: user.name || user.email || "Desconhecido",
            acao: "login",
            entidade: "sistema",
            entidade_id: null,
            descricao: `Login realizado por "${user.name || user.email}"`,
            ip,
          },
        });
      } catch (e) {
        console.error("[auth] erro ao registrar login:", e);
      }
    },
    async signOut(message) {
      try {
        // Em JWT strategy, message.token contém os dados do usuário
        const token = (message as any).token;
        const userId = token?.id ? parseInt(token.id) : null;
        const userName = token?.name || token?.email || "Desconhecido";

        await prisma.logAtividade.create({
          data: {
            usuario_id: userId,
            usuario_nome: userName,
            acao: "logout",
            entidade: "sistema",
            entidade_id: null,
            descricao: `Logout realizado por "${userName}"`,
            ip: null,
          },
        });
      } catch (e) {
        console.error("[auth] erro ao registrar logout:", e);
      }
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 horas — sessão expira automaticamente
  },
  secret: process.env.NEXTAUTH_SECRET,
});
