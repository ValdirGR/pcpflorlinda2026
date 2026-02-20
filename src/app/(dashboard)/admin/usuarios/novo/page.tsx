"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Eye, EyeOff } from "lucide-react";
import AdminGuard from "@/components/admin/admin-guard";
import { criarUsuario } from "@/app/admin-actions";
import { cn } from "@/lib/utils";

export default function NovoUsuarioPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);

  const handleSubmit = (formData: FormData) => {
    setErro(null);

    // Validação client-side
    const senha = formData.get("senha") as string;
    const confirmar = formData.get("confirmar_senha") as string;

    if (!formData.get("nome") || !formData.get("email") || !senha) {
      setErro("Preencha todos os campos obrigatórios");
      return;
    }

    if (senha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    if (senha !== confirmar) {
      setErro("As senhas não coincidem");
      return;
    }

    startTransition(async () => {
      try {
        await criarUsuario(formData);
      } catch (error: any) {
        if (error?.digest?.startsWith("NEXT_REDIRECT")) {
          throw error;
        }
        setErro(error.message || "Erro ao criar usuário");
      }
    });
  };

  return (
    <AdminGuard>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/admin/usuarios"
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Novo Usuário</h1>
            <p className="text-gray-500 mt-1">
              Cadastre um novo usuário no sistema
            </p>
          </div>
        </div>

        {/* Form */}
        <form action={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          {erro && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {erro}
            </div>
          )}

          {/* Nome */}
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
              Nome <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="nome"
              name="nome"
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-colors"
              placeholder="Nome completo do usuário"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-colors"
              placeholder="email@exemplo.com"
            />
          </div>

          {/* Senha */}
          <div>
            <label htmlFor="senha" className="block text-sm font-medium text-gray-700 mb-1">
              Senha <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={mostrarSenha ? "text" : "password"}
                id="senha"
                name="senha"
                required
                minLength={6}
                className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-colors"
                placeholder="Mínimo 6 caracteres"
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {mostrarSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Confirmar Senha */}
          <div>
            <label htmlFor="confirmar_senha" className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar Senha <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={mostrarConfirmar ? "text" : "password"}
                id="confirmar_senha"
                name="confirmar_senha"
                required
                minLength={6}
                className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-colors"
                placeholder="Repita a senha"
              />
              <button
                type="button"
                onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {mostrarConfirmar ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Nível */}
          <div>
            <label htmlFor="nivel" className="block text-sm font-medium text-gray-700 mb-1">
              Nível de Acesso
            </label>
            <select
              id="nivel"
              name="nivel"
              defaultValue="visualizador"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-colors bg-white"
            >
              <option value="visualizador">Visualizador</option>
              <option value="usuario">Usuário</option>
              <option value="admin">Administrador</option>
            </select>
            <p className="text-xs text-gray-400 mt-1">
              Admin: acesso total • Usuário: criar/editar • Visualizador: somente leitura
            </p>
          </div>

          {/* Status */}
          <div>
            <label htmlFor="ativo" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="ativo"
              name="ativo"
              defaultValue="true"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-colors bg-white"
            >
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <Link
              href="/admin/usuarios"
              className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-all shadow-sm",
                isPending
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-linear-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
              )}
            >
              <Save className="h-4 w-4" />
              {isPending ? "Criando..." : "Criar Usuário"}
            </button>
          </div>
        </form>
      </div>
    </AdminGuard>
  );
}
