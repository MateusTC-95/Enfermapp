// DetalhesIntercorrenciasAdmin
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../services/api';

export default function DetalhesIntercorrenciasAdmin() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchDetalhes();
    }
  }, [id]);

  const fetchDetalhes = async () => {
    try {
      const { data, error } = await supabase
        .from('intercorrencia')
        .select(`
          *,
          agendamentos (
            id_agendamento,
            servico:id_servico ( nome_servico ),
            cliente:id_cliente ( id_usuario, nome_usuario, advertencias ),
            profissional:id_profissional ( id_usuario, advertencias, usuario:id_usuario ( nome_usuario ) )
          )
        `)
        .eq('id_intercorrencia', Number(id))
        .single();

      if (error) throw error;
      setData(data);
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Falha ao carregar detalhes.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdvertencia = async (tipoAlvo) => {
    const alvo = tipoAlvo === 'cliente' ? data.agendamentos.cliente : data.agendamentos.profissional;
    const novasAdvertencias = (alvo.advertencias || 0) + 1;

    try {
      setLoading(true);
      
      // 1. Atualiza contador de avisos na tabela de usuários
      await supabase
        .from('usuario')
        .update({ advertencias: novasAdvertencias })
        .eq('id_usuario', alvo.id_usuario);

      // 2. Registra o veredito salvando a data em formato ISO
      const { data: updateData, error } = await supabase
        .from('intercorrencia')
        .update({ 
          status: 'resolvido', 
          veredito: `Advertência aplicada ao ${tipoAlvo}`,
          encerrada_em: new Date().toISOString() 
        })
        .eq('id_intercorrencia', Number(id))
        .select();

      if (error) throw error;

      if (!updateData || updateData.length === 0) {
        Alert.alert("Aviso", "Nenhum registro foi alterado no banco de dados.");
        return;
      }

      Alert.alert("Sucesso", `Advertência aplicada com sucesso.`);
      router.back();
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Falha ao processar punição.");
    } finally {
      setLoading(false);
    }
  };

  // Função para encerrar o chamado sem punições (Inocentes)
  const encerrarSemPunir = async () => {
    try {
      setLoading(true);
      
      const { data: updateData, error } = await supabase
        .from('intercorrencia')
        .update({ 
          status: 'resolvido', 
          veredito: 'Caso encerrado sem aplicação de penalidades.',
          encerrada_em: new Date().toISOString() 
        })
        .eq('id_intercorrencia', Number(id))
        .select();

      if (error) throw error;

      if (!updateData || updateData.length === 0) {
        Alert.alert("Aviso", "O chamado não pôde ser fechado no banco de dados.");
        return;
      }

      Alert.alert("Sucesso", "Chamado encerrado com sucesso.");
      router.back();
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Falha ao encerrar chamado.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#000" /></View>;

  // Identifica quem abriu
  const ehClienteReclamante = data?.aberta_por === 'cliente';
  
  const nomeReclamante = ehClienteReclamante 
    ? data?.agendamentos?.cliente?.nome_usuario 
    : data?.agendamentos?.profissional?.usuario?.nome_usuario;

  const nomeDefesa = ehClienteReclamante 
    ? data?.agendamentos?.profissional?.usuario?.nome_usuario 
    : data?.agendamentos?.cliente?.nome_usuario;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="chevron-back" size={35} color="black" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Julgamento #{data?.id_intercorrencia}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* --- SEÇÃO DO RECLAMANTE --- */}
        <View style={[styles.card, styles.cardReclamante]}>
          <Text style={styles.sectionTitle}>
            Versão do Reclamante ({nomeReclamante} - {data?.aberta_por?.toUpperCase()})
          </Text>
          <Text style={styles.motivoTag}>{data?.motivo_categoria || 'Não Especificado'}</Text>
          <Text style={styles.descricaoTxt}>{data?.descricao || "Sem descrição detalhada."}</Text>
          
          {data?.imagem_url ? (
            <Image source={{ uri: data.imagem_url }} style={styles.img} resizeMode="contain" />
          ) : (
            <Text style={styles.semProva}>Nenhuma foto enviada pelo reclamante.</Text>
          )}
        </View>

        <Ionicons name="swap-vertical" size={30} color="#ccc" style={{ marginVertical: 10 }} />

        {/* --- SEÇÃO DA DEFESA --- */}
        <View style={[styles.card, styles.cardDefesa]}>
          <Text style={styles.sectionTitle}>
            Defesa da Contraparte ({nomeDefesa} - {ehClienteReclamante ? 'PROFISSIONAL' : 'CLIENTE'})
          </Text>
          
          {data?.defesa_descricao ? (
            <>
              <Text style={styles.descricaoTxt}>{data.defesa_descricao}</Text>
              {data?.defesa_imagem_url ? (
                <Image source={{ uri: data.defesa_imagem_url }} style={styles.img} resizeMode="contain" />
              ) : (
                <Text style={styles.semProva}>Não foram anexadas fotos na resposta de defesa.</Text>
              )}
            </>
          ) : (
            <View style={styles.aguardando}>
              <Ionicons name="time-outline" size={24} color="#666" />
              <Text style={styles.aguardandoTxt}>A contraparte ainda não enviou uma resposta de defesa.</Text>
            </View>
          )}
        </View>

        {/* --- BOTÕES DE AÇÃO --- */}
        <View style={styles.actions}>
          <Text style={styles.alerta}>Tomar Decisão Final:</Text>
          
          <TouchableOpacity 
            style={[styles.actionBtn, {backgroundColor: '#2ecc71'}]}
            onPress={() => Alert.alert("Encerrar", "Encerrar sem punir ninguém?", [
              {text: "Cancelar", style: "cancel"},
              {text: "Sim", onPress: encerrarSemPunir}
            ])}
          >
            <Text style={styles.actionBtnText}>Encerrar Chamado (Inocentes)</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionBtn, {backgroundColor: '#e67e22'}]}
            onPress={() => handleAdvertencia('cliente')}
          >
            <Text style={styles.actionBtnText}>Punir Cliente ({data?.agendamentos?.cliente?.nome_usuario})</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionBtn, {backgroundColor: '#e74c3c'}]}
            onPress={() => handleAdvertencia('profissional')}
          >
            <Text style={styles.actionBtnText}>Punir Profissional ({data?.agendamentos?.profissional?.usuario?.nome_usuario})</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f0f0' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: '#fff', elevation: 3 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', marginLeft: 10 },
  content: { padding: 15, alignItems: 'center' },
  card: { backgroundColor: '#fff', width: '100%', padding: 15, borderRadius: 10, marginBottom: 15, elevation: 2 },
  cardReclamante: { borderTopColor: '#dc2626', borderTopWidth: 5 },
  cardDefesa: { borderTopColor: '#5d5dff', borderTopWidth: 5 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  motivoTag: { backgroundColor: '#fee2e2', color: '#dc2626', padding: 5, borderRadius: 5, alignSelf: 'flex-start', fontWeight: 'bold', marginBottom: 10 },
  descricaoTxt: { fontSize: 15, color: '#444', lineHeight: 22, marginBottom: 10 },
  img: { width: '100%', height: 250, backgroundColor: '#eee', borderRadius: 8, marginTop: 10 },
  semProva: { fontStyle: 'italic', color: '#999', marginTop: 10 },
  aguardando: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9f9f9', padding: 15, borderRadius: 8, marginTop: 10 },
  aguardandoTxt: { marginLeft: 10, color: '#666', fontStyle: 'italic' },
  actions: { width: '100%', marginTop: 20, paddingBottom: 40 },
  alerta: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15, textAlign: 'center' },
  actionBtn: { width: '100%', padding: 16, marginBottom: 12, alignItems: 'center', borderRadius: 8 },
  actionBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});