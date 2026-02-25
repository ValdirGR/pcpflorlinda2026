import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

function formatBR(date: Date, includeSeconds = false): string {
  return date.toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...(includeSeconds ? { second: "2-digit" } : {}),
  });
}

const acaoLabels: Record<string, string> = {
  criar: "Criação",
  editar: "Edição",
  excluir: "Exclusão",
  alterar_status: "Alteração de Status",
  alterar_senha: "Alteração de Senha",
  login: "Login",
  logout: "Logout",
};

const entidadeLabels: Record<string, string> = {
  colecao: "Coleção",
  referencia: "Referência",
  etapa: "Etapa",
  producao: "Produção",
  usuario: "Usuário",
  sistema: "Sistema",
  email_relatorio: "Email Relatório",
};

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user as any).nivel !== "admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const entidade = searchParams.get("entidade");
  const acao = searchParams.get("acao");
  const usuario = searchParams.get("usuario");

  const where: any = {};
  if (entidade) where.entidade = entidade;
  if (acao) where.acao = acao;
  if (usuario) where.usuario_nome = { contains: usuario };

  const logs = await prisma.logAtividade.findMany({
    where,
    orderBy: { created_at: "desc" },
    take: 500, // Limite de registros no PDF
  });

  // Gerar PDF
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const now = new Date();
  const dataHora = formatBR(now);

  // ===== CABEÇALHO =====
  doc.setFillColor(124, 58, 237); // purple-600
  doc.rect(0, 0, pageWidth, 28, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Log de Atividades", 15, 13);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Gerado em: ${dataHora}`, 15, 21);

  // Filtros aplicados
  const filtros: string[] = [];
  if (entidade) filtros.push(`Entidade: ${entidadeLabels[entidade] || entidade}`);
  if (acao) filtros.push(`Ação: ${acaoLabels[acao] || acao}`);
  if (usuario) filtros.push(`Usuário: ${usuario}`);
  if (filtros.length > 0) {
    doc.text(`Filtros: ${filtros.join(" | ")}`, pageWidth / 2, 21, { align: "center" });
  }

  doc.text(`${logs.length} registro(s)`, pageWidth - 15, 21, { align: "right" });

  // ===== TABELA =====
  const tableData = logs.map((log) => [
    formatBR(new Date(log.created_at), true),
    log.usuario_nome,
    acaoLabels[log.acao] || log.acao,
    entidadeLabels[log.entidade] || log.entidade,
    log.descricao.length > 80 ? log.descricao.substring(0, 77) + "..." : log.descricao,
    log.ip || "—",
  ]);

  autoTable(doc, {
    startY: 33,
    head: [["Data/Hora", "Usuário", "Ação", "Entidade", "Descrição", "IP"]],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: [124, 58, 237],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
      cellPadding: 3,
    },
    bodyStyles: {
      fontSize: 7.5,
      cellPadding: 2.5,
      textColor: [55, 65, 81],
    },
    alternateRowStyles: {
      fillColor: [243, 244, 246],
    },
    columnStyles: {
      0: { cellWidth: 38 },  // Data/Hora
      1: { cellWidth: 35 },  // Usuário
      2: { cellWidth: 28 },  // Ação
      3: { cellWidth: 25 },  // Entidade
      4: { cellWidth: "auto" }, // Descrição
      5: { cellWidth: 28 },  // IP
    },
    margin: { left: 10, right: 10 },
    didDrawPage: (data: any) => {
      // Rodapé em cada página
      const pageCount = doc.getNumberOfPages();
      const currentPage = data.pageNumber;
      doc.setFontSize(7);
      doc.setTextColor(156, 163, 175);
      doc.text(
        `PCP Flor Linda — Log de Atividades — Página ${currentPage} de ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 7,
        { align: "center" }
      );
    },
  });

  const pdfBuffer = doc.output("arraybuffer");

  const pad = (n: number) => String(n).padStart(2, "0");
  const brNow = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
  const filename = `log-atividades-${brNow.getFullYear()}-${pad(brNow.getMonth() + 1)}-${pad(brNow.getDate())}-${pad(brNow.getHours())}${pad(brNow.getMinutes())}.pdf`;

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
