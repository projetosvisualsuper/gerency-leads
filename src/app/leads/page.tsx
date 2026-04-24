'use client';

import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Lead, LeadStatus } from '@/types/crm';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Trash2, 
  Tag as TagIcon,
  UserPlus,
  X,
  Check,
  Eye,
  Info
} from 'lucide-react';

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [viewingLead, setViewingLead] = useState<Lead | null>(null);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  
  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onResolve: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onResolve: () => {}
  });
  
  // Form State
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    origem: 'Manual',
    status: 'novo' as LeadStatus,
    tags: '',
    observacoes: ''
  });

  const refreshLeads = async () => {
    const data = await api.getLeads();
    setLeads(data);
  };

  useEffect(() => {
    refreshLeads();
  }, []);

  const handleSave = async () => {
    const lead: Lead = {
      id: editingLead?.id || Math.random().toString(36).substr(2, 9),
      nome: formData.nome,
      email: formData.email,
      telefone: formData.telefone,
      origem: formData.origem,
      dataCriacao: editingLead?.dataCriacao || new Date().toISOString(),
      status: formData.status,
      tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
      consentimentoLGPD: true,
      observacoes: formData.observacoes
    };
    
    await api.saveLead(lead);
    await refreshLeads();
    closeModal();
  };

  const openModal = (lead?: Lead) => {
    if (lead) {
      setEditingLead(lead);
      setFormData({
        nome: lead.nome,
        email: lead.email,
        telefone: lead.telefone || '',
        origem: lead.origem,
        status: lead.status,
        tags: lead.tags.join(', '),
        observacoes: lead.observacoes || ''
      });
    } else {
      setEditingLead(null);
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        origem: 'Manual',
        status: 'novo',
        tags: '',
        observacoes: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingLead(null);
  };

  const handleDelete = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Excluir Lead',
      message: 'Tem certeza que deseja excluir este lead? Esta ação não pode ser desfeita.',
      onResolve: async () => {
        await api.deleteLead(id);
        await refreshLeads();
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleBulkDelete = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Excluir em Massa',
      message: `Tem certeza que deseja excluir os ${selectedLeads.length} leads selecionados?`,
      onResolve: async () => {
        for (const id of selectedLeads) {
          await api.deleteLead(id);
        }
        setSelectedLeads([]);
        await refreshLeads();
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleBulkStatus = async (status: LeadStatus) => {
    for (const id of selectedLeads) {
      const lead = leads.find(l => l.id === id);
      if (lead) {
        await api.saveLead({ ...lead, status });
      }
    }
    setSelectedLeads([]);
    await refreshLeads();
  };

  const filteredLeads = leads.filter(lead => 
    lead.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelect = (id: string) => {
    setSelectedLeads(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedLeads.length === filteredLeads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(filteredLeads.map(l => l.id));
    }
  };

  return (
    <div>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>Gerenciamento de Leads</h2>
          <p style={{ opacity: 0.6 }}>Total de {leads.length} leads cadastrados.</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <UserPlus size={18} /> Novo Lead
        </button>
      </header>

      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
            <input 
              type="text" 
              placeholder="Buscar por nome ou e-mail..." 
              className="btn-outline"
              style={{ width: '100%', paddingLeft: '2.5rem', borderRadius: 'var(--radius)', height: '42px', border: '1px solid var(--border)' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn btn-outline">
            <Filter size={18} /> Filtros
          </button>
        </div>
      </div>

      {selectedLeads.length > 0 && (
        <div className="card" style={{ marginBottom: '1.5rem', padding: '0.75rem 1.5rem', background: 'var(--primary)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{selectedLeads.length} leads selecionados</span>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }} onClick={() => handleBulkStatus('contatado')}>
              Mudar p/ Contatado
            </button>
            <button className="btn" style={{ background: 'rgba(239, 68, 68, 0.8)', color: 'white' }} onClick={handleBulkDelete}>
              <Trash2 size={16} /> Excluir
            </button>
          </div>
        </div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th style={{ width: '40px' }}>
                <input type="checkbox" checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0} onChange={selectAll} />
              </th>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Origem</th>
              <th>Data</th>
              <th>Status</th>
              <th>Tags</th>
              <th style={{ width: '40px' }}></th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.map(lead => (
              <tr key={lead.id}>
                <td>
                  <input type="checkbox" checked={selectedLeads.includes(lead.id)} onChange={() => toggleSelect(lead.id)} />
                </td>
                <td style={{ fontWeight: 500 }}>{lead.nome}</td>
                <td style={{ opacity: 0.8 }}>{lead.email}</td>
                <td>{lead.origem}</td>
                <td>{new Date(lead.dataCriacao).toLocaleDateString('pt-BR')}</td>
                <td>
                  <span className={`badge badge-${lead.status}`}>
                    {lead.status.toUpperCase()}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    {lead.tags.map(tag => (
                      <span key={tag} style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: 'var(--accent)', border: '1px solid var(--border)' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button style={{ opacity: 0.6, color: 'var(--primary)' }} onClick={() => { setViewingLead(lead); setIsDetailsOpen(true); }}><Eye size={18} title="Ver Detalhes" /></button>
                    <button style={{ opacity: 0.4 }} onClick={() => openModal(lead)}><TagIcon size={18} title="Editar" /></button>
                    <button style={{ opacity: 0.4, color: 'var(--danger)' }} onClick={() => handleDelete(lead.id)}><Trash2 size={18} title="Excluir" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL DE DETALHES COMPLETO */}
      {isDetailsOpen && viewingLead && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 150, padding: '1rem' }}>
          <div className="card" style={{ width: '600px', maxWidth: '100%', position: 'relative', padding: 0, overflow: 'hidden' }}>
            <div style={{ background: 'var(--primary)', padding: '1.5rem', color: 'white' }}>
              <button style={{ position: 'absolute', right: '1rem', top: '1rem', color: 'white', opacity: 0.8 }} onClick={() => setIsDetailsOpen(false)}>
                <X size={24} />
              </button>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ width: '60px', height: '60px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>
                  {viewingLead.nome.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{viewingLead.nome}</h3>
                  <p style={{ opacity: 0.8 }}>ID: {viewingLead.id}</p>
                </div>
              </div>
            </div>

            <div style={{ padding: '2rem', display: 'grid', gap: '1.5rem', maxHeight: '70vh', overflowY: 'auto' }}>
              {/* Seção Dados Principais */}
              <section>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                  <Info size={18} /> Dados do Lead
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <p style={{ fontSize: '0.75rem', opacity: 0.5 }}>E-mail Principal</p>
                    <p style={{ fontWeight: 500 }}>{viewingLead.email}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', opacity: 0.5 }}>Telefone / WhatsApp</p>
                    <p style={{ fontWeight: 500 }}>{viewingLead.telefone || 'Não informado'}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', opacity: 0.5 }}>Empresa</p>
                    <p style={{ fontWeight: 500 }}>{viewingLead.empresa || 'Não informado'}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', opacity: 0.5 }}>Data de Cadastro</p>
                    <p style={{ fontWeight: 500 }}>{new Date(viewingLead.dataCriacao).toLocaleString('pt-BR')}</p>
                  </div>
                </div>
              </section>

              {/* Seção UTMs e Rastreamento */}
              <section style={{ background: 'var(--background)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontWeight: 600 }}>
                  📍 Rastreamento de Marketing
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div>
                    <p style={{ fontSize: '0.75rem', opacity: 0.5 }}>Origem Principal</p>
                    <p style={{ fontWeight: 600, color: 'var(--primary)' }}>{viewingLead.origem}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', opacity: 0.5 }}>UTM Source</p>
                    <p style={{ color: viewingLead.utm_source ? 'var(--primary)' : 'inherit' }}>{viewingLead.utm_source || '---'}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', opacity: 0.5 }}>UTM Medium</p>
                    <p>{viewingLead.utm_medium || '---'}</p>
                  </div>
                  <div style={{ gridColumn: 'span 3' }}>
                    <p style={{ fontSize: '0.75rem', opacity: 0.5 }}>UTM Campaign</p>
                    <p>{viewingLead.utm_campaign || '---'}</p>
                  </div>
                </div>
              </section>

              {/* Seção Status e Obs */}
              <section>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ fontWeight: 600 }}>Status do Funil</h4>
                  <span className={`badge badge-${viewingLead.status}`} style={{ fontSize: '0.9rem', padding: '0.4rem 1rem' }}>
                    {viewingLead.status.toUpperCase()}
                  </span>
                </div>
                <p style={{ fontSize: '0.75rem', opacity: 0.5, marginBottom: '0.5rem' }}>Observações e Notas</p>
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontStyle: viewingLead.observacoes ? 'normal' : 'italic', color: viewingLead.observacoes ? 'inherit' : '#94a3b8' }}>
                  {viewingLead.observacoes || 'Nenhuma observação registrada para este lead.'}
                </div>
              </section>
            </div>

            <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)', textAlign: 'right' }}>
              <button className="btn btn-outline" onClick={() => setIsDetailsOpen(false)}>Fechar Detalhes</button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card" style={{ width: '500px', position: 'relative' }}>
             <button style={{ position: 'absolute', right: '1rem', top: '1rem', opacity: 0.5 }} onClick={closeModal}>
              <X size={20} />
            </button>
            <h3 style={{ marginBottom: '1.5rem' }}>{editingLead ? 'Editar Lead' : 'Novo Lead'}</h3>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Nome Completo</label>
                <input 
                  type="text" className="btn-outline" style={{ width: '100%', height: '40px', padding: '0 0.75rem' }} 
                  value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>E-mail</label>
                <input 
                  type="email" className="btn-outline" style={{ width: '100%', height: '40px', padding: '0 0.75rem' }} 
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Telefone</label>
                  <input 
                    type="text" className="btn-outline" style={{ width: '100%', height: '40px', padding: '0 0.75rem' }} 
                    value={formData.telefone} onChange={e => setFormData({...formData, telefone: e.target.value})}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Status</label>
                  <select 
                    className="btn-outline" style={{ width: '100%', height: '40px', padding: '0 0.75rem' }} 
                    value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as LeadStatus})}
                  >
                    <option value="novo">Novo</option>
                    <option value="contatado">Contatado</option>
                    <option value="convertido">Convertido</option>
                    <option value="perdido">Perdido</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Tags (separadas por vírgula)</label>
                <input 
                  type="text" className="btn-outline" style={{ width: '100%', height: '40px', padding: '0 0.75rem' }} 
                  value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Observações</label>
                <textarea 
                  className="btn-outline" style={{ width: '100%', minHeight: '80px', padding: '0.75rem' }} 
                  value={formData.observacoes} onChange={e => setFormData({...formData, observacoes: e.target.value})}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSave}>
                  <Check size={18} /> Salvar Lead
                </button>
                <button className="btn btn-outline" style={{ flex: 1 }} onClick={closeModal}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmModal.isOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
          <div className="card" style={{ width: '400px', textAlign: 'center' }}>
            <div style={{ color: 'var(--danger)', marginBottom: '1rem' }}>
              <Trash2 size={48} style={{ margin: '0 auto' }} />
            </div>
            <h3 style={{ marginBottom: '1rem' }}>{confirmModal.title}</h3>
            <p style={{ opacity: 0.7, marginBottom: '2rem', fontSize: '1rem' }}>{confirmModal.message}</p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                className="btn" 
                style={{ flex: 1, background: 'var(--danger)', color: 'white' }} 
                onClick={confirmModal.onResolve}
              >
                Confirmar
              </button>
              <button 
                className="btn btn-outline" 
                style={{ flex: 1 }} 
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
