/**
 * Configuração da captação de leads do Sertão Negócios.
 * Preencha antes de publicar. Veja o README para exemplos de integração.
 */
window.SN_CONFIG = {
  // URL que recebe o POST do formulário (webhook do CRM, Make/Zapier, Google Apps Script, RD Station etc.).
  // Vazio = modo de demonstração: o envio é simulado e um aviso aparece no console.
  leadEndpoint: '',

  // 'json' envia application/json; 'form' envia application/x-www-form-urlencoded
  // (use 'form' + requestMode 'no-cors' para Google Apps Script e webhooks sem CORS).
  payloadFormat: 'json',
  requestMode: 'cors',

  // Opcional: após o envio, redireciona para esta URL (página de obrigado, grupo de WhatsApp etc.).
  redirectUrl: '',
  redirectDelayMs: 2200
};
