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

  // Link da comunidade no WhatsApp: usado no botão "Entrar no grupo" que aparece depois do cadastro.
  communityUrl: 'https://chat.whatsapp.com/It1MX9ij3o48Zzbvo04Vkq',

  // Opcional: após o envio, redireciona sozinho para esta URL (página de obrigado, grupo de WhatsApp etc.).
  redirectUrl: '',
  redirectDelayMs: 150
};
