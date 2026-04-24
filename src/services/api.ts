import { Lead, Campaign, FilaEnvio, Settings } from '@/types/crm';
import { db } from '@/lib/firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc,
  query,
  where,
  setDoc,
  orderBy,
  limit as firestoreLimit
} from 'firebase/firestore';

const COLLECTIONS = {
  LEADS: 'leads',
  CAMPAIGNS: 'campaigns',
  QUEUE: 'queue',
  SETTINGS: 'settings',
  LANDING_PAGES: 'landing_pages'
};

const initialSettings: Settings = {
  brevoApiKey: '',
  remetenteNome: 'Minha Empresa',
  remetenteEmail: 'contato@minhaempresa.com',
  limiteDiario: 300,
  notificacoes: {
    novosLeads: true,
    errosEnvio: true
  },
  landingPage: {
    titulo: 'Gerency Leads',
    subtitulo: 'Acelere suas vendas com o melhor CRM',
    destaque: 'do mercado brasileiro',
    descricao: 'Capture, organize e converta leads de forma profissional com nossa plataforma intuitiva.',
    beneficios: [
      'Automação de e-mail integrada',
      'Gestão de funil de vendas',
      'Dashboard em tempo real'
    ],
    formTitulo: 'Solicite uma demonstração',
    formSubtitulo: 'Preencha o formulário e um consultor entrará em contato.',
    botaoTexto: 'Falar com um consultor',
    backgroundUrl: '/images/sales-bg.png',
    formColor: '#3b82f6',
    botaoColor: '#fbbf24',
    logoUrl: ''
  },
  empresa: {
    website: 'www.visualsuper.com.br',
    endereco: 'Rua Jeremias Eugênio da Silva, 74 - Serraria - São José, Santa Catarina, Brasil',
    facebook: 'https://facebook.com',
    instagram: 'https://instagram.com',
    linkedin: 'https://linkedin.com',
    youtube: 'https://youtube.com'
  },
  whatsappWidget: {
    enabled: true,
    posicao: 'right',
    atendentes: [
      { id: '1', nome: 'Atendimento Comercial', cargo: 'Vendas', telefone: '554899999999', disponibilidade: '08:00 às 18:00' }
    ]
  }
};

export const api = {
  // Leads
  getLeads: async (): Promise<Lead[]> => {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.LEADS));
    const leads: Lead[] = [];
    querySnapshot.forEach((doc) => {
      leads.push({ id: doc.id, ...doc.data() } as Lead);
    });
    return leads.sort((a, b) => new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime());
  },
  
  saveLead: async (lead: Lead) => {
    const leadRef = doc(db, COLLECTIONS.LEADS, lead.id);
    const snap = await getDoc(leadRef);
    
    if (snap.exists()) {
      await updateDoc(leadRef, { ...lead });
    } else {
      await setDoc(leadRef, lead);
    }
    
    // Disparar evento para o sistema saber que há um novo lead (apenas localmente)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('crm_new_lead', { detail: lead }));
    }
    
    return lead;
  },

  deleteLead: async (id: string) => {
    await deleteDoc(doc(db, COLLECTIONS.LEADS, id));
  },

  // Campaigns
  getCampaigns: async (): Promise<Campaign[]> => {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.CAMPAIGNS));
    const campaigns: Campaign[] = [];
    querySnapshot.forEach((doc) => {
      campaigns.push({ id: doc.id, ...doc.data() } as Campaign);
    });
    return campaigns.sort((a, b) => new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime());
  },

  saveCampaign: async (campaign: Campaign) => {
    const campaignRef = doc(db, COLLECTIONS.CAMPAIGNS, campaign.id);
    const snap = await getDoc(campaignRef);
    
    if (snap.exists()) {
      await updateDoc(campaignRef, { ...campaign });
    } else {
      await setDoc(campaignRef, campaign);
    }
    return campaign;
  },

  deleteCampaign: async (id: string) => {
    await deleteDoc(doc(db, COLLECTIONS.CAMPAIGNS, id));
    
    // Opcionalmente: Limpar a fila de envio vinculada a esta campanha (isso exigiria uma query e loop no Firestore)
    const q = query(collection(db, COLLECTIONS.QUEUE), where("campanhaId", "==", id));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (document) => {
      await deleteDoc(doc(db, COLLECTIONS.QUEUE, document.id));
    });
  },

  // Queue
  getQueue: async (): Promise<FilaEnvio[]> => {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.QUEUE));
    const queue: FilaEnvio[] = [];
    querySnapshot.forEach((doc) => {
      queue.push({ id: doc.id, ...doc.data() } as FilaEnvio);
    });
    return queue;
  },

  // Landing Pages (Multi-Template)
  getLandingPages: async (): Promise<LandingPageInstance[]> => {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.LANDING_PAGES));
    const pages: LandingPageInstance[] = [];
    querySnapshot.forEach((doc) => {
      pages.push({ id: doc.id, ...doc.data() } as LandingPageInstance);
    });
    return pages;
  },

  getLandingPageBySlug: async (slug: string): Promise<LandingPageInstance | null> => {
    const q = query(collection(db, COLLECTIONS.LANDING_PAGES), where("slug", "==", slug));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;
    const docSnap = querySnapshot.docs[0];
    const data = docSnap.data();
    
    // Garantir integridade dos dados para evitar crashes no render
    const page = { id: docSnap.id, ...data } as LandingPageInstance;
    
    // Fallback para config se estiver faltando
    if (!page.config) {
      const settings = await api.getSettings();
      page.config = settings.landingPage as LandingPageSettings;
    }

    // Garantir que beneficios seja sempre um array
    if (!page.config.beneficios) {
      page.config.beneficios = [];
    }
    
    return page;
  },

  saveLandingPage: async (page: LandingPageInstance) => {
    await setDoc(doc(db, COLLECTIONS.LANDING_PAGES, page.id), page);
    return page;
  },

  deleteLandingPage: async (id: string) => {
    await deleteDoc(doc(db, COLLECTIONS.LANDING_PAGES, id));
  },

  generateQueueForCampaign: async (campanhaId: string, leadIds: string[]) => {
    const allLeads = await api.getLeads();
    const leads = allLeads.filter(l => leadIds.includes(l.id));
    
    const newItems: FilaEnvio[] = [];
    for (const lead of leads) {
      const item: FilaEnvio = {
        id: Math.random().toString(36).substr(2, 9),
        campanhaId,
        leadId: lead.id,
        email: lead.email,
        status: 'pendente',
        tentativa: 0,
        dataAgendada: new Date().toISOString(),
        prioridade: 1
      };
      await setDoc(doc(db, COLLECTIONS.QUEUE, item.id), item);
      newItems.push(item);
    }
    return newItems;
  },

  // Settings
  getSettings: async (): Promise<Settings> => {
    const settingsRef = doc(db, COLLECTIONS.SETTINGS, 'global');
    const snap = await getDoc(settingsRef);
    
    if (!snap.exists()) {
      await setDoc(settingsRef, initialSettings);
      return initialSettings;
    }
    
    const settings = snap.data() as Settings;
    
    // Garantir que campos novos existam
    return {
      ...initialSettings,
      ...settings,
      notificacoes: { ...initialSettings.notificacoes, ...(settings.notificacoes || {}) },
      landingPage: { ...initialSettings.landingPage, ...(settings.landingPage || {}) },
      empresa: { ...initialSettings.empresa, ...(settings.empresa || {}) },
      whatsappWidget: { ...initialSettings.whatsappWidget, ...(settings.whatsappWidget || {}) }
    };
  },

  saveSettings: async (settings: Settings) => {
    await setDoc(doc(db, COLLECTIONS.SETTINGS, 'global'), settings);
    return settings;
  },

  // Daily Stats Tracking
  getSentTodayCount: async (): Promise<number> => {
    const today = new Date().toISOString().split('T')[0];
    const q = query(
      collection(db, COLLECTIONS.QUEUE), 
      where("status", "==", "enviado")
    );
    const querySnapshot = await getDocs(q);
    let count = 0;
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.dataEnvio?.startsWith(today)) {
        count++;
      }
    });
    return count;
  },

  // Real Brevo Sending
  sendEmailBrevo: async (campaign: Campaign, lead: Lead, settings: Settings): Promise<{ success: boolean; message: string }> => {
    if (!lead.consentimentoLGPD) return { success: false, message: 'Lead sem consentimento LGPD.' };
    if (!lead.email.includes('@')) return { success: false, message: 'E-mail inválido.' };

    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': settings.brevoApiKey,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          sender: { name: settings.remetenteNome, email: settings.remetenteEmail },
          to: [{ email: lead.email, name: lead.nome }],
          subject: campaign.assunto,
          htmlContent: campaign.conteudoHtml.replace('{{nome}}', lead.nome)
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro desconhecido na API do Brevo');
      }

      return { success: true, message: 'Enviado com sucesso' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Falha na conexão com Brevo' };
    }
  },

  // Queue Processing Engine
  processQueue: async (onProgress?: (msg: string) => void) => {
    const settings = await api.getSettings();
    const campaigns = await api.getCampaigns();
    const leads = await api.getLeads();
    const sentToday = await api.getSentTodayCount();
    
    const remainingLimit = settings.limiteDiario - sentToday;
    if (remainingLimit <= 0) {
      onProgress?.(`Limite diário de ${settings.limiteDiario} atingido.`);
      return;
    }

    const queueSnapshot = await getDocs(collection(db, COLLECTIONS.QUEUE));
    const allQueue: FilaEnvio[] = [];
    queueSnapshot.forEach(doc => allQueue.push({ id: doc.id, ...doc.data() } as FilaEnvio));

    const pendingItems = allQueue.filter(q => 
      (q.status === 'pendente' || q.status === 'erro') && q.tentativa < 3
    ).slice(0, remainingLimit);

    if (pendingItems.length === 0) {
      onProgress?.('Nenhum e-mail pendente na fila.');
      return;
    }

    onProgress?.(`Processando ${pendingItems.length} e-mails...`);
    let processedCount = 0;

    for (const item of pendingItems) {
      const campaign = campaigns.find(c => c.id === item.campanhaId);
      const lead = leads.find(l => l.id === item.leadId);

      if (!campaign || !lead) continue;

      item.tentativa += 1;
      const result = await api.sendEmailBrevo(campaign, lead, settings);

      if (result.success) {
        item.status = 'enviado';
        item.dataEnvio = new Date().toISOString();
        item.erroMensagem = undefined;
        processedCount++;
      } else {
        item.status = 'erro';
        item.erroMensagem = result.message;
      }

      // Update Firestore item
      await updateDoc(doc(db, COLLECTIONS.QUEUE, item.id), { ...item });
      
      // Update Campaign Stats (locally recalculate then sync)
      const currentQueue = (await getDocs(collection(db, COLLECTIONS.QUEUE))).docs.map(d => d.data() as FilaEnvio);
      const updatedCampaign = campaigns.find(c => c.id === campaign.id);
      if (updatedCampaign) {
        updatedCampaign.totalEnviados = currentQueue.filter(q => q.campanhaId === campaign.id && q.status === 'enviado').length;
        updatedCampaign.totalPendentes = currentQueue.filter(q => q.campanhaId === campaign.id && (q.status === 'pendente' || (q.status === 'erro' && q.tentativa < 3))).length;
        updatedCampaign.totalErro = currentQueue.filter(q => q.campanhaId === campaign.id && q.status === 'erro' && q.tentativa >= 3).length;
        
        if (updatedCampaign.totalPendentes === 0) {
          updatedCampaign.status = 'concluída';
        }
        await updateDoc(doc(db, COLLECTIONS.CAMPAIGNS, campaign.id), { ...updatedCampaign });
      }

      onProgress?.(`Enviado: ${processedCount}/${pendingItems.length}...`);
      if (processedCount < pendingItems.length) {
        await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));
      }
    }

    onProgress?.(`Processamento concluído. ${processedCount} enviados.`);
  }
};
