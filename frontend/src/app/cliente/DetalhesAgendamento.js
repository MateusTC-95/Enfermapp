import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../services/api';

export default function DetalhesAgendamento() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [agendamento, setAgendamento] = useState(null);
  const [nota, setNota] = useState(0); 
  const [avaliadoLocal, setAvaliadoLocal] = useState(false);
  const [enviandoAvaliacao, setEnviandoAvaliacao] = useState(false);
  const [mostrarAvaliacao, setMostrarAvaliacao] = useState(false);

  useEffect(() => {
    fetchDetalhes();

    // --- CONFIGURAÇÃO REALTIME ---
    const subscription = supabase
      .channel(`agendamento_cliente_${id}`)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'agendamentos', 
          filter: `id_agendamento=eq.${id}` 
        },
        (payload) => {
          console.log('Mudança detectada no Realtime:', payload);
          fetchDetalhes(); // Recarrega para garantir que os joins (profissional/serviço) venham atualizados
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [id]);

  const fetchDetalhes = async () => {
    try {
      const { data, error } = await supabase
        .from('agendamentos')
        .select(`
          *,
          profissional:id_profissional ( 
            id_profissional,
            usuario:id_usuario (nome_usuario) 
          ),
          servico:id_servico ( nome_servico )
        `)
        .eq('id_agendamento', id)
        .single();

      if (error) throw error;
      setAgendamento(data);
    } catch (error) {
      console.error("Erro ao carregar detalhes:", error);
    } finally {
      setLoading(false);
    }
  };

  const enviarAvaliacao = async () => {
    if (nota === 0) {
      Alert.alert("Aviso", "Selecione uma estrela antes de enviar.");
      return;
    }

    try {
      setEnviandoAvaliacao(true);
      
      const { data: prof, error: profError } = await supabase
        .from('profissional')
        .select('media_avaliacao, total_avaliacoes')
        .eq('id_profissional', agendamento.id_profissional)
        .single();

      if (profError) throw profError;

      const qtdAnterior = prof.total_avaliacoes || 0;
      const mediaAtual = prof.media_avaliacao || 0;
      const novaQtd = qtdAnterior + 1;
      const novaMedia = ((mediaAtual * qtdAnterior) + nota) / novaQtd;

      const { error: updateProfError } = await supabase
        .from('profissional')
        .update({ media_avaliacao: novaMedia, total_avaliacoes: novaQtd })
        .eq('id_profissional', agendamento.id_profissional);

      if (updateProfError) throw updateProfError;

      const { data: userData } = await supabase
        .from('usuario')
        .select('servicos_recebidos')
        .eq('id_usuario', agendamento.id_cliente)
        .single();

      await supabase
        .from('usuario')
        .update({ servicos_recebidos: (userData?.servicos_recebidos || 0) + 1 })
        .eq('id_usuario', agendamento.id_cliente);

      const { error: updateAgendError } = await supabase
        .from('agendamentos')
        .update({ finalizado_cliente: true })
        .eq('id_agendamento', id);

      if (updateAgendError) throw updateAgendError;

      setAvaliadoLocal(true);
    } catch (error) {
      console.error("Erro na avaliação:", error);
      Alert.alert("Erro", "Não foi possível processar sua avaliação.");
    } finally {
      setEnviandoAvaliacao(false);
    }
  };

  const getStatusAtendimento = () => {
    if (!agendamento) return { texto: "", cor: "#000", icon: "" };
    const { presenca_cliente, presenca_profissional, finalizado_cliente, finalizado_profissional } = agendamento;
    if (finalizado_cliente && finalizado_profissional) return { texto: "Finalizado", cor: "#007BFF", icon: "🔵" };
    if (finalizado_cliente || finalizado_profissional) return { texto: "Aguardando Finalização", cor: "#A020F0", icon: "🟣" };
    if (presenca_cliente && presenca_profissional) return { texto: "Em Andamento", cor: "#A020F0", icon: "🟣" };
    if (presenca_cliente || presenca_profissional) return { texto: "Confirmado", cor: "#32CD32", icon: "🟢" };
    return { texto: "Aguardando Confirmação", cor: "#FFD700", icon: "🟡" };
  };

  const getStatusPagamento = () => {
    if (!agendamento) return "";
    const { pagamento_cliente, pagamento_profissional } = agendamento;
    if (pagamento_cliente && pagamento_profissional) return "Pagamento Concluído";
    if (pagamento_cliente) return "Pagamento Informado pelo Cliente";
    if (pagamento_profissional) return "Pagamento Informado pelo Profissional";
    return "Aguardando Pagamento";
  };

  const atualizarStatus = async (coluna, valor) => {
    try {
      // Atualização Otimista local
      setAgendamento(prev => ({ ...prev, [coluna]: valor }));

      const { error } = await supabase
        .from('agendamentos')
        .update({ [coluna]: valor })
        .eq('id_agendamento', id);
      
      if (error) {
        fetchDetalhes(); // Reverte em caso de erro
        throw error;
      }
    } catch (error) {
      Alert.alert("Erro", "Falha ao atualizar status.");
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#C5005E" /></View>;

  const statusAtend = getStatusAtendimento();
  const pagamentoConcluido = agendamento.pagamento_cliente && agendamento.pagamento_profissional;

  if (mostrarAvaliacao && !avaliadoLocal) {
    return (
      <View style={styles.container}>
        <View style={styles.headerModal}>
           <TouchableOpacity onPress={() => setMostrarAvaliacao(false)}><Ionicons name="arrow-back" size={30} color="black" /></TouchableOpacity>
           <Text style={styles.headerTitle}>Avaliar Procedimento</Text>
        </View>
        <View style={styles.evalContainer}>
          <Text style={styles.evalText}>Como foi o atendimento com {agendamento.profissional?.usuario?.nome_usuario}?</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setNota(star)}>
                <Ionicons 
                  name={nota >= star ? "star" : "star-outline"} 
                  size={50} 
                  color="#FFD700" 
                />
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity 
            style={styles.btnConfirmar} 
            onPress={enviarAvaliacao}
            disabled={enviandoAvaliacao}
          >
            {enviandoAvaliacao ? <ActivityIndicator color="#000" /> : <Text style={styles.btnText}>Confirmar e Finalizar</Text>}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (avaliadoLocal) {
    return (
      <View style={[styles.container, styles.center]}>
         <Ionicons name="checkmark-circle-outline" size={120} color="#32CD32" />
         <Text style={styles.successText}>Atendimento Finalizado!</Text>
         <TouchableOpacity style={styles.btnVoltar} onPress={() => router.replace('/cliente/dashboard')}>
            <Text style={styles.btnText}>Voltar ao Início</Text>
         </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="close" size={35} color="red" /></TouchableOpacity>
        <Text style={styles.headerTitle}>{agendamento.servico?.nome_servico}</Text>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoText}>Profissional: {agendamento.profissional?.usuario?.nome_usuario}</Text>
        <Text style={styles.infoText}>Horário Marcado: {agendamento.hora_agendamento}</Text>
      </View>

      <View style={styles.statusSection}>
        <Text style={styles.sectionTitle}>Status Do Atendimento</Text>
        <View style={styles.statusRow}>
           <Text style={styles.statusLabel}>Sua confirmação: {agendamento.presenca_cliente ? "Confirmado 🟢" : "Pendente 🟡"}</Text>
           <Text style={styles.statusLabel}>Profissional: {agendamento.presenca_profissional ? "Confirmado 🟢" : "Pendente 🟡"}</Text>
        </View>
        <Text style={[styles.mainStatus, { color: statusAtend.cor }]}>{statusAtend.icon} {statusAtend.texto}</Text>
      </View>

      <View style={styles.actions}>
        {!agendamento.presenca_cliente ? (
          <TouchableOpacity style={styles.btnConfirmar} onPress={() => atualizarStatus('presenca_cliente', true)}>
            <Text style={styles.btnText}>Confirmar Presença</Text>
          </TouchableOpacity>
        ) : !agendamento.finalizado_cliente ? (
          <TouchableOpacity 
            style={styles.btnConfirmar} 
            onPress={() => {
              if(!pagamentoConcluido) {
                  Alert.alert("Aviso", "Confirme o pagamento antes de finalizar.");
              } else {
                  setMostrarAvaliacao(true);
              }
            }}
          >
            <Text style={styles.btnText}>Marcar como Finalizado</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.statusSection}>
        <View style={styles.divider} />
        <Text style={styles.sectionTitle}>Pagamento</Text>
        <Text style={styles.statusLabel}>{getStatusPagamento()}</Text>
        {!agendamento.pagamento_cliente && (
          <TouchableOpacity style={styles.btnConfirmar} onPress={() => atualizarStatus('pagamento_cliente', true)}>
            <Text style={styles.btnText}>Informar Pagamento Efetuado</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#8C8C8C' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 50, backgroundColor: '#D9D9D9' },
  headerModal: { padding: 20, paddingTop: 50, backgroundColor: '#D9D9D9', alignItems: 'center', flexDirection: 'row' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', marginLeft: 20 },
  infoSection: { padding: 25, backgroundColor: '#7A7A7A' },
  infoText: { fontSize: 18, color: '#000', marginBottom: 10, fontWeight: '500' },
  statusSection: { padding: 20, alignItems: 'center' },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
  statusRow: { width: '100%', marginBottom: 15 },
  statusLabel: { fontSize: 18, marginBottom: 5 },
  mainStatus: { fontSize: 20, fontWeight: '900', marginTop: 10 },
  actions: { padding: 20, gap: 15 },
  btnConfirmar: { backgroundColor: '#00FF00', padding: 20, borderRadius: 5, alignItems: 'center', borderWidth: 1 },
  btnVoltar: { backgroundColor: '#FF9900', padding: 20, width: '80%', borderRadius: 5, alignItems: 'center' },
  btnText: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  divider: { height: 2, backgroundColor: '#000', width: '100%', marginVertical: 20 },
  evalContainer: { flex: 1, alignItems: 'center', padding: 30, justifyContent: 'center' },
  evalText: { fontSize: 18, textAlign: 'center', marginBottom: 40 },
  starsRow: { flexDirection: 'row', marginBottom: 50 },
  successText: { fontSize: 22, fontWeight: 'bold', marginVertical: 20 },
});