import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../services/api';

export default function DetalhesAgendamentoProfissional() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [agendamento, setAgendamento] = useState(null);

  // Função para buscar dados
  const fetchDetalhes = async () => {
    try {
      const { data, error } = await supabase
        .from('agendamentos')
        .select(`
          *,
          cliente:id_cliente ( nome_usuario, telefone ),
          servico:id_servico ( nome_servico )
        `)
        .eq('id_agendamento', id)
        .single();

      if (error) throw error;
      setAgendamento(data);
    } catch (error) {
      console.error("Erro ao buscar detalhes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetalhes();

    // CONFIGURAÇÃO DO REALTIME
    const canal = supabase
      .channel(`prof_realtime_${id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'agendamentos', filter: `id_agendamento=eq.${id}` },
        (payload) => {
          console.log("Mudança detectada no banco:", payload);
          fetchDetalhes(); // Recarrega tudo quando houver mudança
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, [id]);

  const atualizarStatus = async (coluna, valor) => {
    try {
      // Atualização otimista (muda na tela antes de ir pro banco)
      setAgendamento(prev => ({ ...prev, [coluna]: valor }));

      const { error } = await supabase
        .from('agendamentos')
        .update({ [coluna]: valor })
        .eq('id_agendamento', id);
      
      if (error) throw error;
    } catch (error) {
      Alert.alert("Erro", "Falha ao atualizar status.");
      fetchDetalhes(); // Volta ao estado original em caso de erro
    }
  };

  const getStatusAtendimento = () => {
    if (!agendamento) return { texto: "", cor: "#000", icon: "" };
    const { presenca_cliente, presenca_profissional, finalizado_cliente, finalizado_profissional } = agendamento;
    
    if (finalizado_cliente && finalizado_profissional) return { texto: "Finalizado", cor: "#007BFF", icon: "🔵" };
    if (finalizado_cliente || finalizado_profissional) return { texto: "Aguardando Outra Parte", cor: "#A020F0", icon: "🟣" };
    if (presenca_cliente && presenca_profissional) return { texto: "Em Andamento", cor: "#A020F0", icon: "🟣" };
    if (presenca_cliente || presenca_profissional) return { texto: "Confirmado", cor: "#32CD32", icon: "🟢" };
    return { texto: "Aguardando Confirmação", cor: "#FFD700", icon: "🟡" };
  };

  const getStatusPagamento = () => {
  if (!agendamento) return "";
  const { pagamento_cliente, pagamento_profissional } = agendamento;

  if (pagamento_cliente && pagamento_profissional) return "Recebimento Confirmado ✅";
  if (pagamento_cliente && !pagamento_profissional) return "Pagamento Informado pelo Cliente 🔔";
  if (!pagamento_cliente && pagamento_profissional) return "Recebimento Confirmado (Manual) ✅";
  return "Aguardando Pagamento ⏳";
};

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#00FFFF" /></View>;

  const statusAtend = getStatusAtendimento();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="close" size={35} color="red" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Atendimento Profissional</Text>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoText}>Cliente: {agendamento.cliente?.nome_usuario}</Text>
        <Text style={styles.infoText}>Horário: {agendamento.hora_agendamento}</Text>
        <Text style={styles.infoText}>Local: {agendamento.endereco}</Text>
      </View>

      <View style={styles.statusSection}>
        <Text style={styles.sectionTitle}>Status Do Atendimento</Text>
        <View style={styles.statusRow}>
           <Text style={styles.statusLabel}>Sua confirmação: {agendamento.presenca_profissional ? "Confirmado 🟢" : "Pendente 🟡"}</Text>
           <Text style={styles.statusLabel}>Cliente: {agendamento.presenca_cliente ? "Confirmado 🟢" : "Pendente 🟡"}</Text>
        </View>
        <Text style={[styles.mainStatus, { color: statusAtend.cor }]}>{statusAtend.icon} {statusAtend.texto}</Text>
      </View>

      <View style={styles.actions}>
        {!agendamento.presenca_profissional ? (
          <TouchableOpacity style={styles.btnConfirmar} onPress={() => atualizarStatus('presenca_profissional', true)}>
            <Text style={styles.btnText}>Confirmar Minha Chegada</Text>
          </TouchableOpacity>
        ) : !agendamento.finalizado_profissional ? (
          <TouchableOpacity style={[styles.btnConfirmar, { backgroundColor: '#00FFFF' }]} onPress={() => atualizarStatus('finalizado_profissional', true)}>
            <Text style={styles.btnText}>Marcar como Concluído</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.center}>
             <Ionicons name="checkmark-done-circle" size={50} color="#32CD32" />
             <Text style={styles.infoText}>Aguardando cliente finalizar.</Text>
          </View>
        )}
      </View>

      <View style={styles.statusSection}>
        <View style={styles.divider} />
        <Text style={styles.sectionTitle}>Pagamento</Text>
        <Text style={styles.statusLabel}>
            {agendamento.pagamento_profissional ? "Recebimento Confirmado" : "Aguardando Recebimento"}
        </Text>
        {!agendamento.pagamento_profissional && (
          <TouchableOpacity style={[styles.btnConfirmar, { backgroundColor: '#FFA500' }]} onPress={() => atualizarStatus('pagamento_profissional', true)}>
            <Text style={styles.btnText}>Confirmar Recebimento</Text>
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
  headerTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 20 },
  infoSection: { padding: 25, backgroundColor: '#7A7A7A' },
  infoText: { fontSize: 18, color: '#FFF', marginBottom: 10, fontWeight: '500' },
  statusSection: { padding: 20, alignItems: 'center' },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFF', marginBottom: 15 },
  statusRow: { width: '100%', marginBottom: 15 },
  statusLabel: { fontSize: 18, marginBottom: 5, color: '#FFF' },
  mainStatus: { fontSize: 20, fontWeight: '900', marginTop: 10 },
  actions: { padding: 20, gap: 15 },
  btnConfirmar: { backgroundColor: '#00FF00', padding: 20, borderRadius: 5, alignItems: 'center', borderWidth: 1 },
  btnText: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  divider: { height: 2, backgroundColor: '#000', width: '100%', marginVertical: 20 },
});