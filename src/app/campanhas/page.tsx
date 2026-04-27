'use client';

import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Campaign, Lead } from '@/types/crm';
import { 
  Plus, 
  Send, 
  FileText, 
  Search,
  CheckCircle2,
  Clock,
  Play,
  Wand2,
  Eye,
  Code,
  Type,
  X,
  Smartphone,
  Monitor,
  Trash2,
  MailOpen,
  MousePointerClick,
  BarChart3
} from 'lucide-react';

export default function CampanhasPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const [processMessage, setProcessMessage] = useState('');
  const [viewMode, setViewMode] = useState<'normal' | 'html'>('normal');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isGeneratingIA, setIsGeneratingIA] = useState(false);
  const [selectedCampaignHtml, setSelectedCampaignHtml] = useState<string | null>(null);
  
  // Custom Delete Confirm State
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    campaignId: string;
    campaignNome: string;
  }>({
    isOpen: false,
    campaignId: '',
    campaignNome: ''
  });
  
  // Alert Modal State
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: '',
    message: ''
  });

  // Form State
  const [newCampaign, setNewCampaign] = useState({
    nome: '',
    assunto: '',
    conteudoHtml: '',
    textoSimples: '',
    bannerImg: ''
  });

  useEffect(() => {
    const loadData = async () => {
      setCampaigns(await api.getCampaigns());
    };
    loadData();
  }, []);

  const generateProfessionalHTML = async (text: string, subject: string, bannerImg?: string) => {
    const settings = await api.getSettings();
    const brandName = settings.landingPage?.titulo || 'Gerency Leads';
    const brandColor = settings.landingPage?.formColor || '#4f46e5';
    const websiteUrl = settings.empresa?.website.startsWith('http') ? settings.empresa.website : 'https://' + settings.empresa?.website;
    
    // Imagens padrão caso não existam
    const logoUrl = settings.landingPage?.logoUrl;
    const finalLogo = logoUrl ? (logoUrl.startsWith('http') ? logoUrl : `${websiteUrl}${logoUrl}`) : null;

    const paragraphs = text.split('\n').filter(p => p.trim() !== '');
    const bodyContent = paragraphs.map(p => `
      <tr><td style="padding-bottom:15px; font-family:Arial,sans-serif; font-size:16px; line-height:1.5; color:#374151;">${p}</td></tr>
    `).join('');

    const empresa = settings.empresa || { website: 'www.visualsuper.com.br', endereco: '' };

    return `
<div style="background-color:#f3f4f6; padding:20px; font-family:Arial,sans-serif;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px; background-color:#ffffff; border-radius:8px; overflow:hidden; border-top: 6px solid ${brandColor};">
    ${finalLogo ? `
    <tr>
      <td align="center" style="padding:30px 20px; background-color:#ffffff;">
        <img src="${finalLogo}" alt="${brandName}" width="180" style="display:block; border:0;">
      </td>
    </tr>` : `<tr><td align="center" style="padding:20px; font-size:24px; font-weight:bold; color:${brandColor};">${brandName}</td></tr>`}
    
    ${bannerImg ? `
    <tr>
      <td align="center">
        <img src="${bannerImg.startsWith('http') ? bannerImg : websiteUrl + bannerImg}" alt="Banner" width="600" style="width:100%; display:block; border:0;">
      </td>
    </tr>` : ''}

    <tr>
      <td style="padding:40px 30px;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
          ${bodyContent}
          <tr>
            <td align="center" style="padding:30px 0;">
              <a href="${websiteUrl}" style="background-color:${brandColor}; color:#ffffff; padding:15px 35px; text-decoration:none; border-radius:50px; font-weight:bold; display:inline-block;">Acesse os detalhes agora</a>
            </td>
          </tr>
          <tr>
            <td style="border-top:1px solid #e5e7eb; padding-top:20px; font-weight:bold; color:#111827;">
              Conte com a ${brandName}! 💙
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <tr>
      <td align="center" style="padding:30px; background-color:#f9fafb; font-size:12px; color:#6b7280; line-height:1.5;">
        <p style="margin-bottom:10px;"><strong>NOSSAS REDES SOCIAIS</strong></p>
        <table border="0" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
          <tr>
            <td style="padding:0 10px;"><a href="${empresa.facebook || '#'}"><img src="https://cdn-icons-png.flaticon.com/32/733/733547.png" width="24"></a></td>
            <td style="padding:0 10px;"><a href="${empresa.instagram || '#'}"><img src="https://cdn-icons-png.flaticon.com/32/2111/2111463.png" width="24"></a></td>
            <td style="padding:0 10px;"><a href="${empresa.linkedin || '#'}"><img src="https://cdn-icons-png.flaticon.com/32/145/145807.png" width="24"></a></td>
          </tr>
        </table>
        <p>${empresa.endereco}</p>
        <p style="margin-top:15px;">Enviado por <a href="${websiteUrl}" style="color:${brandColor}; text-decoration:none;">${empresa.website}</a></p>
        <p style="font-size:10px; margin-top:20px;">Para parar de receber, <a href="#" style="color:#6b7280;">clique aqui</a>.</p>
      </td>
    </tr>
  </table>
</div>
    `.trim();
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      alert("A imagem de destaque é muito grande! Por favor, use uma de até 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setNewCampaign(prev => ({ ...prev, bannerImg: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateIA = () => {
    if (!newCampaign.assunto) {
      alert("Por favor, digite um assunto primeiro para que a IA possa se basear nele.");
      return;
    }

    setIsGeneratingIA(true);
    
    // Simulação de IA (Gera um texto persuasivo baseado no assunto)
    setTimeout(async () => {
      const subject = newCampaign.assunto;
      const settings = await api.getSettings();
      const aiText = `Olá {{nome}},\n\nEstou entrando em contato pois percebi seu interesse em "${subject}".\n\nNa ${settings.landingPage?.titulo || 'nossa empresa'}, focamos em entregar o melhor resultado para nossos clientes...`;
      
      setNewCampaign(prev => ({ ...prev, textoSimples: aiText }));
      setIsGeneratingIA(false);
    }, 1500);
  };

  const handleConvertToHTML = async () => {
    const html = await generateProfessionalHTML(newCampaign.textoSimples, newCampaign.assunto, newCampaign.bannerImg);
    setNewCampaign(prev => ({ ...prev, conteudoHtml: html }));
    setViewMode('html');
  };

  const handleCreate = async () => {
    // Se o HTML estiver vazio mas o texto não, gera um automático antes de salvar
    let finalHtml = newCampaign.conteudoHtml;
    if (!finalHtml && newCampaign.textoSimples) {
      finalHtml = await generateProfessionalHTML(newCampaign.textoSimples, newCampaign.assunto, newCampaign.bannerImg);
    }

    const campaign: Campaign = {
      id: Math.random().toString(36).substr(2, 9),
      ...newCampaign,
      conteudoHtml: finalHtml,
      dataCriacao: new Date().toISOString(),
      status: 'rascunho',
      totalLeads: 0,
      totalEnviados: 0,
      totalPendentes: 0,
      totalErro: 0,
      totalAbertos: 0,
      totalCliques: 0
    };
    
    await api.saveCampaign(campaign);
    setCampaigns(await api.getCampaigns());
    setIsCreating(false);
    setNewCampaign({ nome: '', assunto: '', conteudoHtml: '', textoSimples: '', bannerImg: '' });
  };

  const startCampaign = async (campaign: Campaign) => {
    const leads = await api.getLeads();
    const queue = await api.generateQueueForCampaign(campaign.id, leads.map(l => l.id));
    
    const updatedCampaign: Campaign = {
      ...campaign,
      status: 'em execução',
      totalLeads: leads.length,
      totalPendentes: leads.length
    };
    
    await api.saveCampaign(updatedCampaign);
    setCampaigns(await api.getCampaigns());
    
    // Iniciar processamento automaticamente
    handleProcessQueue();
    
    setAlertModal({
      isOpen: true,
      title: 'Disparo Iniciado',
      message: `Sucesso! Fila de envio gerada com ${queue.length} e-mails. O processamento começou.`
    });
  };

  const handleDeleteCampaign = (id: string, nome: string) => {
    setDeleteConfirm({
      isOpen: true,
      campaignId: id,
      campaignNome: nome
    });
  };

  const confirmDeleteCampaign = async () => {
    const { campaignId } = deleteConfirm;
    await api.deleteCampaign(campaignId);
    setCampaigns(await api.getCampaigns());
    setDeleteConfirm({ isOpen: false, campaignId: '', campaignNome: '' });
  };

  const handleProcessQueue = async () => {
    setIsProcessingQueue(true);
    try {
      await api.processQueue((msg) => setProcessMessage(msg));
      setCampaigns(await api.getCampaigns());
    } catch (error) {
      alert('Erro ao processar fila');
    } finally {
      setIsProcessingQueue(false);
      setProcessMessage('');
    }
  };

  return (
    <div>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>Campanhas de E-mail</h2>
          <p style={{ opacity: 0.6 }}>Crie e monitore seus envios em massa.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {isProcessingQueue && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--success)', color: 'white', padding: '0.5rem 1rem', borderRadius: '50px', fontSize: '0.875rem' }}>
              <div style={{ width: '14px', height: '14px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              {processMessage || 'Processando...'}
            </div>
          )}
          <button 
            className="btn btn-outline" 
            onClick={handleProcessQueue}
            disabled={isProcessingQueue}
            style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}
          >
            <Clock size={18} /> {isProcessingQueue ? 'Processando...' : 'Processar Fila'}
          </button>
          <button className="btn btn-primary" onClick={() => setIsCreating(true)}>
            <Plus size={18} /> Nova Campanha
          </button>
        </div>
      </header>

      {isCreating && (
        <div className="card" style={{ marginBottom: '2.5rem', border: '2px solid var(--primary)' }}>
          <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem' }}>Nova Campanha Profissional</h3>
            <div className="btn-group" style={{ display: 'flex', background: 'var(--accent)', padding: '4px', borderRadius: '8px' }}>
               <button 
                 className={`btn ${viewMode === 'normal' ? 'btn-primary' : ''}`} 
                 style={{ height: '32px', fontSize: '0.8rem', padding: '0 1rem' }}
                 onClick={() => setViewMode('normal')}
               >
                 <Type size={14} /> Normal
               </button>
               <button 
                 className={`btn ${viewMode === 'html' ? 'btn-primary' : ''}`} 
                 style={{ height: '32px', fontSize: '0.8rem', padding: '0 1rem' }}
                 onClick={() => setViewMode('html')}
               >
                 <Code size={14} /> HTML
               </button>
            </div>
          </header>

          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Identificação da Campanha</label>
                <input 
                  type="text" 
                  className="btn-outline" 
                  style={{ width: '100%', height: '42px', padding: '0 1rem' }} 
                  placeholder="Ex: Oferta Black Friday"
                  value={newCampaign.nome}
                  onChange={e => setNewCampaign({...newCampaign, nome: e.target.value})}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Assunto do E-mail</label>
                <input 
                  type="text" 
                  className="btn-outline" 
                  style={{ width: '100%', height: '42px', padding: '0 1rem' }} 
                  placeholder="Subject do e-mail"
                  value={newCampaign.assunto}
                  onChange={e => setNewCampaign({...newCampaign, assunto: e.target.value})}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Imagem de Destaque (Banner)</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input 
                    type="file" 
                    accept="image/*"
                    id="banner-upload"
                    style={{ display: 'none' }} 
                    onChange={handleBannerUpload}
                  />
                  <button 
                    className="btn btn-outline" 
                    style={{ flex: 1, height: '42px', display: 'flex', gap: '0.5rem', justifyContent: 'center', background: newCampaign.bannerImg ? 'rgba(16, 185, 129, 0.1)' : 'transparent' }}
                    onClick={() => document.getElementById('banner-upload')?.click()}
                  >
                    <Plus size={16} /> {newCampaign.bannerImg ? 'Trocar Imagem' : 'Escolher Banner'}
                  </button>
                  {newCampaign.bannerImg && (
                    <div style={{ width: '42px', height: '42px', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                      <img src={newCampaign.bannerImg} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.75rem' }}>
                <label style={{ fontWeight: 600, fontSize: '0.875rem' }}>Conteúdo da Mensagem</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    className="btn btn-outline" 
                    style={{ height: '32px', fontSize: '0.75rem', color: 'var(--primary)', borderColor: 'var(--primary)' }}
                    onClick={handleGenerateIA}
                    disabled={isGeneratingIA}
                  >
                    <Wand2 size={14} /> {isGeneratingIA ? 'Gerando...' : 'Gerar com IA'}
                  </button>
                  {viewMode === 'normal' && (
                    <button 
                      className="btn btn-outline" 
                      style={{ height: '32px', fontSize: '0.75rem' }}
                      onClick={handleConvertToHTML}
                    >
                      <Code size={14} /> Transformar em HTML
                    </button>
                  )}
                  <button 
                    className="btn btn-outline" 
                    style={{ height: '32px', fontSize: '0.75rem' }}
                    onClick={() => setIsPreviewOpen(true)}
                  >
                    <Eye size={14} /> Visualizar
                  </button>
                </div>
              </div>

              {viewMode === 'normal' ? (
                <textarea 
                  className="btn-outline" 
                  style={{ width: '100%', minHeight: '250px', padding: '1.25rem', fontSize: '1rem', lineHeight: '1.6' }} 
                  placeholder="Seja pessoal usando {{nome}}..."
                  value={newCampaign.textoSimples}
                  onChange={e => setNewCampaign({...newCampaign, textoSimples: e.target.value})}
                />
              ) : (
                <textarea 
                  className="btn-outline" 
                  style={{ width: '100%', minHeight: '250px', padding: '1.25rem', fontSize: '0.875rem', fontFamily: 'monospace', background: '#f8fafc' }} 
                  value={newCampaign.conteudoHtml}
                  onChange={e => setNewCampaign({...newCampaign, conteudoHtml: e.target.value})}
                />
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
              <button className="btn btn-primary" onClick={handleCreate} style={{ padding: '0 2rem' }}>Salvar Campanha</button>
              <button className="btn btn-outline" onClick={() => setIsCreating(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Campanhas */}
      <div className="grid grid-cols-2">
        {campaigns.length === 0 && !isCreating && <p style={{ gridColumn: 'span 2', textAlign: 'center', opacity: 0.5, padding: '3rem' }}>Nenhuma campanha criada ainda.</p>}
        {campaigns.map(campaign => (
          <div key={campaign.id} className="card">
            {/* ... o resto do card mantido como original ... */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{campaign.nome}</h4>
                <p style={{ fontSize: '0.875rem', opacity: 0.6 }}>Assunto: {campaign.assunto}</p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                <button 
                  className="btn btn-outline" 
                  style={{ width: '38px', height: '38px', padding: 0 }}
                  title="Visualizar E-mail"
                  onClick={() => {
                    setSelectedCampaignHtml(campaign.conteudoHtml);
                    setIsPreviewOpen(true);
                  }}
                >
                  <Eye size={18} />
                </button>
                <button 
                  className="btn btn-outline" 
                  style={{ width: '38px', height: '38px', padding: 0, color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                  title="Excluir Campanha"
                  onClick={() => handleDeleteCampaign(campaign.id, campaign.nome)}
                >
                  <Trash2 size={18} />
                </button>
                <span className={`badge ${
                  campaign.status === 'concluída' ? 'badge-convertido' : 
                  campaign.status === 'em execução' ? 'badge-contatado' : 'badge-novo'
                }`}>
                  {campaign.status.toUpperCase()}
                </span>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                <span>Progresso</span>
                <span>{campaign.totalEnviados} / {campaign.totalLeads}</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'var(--accent)', borderRadius: '4px', overflow: 'hidden', marginBottom: '1.5rem' }}>
                <div style={{ 
                   width: `${(campaign.totalEnviados / (campaign.totalLeads || 1)) * 100}%`, 
                   height: '100%', 
                   background: 'var(--primary)',
                   transition: 'width 1s ease-in-out'
                }} />
              </div>

              {/* MÉTRICAS DE ENGAJAMENTO */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', background: 'var(--accent)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: 'var(--primary)', marginBottom: '0.25rem' }}>
                    <MailOpen size={14} />
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>Abertos</span>
                  </div>
                  <p style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{campaign.totalAbertos || 0}</p>
                </div>
                <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(0,0,0,0.05)', borderRight: '1px solid rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#8b5cf6', marginBottom: '0.25rem' }}>
                    <MousePointerClick size={14} />
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>Cliques</span>
                  </div>
                  <p style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{campaign.totalCliques || 0}</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: 'var(--success)', marginBottom: '0.25rem' }}>
                    <BarChart3 size={14} />
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>Taxa CTR</span>
                  </div>
                  <p style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                    {campaign.totalAbertos && campaign.totalAbertos > 0 
                      ? ((campaign.totalCliques || 0) / campaign.totalAbertos * 100).toFixed(1)
                      : '0.0'}%
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '0.75rem', opacity: 0.5 }}>Pendentes</p>
                    <p style={{ fontWeight: 'bold' }}>{campaign.totalPendentes}</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '0.75rem', opacity: 0.5 }}>Erros</p>
                    <p style={{ fontWeight: 'bold', color: 'var(--danger)' }}>{campaign.totalErro}</p>
                  </div>
                </div>
                
                {campaign.status === 'rascunho' ? (
                  <button className="btn btn-primary" onClick={() => startCampaign(campaign)}>
                    <Play size={16} /> Iniciar Envio
                  </button>
                ) : (
                  <button className="btn btn-outline">
                    Ver Relatório
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL DE PREVIEW */}
      {isPreviewOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div className="card" style={{ width: '90%', maxWidth: '900px', height: '90vh', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
            <header style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Eye className="color-primary" />
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Pré-visualização do E-mail</h3>
                  <p style={{ fontSize: '0.75rem', opacity: 0.6 }}>Assim é como seus leads verão a mensagem.</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                 <button className="btn btn-outline" style={{ width: '40px', padding: 0 }}><Smartphone size={18} /></button>
                 <button className="btn btn-outline" style={{ width: '40px', padding: 0 }}><Monitor size={18} /></button>
                 <button className="btn btn-outline" style={{ width: '40px', padding: 0, marginLeft: '1rem' }} onClick={() => {
                   setIsPreviewOpen(false);
                   setSelectedCampaignHtml(null);
                 }}><X size={18} /></button>
              </div>
            </header>
            
            <div style={{ flex: 1, background: '#f1f5f9', padding: '2rem', overflowY: 'auto', display: 'flex', justifyContent: 'center' }}>
              <div 
                style={{ width: '100%', maxWidth: '600px' }}
                dangerouslySetInnerHTML={{ 
                  __html: selectedCampaignHtml 
                    ? selectedCampaignHtml 
                    : (viewMode === 'html' && newCampaign.conteudoHtml 
                        ? newCampaign.conteudoHtml 
                        : generateProfessionalHTML(newCampaign.textoSimples || 'Digite seu texto para visualizar...', newCampaign.assunto || 'Assunto Exemplo', newCampaign.bannerImg)) 
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Alert Modal */}
      {alertModal.isOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
          <div className="card" style={{ width: '400px', textAlign: 'center' }}>
            <div style={{ color: 'var(--success)', marginBottom: '1rem' }}>
              <CheckCircle2 size={48} style={{ margin: '0 auto' }} />
            </div>
            <h3 style={{ marginBottom: '1rem' }}>{alertModal.title}</h3>
            <p style={{ opacity: 0.7, marginBottom: '2rem' }}>{alertModal.message}</p>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}>Entendido</button>
          </div>
        </div>
      )}
      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO (SYSTEM MODAL) */}
      {deleteConfirm.isOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 400, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '450px', padding: '2.5rem', textAlign: 'center' }}>
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <Trash2 size={32} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: '#0f172a' }}>Deseja excluir esta campanha?</h3>
            <p style={{ opacity: 0.6, marginBottom: '2rem', lineHeight: '1.5' }}>
              Você está prestes a excluir a campanha <strong style={{ color: '#0f172a' }}>"{deleteConfirm.campaignNome}"</strong>. 
              Esta ação é permanente e removerá todos os dados de envio vinculados a ela.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <button 
                className="btn btn-outline" 
                style={{ height: '48px' }}
                onClick={() => setDeleteConfirm({ isOpen: false, campaignId: '', campaignNome: '' })}
              >
                Cancelar
              </button>
              <button 
                className="btn" 
                style={{ height: '48px', background: 'var(--danger)', color: 'white' }}
                onClick={confirmDeleteCampaign}
              >
                Sim, Excluir Campaign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
