'use client';

import { 
  Globe, 
  Code, 
  Copy, 
  Check, 
  ExternalLink,
  ShieldCheck,
  Zap,
  MessageCircle
} from 'lucide-react';
import { useState, useEffect } from 'react';

export default function IntegracoesPage() {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [copiedWa, setCopiedWa] = useState(false);
  const [publicLink, setPublicLink] = useState('');

  useEffect(() => {
    setPublicLink(`${window.location.origin}/captura`);
  }, []);

  const embedCode = `<iframe src="${publicLink}" width="100%" height="700px" frameborder="0" style="border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"></iframe>`;
  const waCode = `<script>
  (function() {
    var frame = document.createElement('iframe');
    frame.src = "${typeof window !== 'undefined' ? window.location.origin : ''}/whatsapp-widget";
    frame.style.cssText = "position:fixed;bottom:0;right:0;width:350px;height:650px;border:none;z-index:999999;background:transparent;";
    frame.setAttribute('allowTransparency', 'true');
    document.body.appendChild(frame);
  })();
</script>`;

  const copyToClipboard = (text: string, setter: (val: boolean) => void) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  return (
    <div style={{ maxWidth: '900px' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>Integrações de Captura</h2>
        <p style={{ opacity: 0.6 }}>Conecte seu site ou landing page diretamente ao GerencyLeads.</p>
      </header>

      <div className="grid" style={{ gap: '2rem' }}>
        <section className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Globe className="color-primary" size={24} />
            <h3 style={{ fontSize: '1.25rem' }}>Link Público da Landing Page</h3>
          </div>
          <p style={{ fontSize: '0.875rem', opacity: 0.7, marginBottom: '1rem' }}>
            Use este link em suas campanhas, bio do Instagram ou botões de anúncios. Os leads caem direto no seu CRM.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--background)', padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <input 
              readOnly 
              type="text" 
              value={publicLink} 
              style={{ background: 'transparent', border: 'none', width: '100%', outline: 'none', color: 'var(--primary)', fontWeight: 500 }}
            />
            <button onClick={() => copyToClipboard(publicLink, setCopiedLink)} style={{ color: copiedLink ? 'var(--success)' : 'inherit' }}>
              {copiedLink ? <Check size={20} /> : <Copy size={20} />}
            </button>
          </div>
          <a href="/captura" target="_blank" className="btn btn-outline" style={{ marginTop: '1rem', border: 'none', color: 'var(--primary)', padding: 0 }}>
             Visualizar Página <ExternalLink size={14} />
          </a>
        </section>

        <section className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Code className="color-primary" size={24} />
            <h3 style={{ fontSize: '1.25rem' }}>Código de Incorporação (Embed)</h3>
          </div>
          <p style={{ fontSize: '0.875rem', opacity: 0.7, marginBottom: '1rem' }}>
            Copie o código abaixo e cole no HTML do seu site para exibir o formulário dentro de qualquer página sua.
          </p>
          <div style={{ position: 'relative' }}>
            <pre style={{ 
              background: '#1e293b', 
              color: '#f8fafc', 
              padding: '1.5rem', 
              borderRadius: 'var(--radius)', 
              fontSize: '0.875rem', 
              overflowX: 'auto',
              border: '1px solid #334155'
            }}>
              <code>{embedCode}</code>
            </pre>
            <button 
              onClick={() => copyToClipboard(embedCode, setCopiedEmbed)}
              style={{ 
                position: 'absolute', 
                right: '1rem', 
                top: '1rem', 
                background: 'rgba(255,255,255,0.1)', 
                padding: '0.5rem', 
                borderRadius: '4px',
                color: copiedEmbed ? '#34d399' : '#94a3b8'
              }}
            >
              {copiedEmbed ? <Check size={18} /> : <Copy size={18} />}
            </button>
          </div>
          <p style={{ fontSize: '0.75rem', opacity: 0.5, marginTop: '1rem' }}>
            Dica: No Wordpress, use o bloco "HTML Personalizado" para colar este código.
          </p>
        </section>

        <section className="card" style={{ border: '1px solid #25D366', background: 'rgba(37, 211, 102, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <MessageCircle style={{ color: '#25D366' }} size={24} />
            <h3 style={{ fontSize: '1.25rem' }}>Botão WhatsApp Global (Embed)</h3>
          </div>
          <p style={{ fontSize: '0.875rem', opacity: 0.7, marginBottom: '1rem' }}>
            Adicione o botão flutuante com atendentes em seu site oficial. O código abaixo cria o botão no canto da tela.
          </p>
          <div style={{ position: 'relative' }}>
            <pre style={{ 
              background: '#064e3b', 
              color: '#d1fae5', 
              padding: '1.5rem', 
              borderRadius: 'var(--radius)', 
              fontSize: '0.875rem', 
              overflowX: 'auto',
              border: '1px solid #065f46'
            }}>
              <code>{waCode}</code>
            </pre>
            <button 
              onClick={() => copyToClipboard(waCode, setCopiedWa)}
              style={{ 
                position: 'absolute', 
                right: '1rem', 
                top: '1rem', 
                background: 'rgba(255,255,255,0.1)', 
                padding: '0.5rem', 
                borderRadius: '4px',
                color: copiedWa ? '#34d399' : '#a7f3d0'
              }}
            >
              {copiedWa ? <Check size={18} /> : <Copy size={18} />}
            </button>
          </div>
          <p style={{ fontSize: '0.75rem', opacity: 0.5, marginTop: '1rem' }}>
            Configure os atendentes em <strong>Configurações</strong> no menu lateral.
          </p>
        </section>

        <div className="grid grid-cols-2" style={{ gap: '1.5rem' }}>
          <div className="card" style={{ opacity: 0.6, borderStyle: 'dashed' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <Zap size={20} />
              <h4 style={{ fontWeight: 600 }}>Webhooks & API</h4>
            </div>
            <p style={{ fontSize: '0.875rem' }}>Envie dados de outros apps (Typeform, Elementor) via JSON. Em breve!</p>
          </div>
          <div className="card" style={{ border: '1px solid var(--success)', background: 'rgba(16, 185, 129, 0.05)' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <ShieldCheck className="color-success" size={20} />
              <h4 style={{ fontWeight: 600 }}>Tracking de Origem</h4>
            </div>
            <p style={{ fontSize: '0.875rem', opacity: 0.8 }}><strong>Ativo:</strong> Parâmetros UTM (Source, Medium, Campaign) estão sendo capturados automaticamente em todos os seus formulários.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
