'use client';

import { useState, useEffect, Suspense, use } from 'react';
import { api } from '@/services/api';
import { Lead, LandingPageInstance } from '@/types/crm';
import { CheckCircle2, ChevronRight, Check, Calendar } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

const DEFAULT_BGS = {
  'professional': '/images/sales-bg.png',
  'lead-magnet': '/images/catalog-bg.png',
  'minimalist': '/images/minimalist-bg.png',
  'vsl': '/images/vsl-bg.png',
  'event': 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80',
  'coupon': '/images/coupon-bg.png'
};

const getEmbedUrl = (url: string) => {
  if (!url) return '';
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    const id = url.includes('v=') ? url.split('v=')[1]?.split('&')[0] : url.split('/').pop();
    return `https://www.youtube.com/embed/${id}?autoplay=0&rel=0`;
  }
  if (url.includes('vimeo.com')) {
    const id = url.split('/').pop();
    return `https://player.vimeo.com/video/${id}`;
  }
  return url;
};

const getContrastColor = (hexColor: string) => {
  if (!hexColor || hexColor === 'transparent') return 'white';
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 128) ? '#1e3a8a' : 'white';
};

// --- FORMULÁRIO ---
function CaptureForm({ config, onSubmit }: { config: any, onSubmit: any }) {
  const [formData, setFormData] = useState({ nome: '', email: '', telefone: '', empresa: '', captchaInput: '', consentimento: false });
  const [captcha, setCaptcha] = useState({ a: 0, b: 0, sum: 0 });

  useEffect(() => {
    const a = Math.floor(Math.random() * 10);
    const b = Math.floor(Math.random() * 10);
    setCaptcha({ a, b, sum: a + b });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(formData.captchaInput) !== captcha.sum) { alert("Soma incorreta!"); return; }
    if (!formData.consentimento) { alert("Aceite os termos!"); return; }
    onSubmit(formData);
  };

  const isLight = (hex: string) => {
    if (!hex || hex === 'transparent') return true;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return ((r * 299) + (g * 587) + (b * 114)) / 1000 > 128;
  };

  const isLightBackground = isLight(config.formColor || '#4285F4');
  const textColor = isLightBackground ? '#1e293b' : 'white';
  const btnTextColor = getContrastColor(config.botaoColor || '#fbbf24');
  const inputBorder = isLightBackground ? '1px solid #e2e8f0' : 'none';
  const inputBg = isLightBackground ? '#f8fafc' : 'white';

  return (
    <div className="form-container" style={{ 
      maxWidth: '520px', width: '100%', margin: '0 auto', 
      background: config.formColor || '#4285F4', borderRadius: '16px', 
      padding: '3rem 2rem',
      boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)', color: textColor
    }}>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.85rem', fontWeight: 700, marginBottom: '0.4rem', lineHeight: '1', color: textColor }}>{config.formTitulo}</h2>
        <p style={{ fontSize: '0.95rem', opacity: 0.9, fontWeight: 400, color: textColor }}>{config.formSubtitulo}</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.25rem', textAlign: 'left' }}>
        <div style={{ display: 'grid', gap: '0.4rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, opacity: 0.9, color: textColor, textAlign: 'left' }}>Nome*</label>
          <input 
            required
            className="form-input"
            style={{ width: '100%', height: '50px', borderRadius: '8px', border: isLightBackground ? '1px solid #cbd5e1' : 'none', padding: '0 1.25rem', fontSize: '1rem', background: inputBg, color: '#1e293b' }}
            value={formData.nome}
            onChange={e => setFormData({...formData, nome: e.target.value})}
          />
        </div>

        <div style={{ display: 'grid', gap: '0.4rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, opacity: 0.9, color: textColor, textAlign: 'left' }}>Email*</label>
          <input 
            required
            type="email"
            className="form-input"
            style={{ width: '100%', height: '50px', borderRadius: '8px', border: isLightBackground ? '1px solid #cbd5e1' : 'none', padding: '0 1.25rem', fontSize: '1rem', background: inputBg, color: '#1e293b' }}
            value={formData.email}
            onChange={e => setFormData({...formData, email: e.target.value})}
          />
        </div>

        <div className="form-row">
          <div style={{ display: 'grid', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, opacity: 0.9, color: textColor, textAlign: 'left' }}>Celular*</label>
            <input 
              required
              className="form-input"
              style={{ width: '100%', height: '50px', borderRadius: '8px', border: isLightBackground ? '1px solid #cbd5e1' : 'none', padding: '0 1.25rem', fontSize: '1rem', background: inputBg, color: '#1e293b' }}
              placeholder="(00) 00000-0000"
              value={formData.telefone}
              onChange={e => setFormData({...formData, telefone: e.target.value})}
            />
          </div>
          <div style={{ display: 'grid', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, opacity: 0.9, color: textColor, textAlign: 'left' }}>Empresa</label>
            <input 
              className="form-input"
              style={{ width: '100%', height: '50px', borderRadius: '8px', border: isLightBackground ? '1px solid #cbd5e1' : 'none', padding: '0 1.25rem', fontSize: '1rem', background: inputBg, color: '#1e293b' }}
              value={formData.empresa}
              onChange={e => setFormData({...formData, empresa: e.target.value})}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gap: '0.4rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, opacity: 0.9, color: textColor, textAlign: 'left' }}>Quanto é {captcha.a} + {captcha.b}?</label>
          <input 
            required
            className="form-input"
            style={{ width: '100%', height: '50px', borderRadius: '8px', border: isLightBackground ? '1px solid #cbd5e1' : 'none', padding: '0 1.25rem', fontSize: '1rem', background: inputBg, color: '#1e293b' }}
            placeholder="Resultado da soma"
            value={formData.captchaInput}
            onChange={e => setFormData({...formData, captchaInput: e.target.value})}
          />
        </div>

        <label style={{ display: 'flex', gap: '0.75rem', cursor: 'pointer', fontSize: '0.8rem', marginTop: '0.5rem', color: textColor, alignItems: 'flex-start' }}>
          <input 
            type="checkbox" 
            style={{ width: '18px', height: '18px', marginTop: '2px', flexShrink: 0 }}
            checked={formData.consentimento}
            onChange={e => setFormData({...formData, consentimento: e.target.checked})}
          />
          <span style={{ opacity: 0.9 }}>Eu concordo em receber comunicações de marketing conforme a LGPD.</span>
        </label>
        <button type="submit" className="btn-cta" style={{ 
          height: '60px', borderRadius: '12px', background: config.botaoColor || '#fbbf24', 
          color: btnTextColor, fontWeight: 700, fontSize: '1.2rem', marginTop: '1rem', 
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)', transition: 'all 0.2s', border: 'none'
        }}>
          {config.botaoTexto || 'Falar com um consultor'} <ChevronRight size={22} />
        </button>

        <p style={{ fontSize: '0.7rem', textAlign: 'center', opacity: 0.7, marginTop: '0.5rem', color: textColor }}>
          Nossa empresa está comprometida a proteger sua privacidade.
        </p>
      </form>
      <style jsx>{`
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        @media (max-width: 500px) {
          .form-row { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}

function BenefitItem({ text }: { text: string }) {
  return (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '1.1rem', fontWeight: 500 }}>
      <div style={{ background: '#10b981', color: 'white', borderRadius: '4px', padding: '2px' }}>
        <Check size={20} strokeWidth={3} />
      </div>
      {text}
    </div>
  );
}

function RenderTemplate({ page }: { page: LandingPageInstance }) {
  const searchParams = useSearchParams();
  const [submitted, setSubmitted] = useState(false);
  const config = page?.config || {} as any;

  useEffect(() => {
    document.body.style.backgroundColor = 'transparent';
    return () => { document.body.style.backgroundColor = ''; };
  }, []);

  const handleFormSubmit = async (formData: any) => {
    const newLead: Lead = {
      id: Math.random().toString(36).substr(2, 9),
      nome: formData.nome, email: formData.email, telefone: formData.telefone, empresa: formData.empresa,
      origem: page.slug, dataCriacao: new Date().toISOString(), status: 'novo', tags: [page.templateId, page.slug],
      consentimentoLGPD: true, utm_source: searchParams.get('utm_source') || undefined
    };
    await api.saveLead(newLead);
    setSubmitted(true);
  };

  // Lógica inquebrável para usar a imagem do catálogo real
  let currentBg = config.backgroundUrl === 'none' ? '' : (config.backgroundUrl || DEFAULT_BGS[page.templateId] || DEFAULT_BGS.professional);
  
  // xeque-mate: se o link contiver o código do livro antigo ou o caminho do arquivo antigo, substitui pela nova imagem real
  if (currentBg && typeof currentBg === 'string' && (currentBg.includes('1456513080510') || currentBg.includes('default-catalog-bg.png') || currentBg === '/background.png' || currentBg === 'background.png')) {
    currentBg = page.templateId === 'lead-magnet' ? '/images/catalog-bg.png' : 
                page.templateId === 'vsl' ? '/images/vsl-bg.png' : 
                page.templateId === 'minimalist' ? '/images/minimalist-bg.png' :
                page.templateId === 'coupon' ? '/images/coupon-bg.png' : '/images/sales-bg.png';
  }

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#020617', color: 'white', padding: '2rem' }}>
        <div style={{ textAlign: 'center', maxWidth: '500px' }}>
          <CheckCircle2 size={64} style={{ color: '#10b981', margin: '0 auto' }} />
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '1.5rem' }}>Sucesso!</h2>
          <p style={{ opacity: 0.8, fontSize: '1.1rem', marginTop: '0.5rem' }}>
            {page.templateId === 'lead-magnet' ? 'Seu material já está disponível para download abaixo.' : 
             page.templateId === 'coupon' ? 'Seu cupom foi ativado! Verifique seu e-mail para o código.' :
             'Recebemos seus dados e entraremos em contato em breve.'}
          </p>
          
          {page.templateId === 'lead-magnet' && config.downloadFileUrl && (
            <a 
              href={config.downloadFileUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{ marginTop: '2rem', display: 'inline-flex', width: 'auto', padding: '1rem 2rem', textDecoration: 'none' }}
            >
              Baixar Material Agora
            </a>
          )}

          <div style={{ marginTop: '2rem' }}>
            <button 
              style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.9rem' }} 
              onClick={() => window.location.reload()}
            >
              Voltar para a página
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isMinimalist = page.templateId === 'minimalist';
  const mainTextColor = 'white';

  const bgStyles: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: currentBg ? `url("${currentBg}") center/cover no-repeat fixed` : 'none',
    zIndex: -2
  };

  const overlayStyles: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: 'linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.85))',
    zIndex: -1
  };

  // Layout Único e Consistente (Headline na Esquerda, Formulário na Direita)
  return (
    <div style={{ minHeight: '100vh', position: 'relative', zIndex: 1, color: mainTextColor }}>
      <div style={bgStyles} />
      <div style={overlayStyles} />
      <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', zIndex: 1 }} className="landing-container">
        <div className="landing-grid">
          <div className="content-side">
            {page.templateId === 'event' && (
               <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#e11d48', padding: '0.35rem 0.75rem', borderRadius: '50px', marginBottom: '1rem', fontWeight: 600, fontSize: '0.9rem' }}>
                 <Calendar size={16} /> INSCRIÇÕES ABERTAS
               </div>
            )}
          {page.templateId === 'coupon' && (
             <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#fbbf24', color: '#000', padding: '0.35rem 0.75rem', borderRadius: '50px', marginBottom: '1rem', fontWeight: 700, fontSize: '0.9rem', boxShadow: '0 4px 15px rgba(251, 191, 36, 0.4)' }}>
               <CheckCircle2 size={16} /> OFERTA POR TEMPO LIMITADO
             </div>
          )}
          <div style={{ marginBottom: '2rem' }}>
            {config.logoUrl && config.logoUrl !== 'none' ? (
                <img src={config.logoUrl} alt="Logo" style={{ maxHeight: '60px', width: 'auto' }} className="mobile-center" />
            ) : (
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }} className="mobile-center">{config.titulo}</h1>
            )}
          </div>
          <h2 className="title-main" style={{ fontWeight: 700, lineHeight: '1.1', marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>
            {config.subtitulo} <br/><span style={{ color: config.botaoColor || '#fbbf24' }}>{config.destaque}</span>
          </h2>
          <p className="description-text" style={{ fontSize: '1.15rem', opacity: 0.9, marginBottom: '2rem', lineHeight: '1.5', fontWeight: 400 }}>{config.descricao}</p>
          <div style={{ display: 'grid', gap: '1.25rem' }}>
             {config.beneficios?.map((b: string, i: number) => (
                <BenefitItem key={i} text={b} />
             ))}
          </div>
          {page.templateId === 'vsl' && config.videoUrl && (
             <div style={{ marginTop: '2rem', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', background: 'black', aspectRatio: '16/9' }}>
               <iframe 
                 width="100%" 
                 height="100%" 
                 src={getEmbedUrl(config.videoUrl)} 
                 title="Video Player" 
                 frameBorder="0" 
                 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                 allowFullScreen
               />
             </div>
          )}
        </div>
          <div className="form-side">
            <CaptureForm config={config} onSubmit={handleFormSubmit} />
          </div>
        </div>
      </div>

      <style jsx>{`
        .landing-container { padding: 4rem 2rem; min-height: 100vh; display: flex; align-items: center; }
        .landing-grid { display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr); gap: 4rem; align-items: center; width: 100%; }
        .title-main { font-size: 3.5rem; }
        .form-container {
          padding: 2.5rem 2.25rem;
        }

        @media (max-width: 1024px) {
          .landing-grid { gap: 2rem; }
          .title-main { font-size: 2.75rem; }
        }

        @media (max-width: 768px) {
          .landing-container { padding: 2rem 1rem; align-items: flex-start; overflow-x: hidden; }
          .landing-grid { grid-template-columns: 1fr; gap: 3rem; text-align: center; width: 100%; }
          .content-side { display: flex; flex-direction: column; align-items: center; width: 100%; }
          .title-main { font-size: 2.25rem !important; margin: 0 0 1rem !important; }
          .description-text { font-size: 1rem !important; margin: 0 auto 1.5rem !important; }
          .form-side { width: 100%; max-width: 100%; overflow: hidden; }
          .mobile-center { text-align: center !important; margin: 0 auto !important; justify-content: center !important; }
        }

        @media (max-width: 480px) {
          .title-main { font-size: 1.85rem !important; }
          .landing-container { padding: 1.5rem 0.75rem; }
        }
      `}</style>
    </div>
  );
}

export default function DynamicLandingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [page, setPage] = useState<LandingPageInstance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPage = async () => {
      const p = await api.getLandingPageBySlug(slug);
      setPage(p);
      setLoading(false);
    };
    loadPage();
  }, [slug]);

  if (loading) return <div style={{ minHeight: '100vh', background: '#020617', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>Carregando...</div>;
  if (!page) return null;

  return (
    <Suspense fallback={<div />}>
      <RenderTemplate page={page} />
    </Suspense>
  );
}
