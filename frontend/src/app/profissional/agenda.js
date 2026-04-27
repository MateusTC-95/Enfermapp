import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { supabase } from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function AgendaProfissional() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [agendamentos, setAgendamentos] = useState([]);

  const buscarAgenda = async () => {
    try {
      setLoading(true);
      const nomeLogado = await AsyncStorage.getItem('nome_logado');
      
      const { data: userData, error: userError } = await supabase
        .from('usuario')
        .select('id_usuario')
        .eq('nome_usuario', nomeLogado)
        .single();

      if (userError || !userData) throw new Error("Usuário não encontrado.");

      const { data: profData, error: profError } = await supabase
        .from('profissional')
        .select('id_profissional')
        .eq('id_usuario', userData.id_usuario)
        .single();

      if (profError || !profData) throw new Error("Perfil profissional não encontrado.");

      // BUSCA COM LÓGICA DE SUMIR QUANDO OS DOIS FINALIZAREM
      const { data, error } = await supabase
        .from('agendamentos')
        .select(`
          id_agendamento,
          hora_agendamento,
          data_agendamento,
          endereco,
          status,
          finalizado_cliente,
          finalizado_profissional,
          cliente:id_cliente (
            nome_usuario,
            telefone
          ),
          servico:id_servico (nome_servico)
        `)
        .eq('id_profissional', profData.id_profissional)
        .eq('status', 'confirmado') 
        // Lógica: Só mostra se (finalizado_cliente é falso OU finalizado_profissional é falso)
        // Se ambos forem TRUE, o registro não vem na query.
        .or('finalizado_cliente.eq.false,finalizado_profissional.eq.false')
        .order('data_agendamento', { ascending: true });

      if (error) throw error;
      setAgendamentos(data || []);

    } catch (error) {
      console.error("Erro Agenda Profissional:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      buscarAgenda();
    }, [])
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Agenda de Trabalho</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <ActivityIndicator size="large" color="#00FFFF" style={{ marginTop: 50 }} />
        ) : agendamentos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={80} color="#ccc" />
            <Text style={styles.emptyText}>Você não possui atendimentos confirmados no momento.</Text>
          </View>
        ) : (
          agendamentos.map((item) => (
            <TouchableOpacity 
              key={item.id_agendamento} 
              style={styles.card}
              onPress={() => {
                // NAVEGAÇÃO PARA DETALHES DO PROFISSIONAL
                router.push({
                  pathname: '/profissional/DetalhesAgendamento', // Ajuste o caminho se necessário
                  params: { id: item.id_agendamento }
                });
              }}
            >
              <View style={styles.cardHeader}>
                <Ionicons name="time" size={20} color="#00FFFF" />
                <Text style={styles.horarioText}>{item.hora_agendamento}</Text>
                <View style={[styles.badgeConfirmado, { backgroundColor: '#E0FFFF' }]}>
                  <Text style={[styles.badgeText, { color: '#008B8B' }]}>CONFIRMADO</Text>
                </View>
              </View>

              <Text style={styles.servicoText}>{item.servico?.nome_servico}</Text>
              
              <View style={styles.infoRow}>
                <Ionicons name="person" size={16} color="#444" />
                <Text style={styles.infoText}>Cliente: {item.cliente?.nome_usuario}</Text>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="location" size={16} color="#444" />
                <Text style={styles.infoText} numberOfLines={1}>{item.endereco}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#8C8C8C' },
  header: { paddingTop: 60, paddingBottom: 20, backgroundColor: '#D9D9D9', alignItems: 'center', elevation: 4 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#000' },
  scrollContent: { padding: 20 },
  card: { backgroundColor: '#FFF', borderRadius: 10, padding: 15, marginBottom: 15, elevation: 3, borderLeftWidth: 5, borderLeftColor: '#00FFFF' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  horarioText: { fontSize: 18, fontWeight: 'bold', marginLeft: 5, flex: 1 },
  badgeConfirmado: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 5 },
  badgeText: { fontSize: 10, fontWeight: 'bold' },
  servicoText: { fontSize: 20, fontWeight: 'bold', color: '#008B8B', marginBottom: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  infoText: { fontSize: 14, color: '#444', marginLeft: 8 },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#FFF', textAlign: 'center', fontSize: 16, marginTop: 15, paddingHorizontal: 40 }
});