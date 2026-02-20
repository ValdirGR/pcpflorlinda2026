import { Resend } from "resend";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const resend = new Resend(process.env.RESEND_API_KEY);

interface Destinatario {
  email: string;
  nome: string;
}

export async function enviarRelatorioEmail(
  destinatarios: Destinatario[],
  pdfBuffer: Buffer,
  dataGeracao: Date
): Promise<{ sucesso: number; erros: number; detalhes: string[] }> {
  const dataFormatada = format(dataGeracao, "dd/MM/yyyy");
  const dataArquivo = format(dataGeracao, "yyyy-MM-dd");
  const resultado = { sucesso: 0, erros: 0, detalhes: [] as string[] };

  const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

  for (const dest of destinatarios) {
    try {
      await resend.emails.send({
        from: `PCP Flor Linda <${fromEmail}>`,
        to: dest.email,
        subject: `Relatório Gerencial PCP — ${dataFormatada}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #ec4899, #f43f5e); padding: 24px; border-radius: 12px 12px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 22px;">PCP Flor Linda</h1>
              <p style="color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 14px;">Relatório Gerencial Diário</p>
            </div>
            <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
              <p style="color: #374151; margin: 0 0 16px;">Olá <strong>${dest.nome}</strong>,</p>
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 16px;">
                Segue em anexo o relatório gerencial do dia <strong>${dataFormatada}</strong> 
                com o resumo das coleções, produção e etapas atrasadas.
              </p>
              <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                  📎 Arquivo anexo: <strong>relatorio-pcp-${dataArquivo}.pdf</strong>
                </p>
              </div>
              <p style="color: #9ca3af; font-size: 11px; margin: 0;">
                Este e-mail é enviado automaticamente de segunda a sexta às 7h. 
                Para cancelar, solicite ao administrador do sistema.
              </p>
            </div>
          </div>
        `,
        attachments: [
          {
            filename: `relatorio-pcp-${dataArquivo}.pdf`,
            content: pdfBuffer,
          },
        ],
      });
      resultado.sucesso++;
      resultado.detalhes.push(`✅ ${dest.email}`);
    } catch (error: any) {
      resultado.erros++;
      resultado.detalhes.push(`❌ ${dest.email}: ${error.message || "Erro desconhecido"}`);
    }
  }

  return resultado;
}
