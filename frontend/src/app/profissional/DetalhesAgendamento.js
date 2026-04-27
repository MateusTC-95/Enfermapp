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

  useEffect(() => {
    fetchDetalhes();
  }, [id]);

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
      Alert.alert("Erro", "Não foi possível carregar o agendamento.");
    } finally {
      setLoading(false);
    }
  };

  const atualizarStatus = async (coluna, valor) => {
    try {
      const { error } = await supabase
        .from('agendamentos')
        .update({ [coluna]: valor })
        .eq('id_agendamento', id);
      if (error) throw error;
      fetchDetalhes();
    } catch (error) {
      Alert.alert("Erro", "Falha ao atualizar status.");
    }
  };

  const getStatusAtendimento = () => {
    const { finalizado_cliente, finalizado_profissional, presenca_cliente, presenca_profissional } = agendamento;
    if (finalizado_cliente && finalizado_profissional) return { texto: "Finalizado", cor: "#007BFF", icon: "🔵" };
    if (finalizado_cliente || finalizado_profissional) return { texto: "Aguardando Outra Parte", cor: "#A020F0", icon: "🟣" };
    if (presenca_cliente && presenca_profissional) return { texto: "Em Andamento", cor: "#A020F0", icon: "🟣" };
    return { texto: "Confirmado", cor: "#32CD32", icon: "🟢" };
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#00FFFF" /></View>;

  const statusAtend = getStatusAtendimento();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={30} color="#000" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes do Atendimento</Text>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoText}>Cliente: {agendamento.cliente?.nome_usuario}</Text>
        <Text style={styles.infoText}>Serviço: {agendamento.servico?.nome_servico}</Text>
        <Text style={styles.infoText}>Horário: {agendamento.hora_agendamento}</Text>
        <Text style={styles.infoText}>Local: {agendamento.endereco}</Text>
      </View>

      <View style={styles.statusSection}>
        <Text style={styles.sectionTitle}>Status Atual</Text>
        <Text style={[styles.mainStatus, { color: statusAtend.cor }]}>{statusAtend.icon} {statusAtend.texto}</Text>
      </View>

      <View style={styles.actions}>
        {/* LÓGICA DE PRESENÇA DO PROFISSIONAL */}
        {!agendamento.presenca_profissional ? (
          <TouchableOpacity style={styles.btnConfirmar} onPress={() => atualizarStatus('presenca_profissional', true)}>
            <Text style={styles.btnText}>Confirmar Minha Chegada</Text>
          </TouchableOpacity>
        ) : !agendamento.finalizado_profissional ? (
          /* LÓGICA DE FINALIZAÇÃO DO PROFISSIONAL */
          <TouchableOpacity style={[styles.btnConfirmar, { backgroundColor: '#00FFFF' }]} onPress={() => atualizarStatus('finalizado_profissional', true)}>
            <Text style={styles.btnText}>Marcar como Concluído</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.finalizadoBox}>
            <Ionicons name="checkmark-done-circle" size={50} color="#32CD32" />
            <Text style={styles.finalizadoText}>Você já finalizou este atendimento.</Text>
          </View>
        )}

        {/* LÓGICA DE PAGAMENTO (PARTE DO PROFISSIONAL) */}
        {!agendamento.pagamento_profissional && (
           <TouchableOpacity style={[styles.btnIntercorrencia, { marginTop: 20 }]} onPress={() => atualizarStatus('pagamento_profissional', true)}>
             <Text style={styles.btnText}>Confirmar Recebimento do Pagamento</Text>
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
  headerTitle: { fontSize: 20, fontWeight: 'bold', marginLeft: 20 },
  infoSection: { padding: 25, backgroundColor: '#7A7A7A' },
  infoText: { fontSize: 18, color: '#FFF', marginBottom: 10, fontWeight: '500' },
  statusSection: { padding: 20, alignItems: 'center' },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFF', marginBottom: 15 },
  mainStatus: { fontSize: 20, fontWeight: '900' },
  actions: { padding: 20 },
  btnConfirmar: { backgroundColor: '#00FF00', padding: 20, borderRadius: 10, alignItems: 'center', elevation: 5 },
  btnIntercorrencia: { backgroundColor: '#FFA500', padding: 20, borderRadius: 10, alignItems: 'center' },
  btnText: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  finalizadoBox: { alignItems: 'center', padding: 20 },
  finalizadoText: { color: '#FFF', fontSize: 16, marginTop: 10, fontWeight: 'bold' }
});