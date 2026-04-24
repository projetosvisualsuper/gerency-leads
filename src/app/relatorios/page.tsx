'use client';

import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { FilaEnvio, Campaign } from '@/types/crm';
import { 
  BarChart3, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';

export default function RelatoriosPage() {
  const [queue, setQueue] = useState<FilaEnvio[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    const q = await api.getQueue();
    const c = await api.getCampaigns();
    setQueue(q);
    setCampaigns(c);
  };

  const handleProcessQueue = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setLog(['Iniciando processamento...']);
    
    await api.processQueue((msg) => {
      setLog(prev => [msg, ...prev.slice(0, 9)]);
      refreshData();
    });
    
    setIsProcessing(false);
  };

  const stats = {
    total: queue.length,
    enviados: queue.filter(q => q.status === 'enviado').length,
    pendentes: queue.filter(q => q.status === 'pendente').length,
    erros: queue.filter(q => q.status === 'erro').length
  };

  return (
    <div>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>Monitoramento de Envios</h2>
          <p style={{ opacity: 0.6 }}>Visão em tempo real da fila de processamento.</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={handleProcessQueue}
          disabled={isProcessing}
        >
          {isProcessing ? <RefreshCw className="animate-spin" size={18} /> : <CheckCircle size={18} />}
          {isProcessing ? 'Processando...' : 'Enviar Lote Agora'}
        </button>
      </header>

      {log.length > 0 && (
        <div className="card" style={{ marginBottom: '2rem', background: '#0f172a', color: '#10b981', fontFamily: 'monospace', fontSize: '0.875rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#64748b' }}>
            <span>Terminal de Envio</span>
            {isProcessing && <span className="animate-pulse">Ativo</span>}
          </div>
          {log.map((msg, i) => (
            <div key={i} style={{ opacity: 1 - (i * 0.1) }}>{`> ${msg}`}</div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-4" style={{ marginBottom: '2rem' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '0.875rem', opacity: 0.6 }}>Total na Fila</p>
          <h3 style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.total}</h3>
        </div>
        <div className="card" style={{ textAlign: 'center', borderColor: 'var(--primary)' }}>
          <p style={{ fontSize: '0.875rem', opacity: 0.6, color: 'var(--primary)' }}>Pendentes</p>
          <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{stats.pendentes}</h3>
        </div>
        <div className="card" style={{ textAlign: 'center', borderColor: 'var(--success)' }}>
          <p style={{ fontSize: '0.875rem', opacity: 0.6, color: 'var(--success)' }}>Enviados</p>
          <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--success)' }}>{stats.enviados}</h3>
        </div>
        <div className="card" style={{ textAlign: 'center', borderColor: 'var(--danger)' }}>
          <p style={{ fontSize: '0.875rem', opacity: 0.6, color: 'var(--danger)' }}>Erros</p>
          <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--danger)' }}>{stats.erros}</h3>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h4 style={{ fontWeight: 600 }}>Log de Processamento Recente</h4>
          <button className="btn btn-outline" onClick={() => setQueue(api.getQueue())}>
            <RefreshCw size={16} /> Atualizar
          </button>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Lead</th>
                <th>Campanha</th>
                <th>Status</th>
                <th>Tentativa</th>
                <th>Data Agendada</th>
                <th>Mensagem</th>
              </tr>
            </thead>
            <tbody>
              {queue.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', opacity: 0.5 }}>Fila de envio vazia.</td>
                </tr>
              )}
              {queue.slice().reverse().map(item => {
                const campaign = campaigns.find(c => c.id === item.campanhaId);
                return (
                  <tr key={item.id}>
                    <td>{item.email}</td>
                    <td>{campaign?.nome || 'Campanha Excluída'}</td>
                    <td>
                      <span style={{ 
                        padding: '0.2rem 0.5rem', 
                        borderRadius: '4px', 
                        fontSize: '0.75rem',
                        background: item.status === 'enviado' ? '#dcfce7' : item.status === 'erro' ? '#fee2e2' : '#fef9c3',
                        color: item.status === 'enviado' ? '#166534' : item.status === 'erro' ? '#991b1b' : '#854d0e'
                      }}>
                        {item.status.toUpperCase()}
                      </span>
                    </td>
                    <td>{item.tentativa}</td>
                    <td style={{ fontSize: '0.75rem' }}>{new Date(item.dataAgendada).toLocaleString('pt-BR')}</td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>{item.erroMensagem || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
