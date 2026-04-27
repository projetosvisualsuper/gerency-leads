'use client';

import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Settings } from '@/types/crm';
import { testBrevoConnectionAction } from '@/app/actions/brevo';
import { 
  Save, 
  Key, 
  User, 
  Globe,
  Bell,
  Lock,
  MapPin,
  Share2,
  ExternalLink,
  MessageCircle,
  Trash2,
  Plus
} from 'lucide-react';

export default function ConfigPage() {
  const [settings, setSettings] = useState<Settings>({
    brevoApiKey: '',
    remetenteNome: '',
    remetenteEmail: '',
    limiteDiario: 300,
    notificacoes: {
      novosLeads: true,
      errosEnvio: true
    },
    landingPage: {
      titulo: '',
      subtitulo: '',
      destaque: '',
      descricao: '',
      beneficios: [],
      formTitulo: '',
      formSubtitulo: '',
      botaoTexto: '',
      botaoColor: '',
      formColor: '',
      logoUrl: '',
      backgroundUrl: ''
    },
    empresa: {
      website: '',
      endereco: '',
      facebook: '',
      instagram: '',
      linkedin: '',
      youtube: ''
    }
  });
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      const s = await api.getSettings();
      setSettings(s);
      setLoading(false);
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    await api.saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const toggleNotification = (key: keyof Settings['notificacoes']) => {
    setSettings({
      ...settings,
      notificacoes: {
        ...settings.notificacoes,
        [key]: !settings.notificacoes[key]
      }
    });
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div style={{ maxWidth: '800px' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>Configurações do Sistema</h2>
        <p style={{ opacity: 0.6 }}>Gerencie suas integrações e preferências de envio.</p>
      </header>

      <div className="grid" style={{ gap: '2rem' }}>
        {/* API BREVO */}
        <section className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Globe className="color-primary" size={20} />
            <h3 style={{ fontSize: '1.25rem' }}>Integração API (Brevo)</h3>
          </div>
          
          <div style={{ display: 'grid', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>API Key</label>
              <div style={{ position: 'relative' }}>
                <Key size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                <input 
                  type="password" 
                  className="btn-outline" 
                  style={{ width: '100%', paddingLeft: '2.5rem', height: '42px' }} 
                  placeholder="xkeysib-..."
                  value={settings.brevoApiKey}
                  onChange={e => setSettings({...settings, brevoApiKey: e.target.value})}
                />
              </div>
              <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button 
                  className="btn btn-outline" 
                  style={{ fontSize: '0.75rem', height: '32px', borderColor: 'var(--primary)', color: 'var(--primary)' }}
                  onClick={async () => {
                    const result = await testBrevoConnectionAction(settings.brevoApiKey);
                    alert(result.message);
                  }}
                >
                  Testar Conexão
                </button>
                <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Teste sua chave antes de salvar as alterações.
                </p>
              </div>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Limite Diário de Envios</label>
              <input 
                type="number" 
                className="btn-outline" 
                style={{ width: '100%', height: '42px', padding: '0 1rem' }} 
                value={settings.limiteDiario}
                onChange={e => setSettings({...settings, limiteDiario: parseInt(e.target.value) || 0})}
              />
            </div>
          </div>
        </section>

        {/* INFORMAÇÕES DA EMPRESA (RODAPÉ) */}
        <section className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <MapPin className="color-primary" size={20} />
            <h3 style={{ fontSize: '1.25rem' }}>Informações da Empresa (Rodapé)</h3>
          </div>
          
          <div style={{ display: 'grid', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Nome do Remetente</label>
                <input 
                  type="text" 
                  className="btn-outline" 
                  style={{ width: '100%', height: '42px', padding: '0 1rem' }} 
                  value={settings.remetenteNome}
                  onChange={e => setSettings({...settings, remetenteNome: e.target.value})}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>E-mail do Remetente</label>
                <input 
                  type="email" 
                  className="btn-outline" 
                  style={{ width: '100%', height: '42px', padding: '0 1rem' }} 
                  value={settings.remetenteEmail}
                  onChange={e => setSettings({...settings, remetenteEmail: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Endereço Completo (Aparecerá no E-mail)</label>
              <input 
                type="text" 
                className="btn-outline" 
                style={{ width: '100%', height: '42px', padding: '0 1rem' }} 
                placeholder="Ex: Rua Exemplo, 123 - Cidade, Estado"
                value={settings.empresa?.endereco}
                onChange={e => setSettings({...settings, empresa: {...settings.empresa, endereco: e.target.value}})}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Website URL</label>
              <div style={{ position: 'relative' }}>
                <ExternalLink size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                <input 
                  type="text" 
                  className="btn-outline" 
                  style={{ width: '100%', paddingLeft: '2.5rem', height: '42px' }} 
                  placeholder="www.suaempresa.com.br"
                  value={settings.empresa?.website}
                  onChange={e => setSettings({...settings, empresa: {...settings.empresa, website: e.target.value}})}
                />
              </div>
            </div>

            <div style={{ marginTop: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem', fontWeight: 600 }}>
                <Share2 size={16} /> Redes Sociais (Links)
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <input 
                  className="btn-outline text-sm" 
                  style={{ height: '38px', padding: '0 0.75rem' }} 
                  placeholder="Instagram Link"
                  value={settings.empresa?.instagram}
                  onChange={e => setSettings({...settings, empresa: {...settings.empresa, instagram: e.target.value}})}
                />
                <input 
                  className="btn-outline text-sm" 
                  style={{ height: '38px', padding: '0 0.75rem' }} 
                  placeholder="Facebook Link"
                  value={settings.empresa?.facebook}
                  onChange={e => setSettings({...settings, empresa: {...settings.empresa, facebook: e.target.value}})}
                />
                <input 
                  className="btn-outline text-sm" 
                  style={{ height: '38px', padding: '0 0.75rem' }} 
                  placeholder="LinkedIn Link"
                  value={settings.empresa?.linkedin}
                  onChange={e => setSettings({...settings, empresa: {...settings.empresa, linkedin: e.target.value}})}
                />
                <input 
                  className="btn-outline text-sm" 
                  style={{ height: '38px', padding: '0 0.75rem' }} 
                  placeholder="YouTube Link"
                  value={settings.empresa?.youtube}
                  onChange={e => setSettings({...settings, empresa: {...settings.empresa, youtube: e.target.value}})}
                />
              </div>
            </div>
          </div>
        </section>

        {/* NOTIFICAÇÕES */}
        <section className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Bell className="color-primary" size={20} />
            <h3 style={{ fontSize: '1.25rem' }}>Preferências de Notificação</h3>
          </div>
          
          <div style={{ display: 'grid', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', padding: '1rem', borderRadius: 'var(--radius)', background: 'var(--background)', border: '1px solid var(--border)' }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>Alerta de Novo Lead</p>
                <p style={{ fontSize: '0.75rem', opacity: 0.6 }}>Notificação visual imediata ao receber contatos.</p>
              </div>
              <input 
                type="checkbox" 
                checked={settings.notificacoes?.novosLeads || false}
                onChange={() => toggleNotification('novosLeads')}
                style={{ width: '40px', height: '20px', cursor: 'pointer' }}
              />
            </label>
          </div>
        </section>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginBottom: '4rem', alignItems: 'center' }}>
          {saved && <span style={{ color: 'var(--success)', fontSize: '0.875rem' }}>Configurações aplicadas com sucesso!</span>}
          <button className="btn btn-primary" onClick={handleSave} style={{ height: '50px', padding: '0 2.5rem', fontSize: '1rem' }}>
            <Save size={20} /> Salvar Tudo
          </button>
        </div>
      </div>
    </div>
  );
}
