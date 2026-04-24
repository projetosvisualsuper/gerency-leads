'use client';

import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Lead, Campaign, FilaEnvio } from '@/types/crm';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Mail, 
  Send, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  PlusCircle,
  Upload,
  X,
  Zap
} from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importStatus, setImportStatus] = useState('');
  
  interface DashboardStats {
    totalLeads: number;
    leadsHoje: number;
    totalCampaigns: number;
    enviadosHoje: number;
    pendentes: number;
    limiteRestante: number;
  }

  const [stats, setStats] = useState<DashboardStats>({
    totalLeads: 0,
    leadsHoje: 0,
    totalCampaigns: 0,
    enviadosHoje: 0,
    pendentes: 0,
    limiteRestante: 0
  });

  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);

  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportStatus('Processando arquivo...');
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      let count = 0;
      
      lines.forEach((line, i) => {
        if (i === 0 || !line.trim()) return; // Skip header/empty
        const [nome, email, telefone] = line.split(',');
        if (email && email.includes('@')) {
          api.saveLead({
            id: Math.random().toString(36).substr(2, 9),
            nome: nome?.trim() || 'Importado',
            email: email.trim(),
            telefone: telefone?.trim(),
            origem: 'Importação CSV',
            dataCriacao: new Date().toISOString(),
            status: 'novo',
            tags: ['csv-import'],
            consentimentoLGPD: true
          });
          count++;
        }
      });
      
      setImportStatus(`${count} leads importados com sucesso!`);
      setTimeout(() => {
        setIsImportModalOpen(false);
        setImportStatus('');
        window.location.reload(); // Refresh to show new leads
      }, 2000);
    };
    reader.readAsText(file);
  };

  useEffect(() => {
    const loadStats = async () => {
      const leads = await api.getLeads();
      const campaigns = await api.getCampaigns();
      const queue = await api.getQueue();
      const sentToday = await api.getSentTodayCount();
      const settings = await api.getSettings();

      const today = new Date().toISOString().split('T')[0];
      const leadsHoje = leads.filter(l => l.dataCriacao.startsWith(today)).length;

      setStats({
        totalLeads: leads.length,
        leadsHoje: leadsHoje,
        totalCampaigns: campaigns.length,
        enviadosHoje: sentToday,
        pendentes: queue.filter(q => q.status === 'pendente' || (q.status === 'erro' && q.tentativa < 3)).length,
        limiteRestante: settings.limiteDiario - sentToday
      });

      setRecentLeads(leads.slice(0, 5));
    };

    loadStats();
  }, []);

  return (
    <div>
      <header style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>Dashboard Overview</h2>
        <p style={{ opacity: 0.6 }}>Bem-vindo ao seu centro de comando de marketing.</p>
      </header>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(5, 1fr)', 
        gap: '1rem', 
        marginBottom: '3rem' 
      }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '0.75rem', borderRadius: '50%', color: 'var(--primary)' }}>
            <Users size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.875rem', opacity: 0.6 }}>Total Leads</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.totalLeads}</h3>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid var(--success)', background: 'rgba(16, 185, 129, 0.05)' }}>
          <div style={{ background: 'var(--success)', padding: '0.75rem', borderRadius: '50%', color: 'white' }}>
            <Zap size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.875rem', opacity: 0.6 }}>Leads Hoje</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--success)' }}>+{stats.leadsHoje}</h3>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(129, 140, 248, 0.1)', padding: '0.75rem', borderRadius: '50%', color: '#818cf8' }}>
            <Mail size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.875rem', opacity: 0.6 }}>Campanhas</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.totalCampaigns}</h3>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '0.75rem', borderRadius: '50%', color: 'var(--warning)' }}>
            <Clock size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.875rem', opacity: 0.6 }}>Fila Pendente</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.pendentes}</h3>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid var(--primary)', background: 'rgba(99, 102, 241, 0.05)' }}>
          <div style={{ background: 'var(--primary)', padding: '0.75rem', borderRadius: '50%', color: 'white' }}>
            <Send size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.875rem', opacity: 0.6 }}>Créditos Dia</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>{stats.limiteRestante}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2">
        <div className="card">
          <h4 style={{ marginBottom: '1.5rem', fontWeight: 600 }}>Leads Recentes</h4>
          <div className="table-container" style={{ border: 'none' }}>
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentLeads.map(lead => (
                  <tr key={lead.id}>
                    <td>{lead.nome}</td>
                    <td>{lead.email}</td>
                    <td>
                      <span className={`badge badge-${lead.status}`}>
                        {lead.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h4 style={{ marginBottom: '1.5rem', fontWeight: 600 }}>Ações Rápidas</h4>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <button className="btn btn-outline" style={{ justifyContent: 'flex-start' }} onClick={() => router.push('/campanhas')}>
              <PlusCircle size={18} /> Criar Nova Campanha
            </button>
            <button className="btn btn-outline" style={{ justifyContent: 'flex-start' }} onClick={() => setIsImportModalOpen(true)}>
              <Users size={18} /> Importar Leads CSV
            </button>
            <button className="btn btn-outline" style={{ justifyContent: 'flex-start' }} onClick={() => router.push('/relatorios')}>
              <Mail size={18} /> Ver Relatório de Envios
            </button>
          </div>
        </div>
      </div>

      {isImportModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card" style={{ width: '400px', position: 'relative' }}>
            <button style={{ position: 'absolute', right: '1rem', top: '1rem', opacity: 0.5 }} onClick={() => setIsImportModalOpen(false)}>
              <X size={20} />
            </button>
            <h3 style={{ marginBottom: '1.5rem' }}>Importar via CSV</h3>
            <p style={{ fontSize: '0.875rem', opacity: 0.6, marginBottom: '1.5rem' }}>
              O arquivo deve conter as colunas: <strong>nome, email, telefone</strong> na primeira linha.
            </p>
            
            <div style={{ border: '2px dashed var(--border)', borderRadius: 'var(--radius)', padding: '2rem', textAlign: 'center', cursor: 'pointer' }} onClick={() => document.getElementById('csv-file')?.click()}>
              <Upload size={32} style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
              <p>{importStatus || 'Clique para selecionar arquivo .csv'}</p>
              <input 
                id="csv-file" 
                type="file" 
                accept=".csv" 
                hidden 
                onChange={handleCSVImport}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
