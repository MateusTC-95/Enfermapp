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
  const [avaliado, setAvaliado] = useState(false);
  const [enviandoAvaliacao, setEnviandoAvaliacao] = useState(false);

  useEffect(() => {
    fetchDetalhes();
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
      Alert.alert("Erro", "Não foi possível carregar o agendamento.");
    } finally {
      setLoading(false);
    }
  };

  // --- NOVA FUNÇÃO: ENVIAR AVALIAÇÃO COM LOGS ---
  const enviarAvaliacao = async () => {
    if (nota === 0) {
      Alert.alert("Aviso", "Selecione uma estrela antes de enviar.");
      return;
    }

    try {
      setEnviandoAvaliacao(true);
      console.log("--- INICIANDO PROCESSO DE AVALIAÇÃO ---");
      console.log("ID Profissional:", agendamento.id_profissional);
      console.log("ID Cliente:", agendamento.id_cliente);

      // 1. Buscar dados atuais do profissional para o cálculo
      const { data: prof, error: profError } = await supabase
        .from('profissional')
        .select('media_avaliacao, total_avaliacoes')
        .eq('id_profissional', agendamento.id_profissional)
        .single();

      if (profError) {
        console.error("Erro ao buscar profissional no BD:", profError.message);
        throw profError;
      }

      console.log("Dados atuais do Prof no BD:", prof);

      const qtdAnterior = prof.total_avaliacoes || 0;
      const mediaAtual = prof.media_avaliacao || 0;
      const novaQtd = qtdAnterior + 1;
      const novaMedia = ((mediaAtual * qtdAnterior) + nota) / novaQtd;

      console.log(`Calculando: Nova Qtd: ${novaQtd}, Nova Média: ${novaMedia}`);

      // 2. Atualizar tabela Profissional
      const { error: updateProfError } = await supabase
        .from('profissional')
        .update({ 
          media_avaliacao: novaMedia, 
          total_avaliacoes: novaQtd 
        })
        .eq('id_profissional', agendamento.id_profissional);

      if (updateProfError) {
        console.error("Erro ao dar Update no Profissional:", updateProfError.message);
        throw updateProfError;
      }
      console.log("✅ Tabela Profissional atualizada!");

      // 3. Atualizar tabela Usuario (Serviços Recebidos do Cliente)
      const { data: userData, error: userFetchError } = await supabase
        .from('usuario')
        .select('servicos_recebidos')
        .eq('id_usuario', agendamento.id_cliente)
        .single();

      if (userFetchError) console.error("Erro ao buscar dados do cliente:", userFetchError.message);

      const { error: updateUserError } = await supabase
        .from('usuario')
        .update({ servicos_recebidos: (userData?.servicos_rece_bidos || 0) + 1 })
        .eq('id_usuario', agendamento.id_cliente);

      if (updateUserError) {
        console.error("Erro ao atualizar servicos_recebidos do cliente:", updateUserError.message);
      } else {
        console.log("✅ Tabela Usuario (Cliente) atualizada!");
      }

      setAvaliado(true);
    } catch (error) {
      console.error("Erro Geral na Função enviarAvaliacao:", error);
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
    const { pagamento_cliente, pagamento_profissional } = agendamento;
    if (pagamento_cliente && pagamento_profissional) return "Pagamento Concluído";
    if (pagamento_cliente) return "Pagamento Informado pelo Cliente";
    if (pagamento_profissional) return "Pagamento Informado pelo Profissional";
    return "Aguardando Pagamento";
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

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#C5005E" /></View>;

  const statusAtend = getStatusAtendimento();
  const todosFinalizados = agendamento.finalizado_cliente && agendamento.finalizado_profissional;
  const pagamentoConcluido = agendamento.pagamento_cliente && agendamento.pagamento_profissional;

  // --- RENDER DA AVALIAÇÃO ---
  if (todosFinalizados && pagamentoConcluido && !avaliado) {
    return (
      <View style={styles.container}>
        <View style={styles.headerModal}>
           <TouchableOpacity onPress={() => router.back()}><Ionicons name="close" size={30} color="red" /></TouchableOpacity>
           <Text style={styles.headerTitle}>Avaliar Procedimento</Text>
        </View>
        <View style={styles.evalContainer}>
          <Text style={styles.evalText}>Avalie o atendimento recebido para ajudar outros usuários.</Text>
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
            {enviandoAvaliacao ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.btnText}>Enviar Avaliação</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (avaliado) {
    return (
      <View style={[styles.container, styles.center]}>
         <Ionicons name="checkmark-circle-outline" size={120} color="#32CD32" />
         <Text style={styles.successText}>Avaliação Enviada com sucesso</Text>
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
        <Text style={styles.infoText}>Serviço: {agendamento.servico?.nome_servico}</Text>
        <Text style={styles.infoText}>Horário Marcado: {agendamento.hora_agendamento}</Text>
      </View>

      <View style={styles.statusSection}>
        <Text style={styles.sectionTitle}>Status Do Atendimento</Text>
        <View style={styles.statusRow}>
           <Text style={styles.statusLabel}>Cliente: {agendamento.presenca_cliente ? "Confirmado 🟢" : "Aguardando Confirmação 🟡"}</Text>
           <Text style={styles.statusLabel}>Profissional: {agendamento.presenca_profissional ? "Confirmado 🟢" : "Aguardando Confirmação 🟡"}</Text>
        </View>
        <Text style={[styles.mainStatus, { color: statusAtend.cor }]}>{statusAtend.icon} {statusAtend.texto}</Text>
      </View>

      <View style={styles.actions}>
        {!agendamento.presenca_cliente ? (
          <>
            <TouchableOpacity style={styles.btnConfirmar} onPress={() => atualizarStatus('presenca_cliente', true)}>
              <Text style={styles.btnText}>Confirmar Presença</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnCancelar} onPress={() => Alert.alert("Cancelar", "Deseja cancelar?")}>
              <Text style={styles.btnText}>Cancelar Procedimento</Text>
            </TouchableOpacity>
          </>
        ) : !agendamento.finalizado_cliente ? (
          <>
            <TouchableOpacity style={styles.btnConfirmar} onPress={() => atualizarStatus('finalizado_cliente', true)}>
              <Text style={styles.btnText}>Marcar como Finalizado</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnIntercorrencia}>
              <Text style={styles.btnText}>Abrir Intercorrência</Text>
            </TouchableOpacity>
          </>
        ) : null}
      </View>

      {!pagamentoConcluido && (
        <View style={styles.statusSection}>
          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Status Do Pagamento</Text>
          <Text style={styles.statusLabel}>{getStatusPagamento()}</Text>
          {!agendamento.pagamento_cliente && (
            <TouchableOpacity style={styles.btnConfirmar} onPress={() => atualizarStatus('pagamento_cliente', true)}>
              <Text style={styles.btnText}>Marcar Pagamento como Efetuado</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
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
  btnCancelar: { backgroundColor: '#FF0000', padding: 20, borderRadius: 5, alignItems: 'center', borderWidth: 1 },
  btnIntercorrencia: { backgroundColor: '#FFA500', padding: 20, borderRadius: 5, alignItems: 'center', borderWidth: 1 },
  btnVoltar: { backgroundColor: '#FF9900', padding: 20, width: '80%', borderRadius: 5, alignItems: 'center' },
  btnText: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  divider: { height: 2, backgroundColor: '#000', width: '100%', marginVertical: 20 },
  evalContainer: { flex: 1, alignItems: 'center', padding: 30, justifyContent: 'center' },
  evalText: { fontSize: 18, textAlign: 'center', marginBottom: 40 },
  starsRow: { flexDirection: 'row', marginBottom: 50 },
  successText: { fontSize: 22, fontWeight: 'bold', marginVertical: 20 },
});