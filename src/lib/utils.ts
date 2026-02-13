import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null): string {
  if (!date) return "—";
  const d = new Date(date);
  return d.toLocaleDateString("pt-BR");
}

export function formatDateTime(date: Date | string | null): string {
  if (!date) return "—";
  const d = new Date(date);
  return d.toLocaleString("pt-BR");
}

export function calcPercentage(produced: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.round((produced / total) * 100));
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    normal: "bg-blue-100 text-blue-800",
    finalizada: "bg-green-100 text-green-800",
    finalizado: "bg-green-100 text-green-800",
    arquivada: "bg-gray-100 text-gray-800",
    atraso_desenvolvimento: "bg-yellow-100 text-yellow-800",
    atraso_logistica: "bg-red-100 text-red-800",
    atrasado: "bg-red-100 text-red-800",
    pendente: "bg-orange-100 text-orange-800",
    em_andamento: "bg-blue-100 text-blue-800",
    concluida: "bg-green-100 text-green-800",
    em_producao: "bg-purple-100 text-purple-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    normal: "Normal",
    finalizada: "Finalizada",
    finalizado: "Finalizado",
    arquivada: "Arquivada",
    atraso_desenvolvimento: "Atraso Desenvolvimento",
    atraso_logistica: "Atraso Logística",
    atrasado: "Atrasado",
    pendente: "Pendente",
    em_andamento: "Em Andamento",
    concluida: "Concluída",
    em_producao: "Em Produção",
  };
  return labels[status] || status;
}

export function isDeadlineNear(date: Date | string | null, days: number = 5): boolean {
  if (!date) return false;
  const d = new Date(date);
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  const diffDays = diff / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= days;
}

export function isOverdue(date: Date | string | null): boolean {
  if (!date) return false;
  const d = new Date(date);
  return d < new Date();
}

export function getEtapaDisplayColor(
  status: string,
  dataFim?: Date | string | null
): string {
  if (status === "concluida") {
    return "bg-green-100 text-green-800";
  }
  if (status === "em_andamento") {
    if (dataFim && (isOverdue(dataFim) || isDeadlineNear(dataFim, 5))) {
      return "bg-red-100 text-red-800";
    }
    return "bg-blue-100 text-blue-800";
  }
  // pendente
  return "bg-yellow-100 text-yellow-800";
}

export interface EtapaDisplayInfo {
  nome: string;
  status: string;
  urgente: boolean;
  todasConcluidas: boolean;
}

export function getEtapaDisplayInfo(
  etapas: Array<{ nome: string; status: string | null; data_fim: Date | string | null }>
): EtapaDisplayInfo | null {
  if (!etapas || etapas.length === 0) return null;

  const todasConcluidas = etapas.every((e) => e.status === "concluida");
  if (todasConcluidas) {
    return {
      nome: "Concluída",
      status: "concluida",
      urgente: false,
      todasConcluidas: true,
    };
  }

  const ativa = etapas.find(
    (e) => e.status === "pendente" || e.status === "em_andamento"
  );
  if (!ativa) return null;

  const status = ativa.status || "pendente";
  const urgente =
    status === "em_andamento" &&
    ativa.data_fim != null &&
    (isOverdue(ativa.data_fim) || isDeadlineNear(ativa.data_fim, 5));

  return {
    nome: ativa.nome,
    status,
    urgente,
    todasConcluidas: false,
  };
}
