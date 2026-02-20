import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ColecaoResumo {
  nome: string;
  codigo: string;
  dataInicio: string;
  dataFim: string;
  totalReferencias: number;
  finalizadas: number;
  produzidas: number;
  previstas: number;
  percentual: number;
}

interface EtapaAtrasada {
  nome: string;
  referenciaCodigo: string;
  referenciaNome: string;
  colecaoNome: string;
  dataFim: string;
}

interface ResumoGeral {
  totalColecoes: number;
  totalReferencias: number;
  totalFinalizadas: number;
  totalEmProducao: number;
  totalProduzido: number;
  totalPrevisto: number;
  percentualGeral: number;
}

export interface RelatorioData {
  resumo: ResumoGeral;
  colecoes: ColecaoResumo[];
  etapasAtrasadas: EtapaAtrasada[];
  dataGeracao: Date;
}

export function gerarRelatorioPDF(dados: RelatorioData): Buffer {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const dataFormatada = format(dados.dataGeracao, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  const dataHora = format(dados.dataGeracao, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });

  // ===== CABEÇALHO =====
  doc.setFillColor(236, 72, 153); // pink-500
  doc.rect(0, 0, pageWidth, 32, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("PCP Flor Linda", 14, 15);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Relatório Gerencial Diário", 14, 23);

  doc.setFontSize(9);
  doc.text(dataFormatada, pageWidth - 14, 15, { align: "right" });
  doc.text(`Gerado em ${dataHora}`, pageWidth - 14, 23, { align: "right" });

  let yPos = 42;

  // ===== RESUMO GERAL =====
  doc.setTextColor(31, 41, 55); // gray-800
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Resumo Geral", 14, yPos);
  yPos += 8;

  const resumoItems = [
    ["Coleções Ativas", String(dados.resumo.totalColecoes)],
    ["Total de Referências", String(dados.resumo.totalReferencias)],
    ["Finalizadas", String(dados.resumo.totalFinalizadas)],
    ["Em Produção", String(dados.resumo.totalEmProducao)],
    ["Produção Total", `${dados.resumo.totalProduzido.toLocaleString("pt-BR")} / ${dados.resumo.totalPrevisto.toLocaleString("pt-BR")} (${dados.resumo.percentualGeral}%)`],
  ];

  // Cards de resumo
  const cardWidth = (pageWidth - 28 - 16) / 5; // 5 cards com gap
  resumoItems.forEach(([label, value], i) => {
    const x = 14 + i * (cardWidth + 4);
    doc.setFillColor(249, 250, 251); // gray-50
    doc.roundedRect(x, yPos, cardWidth, 22, 2, 2, "F");

    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(107, 114, 128); // gray-500
    doc.text(label, x + cardWidth / 2, yPos + 8, { align: "center" });

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(31, 41, 55);
    doc.text(value, x + cardWidth / 2, yPos + 18, { align: "center" });
  });

  yPos += 32;

  // ===== TABELA POR COLEÇÃO =====
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(31, 41, 55);
  doc.text("Produção por Coleção", 14, yPos);
  yPos += 4;

  autoTable(doc, {
    startY: yPos,
    head: [["Coleção", "Ref.", "Finaliz.", "Produção", "% Progresso"]],
    body: dados.colecoes.map((c) => [
      c.nome,
      String(c.totalReferencias),
      String(c.finalizadas),
      `${c.produzidas.toLocaleString("pt-BR")} / ${c.previstas.toLocaleString("pt-BR")}`,
      `${c.percentual}%`,
    ]),
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [236, 72, 153],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
    },
    alternateRowStyles: {
      fillColor: [253, 242, 248], // pink-50
    },
    columnStyles: {
      0: { cellWidth: 55 },
      1: { halign: "center", cellWidth: 20 },
      2: { halign: "center", cellWidth: 22 },
      3: { halign: "right", cellWidth: 45 },
      4: { halign: "center", cellWidth: 30 },
    },
    margin: { left: 14, right: 14 },
    didDrawCell: (data) => {
      // Draw progress bar in the last column (body only)
      if (data.section === "body" && data.column.index === 4 && data.cell.raw) {
        const pct = parseInt(String(data.cell.raw));
        const cellX = data.cell.x + 2;
        const cellY = data.cell.y + data.cell.height - 5;
        const barWidth = data.cell.width - 4;
        const barHeight = 2;

        // Background
        doc.setFillColor(229, 231, 235); // gray-200
        doc.roundedRect(cellX, cellY, barWidth, barHeight, 1, 1, "F");

        // Progress
        if (pct > 0) {
          const color = pct >= 100 ? [34, 197, 94] : [236, 72, 153]; // green or pink
          doc.setFillColor(color[0], color[1], color[2]);
          doc.roundedRect(cellX, cellY, Math.min(barWidth * pct / 100, barWidth), barHeight, 1, 1, "F");
        }
      }
    },
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // ===== ETAPAS ATRASADAS =====
  if (dados.etapasAtrasadas.length > 0) {
    // Check if we need a new page
    if (yPos > 230) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(31, 41, 55);
    doc.text(`Etapas Atrasadas (${dados.etapasAtrasadas.length})`, 14, yPos);
    yPos += 4;

    autoTable(doc, {
      startY: yPos,
      head: [["Etapa", "Referência", "Coleção", "Vencimento"]],
      body: dados.etapasAtrasadas.slice(0, 20).map((e) => [
        e.nome,
        `${e.referenciaCodigo} - ${e.referenciaNome}`,
        e.colecaoNome,
        format(new Date(e.dataFim), "dd/MM/yyyy"),
      ]),
      styles: {
        fontSize: 8,
        cellPadding: 2.5,
      },
      headStyles: {
        fillColor: [239, 68, 68], // red-500
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 8,
      },
      alternateRowStyles: {
        fillColor: [254, 242, 242], // red-50
      },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 55 },
        2: { cellWidth: 45 },
        3: { halign: "center", cellWidth: 28 },
      },
      margin: { left: 14, right: 14 },
    });
  }

  // ===== RODAPÉ =====
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(156, 163, 175); // gray-400
    doc.text(
      `PCP Flor Linda — Relatório Gerencial — ${dataFormatada} — Página ${i} de ${totalPages}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: "center" }
    );
  }

  // Return as Buffer
  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
}
