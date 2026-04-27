import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../services/api';

export default function DetalhesSolicitacao() {
  const router = useRouter();
  const { idAgendamento } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [agendamento, setAgendamento] = useState(null);

  useEffect(() => {
    fetchDetalhes();
  }, [idAgendamento]);

  const fetchDetalhes = async () => {
    try {
      const { data, error } = await supabase
        .from('agendamentos')
        .select(`
          *,
          usuario:id_cliente (nome_usuario),
          servico:id_servico (nome_servico)
        `)
        .eq('id_agendamento', idAgendamento)
        .single();

      if (error) throw error;
      setAgendamento(data);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar os detalhes.");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const responder = async (novoStatus) => {
    try {
      const { error } = await supabase
        .from('agendamentos')
        .update({ status: novoStatus })
        .eq('id_agendamento', idAgendamento);

      if (error) throw error;

      const aprovou = novoStatus === 'confirmado';
      const acaoPalavra = aprovou ? 'ACEITOU' : 'RECUSOU';
      const tituloAlerta = aprovou ? "Sucesso!" : "Solicitação Negada";
      
      const msg = `Você ${acaoPalavra} o atendimento de ${agendamento?.usuario?.nome_usuario || 'Cliente'}.`;

      // Ao clicar em OK no alerta, ele redireciona para as notificações
      Alert.alert(
        tituloAlerta, 
        msg,
        [{ 
          text: "OK", 
          onPress: () => {
            // Usamos replace para garantir que ele saia da pilha de "detalhes" 
            // e volte para a lista atualizada
            router.replace('/profissional/notificacoes'); 
          } 
        }]
      );

    } catch (error) {
      Alert.alert("Erro", "Falha ao atualizar status.");
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#C5005E" /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close-outline" size={40} color="red" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Solicitação de Atendimento</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.infoBox}>
          <Text style={styles.textoInfo}>Agendado Por: <Text style={styles.bold}>{agendamento?.usuario?.nome_usuario}</Text></Text>
          <Text style={styles.textoInfo}>Serviço: <Text style={styles.bold}>{agendamento?.servico?.nome_servico}</Text></Text>
          <Text style={styles.textoInfo}>Horário Marcado: <Text style={styles.bold}>{agendamento?.hora_agendamento}</Text></Text>
          <Text style={styles.textoInfo}>Endereço: <Text style={styles.bold}>{agendamento?.endereco}</Text></Text>
          <Text style={styles.textoInfo}>Tipo de Pagamento: <Text style={styles.bold}>{agendamento?.metodo_pagamento}</Text></Text>
        </View>

        <View style={styles.descBox}>
          <Text style={styles.label}>• Descrição do Procedimento</Text>
          <View style={styles.whiteCard}>
            <Text style={styles.descText}>{agendamento?.observacao || "Nenhuma observação informada."}</Text>
          </View>
        </View>

        {/* Botão Aceitar */}
        <TouchableOpacity 
          activeOpacity={0.8}
          style={[styles.btnAcao, { backgroundColor: '#00FF00' }]} 
          onPress={() => responder('confirmado')}
        >
          <Text style={styles.btnText}>Aceitar Atendimento</Text>
        </TouchableOpacity>

        {/* Botão Recusar */}
        <TouchableOpacity 
          activeOpacity={0.8}
          style={[styles.btnAcao, { backgroundColor: '#FF0000', marginTop: 20 }]} 
          onPress={() => responder('cancelado')}
        >
          <Text style={styles.btnText}>Recusar Atendimento</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#8C8C8C' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#8C8C8C' },
  header: { 
    paddingTop: 50, 
    backgroundColor: '#D9D9D9', 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 15, 
    paddingBottom: 10,
    elevation: 2
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
  content: { padding: 20 },
  infoBox: { marginBottom: 20 },
  textoInfo: { fontSize: 22, color: 'black', marginBottom: 8 },
  bold: { fontWeight: 'bold' },
  descBox: { marginTop: 10, marginBottom: 30 },
  label: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  whiteCard: { 
    backgroundColor: '#D9D9D9', 
    padding: 20, 
    borderRadius: 5, 
    minHeight: 150, 
    borderWidth: 1, 
    borderColor: '#666',
    justifyContent: 'center'
  },
  descText: { fontSize: 22, textAlign: 'center', color: '#000' },
  btnAcao: { 
    width: '100%', 
    padding: 25, 
    borderRadius: 5, 
    alignItems: 'center', 
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  btnText: { fontSize: 24, fontWeight: 'bold', color: 'black' }
});