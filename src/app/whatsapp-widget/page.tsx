'use client';

import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Settings, Lead } from '@/types/crm';
import { MessageCircle, X, User, ChevronRight } from 'lucide-react';

export default function WhatsappWidgetStandalone() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [open, setOpen] = useState(false);
  const [selectedAttendant, setSelectedAttendant] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ nome: '', email: '', telefone: '' });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const load = async () => {
      const s = await api.getSettings();
      setSettings(s);
    };
    load();
  }, []);

  if (!settings?.whatsappWidget?.enabled || !settings.whatsappWidget.atendentes.length) {
    return null;
  }

  const config = settings.whatsappWidget;

  const handleStartChat = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Salvar Lead
    const leadId = Math.random().toString(36).substr(2, 9);
    await api.saveLead({
      id: leadId,
      nome: formData.nome,
      email: formData.email,
      telefone: formData.telefone,
      origem: `Widget Externo - Atendente: ${selectedAttendant.nome}`,
      consentimentoLGPD: true,
      status: 'novo',
      tags: ['whatsapp-widget'],
      dataCriacao: new Date().toISOString()
    } as Lead);

    const msg = encodeURIComponent(`Olá ${selectedAttendant.nome}, vim pelo seu site e gostaria de falar com você.`);
    window.open(`https://wa.me/${selectedAttendant.telefone.replace(/\D/g, '')}?text=${msg}`, '_blank');
    
    setSubmitted(true);
    setTimeout(() => {
      setOpen(false);
      setShowForm(false);
      setSelectedAttendant(null);
      setFormData({ nome: '', email: '', telefone: '' });
      setSubmitted(false);
    }, 2000);
  };

  return (
    <div style={{ position: 'fixed', bottom: '1rem', [config.posicao || 'right']: '1rem', zIndex: 9999, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
       {/* Botão Flutuante */}
       <button 
         onClick={() => setOpen(!open)}
         style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#25D366', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(0,0,0,0.25)', border: 'none', cursor: 'pointer', transition: 'transform 0.2s' }}
         onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
         onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
       >
         {open ? <X size={28} /> : <MessageCircle size={28} fill="currentColor" />}
       </button>

       {/* Janela Pop-up */}
       {open && (
         <div style={{ position: 'absolute', bottom: '75px', [config.posicao || 'right']: 0, width: '320px', background: 'white', borderRadius: '16px', boxShadow: '0 15px 40px rgba(0,0,0,0.2)', overflow: 'hidden', animation: 'slideUp 0.3s ease-out' }}>
            <div style={{ background: '#25D366', padding: '1.25rem', color: 'white' }}>
               <h3 style={{ fontWeight: 700, fontSize: '1rem', margin: 0 }}>Fale Conosco</h3>
               <p style={{ fontSize: '0.8rem', opacity: 0.9, margin: '4px 0 0 0' }}>Escolha um atendente abaixo:</p>
            </div>

            <div style={{ padding: '0.75rem', maxHeight: '380px', overflowY: 'auto' }}>
               {!showForm ? (
                 config.atendentes.map((at: any) => (
                    <div 
                      key={at.id} 
                      onClick={() => { setSelectedAttendant(at); setShowForm(true); }}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem', borderRadius: '10px', cursor: 'pointer', transition: 'background 0.2s', borderBottom: '1px solid #f1f5f9' }}
                      onMouseOver={e => e.currentTarget.style.background = '#f8fafc'}
                      onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                    >
                       <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                          <User size={20} color="#94a3b8" />
                       </div>
                       <div style={{ flex: 1 }}>
                          <h4 style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1e293b', margin: 0 }}>{at.nome}</h4>
                          <p style={{ fontSize: '0.7rem', color: '#64748b', margin: 0 }}>{at.cargo}</p>
                          {at.disponibilidade && <p style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 600, marginTop: '2px' }}>{at.disponibilidade}</p>}
                       </div>
                       <MessageCircle size={16} color="#25D366" />
                    </div>
                 ))
               ) : (
                 <div style={{ padding: '0.5rem' }}>
                    {submitted ? (
                        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                            <div style={{ color: '#25D366', marginBottom: '1rem' }}><MessageCircle size={48} /></div>
                            <p style={{ fontWeight: 600, color: '#1e293b' }}>Abrindo WhatsApp...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleStartChat}>
                            <p style={{ fontSize: '0.8rem', color: '#64748b', textAlign: 'center', marginBottom: '1rem' }}>Falar com <strong>{selectedAttendant.nome}</strong></p>
                            <div style={{ display: 'grid', gap: '0.75rem' }}>
                            <input 
                                required placeholder="Seu Nome" 
                                style={{ width: '100%', height: '38px', borderRadius: '6px', border: '1px solid #e2e8f0', padding: '0 0.75rem', fontSize: '0.85rem' }}
                                value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})}
                            />
                            <input 
                                required type="email" placeholder="Seu Email" 
                                style={{ width: '100%', height: '38px', borderRadius: '6px', border: '1px solid #e2e8f0', padding: '0 0.75rem', fontSize: '0.85rem' }}
                                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                            />
                            <input 
                                required placeholder="Seu WhatsApp" 
                                style={{ width: '100%', height: '38px', borderRadius: '6px', border: '1px solid #e2e8f0', padding: '0 0.75rem', fontSize: '0.85rem' }}
                                value={formData.telefone} onChange={e => setFormData({...formData, telefone: e.target.value})}
                            />
                            <button type="submit" style={{ width: '100%', height: '42px', borderRadius: '6px', background: '#25D366', color: 'white', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}>
                                Iniciar Conversa
                            </button>
                            <button type="button" onClick={() => setShowForm(false)} style={{ width: '100%', fontSize: '0.75rem', color: '#94a3b8', border: 'none', background: 'none', cursor: 'pointer', marginTop: '0.5rem' }}>Voltar</button>
                            </div>
                        </form>
                    )}
                 </div>
               )}
            </div>
         </div>
       )}

       <style jsx>{`
         @keyframes slideUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
       `}</style>
    </div>
  );
}
