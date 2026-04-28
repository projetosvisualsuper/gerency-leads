export type LeadStatus = 'novo' | 'contatado' | 'convertido' | 'perdido';
export type CampaignStatus = 'rascunho' | 'agendada' | 'em execução' | 'concluída' | 'cancelada';
export type QueueStatus = 'pendente' | 'enviado' | 'erro';

export interface Lead {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  empresa?: string;
  origem: string;
  dataCriacao: string;
  status: LeadStatus;
  tags: string[];
  consentimentoLGPD: boolean;
  observacoes?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

export interface Campaign {
  id: string;
  nome: string;
  assunto: string;
  conteudoHtml: string;
  dataCriacao: string;
  dataAgendada?: string;
  status: CampaignStatus;
  totalLeads: number;
  totalEnviados: number;
  totalPendentes: number;
  totalErro: number;
  totalAbertos: number;
  totalCliques: number;
}

export interface FilaEnvio {
  id: string;
  campanhaId: string;
  leadId: string;
  email: string;
  status: QueueStatus;
  tentativa: number;
  dataAgendada: string;
  dataEnvio?: string;
  erroMensagem?: string | null;
  loteNumero?: number;
  prioridade: number;
}

export type LandingPageTemplate = 'professional' | 'lead-magnet' | 'vsl' | 'minimalist' | 'event' | 'coupon';

export interface Attendant {
  id: string;
  nome: string;
  cargo: string;
  telefone: string;
  avatarUrl?: string;
  disponibilidade?: string;
}

export interface WhatsappWidgetConfig {
  enabled: boolean;
  posicao: 'left' | 'right';
  atendentes: Attendant[];
}

export interface  LandingPageSettings {
  titulo: string;
  subtitulo: string;
  destaque: string;
  descricao: string;
  beneficios: string[];
  formTitulo: string;
  formSubtitulo: string;
  botaoTexto: string;
  backgroundUrl: string;
  formColor: string;
  botaoColor: string;
  logoUrl?: string;
  headerColor?: string;
  downloadFileUrl?: string;
  videoUrl?: string;
  eventDate?: string;
  accentColor?: string;
  whatsapp?: WhatsappWidgetConfig;
}

export interface LandingPageInstance {
  id: string;
  slug: string;
  templateId: LandingPageTemplate;
  config: LandingPageSettings;
  dataCriacao: string;
  isAtiva: boolean;
}

export interface Settings {
  brevoApiKey: string;
  remetenteNome: string;
  remetenteEmail: string;
  limiteDiario: number;
  notificacoes: {
    novosLeads: boolean;
    errosEnvio: boolean;
  };
  landingPage: {
    titulo: string;
    subtitulo: string;
    destaque: string;
    descricao: string;
    beneficios: string[];
    formTitulo: string;
    formSubtitulo: string;
    botaoTexto: string;
    backgroundUrl: string;
    formColor: string;
    botaoColor: string;
    logoUrl?: string;
    headerColor?: string;
  };
  empresa: {
    website: string;
    endereco: string;
    facebook: string;
    instagram: string;
    linkedin: string;
    youtube: string;
  };
  whatsappWidget?: WhatsappWidgetConfig;
}
