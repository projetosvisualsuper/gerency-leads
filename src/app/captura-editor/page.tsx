'use client';

import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { LandingPageInstance, LandingPageTemplate, LandingPageSettings } from '@/types/crm';
import { 
  Save, 
  Layout as LayoutIcon,
  Image as ImageIcon,
  Check,
  ChevronRight,
  Monitor,
  ArrowLeft,
  Type,
  FileText,
  List,
  Upload,
  Plus,
  Trash2,
  ExternalLink,
  Settings as SettingsIcon,
  MousePointerClick,
  Copy,
  LayoutTemplate,
  MessageCircle,
  User
} from 'lucide-react';
import Link from 'next/link';

const TEMPLATES: { id: LandingPageTemplate; label: string; icon: any; description: string }[] = [
  { 
    id: 'professional', 
    label: 'Executivo / Vendas', 
    icon: LayoutIcon,
    description: 'Focado em autoridade, com imagem de fundo e degradê.'
  },
  { 
    id: 'lead-magnet', 
    label: 'Download de Catálogo', 
    icon: FileText,
    description: 'Clean, focado na conversão de leads para arquivos PDF.'
  },
  { 
    id: 'vsl', 
    label: 'VSL (Vídeo de Vendas)', 
    icon: LayoutIcon,
    description: 'Focado em um vídeo central com formulário abaixo.'
  },
  { 
    id: 'event', 
    label: 'Inscrição para Evento', 
    icon: LayoutIcon,
    description: 'Ideal para lançamentos, webinars e eventos ao vivo.'
  },
  { 
    id: 'minimalist', 
    label: 'Ultra Minimalista', 
    icon: MousePointerClick,
    description: 'Foco total no formulário. Ideal para anúncios diretos.'
  },
  { 
    id: 'coupon', 
    label: 'Cupom de Desconto', 
    icon: ImageIcon,
    description: 'Design festivo para ofertas especiais e códigos de desconto.'
  }
];
const TEMPLATE_DEFAULTS: Record<LandingPageTemplate, Partial<LandingPageSettings>> = {
  professional: {
    titulo: 'CONSULTORIA EXCLUSIVA',
    subtitulo: 'Acelere o crescimento da sua empresa com',
    destaque: 'Gestão Inteligente de Leads',
    descricao: 'Nossa plataforma ajuda times de vendas a organizarem seu funil e converterem mais em menos tempo. Solicite uma demonstração agora.',
    beneficios: ['Pipeline de Vendas Intuitivo', 'Relatórios de Desempenho', 'Integração com WhatsApp'],
    botaoTexto: 'Agendar Demonstração',
    backgroundUrl: '/images/sales-bg.png',
    botaoColor: '#FFB948',
    formColor: '#4285F4',
    formTitulo: 'Solicite uma demonstração',
    formSubtitulo: 'Preencha o formulário e um consultor entrará em contato.',
    whatsapp: {
      enabled: true,
      posicao: 'right',
      atendentes: [
        { id: '1', nome: 'Suporte Visual Super', cargo: 'Atendimento Comercial', telefone: '554899999999', disponibilidade: 'Segunda a Sexta, 08h às 18h' }
      ]
    }
  },
  'lead-magnet': {
    titulo: 'MATERIAL GRATUITO',
    subtitulo: 'Tenha acesso imediato ao nosso',
    destaque: 'Catálogo Completo 2024',
    descricao: 'Descubra todas as nossas soluções, preços e condições especiais para parceiros. O arquivo PDF será enviado para seu e-mail.',
    beneficios: ['Mais de 500 itens', 'Tabela de Preços Atualizada', 'Guia de Aplicação'],
    botaoTexto: 'Baixar Catálogo Agora',
    backgroundUrl: '/images/catalog-bg.png',
    botaoColor: '#2563eb',
    formColor: '#ffffff',
    formTitulo: 'Receber Material',
    formSubtitulo: 'Informe seus dados para liberar o acesso ao PDF.',
    whatsapp: {
      enabled: true,
      posicao: 'right',
      atendentes: [
        { id: '1', nome: 'Suporte Visual Super', cargo: 'Atendimento Comercial', telefone: '554899999999', disponibilidade: 'Segunda a Sexta, 08h às 18h' }
      ]
    }
  },
  vsl: {
    titulo: 'TREINAMENTO ONLINE',
    subtitulo: 'Descubra o segredo para',
    destaque: 'Vender Todo Santo Dia',
    descricao: 'Assista ao vídeo abaixo para entender como nossa metodologia pode transformar seus resultados em apenas 30 dias.',
    beneficios: ['Método Comprovado', 'Passo a Passo Detalhado', 'Suporte Especializado'],
    botaoTexto: 'Quero Garantir Minha Vaga',
    backgroundUrl: '/images/vsl-bg.png',
    botaoColor: '#ef4444',
    formColor: '#1e293b',
    formTitulo: 'Garantir Acesso',
    formSubtitulo: 'Cadastre-se para assistir ao conteúdo completo.',
    whatsapp: {
      enabled: true,
      posicao: 'right',
      atendentes: [
        { id: '1', nome: 'Suporte Visual Super', cargo: 'Atendimento Comercial', telefone: '554899999999', disponibilidade: 'Segunda a Sexta, 08h às 18h' }
      ]
    }
  },
  event: {
    titulo: 'CONVITE ESPECIAL',
    subtitulo: 'Participe do nosso próximo',
    destaque: 'Workshop de Marketing Digital',
    descricao: 'Um evento ao vivo e gratuito onde vamos revelar as estratégias que as maiores empresas do mundo usam para captar clientes.',
    beneficios: ['Certificado de Participação', 'Material Complementar', 'Sessão de Q&A ao Vivo'],
    botaoTexto: 'Fazer Minha Inscrição',
    backgroundUrl: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80',
    botaoColor: '#e11d48',
    formColor: '#ffffff',
    formTitulo: 'Inscrição Gratuita',
    formSubtitulo: 'Garanta sua vaga no workshop ao vivo.',
    whatsapp: {
      enabled: true,
      posicao: 'right',
      atendentes: [
        { id: '1', nome: 'Suporte Visual Super', cargo: 'Atendimento Comercial', telefone: '554899999999', disponibilidade: 'Segunda a Sexta, 08h às 18h' }
      ]
    }
  },
  minimalist: {
    titulo: 'CONTATO DIRETO',
    subtitulo: 'Deixe seus dados para',
    destaque: 'Receber uma Proposta',
    descricao: 'Preencha o formulário rápido abaixo e um de nossos especialistas entrará em contato em até 24 horas úteis.',
    beneficios: ['Atendimento Personalizado', 'Sem Compromisso', 'Rapidez e Eficiência'],
    botaoTexto: 'Enviar Dados',
    backgroundUrl: '/images/minimalist-bg.png',
    botaoColor: '#3b82f6',
    formColor: '#1e293b',
    formTitulo: 'Solicitar Proposta',
    formSubtitulo: 'Entraremos em contato o mais breve possível.',
    whatsapp: {
      enabled: true,
      posicao: 'right',
      atendentes: [
        { id: '1', nome: 'Suporte Visual Super', cargo: 'Atendimento Comercial', telefone: '554899999999', disponibilidade: 'Segunda a Sexta, 08h às 18h' }
      ]
    }
  },
  coupon: {
    titulo: 'OFERTA IMPERDÍVEL',
    subtitulo: 'Garanta agora seu cupom de',
    destaque: '25% DE DESCONTO',
    descricao: 'Aproveite esta promoção por tempo limitado para adquirir nossos serviços com o melhor preço do ano. O código será gerado após o cadastro.',
    beneficios: ['Desconto Válido por 7 dias', 'Uso em Qualquer Produto', 'Acumulativo com outras promoções'],
    botaoTexto: 'Pegar Meu Cupom',
    backgroundUrl: '/images/coupon-bg.png',
    botaoColor: '#fbbf24',
    formColor: '#ffffff',
    formTitulo: 'Resgatar Cupom',
    formSubtitulo: 'Complete o cadastro para ver o código do desconto.',
    whatsapp: {
      enabled: true,
      posicao: 'right',
      atendentes: [
        { id: '1', nome: 'Suporte Visual Super', cargo: 'Atendimento Comercial', telefone: '554899999999', disponibilidade: 'Segunda a Sexta, 08h às 18h' }
      ]
    }
  }
};

export default function MultiCapturaEditor() {
  const [pages, setPages] = useState<LandingPageInstance[]>([]);
  const [editingPage, setEditingPage] = useState<LandingPageInstance | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{ 
    show: boolean; 
    title: string; 
    message: string; 
    onConfirm: () => void;
    type: 'warning' | 'danger' | 'info';
  }>({ 
    show: false, 
    title: '', 
    message: '', 
    onConfirm: () => {},
    type: 'info'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const p = await api.getLandingPages();
    const globalSettings = await api.getSettings();
    
    // Verifica se já existe uma página migrara do /captura
    const mainPageExists = p.find(page => page.slug === 'captura');
    
    if (!mainPageExists) {
        // Cria virtualmente a página principal baseada nas configurações globais antigas
        const mainPage: LandingPageInstance = {
            id: 'main-vendas',
            slug: 'captura',
            templateId: 'professional',
            isAtiva: true,
            dataCriacao: new Date().toISOString(),
            config: globalSettings.landingPage as LandingPageSettings
        };
        // Salva ela no novo formato para o usuário já vê-la na lista
        await api.saveLandingPage(mainPage);
        setPages([mainPage, ...p]);
    } else {
        setPages(p);
    }
    
    setLoading(false);
  };

  const createNewPage = () => {
    const newPage: LandingPageInstance = {
      id: Math.random().toString(36).substr(2, 9),
      slug: `nova-pagina-${pages.length + 1}`,
      templateId: 'professional',
      isAtiva: true,
      dataCriacao: new Date().toISOString(),
      config: {
        formTitulo: 'Solicite uma demonstração',
        formSubtitulo: 'Preencha o formulário e um consultor entrará em contato.',
        logoUrl: '',
        ...TEMPLATE_DEFAULTS.professional
      } as LandingPageSettings
    };
    setEditingPage(newPage);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'logoUrl' | 'backgroundUrl') => {
    const file = e.target.files?.[0];
    if (!file || !editingPage) return;

    if (file.size > 800 * 1024) {
      alert("Imagem muito grande! Use até 800KB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setEditingPage({
        ...editingPage,
        config: { ...editingPage.config, [field]: base64String }
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!editingPage) return;
    
    // Validar slug duplicado (exceto para a própria página)
    const exists = pages.find(p => p.slug === editingPage.slug && p.id !== editingPage.id);
    if (exists) {
        alert("Este link (slug) já está sendo usado por outra página.");
        return;
    }

    await api.saveLandingPage(editingPage);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleAtendenteAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const file = e.target.files?.[0];
    if (!file || !editingPage?.config.whatsapp) return;

    if (file.size > 500 * 1024) {
      alert("Imagem muito grande! Use até 500KB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const wa = editingPage.config.whatsapp!;
      const newAtArr = [...wa.atendentes];
      newAtArr[idx] = { ...newAtArr[idx], avatarUrl: base64String };
      setEditingPage({ ...editingPage, config: { ...editingPage.config, whatsapp: { ...wa, atendentes: newAtArr } } });
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = async (id: string) => {
    setConfirmModal({
        show: true,
        title: 'Excluir Página?',
        message: 'Tem certeza que deseja excluir esta página permanentemente? Esta ação não pode ser desfeita.',
        type: 'danger',
        onConfirm: async () => {
            await api.deleteLandingPage(id);
            await loadData();
            setConfirmModal(prev => ({ ...prev, show: false }));
        }
    });
  };

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}>Carregando Central de Páginas...</div>;

  // VISÃO DA LISTA DE PÁGINAS
  if (!editingPage) {
    return (
      <div style={{ paddingBottom: '5rem' }}>
        <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Suas Páginas de Captura</h2>
            <p style={{ opacity: 0.6 }}>Gerencie múltiplos modelos e campanhas em paralelo.</p>
          </div>
          <button className="btn btn-primary" onClick={createNewPage}>
            <Plus size={18} /> Criar Nova Página
          </button>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {pages.map(page => {
            const template = TEMPLATES.find(t => t.id === page.templateId);
            const IconComponent = template?.icon || LayoutIcon;
            
            return (
              <div key={page.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ background: 'var(--accent)', padding: '0.75rem', borderRadius: '10px', color: 'var(--primary)' }}>
                    <IconComponent size={24} />
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => handleDelete(page.id)} style={{ color: 'var(--danger)', opacity: 0.5 }}><Trash2 size={18} /></button>
                  </div>
                </div>

              <div>
                <h4 style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.25rem' }}>{page.config.titulo}</h4>
                <p style={{ fontSize: '0.875rem', opacity: 0.6 }}>Tipo: {TEMPLATES.find(t => t.id === page.templateId)?.label}</p>
              </div>

              <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.875rem' }}>
                <code style={{ color: 'var(--primary)' }}>/{page.slug}</code>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto' }}>
                <button className="btn btn-outline" style={{ flex: 1, fontSize: '0.875rem' }} onClick={() => setEditingPage(page)}>
                  Editar Conteúdo
                </button>
                <Link href={`/${page.slug}`} target="_blank" className="btn btn-outline" style={{ padding: '0.75rem', width: '42px' }}>
                  <ExternalLink size={18} />
                </Link>
              </div>
            </div>
          );
        })}

          {pages.length === 0 && (
            <div style={{ gridColumn: 'span 3', textAlign: 'center', padding: '4rem', opacity: 0.4 }}>
               <LayoutTemplate size={48} style={{ margin: '0 auto 1rem' }} />
               <p>Nenhuma página personalizada criada ainda.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // VISÃO DO EDITOR DE PÁGINA ESPECÍFICA
  return (
    <div style={{ paddingBottom: '6rem' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button onClick={() => setEditingPage(null)} style={{ padding: '0.5rem', opacity: 0.6 }}>
          <ArrowLeft size={24} />
        </button>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Editando Página: {editingPage.config.titulo}</h2>
          <p style={{ fontSize: '0.875rem', opacity: 0.6 }}>Personalize o link e o modelo da página.</p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '1rem' }}>
          <button className="btn btn-primary" onClick={handleSave}>
            <Save size={18} /> Salvar Alterações
          </button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }}>
        
        {/* COLUNA ESQUERDA: CONFIGURAÇÕES */}
        <div style={{ display: 'grid', gap: '2rem' }}>
          
          {/* BLOCO: CONFIGURAÇÕES DE ROTA E MODELO */}
          <section className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', fontWeight: 600 }}>
                <SettingsIcon size={20} className="color-primary" /> Configurações Gerais
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 500 }}>Slug do Link (ex: /{editingPage.slug})</label>
                <div style={{ position: 'relative' }}>
                   <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.4, fontSize: '0.875rem' }}>/</span>
                   <input 
                    className="btn-outline" 
                    style={{ width: '100%', height: '42px', paddingLeft: '2.5rem' }}
                    value={editingPage.slug}
                    onChange={e => setEditingPage({...editingPage, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                   />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 500 }}>Modelo da Página</label>
                <select 
                  className="btn-outline" style={{ width: '100%', height: '42px', padding: '0 0.5rem' }}
                  value={editingPage.templateId}
                  onChange={e => {
                    const newTemplate = e.target.value as LandingPageTemplate;
                    setConfirmModal({
                        show: true,
                        title: 'Aplicar Padrões do Modelo?',
                        message: 'Deseja carregar os textos, cores e fundo padrão deste modelo? Isso substituirá suas edições atuais.',
                        type: 'warning',
                        onConfirm: () => {
                            if (editingPage) {
                                setEditingPage({
                                    ...editingPage, 
                                    templateId: newTemplate,
                                    config: { ...editingPage.config, ...TEMPLATE_DEFAULTS[newTemplate] }
                                });
                            }
                            setConfirmModal(prev => ({ ...prev, show: false }));
                        }
                    });
                  }}
                >
                  {TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
              </div>
            </div>
          </section>

          {/* BLOCO: CONTEÚDO (Diferente por template) */}
          <section className="card">
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', fontWeight: 600 }}>
                <Type size={20} className="color-primary" /> Conteúdo da Página
            </div>
            
            <div style={{ display: 'grid', gap: '1.25rem' }}>
              <div>
                <label style={{ fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>Título Interno ou Logo</label>
                <input 
                  className="btn-outline" style={{ width: '100%', height: '42px', padding: '0 1rem' }}
                  value={editingPage.config.titulo}
                  onChange={e => setEditingPage({...editingPage, config: {...editingPage.config, titulo: e.target.value}})}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>Headline (Título Principal)</label>
                  <input 
                    className="btn-outline" style={{ width: '100%', height: '42px', padding: '0 1rem' }}
                    value={editingPage.config.subtitulo}
                    onChange={e => setEditingPage({...editingPage, config: {...editingPage.config, subtitulo: e.target.value}})}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>Texto em Destaque (Colorido)</label>
                  <input 
                    className="btn-outline" style={{ width: '100%', height: '42px', padding: '0 1rem' }}
                    value={editingPage.config.destaque}
                    onChange={e => setEditingPage({...editingPage, config: {...editingPage.config, destaque: e.target.value}})}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>Descrição Longa</label>
                <textarea 
                  className="btn-outline" style={{ width: '100%', minHeight: '100px', padding: '0.75rem' }}
                  value={editingPage.config.descricao}
                  onChange={e => setEditingPage({...editingPage, config: {...editingPage.config, descricao: e.target.value}})}
                />
              </div>

              {editingPage.templateId === 'lead-magnet' && (
                <div style={{ background: 'rgba(99, 102, 241, 0.05)', padding: '1.25rem', borderRadius: '8px', border: '1px dashed var(--primary)' }}>
                   <label style={{ fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block', color: 'var(--primary)', fontWeight: 600 }}>Link do Arquivo para Download (% PDF)</label>
                   <input 
                    className="btn-outline" style={{ width: '100%', height: '42px', padding: '0 1rem', background: 'white' }}
                    placeholder="https://exemplo.com/catalogo.pdf"
                    value={editingPage.config.downloadFileUrl || ''}
                    onChange={e => setEditingPage({...editingPage, config: {...editingPage.config, downloadFileUrl: e.target.value}})}
                   />
                </div>
              )}

              {editingPage.templateId === 'vsl' && (
                <div style={{ background: 'rgba(239, 68, 68, 0.05)', padding: '1.25rem', borderRadius: '8px', border: '1px dashed #ef4444' }}>
                   <label style={{ fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block', color: '#ef4444', fontWeight: 600 }}>Link do Vídeo (YouTube/Vimeo)</label>
                   <input 
                    className="btn-outline" style={{ width: '100%', height: '42px', padding: '0 1rem', background: 'white' }}
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={editingPage.config.videoUrl || ''}
                    onChange={e => setEditingPage({...editingPage, config: {...editingPage.config, videoUrl: e.target.value}})}
                   />
                </div>
              )}

              {editingPage.templateId === 'event' && (
                <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '1.25rem', borderRadius: '8px', border: '1px dashed #10b981' }}>
                   <label style={{ fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block', color: '#10b981', fontWeight: 600 }}>Data e Hora do Evento</label>
                   <input 
                    className="btn-outline" style={{ width: '100%', height: '42px', padding: '0 1rem', background: 'white' }}
                    placeholder="Ex: 25 de Maio às 20h"
                    value={editingPage.config.eventDate || ''}
                    onChange={e => setEditingPage({...editingPage, config: {...editingPage.config, eventDate: e.target.value}})}
                   />
                </div>
              )}
            </div>
          </section>

          {/* BENEFÍCIOS */}
          <section className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 600 }}>
                  <List size={20} className="color-primary" /> Benefícios e Pontos
               </div>
               <button className="btn btn-outline" style={{ height: '30px', fontSize: '0.75rem' }} onClick={() => {
                  const b = [...editingPage.config.beneficios, 'Novo benefício'];
                  setEditingPage({...editingPage, config: {...editingPage.config, beneficios: b}});
               }}>+ Adicionar</button>
            </div>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {editingPage.config.beneficios.map((b, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.5rem' }}>
                  <input 
                    className="btn-outline" style={{ flex: 1, height: '40px', padding: '0 1rem' }}
                    value={b}
                    onChange={e => {
                      const nb = [...editingPage.config.beneficios];
                      nb[i] = e.target.value;
                      setEditingPage({...editingPage, config: {...editingPage.config, beneficios: nb}});
                    }}
                  />
                  <button onClick={() => {
                     const nb = editingPage.config.beneficios.filter((_, idx) => idx !== i);
                     setEditingPage({...editingPage, config: {...editingPage.config, beneficios: nb}});
                  }} style={{ color: 'var(--danger)', opacity: 0.5 }}><Trash2 size={18} /></button>
                </div>
              ))}
            </div>
          </section>

          {/* WIDGET WHATSAPP */}
          <section className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 600 }}>
                  <MessageCircle size={20} className="color-primary" /> Widget WhatsApp Multi-Atendente
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>Ativo:</span>
                  <input 
                    type="checkbox" 
                    style={{ width: '18px', height: '18px' }}
                    checked={editingPage.config.whatsapp?.enabled || false}
                    onChange={e => {
                        const wa = editingPage.config.whatsapp || { enabled: false, posicao: 'right', atendentes: [] };
                        setEditingPage({...editingPage, config: {...editingPage.config, whatsapp: {...wa, enabled: e.target.checked}}});
                    }}
                  />
               </div>
            </div>

            {editingPage.config.whatsapp?.enabled && (
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                <div>
                   <label style={{ fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>Posição na Tela</label>
                   <select 
                     className="btn-outline" style={{ width: '100%', height: '42px', padding: '0 0.5rem' }}
                     value={editingPage.config.whatsapp.posicao}
                     onChange={e => {
                        const wa = editingPage.config.whatsapp!;
                        setEditingPage({...editingPage, config: {...editingPage.config, whatsapp: {...wa, posicao: e.target.value as any}}});
                     }}
                   >
                     <option value="right">Canto Inferior Direito</option>
                     <option value="left">Canto Inferior Esquerdo</option>
                   </select>
                </div>

                <div>
                   <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Atendentes</label>
                      <button className="btn btn-outline" style={{ height: '30px', fontSize: '0.75rem' }} onClick={() => {
                          const wa = editingPage.config.whatsapp!;
                          const newAt = { id: Math.random().toString(36).substr(2, 9), nome: 'Novo Atendente', cargo: 'Vendas', telefone: '55', disponibilidade: 'Disponível' };
                          setEditingPage({...editingPage, config: {...editingPage.config, whatsapp: {...wa, atendentes: [...wa.atendentes, newAt]}}});
                      }}>+ Novo</button>
                   </div>
                   
                   <div style={{ display: 'grid', gap: '1rem' }}>
                      {editingPage.config.whatsapp.atendentes.map((at, idx) => (
                        <div key={at.id} style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', background: 'white', position: 'relative' }}>
                           <button 
                             onClick={() => {
                               const wa = editingPage.config.whatsapp!;
                               const newAtArr = wa.atendentes.filter((_, i) => i !== idx);
                               setEditingPage({...editingPage, config: {...editingPage.config, whatsapp: {...wa, atendentes: newAtArr}}});
                             }}
                             style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', color: '#ef4444', opacity: 0.5, border: 'none', background: 'none', cursor: 'pointer' }}
                           ><Trash2 size={16} /></button>
                           
                           <div style={{ display: 'flex', gap: '1rem', alignItems: 'start', marginTop: '0.5rem' }}>
                              {/* Avatar Column */}
                              <div style={{ display: 'grid', gap: '0.4rem', textAlign: 'center' }}>
                                 <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#f8fafc', border: '1px solid #e2e8f0', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {at.avatarUrl ? (
                                      <img src={at.avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                      <User size={24} color="#94a3b8" />
                                    )}
                                 </div>
                                 <label style={{ fontSize: '0.6rem', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}>
                                    FOTO
                                    <input type="file" hidden accept="image/*" onChange={e => handleAtendenteAvatarUpload(e, idx)} />
                                 </label>
                              </div>

                              <div style={{ flex: 1, display: 'grid', gap: '0.75rem' }}>
                                 <input 
                                    placeholder="Nome do Atendente"
                                    style={{ width: '100%', height: '32px', border: 'none', background: 'transparent', fontWeight: 700, borderBottom: '1px solid #e2e8f0', fontSize: '0.9rem' }}
                                    value={at.nome}
                                    onChange={e => {
                                       const wa = editingPage.config.whatsapp!;
                                       const newAtArr = [...wa.atendentes];
                                       newAtArr[idx] = { ...at, nome: e.target.value };
                                       setEditingPage({...editingPage, config: {...editingPage.config, whatsapp: {...wa, atendentes: newAtArr}}});
                                    }}
                                 />
                                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                    <input 
                                       placeholder="Cargo"
                                       style={{ fontSize: '0.75rem', width: '100%', height: '30px', borderRadius: '4px', border: '1px solid #e2e8f0', padding: '0 0.5rem' }}
                                       value={at.cargo}
                                       onChange={e => {
                                          const wa = editingPage.config.whatsapp!;
                                          const newAtArr = [...wa.atendentes];
                                          newAtArr[idx] = { ...at, cargo: e.target.value };
                                          setEditingPage({...editingPage, config: {...editingPage.config, whatsapp: {...wa, atendentes: newAtArr}}});
                                       }}
                                    />
                                    <input 
                                       placeholder="WhatsApp"
                                       style={{ fontSize: '0.75rem', width: '100%', height: '30px', borderRadius: '4px', border: '1px solid #e2e8f0', padding: '0 0.5rem' }}
                                       value={at.telefone}
                                       onChange={e => {
                                          const wa = editingPage.config.whatsapp!;
                                          const newAtArr = [...wa.atendentes];
                                          newAtArr[idx] = { ...at, telefone: e.target.value };
                                          setEditingPage({...editingPage, config: {...editingPage.config, whatsapp: {...wa, atendentes: newAtArr}}});
                                       }}
                                    />
                                 </div>
                               </div>
                            </div>
                         </div>
                       ))}
                   </div>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* COLUNA DIREITA: VISUAL E PREVIEW */}
        <div style={{ display: 'grid', gap: '2rem' }}>
          <section className="card">
            <h4 style={{ marginBottom: '1rem', fontWeight: 600 }}>Cores e Estilo</h4>
             <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', opacity: 0.6 }}>Cor do Formulário/Fundo</label>
                  <input type="color" style={{ width: '100%', height: '40px', border: 'none', cursor: 'pointer' }} value={editingPage.config.formColor} onChange={e => setEditingPage({...editingPage, config: {...editingPage.config, formColor: e.target.value}})} />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', opacity: 0.6 }}>Cor do Botão Principal</label>
                  <input type="color" style={{ width: '100%', height: '40px', border: 'none', cursor: 'pointer' }} value={editingPage.config.botaoColor} onChange={e => setEditingPage({...editingPage, config: {...editingPage.config, botaoColor: e.target.value}})} />
                </div>
                <div>
                   <label style={{ fontSize: '0.75rem', opacity: 0.6 }}>Texto do Botão CTA</label>
                   <input 
                    className="btn-outline" style={{ width: '100%', height: '40px', padding: '0 0.75rem', fontSize: '0.875rem' }}
                    value={editingPage.config.botaoTexto}
                    onChange={e => setEditingPage({...editingPage, config: {...editingPage.config, botaoTexto: e.target.value}})}
                   />
                 </div>
             </div>
          </section>

          <section className="card">
            <h4 style={{ marginBottom: '1rem', fontWeight: 600 }}>Textos do Formulário</h4>
            <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                   <label style={{ fontSize: '0.75rem', opacity: 0.6 }}>Título do Formulário</label>
                   <input 
                    className="btn-outline" style={{ width: '100%', height: '40px', padding: '0 0.75rem', fontSize: '0.875rem' }}
                    value={editingPage.config.formTitulo}
                    onChange={e => setEditingPage({...editingPage, config: {...editingPage.config, formTitulo: e.target.value}})}
                   />
                </div>
                <div>
                   <label style={{ fontSize: '0.75rem', opacity: 0.6 }}>Subtítulo do Formulário</label>
                   <input 
                    className="btn-outline" style={{ width: '100%', height: '40px', padding: '0 0.75rem', fontSize: '0.875rem' }}
                    value={editingPage.config.formSubtitulo}
                    onChange={e => setEditingPage({...editingPage, config: {...editingPage.config, formSubtitulo: e.target.value}})}
                   />
                </div>
            </div>
          </section>

          <section className="card">
             <h4 style={{ marginBottom: '1rem', fontWeight: 600 }}>Imagens</h4>
              <div style={{ display: 'grid', gap: '1rem' }}>
                 <div>
                    <label style={{ fontSize: '0.75rem', opacity: 0.6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      Fundo (Wallpaper)
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {editingPage.config.backgroundUrl !== '' && (
                          <button onClick={() => setEditingPage({...editingPage, config: {...editingPage.config, backgroundUrl: ''}})} style={{ color: '#3b82f6', fontSize: '0.65rem', border: 'none', background: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Restaurar Padrão</button>
                        )}
                        {editingPage.config.backgroundUrl !== 'none' && (
                          <button onClick={() => setEditingPage({...editingPage, config: {...editingPage.config, backgroundUrl: 'none'}})} style={{ color: 'var(--danger)', fontSize: '0.65rem', border: 'none', background: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Remover Tudo</button>
                        )}
                      </div>
                    </label>
                    <input type="file" onChange={e => handleFileUpload(e, 'backgroundUrl')} style={{ fontSize: '0.75rem', marginTop: '0.5rem' }} />
                 </div>
                 <div>
                    <label style={{ fontSize: '0.75rem', opacity: 0.6, display: 'flex', justifyContent: 'space-between' }}>
                      Logotipo
                      {editingPage.config.logoUrl && editingPage.config.logoUrl !== 'none' && (
                        <button onClick={() => setEditingPage({...editingPage, config: {...editingPage.config, logoUrl: 'none'}})} style={{ color: 'var(--danger)', fontSize: '0.65rem', border: 'none', background: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Remover</button>
                      )}
                    </label>
                    <input type="file" onChange={e => handleFileUpload(e, 'logoUrl')} style={{ fontSize: '0.75rem', marginTop: '0.5rem' }} />
                 </div>
              </div>
          </section>

          <section className="card" style={{ background: 'var(--accent)', textAlign: 'center' }}>
            <Monitor size={32} style={{ opacity: 0.2, marginBottom: '1rem' }} />
            <Link href={`/${editingPage.slug}`} target="_blank" className="btn btn-primary" style={{ width: '100%' }}>
              Testar Página <ExternalLink size={16} />
            </Link>
          </section>
        </div>
      </div>

      {saved && (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', background: 'var(--success)', color: 'white', padding: '1rem 2rem', borderRadius: '50px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', zIndex: 100, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Check size={20} /> Alterações salvas com sucesso!
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO PERSONALIZADO */}
      {confirmModal.show && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="card" style={{ maxWidth: '450px', width: '90%', padding: '2rem', textAlign: 'center', animation: 'modalIn 0.3s ease-out' }}>
             <div style={{ 
                 background: confirmModal.type === 'danger' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(251, 191, 36, 0.1)', 
                 color: confirmModal.type === 'danger' ? '#ef4444' : '#fbbf24', 
                 width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' 
             }}>
                {confirmModal.type === 'danger' ? <Trash2 size={32} /> : <LayoutTemplate size={32} />}
             </div>
             <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>{confirmModal.title}</h3>
             <p style={{ opacity: 0.6, marginBottom: '2rem', lineHeight: '1.5' }}>
               {confirmModal.message}
             </p>
             <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => {
                   // Se for troca de template e o usuário cancelar, ainda assim mudamos o template mas sem aplicar o padrão
                   if (confirmModal.title.includes('Modelo') && editingPage) {
                       // Extraímos o templateId do contexto ou simplesmente não fazemos nada se quisermos que o cancel pare a troca
                       // Mas o select já mudou o valor no DOM se for um uncontrolled component. 
                       // No nosso caso é controlado. Então o cancel apenas fecha o modal e mantém o estado anterior.
                   }
                   setConfirmModal(prev => ({ ...prev, show: false }));
                }}>
                  Cancelar
                </button>
                <button 
                    className="btn" 
                    style={{ 
                        flex: 1, 
                        background: confirmModal.type === 'danger' ? '#ef4444' : 'var(--primary)',
                        color: 'white'
                    }} 
                    onClick={confirmModal.onConfirm}
                >
                  Confirmar
                </button>
             </div>
          </div>
          <style jsx>{`
            @keyframes modalIn {
              from { opacity: 0; transform: scale(0.95) translateY(10px); }
              to { opacity: 1; transform: scale(1) translateY(0); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
