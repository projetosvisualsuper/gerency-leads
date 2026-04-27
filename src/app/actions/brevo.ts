'use server';

/**
 * Ações de Servidor para integrar com o Brevo de forma segura e sem erros de CORS.
 */

export async function testBrevoConnectionAction(apiKey: string) {
  if (!apiKey) return { success: false, message: 'API Key não informada.' };

  try {
    const response = await fetch('https://api.brevo.com/v3/account', {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey
      },
      next: { revalidate: 0 }
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, message: data.message || 'Chave inválida ou expirada.' };
    }

    return { success: true, message: 'Conectado com sucesso!', account: data };
  } catch (error) {
    return { success: false, message: 'Erro ao conectar com o servidor do Brevo.' };
  }
}

export async function sendEmailBrevoAction(params: {
  apiKey: string,
  sender: { name: string, email: string },
  to: { email: string, name: string }[],
  subject: string,
  htmlContent: string
}) {
  const { apiKey, sender, to, subject, htmlContent } = params;

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify({ sender, to, subject, htmlContent }),
      next: { revalidate: 0 }
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, message: data.message || 'Erro no disparo.' };
    }

    return { success: true, message: 'Enviado com sucesso!', data };
  } catch (error) {
    return { success: false, message: 'Falha crítica no servidor de disparo.' };
  }
}
