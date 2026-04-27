import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../services/api';
import { useFocusEffect, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Notificacoes() {
  const router = useRouter();
  const [notificacoes, setNotificacoes] = useState([]);
  const [loading, setLoading] = useState(true);

  const buscarDados = async () => {
    try {
      setLoading(true);
      const nomeLogado = await AsyncStorage.getItem('nome_logado');

      // 1. Pegar ID do profissional
      const { data: prof } = await supabase
        .from('profissional')
        .select('id_profissional, usuario!inner(nome_usuario)')
        .eq('usuario.nome_usuario', nomeLogado)
        .single();

      if (prof) {
        // 2. Buscar agendamentos (Pendentes, Confirmados e Rejeitados)
        const { data, error } = await supabase
          .from('agendamentos')
          .select(`
            id_agendamento,
            status,
            hora_agendamento,
            usuario:id_cliente (nome_usuario),
            servico:id_servico (nome_servico)
          `)
          .eq('id_profissional', prof.id_profissional)
          .order('id_agendamento', { ascending: false });

        if (error) throw error;
        setNotificacoes(data || []);
      }
    } catch (error) {
      console.error("Erro ao carregar notificações:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      buscarDados();
    }, [])
  );

  const renderItem = ({ item }) => {
    // SE FOR PENDENTE
    if (item.status === 'pendente') {
      return (
        <TouchableOpacity 
          style={styles.cardAviso}
          onPress={() => router.push({
            pathname: '/profissional/detalhes_solicitacao',
            params: { idAgendamento: item.id_agendamento }
          })}
        >
          <Text style={styles.cardTitle}>Nova Solicitação de Atendimento</Text>
          <Text style={styles.cardSub}>Você tem uma nova solicitação de atendimento.</Text>
          <Text style={styles.link}>Clique para visualizar</Text>
        </TouchableOpacity>
      );
    }

    // SE FOR REJEITADO (A mudança que você pediu está aqui)
    if (item.status === 'rejeitado' || item.status === 'cancelado') {
      return (
        <View style={[styles.cardInformativo, { borderLeftWidth: 5, borderLeftColor: 'red' }]}>
          <Text style={[styles.cardTitle, { color: '#600' }]}>Atendimento Recusado</Text>
          <Text style={styles.cardSub}>
            Você recusou a solicitação de {item.usuario?.nome_usuario} para {item.servico?.nome_servico}.
          </Text>
        </View>
      );
    }

    // SE FOR CONFIRMADO (Ou qualquer outro status positivo)
    return (
      <View style={styles.cardInformativo}>
        <Text style={styles.cardTitle}>Atendimento Confirmado</Text>
        <Text style={styles.cardSub}>
          {item.usuario?.nome_usuario} confirmou o atendimento de {item.servico?.nome_servico}.
        </Text>
      </View>
    );
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#C5005E" /></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close-outline" size={40} color="red" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notificações do Profissional</Text>
      </View>

      <FlatList
        data={notificacoes}
        keyExtractor={(item) => item.id_agendamento.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 15 }}
        ListEmptyComponent={<Text style={styles.vazio}>Nenhuma notificação por enquanto.</Text>}
      />
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
    paddingBottom: 10 
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', marginLeft: 10 },
  cardAviso: { 
    backgroundColor: '#D9D9D9', 
    padding: 20, 
    borderRadius: 5, 
    marginBottom: 15,
    borderBottomWidth: 4,
    borderBottomColor: '#777' 
  },
  cardInformativo: { 
    backgroundColor: '#D9D9D9', 
    padding: 15, 
    borderRadius: 5, 
    marginBottom: 15,
    opacity: 0.8 
  },
  cardTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  cardSub: { fontSize: 16, textAlign: 'center', color: '#333' },
  link: { fontSize: 16, textAlign: 'center', marginTop: 15, fontWeight: 'bold', textDecorationLine: 'underline' },
  vazio: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#333' }
});