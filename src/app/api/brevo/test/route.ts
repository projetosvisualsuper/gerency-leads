import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { apiKey } = await request.json();

    if (!apiKey) {
      return NextResponse.json({ success: false, message: 'API Key não informada.' }, { status: 400 });
    }

    const response = await fetch('https://api.brevo.com/v3/account', {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ 
        success: false, 
        message: errorData.message || 'Chave de API inválida ou expirada.' 
      }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ success: true, message: 'Conectado com sucesso!', account: data });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Erro interno ao validar chave.' }, { status: 500 });
  }
}
