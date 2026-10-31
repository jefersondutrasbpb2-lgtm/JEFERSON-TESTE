/**
 * Dados para dízimos e ofertas (enviados pela igreja). O QR Code da imagem foi
 * conferido: é um PIX com a chave CNPJ abaixo (código de controle válido).
 */

import type { L10n } from "@/i18n/config";

export const contribuicao = {
  pix: {
    tipo: { pt: "CNPJ", en: "CNPJ (Brazilian tax ID)", es: "CNPJ (identificación fiscal brasileña)" } as L10n,
    chave: "09.317.231/0001-06",
    /** Como deve ser colada no app do banco (só números) */
    chaveCopia: "09317231000106",
    /** PIX "copia e cola", o mesmo conteúdo do QR Code */
    copiaECola:
      "00020126360014br.gov.bcb.pix0114093172310001065204000053039865802BR5910----------6006POMBAL62110507Dizimos6304586B",
    imagem: { src: "/images/pix-iec-pombal.webp", width: 580, height: 974 },
  },
  banco: {
    nome: "Sicredi",
    agencia: "2216",
    conta: "9368-8",
    cnpj: "09.317.231/0001-06",
  },
};
