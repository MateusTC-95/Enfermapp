import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../services/api';
import { useFocusEffect, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function NotificacoesCliente() {
  const router = useRouter();
  const [notificacoes, setNotificacoes] = useState([]);
  const [loading, setLoading] = useState(true);

  const buscarDados = async () => {
    try {
      setLoading(true);
      const nomeLogado = await AsyncStorage.getItem('nome_logado');

      // 1. Pegar o ID do cliente logado
      const { data: user } = await supabase
        .from('usuario')
        .select('id_usuario')
        .eq('nome_usuario', nomeLogado)
        .single();

      if (user) {
        // 2. Buscar agendamentos do cliente (Pendente, Confirmado, Cancelado)
        const { data, error } = await supabase
          .from('agendamentos')
          .select(`
            id_agendamento,
            status,
            hora_agendamento,
            profissional:id_profissional (
               usuario:id_usuario (nome_usuario)
            ),
            servico:id_servico (nome_servico)
          `)
          .eq('id_cliente', user.id_usuario)
          .order('id_agendamento', { ascending: false });

        if (error) throw error;
        setNotificacoes(data || []);
      }
    } catch (error) {
      console.error("Erro ao carregar notificações do cliente:", error.message);
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
    // Caso 1: Ainda está PENDENTE (Aguardando o profissional)
    if (item.status === 'pendente') {
      return (
        <View style={styles.cardPendente}>
          <Text style={[styles.cardTitle, { color: '#856404' }]}>Solicitação em Análise</Text>
          <Text style={styles.cardSub}>
            Sua solicitação de <Text style={styles.bold}>{item.servico?.nome_servico}</Text> foi enviada para o profissional. Aguarde a confirmação.
          </Text>
        </View>
      );
    }

    // Caso 2: O profissional ACEITOU (Confirmado)
    if (item.status === 'confirmado') {
      return (
        <View style={[styles.cardInformativo, { borderLeftColor: '#28a745', borderLeftWidth: 5 }]}>
          <Text style={[styles.cardTitle, { color: '#155724' }]}>Atendimento Confirmado!</Text>
          <Text style={styles.cardSub}>
            O profissional <Text style={styles.bold}>{item.profissional?.usuario?.nome_usuario}</Text> aceitou seu pedido de {item.servico?.nome_servico}.
          </Text>
          <Text style={styles.horaText}>Horário: {item.hora_agendamento}</Text>
        </View>
      );
    }

    // Caso 3: O profissional RECUSOU (Cancelado)
    if (item.status === 'cancelado') {
      return (
        <View style={[styles.cardInformativo, { borderLeftColor: '#dc3545', borderLeftWidth: 5 }]}>
          <Text style={[styles.cardTitle, { color: '#721c24' }]}>Solicitação Recusada</Text>
          <Text style={styles.cardSub}>
            Infelizmente o profissional não poderá realizar o serviço de {item.servico?.nome_servico} neste horário.
          </Text>
        </View>
      );
    }
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
        <Text style={styles.headerTitle}>Minhas Notificações</Text>
      </View>

      <FlatList
        data={notificacoes}
        keyExtractor={(item) => item.id_agendamento.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 15 }}
        ListEmptyComponent={<Text style={styles.vazio}>Você não tem notificações.</Text>}
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
  
  cardPendente: { 
    backgroundColor: '#fff3cd', // Amarelo clarinho para espera
    padding: 15, 
    borderRadius: 8, 
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ffeeba'
  },
  
  cardInformativo: { 
    backgroundColor: '#D9D9D9', 
    padding: 15, 
    borderRadius: 5, 
    marginBottom: 15,
  },

  cardTitle: { fontSize: 17, fontWeight: 'bold', marginBottom: 5 },
  cardSub: { fontSize: 15, color: '#333', lineHeight: 20 },
  bold: { fontWeight: 'bold' },
  horaText: { marginTop: 10, fontWeight: 'bold', fontSize: 14, color: '#555' },
  vazio: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#333' }
});