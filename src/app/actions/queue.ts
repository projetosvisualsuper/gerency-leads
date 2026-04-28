'use server';

import { db } from '@/lib/firebase';
import { 
  collection, 
  getDocs, 
  updateDoc, 
  doc, 
  query, 
  where,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { FilaEnvio, Campaign, Settings, Lead } from '@/types/crm';
import { sendEmailBrevoAction, getBrevoCreditsAction } from './brevo';

/**
 * Processa a fila de e-mails no servidor.
 * Pode ser chamado via UI ou via Cron Job.
 */
export async function processQueueServerAction() {
  console.log('Iniciando processamento de fila no servidor...');

  try {
    // 1. Buscar Configurações
    const settingsSnap = await getDoc(doc(db, 'settings', 'global'));
    if (!settingsSnap.exists()) return { success: false, message: 'Configurações não encontradas.' };
    const settings = settingsSnap.data() as Settings;

    if (!settings.brevoApiKey) return { success: false, message: 'API Key do Brevo não configurada.' };

    // 2. Verificar Campanhas Agendadas que já devem começar
    const now = new Date().toISOString();
    const scheduledQuery = query(
      collection(db, 'campaigns'),
      where('status', '==', 'agendada')
    );
    const scheduledSnap = await getDocs(scheduledQuery);
    
    for (const campaignDoc of scheduledSnap.docs) {
      const camp = campaignDoc.data() as Campaign;
      if (camp.dataAgendada && camp.dataAgendada <= now) {
        console.log(`Iniciando campanha agendada: ${camp.nome}`);
        
        // Buscar todos os leads
        const leadsSnap = await getDocs(collection(db, 'leads'));
        const leadIds: string[] = [];
        leadsSnap.forEach(d => leadIds.push(d.id));

        // Gerar fila para esta campanha
        for (const leadId of leadIds) {
          const queueId = Math.random().toString(36).substr(2, 9);
          const leadSnap = await getDoc(doc(db, 'leads', leadId));
          if (!leadSnap.exists()) continue;
          const leadData = leadSnap.data() as Lead;

          await setDoc(doc(db, 'queue', queueId), {
            id: queueId,
            campanhaId: camp.id,
            leadId: leadId,
            email: leadData.email,
            status: 'pendente',
            tentativa: 0,
            dataAgendada: now,
            prioridade: 1
          });
        }

        // Atualizar status da campanha para em execução
        await updateDoc(doc(db, 'campaigns', camp.id), {
          status: 'em execução',
          totalLeads: leadIds.length,
          totalPendentes: leadIds.length
        });
      }
    }

    // 3. Verificar limite real no Brevo
    const remainingLimit = await getBrevoCreditsAction(settings.brevoApiKey);
    if (remainingLimit <= 0) {
      return { success: false, message: `Limite diário do Brevo atingido (Créditos: ${remainingLimit}).` };
    }

    // 3. Buscar itens pendentes na fila
    const q = query(
      collection(db, 'queue'),
      where('status', 'in', ['pendente', 'erro'])
    );
    const queueSnapshot = await getDocs(q);
    
    let pendingItems: FilaEnvio[] = [];
    queueSnapshot.forEach(doc => {
      const data = doc.data() as FilaEnvio;
      if (data.status === 'pendente' || (data.status === 'erro' && data.tentativa < 3)) {
        pendingItems.push({ ...data, id: doc.id });
      }
    });

    // Pegar apenas o que cabe no limite
    pendingItems = pendingItems.slice(0, remainingLimit);

    if (pendingItems.length === 0) {
      return { success: true, message: 'Nenhum e-mail pendente para processar.' };
    }

    console.log(`Processando ${pendingItems.length} e-mails com intervalo de 5s...`);

    // 4. Buscar Campanhas e Leads necessários para o processamento
    const campaignsSnap = await getDocs(collection(db, 'campaigns'));
    const campaigns: Campaign[] = [];
    campaignsSnap.forEach(d => campaigns.push({ id: d.id, ...d.data() } as Campaign));

    const leadsSnap = await getDocs(collection(db, 'leads'));
    const leads: Lead[] = [];
    leadsSnap.forEach(d => leads.push({ id: d.id, ...d.data() } as Lead));

    let processedCount = 0;

    for (const item of pendingItems) {
      const campaign = campaigns.find(c => c.id === item.campanhaId);
      const lead = leads.find(l => l.id === item.leadId);

      if (!campaign || !lead) continue;

      // Incrementar tentativa
      const tentativaAtual = (item.tentativa || 0) + 1;

      // Enviar e-mail via Brevo
      const result = await sendEmailBrevoAction({
        apiKey: settings.brevoApiKey,
        sender: { name: settings.remetenteNome, email: settings.remetenteEmail },
        to: [{ email: lead.email, name: lead.nome }],
        subject: campaign.assunto,
        htmlContent: campaign.conteudoHtml.replace(/\{\{nome\}\}/g, lead.nome)
      });

      if (result.success) {
        await updateDoc(doc(db, 'queue', item.id), {
          status: 'enviado',
          dataEnvio: new Date().toISOString(),
          tentativa: tentativaAtual,
          erroMensagem: null
        });
        processedCount++;
      } else {
        await updateDoc(doc(db, 'queue', item.id), {
          status: 'erro',
          tentativa: tentativaAtual,
          erroMensagem: result.message
        });
      }

      // Atualizar estatísticas da campanha
      // Nota: Para escala, isso deve ser feito via transação ou função agregadora, 
      // mas para este CRM simplificado, atualizamos aqui.
      const campaignRef = doc(db, 'campaigns', campaign.id);
      const updatedCampSnap = await getDoc(campaignRef);
      if (updatedCampSnap.exists()) {
        const campData = updatedCampSnap.data() as Campaign;
        const totalEnviados = result.success ? (campData.totalEnviados + 1) : campData.totalEnviados;
        const totalPendentes = Math.max(0, campData.totalPendentes - 1);
        const totalErro = (!result.success && tentativaAtual >= 3) ? (campData.totalErro + 1) : campData.totalErro;
        
        await updateDoc(campaignRef, {
          totalEnviados,
          totalPendentes,
          totalErro,
          status: totalPendentes === 0 ? 'concluída' : 'em execução'
        });
      }

      // Intervalo de 5 segundos entre envios conforme pedido pelo usuário
      if (processedCount < pendingItems.length) {
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    return { 
      success: true, 
      message: `Processamento concluído. ${processedCount} e-mails enviados.` 
    };

  } catch (error: any) {
    console.error('Erro no processador de fila:', error);
    return { success: false, message: error.message };
  }
}
