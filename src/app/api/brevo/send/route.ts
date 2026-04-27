import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { apiKey, sender, to, subject, htmlContent } = await request.json();

    if (!apiKey) {
      return NextResponse.json({ success: false, message: 'API Key não configurada.' }, { status: 400 });
    }

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender,
        to,
        subject,
        htmlContent
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ 
        success: false, 
        message: data.message || 'Erro ao disparar e-mail via Brevo.' 
      }, { status: response.status });
    }

    return NextResponse.json({ success: true, message: 'E-mail enviado com sucesso!', data });
  } catch (error: any) {
    console.error('Erro no disparador de e-mail:', error);
    return NextResponse.json({ success: false, message: 'Erro interno no servidor de disparo.' }, { status: 500 });
  }
}
