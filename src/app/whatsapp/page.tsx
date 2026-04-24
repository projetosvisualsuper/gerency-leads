'use client';

import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Settings } from '@/types/crm';
import { 
  Save, 
  MessageCircle, 
  Trash2, 
  Plus,
  Settings as SettingsIcon,
  ChevronRight,
  Monitor
} from 'lucide-react';
import Link from 'next/link';

export default function WhatsappConfigPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
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
    if (!settings) return;
    await api.saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading || !settings) return <div style={{ padding: '2rem' }}>Carregando Configurações do WhatsApp...</div>;

  return (
    <div style={{ maxWidth: '900px' }}>
      <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Gerador de Botão WhatsApp</h2>
          <p style={{ opacity: 0.6 }}>Crie um botão flutuante profissional para o seu site principal.</p>
        </div>
        <button className="btn btn-primary" onClick={handleSave} style={{ height: '50px', padding: '0 2.5rem', fontSize: '1rem' }}>
          <Save size={20} /> Salvar Configurações
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }}>
        
        {/* COLUNA ESQUERDA: CONFIGURAÇÃO */}
        <div style={{ display: 'grid', gap: '2rem' }}>
          <section className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 600 }}>
                <SettingsIcon size={20} className="color-primary" /> Opções do Widget
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>Ativar Botão:</span>
                 <input 
                   type="checkbox" 
                   style={{ width: '18px', height: '18px' }}
                   checked={settings.whatsappWidget?.enabled || false}
                   onChange={e => {
                      const wa = settings.whatsappWidget || { enabled: false, posicao: 'right', atendentes: [] };
                      setSettings({...settings, whatsappWidget: {...wa, enabled: e.target.checked}});
                   }}
                 />
              </div>
            </div>

            {settings.whatsappWidget?.enabled && (
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                 <div>
                    <label style={{ fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>Posição na Tela</label>
                    <select 
                      className="btn-outline" style={{ width: '100%', height: '42px', padding: '0 0.5rem' }}
                      value={settings.whatsappWidget.posicao}
                      onChange={e => {
                         const wa = settings.whatsappWidget!;
                         setSettings({...settings, whatsappWidget: {...wa, posicao: e.target.value as any}});
                      }}
                    >
                      <option value="right">Canto Inferior Direito</option>
                      <option value="left">Canto Inferior Esquerdo</option>
                    </select>
                 </div>

                 <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9' }} />

                 <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                       <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Atendentes do Chat</label>
                       <button className="btn btn-outline" style={{ height: '30px', fontSize: '0.75rem' }} onClick={() => {
                           const wa = settings.whatsappWidget!;
                           const newAt = { id: Math.random().toString(36).substr(2, 9), nome: 'Novo Atendente', cargo: 'Comercial', telefone: '55', disponibilidade: 'Seg a Sex, 08h-18h' };
                           setSettings({...settings, whatsappWidget: {...wa, atendentes: [...wa.atendentes, newAt]}});
                       }}>+ Adicionar</button>
                    </div>
                    
                    <div style={{ display: 'grid', gap: '1rem' }}>
                       {settings.whatsappWidget.atendentes.map((at, idx) => (
                         <div key={at.id} style={{ padding: '1.25rem', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#f8fafc', position: 'relative' }}>
                            <button 
                              onClick={() => {
                                const wa = settings.whatsappWidget!;
                                const newAt = wa.atendentes.filter((_, i) => i !== idx);
                                setSettings({...settings, whatsappWidget: {...wa, atendentes: newAt}});
                              }}
                              style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', color: '#ef4444', opacity: 0.5, border: 'none', background: 'none', cursor: 'pointer' }}
                            ><Trash2 size={16} /></button>
                            
                            <div style={{ display: 'grid', gap: '1rem' }}>
                               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                  <div>
                                     <label style={{ fontSize: '0.7rem', opacity: 0.6, fontWeight: 700, textTransform: 'uppercase' }}>Nome</label>
                                     <input 
                                       className="btn-outline"
                                       style={{ width: '100%', height: '36px', padding: '0 0.75rem', fontSize: '0.85rem', background: 'white' }}
                                       value={at.nome}
                                       onChange={e => {
                                          const wa = settings.whatsappWidget!;
                                          const newAtArr = [...wa.atendentes];
                                          newAtArr[idx] = { ...at, nome: e.target.value };
                                          setSettings({...settings, whatsappWidget: {...wa, atendentes: newAtArr}});
                                       }}
                                     />
                                  </div>
                                  <div>
                                     <label style={{ fontSize: '0.7rem', opacity: 0.6, fontWeight: 700, textTransform: 'uppercase' }}>WhatsApp</label>
                                     <input 
                                       className="btn-outline"
                                       style={{ width: '100%', height: '36px', padding: '0 0.75rem', fontSize: '0.85rem', background: 'white' }}
                                       placeholder="Ex: 5548999999999"
                                       value={at.telefone}
                                       onChange={e => {
                                          const wa = settings.whatsappWidget!;
                                          const newAtArr = [...wa.atendentes];
                                          newAtArr[idx] = { ...at, telefone: e.target.value };
                                          setSettings({...settings, whatsappWidget: {...wa, atendentes: newAtArr}});
                                       }}
                                     />
                                  </div>
                               </div>
                               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                  <div>
                                     <label style={{ fontSize: '0.7rem', opacity: 0.6, fontWeight: 700, textTransform: 'uppercase' }}>Setor</label>
                                     <input 
                                       className="btn-outline"
                                       style={{ width: '100%', height: '36px', padding: '0 0.75rem', fontSize: '0.85rem', background: 'white' }}
                                       value={at.cargo}
                                       onChange={e => {
                                          const wa = settings.whatsappWidget!;
                                          const newAtArr = [...wa.atendentes];
                                          newAtArr[idx] = { ...at, cargo: e.target.value };
                                          setSettings({...settings, whatsappWidget: {...wa, atendentes: newAtArr}});
                                       }}
                                     />
                                  </div>
                                  <div>
                                     <label style={{ fontSize: '0.7rem', opacity: 0.6, fontWeight: 700, textTransform: 'uppercase' }}>Horário</label>
                                     <input 
                                       className="btn-outline"
                                       style={{ width: '100%', height: '36px', padding: '0 0.75rem', fontSize: '0.85rem', background: 'white' }}
                                       value={at.disponibilidade}
                                       onChange={e => {
                                          const wa = settings.whatsappWidget!;
                                          const newAtArr = [...wa.atendentes];
                                          newAtArr[idx] = { ...at, disponibilidade: e.target.value };
                                          setSettings({...settings, whatsappWidget: {...wa, atendentes: newAtArr}});
                                       }}
                                     />
                                  </div>
                               </div>
                            </div>
                         </div>
                       ))}
                       {settings.whatsappWidget.atendentes.length === 0 && (
                         <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.4 }}>Nenhum atendente cadastrado.</div>
                       )}
                    </div>
                 </div>
              </div>
            )}
          </section>
        </div>

        {/* COLUNA DIREITA: HELP & EMBED */}
        <div style={{ display: 'grid', gap: '1.5rem' }}>
           <section className="card" style={{ background: 'var(--accent)' }}>
              <h4 style={{ fontWeight: 600, marginBottom: '0.75rem' }}>Como Instalar?</h4>
              <p style={{ fontSize: '0.85rem', opacity: 0.7, lineHeight: '1.5', marginBottom: '1.25rem' }}>
                Após salvar as configurações, vá na página de Integrações para copiar o código HTML.
              </p>
              <Link href="/integracoes" className="btn btn-outline" style={{ width: '100%', background: 'white' }}>
                 Pegar Código <ChevronRight size={16} />
              </Link>
           </section>

           <div className="card" style={{ textAlign: 'center', borderStyle: 'dashed' }}>
              <Monitor size={32} style={{ opacity: 0.2, marginBottom: '1rem' }} />
              <p style={{ fontSize: '0.85rem', opacity: 0.6 }}>O botão aparecerá no canto inferior do seu site.</p>
           </div>
        </div>
      </div>

      {saved && (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', background: 'var(--success)', color: 'white', padding: '1rem 2rem', borderRadius: '50px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', zIndex: 100, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
           Configurações salvas com sucesso!
        </div>
      )}
    </div>
  );
}
