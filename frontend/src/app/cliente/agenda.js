import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { supabase } from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function Agenda() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [agendamentos, setAgendamentos] = useState([]);

  const buscarAgenda = async () => {
    try {
      setLoading(true);
      const nomeLogado = await AsyncStorage.getItem('nome_logado');
      
      const { data: user } = await supabase
        .from('usuario')
        .select('id_usuario')
        .eq('nome_usuario', nomeLogado)
        .single();

      if (!user) return;

      // BUSCA COM A LÓGICA DE SUMIR QUANDO OS DOIS FINALIZAREM
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
          profissional:id_profissional (
            usuario:id_usuario (nome_usuario)
          ),
          servico:id_servico (nome_servico)
        `)
        .eq('id_cliente', user.id_usuario)
        .eq('status', 'confirmado') 
        // Lógica: Só mostra se o cliente NÃO finalizou OU o profissional NÃO finalizou
        .or('finalizado_cliente.eq.false,finalizado_profissional.eq.false')
        .order('data_agendamento', { ascending: true });

      if (error) throw error;
      setAgendamentos(data || []);

    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível carregar sua agenda.");
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
        <Text style={styles.headerTitle}>Minha Agenda</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <ActivityIndicator size="large" color="#FFD700" style={{ marginTop: 50 }} />
        ) : agendamentos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={80} color="#ccc" />
            <Text style={styles.emptyText}>Nenhum atendimento confirmado para os próximos dias.</Text>
          </View>
        ) : (
          agendamentos.map((item) => (
            <TouchableOpacity 
              key={item.id_agendamento} 
              style={styles.card}
              onPress={() => {
                router.push({
                  pathname: '/cliente/DetalhesAgendamento',
                  params: { id: item.id_agendamento }
                });
              }}
            >
              <View style={styles.cardHeader}>
                <Ionicons name="time" size={20} color="#FFD700" />
                <Text style={styles.horarioText}>{item.hora_agendamento}</Text>
                <View style={styles.badgeConfirmado}>
                  <Text style={styles.badgeText}>CONFIRMADO</Text>
                </View>
              </View>

              <Text style={styles.servicoText}>{item.servico?.nome_servico}</Text>
              
              <View style={styles.infoRow}>
                <Ionicons name="person" size={16} color="#666" />
                <Text style={styles.infoText}>Profissional: {item.profissional?.usuario?.nome_usuario}</Text>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="location" size={16} color="#666" />
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
  card: { backgroundColor: '#FFF', borderRadius: 10, padding: 15, marginBottom: 15, elevation: 3, borderLeftWidth: 5, borderLeftColor: '#FFD700' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  horarioText: { fontSize: 18, fontWeight: 'bold', marginLeft: 5, flex: 1 },
  badgeConfirmado: { backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 5 },
  badgeText: { color: '#2E7D32', fontSize: 10, fontWeight: 'bold' },
  servicoText: { fontSize: 20, fontWeight: 'bold', color: '#C5005E', marginBottom: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  infoText: { fontSize: 14, color: '#444', marginLeft: 8 },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#FFF', textAlign: 'center', fontSize: 16, marginTop: 15, paddingHorizontal: 40 }
});