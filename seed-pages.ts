import { api } from './src/services/api';

async function seed() {
  const catalogPage = {
    id: 'catalogo-001',
    slug: 'catalogo',
    templateId: 'lead-magnet',
    config: {
      titulo: 'Catálogo de Produtos 2024',
      subtitulo: 'Acesse agora nosso',
      destaque: 'Catálogo de Ofertas',
      descricao: 'Tenha acesso exclusivo a todos os nossos produtos e preços especiais para parceiros. Preencha os campos e receba o PDF instantaneamente.',
      beneficios: [
        'Mais de 500 itens com desconto',
        'Tabela de preços atualizada',
        'Condições de frete exclusivas'
      ],
      formTitulo: 'Receber Catálogo por E-mail',
      formSubtitulo: 'O download será liberado após o cadastro.',
      botaoTexto: 'Quero meu Catálogo',
      backgroundUrl: '',
      formColor: '#ffffff',
      botaoColor: '#2563eb',
      downloadFileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' // PDF EXEMPLO
    },
    dataCriacao: new Date().toISOString(),
    isAtiva: true
  };

  await api.saveLandingPage(catalogPage as any);
  console.log('Página de catálogo criada em /c/catalogo');
}

seed();
