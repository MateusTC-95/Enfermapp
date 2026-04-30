import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router'; // useFocusEffect faz a lista recarregar ao voltar
import { supabase } from '../../services/api';

export default function ListaIntercorrenciasAdmin() {
  const router = useRouter();
  const [intercorrencias, setIntercorrencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // useFocusEffect garante que se você resolver uma intercorrência e clicar em "voltar", 
  // ela já terá sumido da lista sem precisar fechar o app.
  useFocusEffect(
    useCallback(() => {
      fetchIntercorrencias();
    }, [])
  );

  const fetchIntercorrencias = async () => {
    try {
      const { data, error } = await supabase
        .from('intercorrencia')
        .select(`
          *,
          agendamentos (
            id_agendamento,
            servico:id_servico ( nome_servico )
          )
        `)
        .eq('status', 'pendente') // O SEGREDO: Só busca as que ainda não foram resolvidas
        .order('criado_em', { ascending: false });

      if (error) throw error;
      setIntercorrencias(data);
    } catch (error) {
      console.error("Erro ao buscar intercorrências:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchIntercorrencias();
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => router.push({
        pathname: '/admin/DetalhesIntercorrencias',
        params: { id: item.id_intercorrencia }
      })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardId}>#ID {item.id_intercorrencia}</Text>
        <View style={styles.badgeContainer}>
           <Text style={styles.statusBadge}>PENDENTE</Text>
        </View>
      </View>
      
      <Text style={styles.cardTitle}>
        {item.agendamentos?.servico?.nome_servico || "Serviço não identificado"}
      </Text>
      
      <Text style={styles.cardSub}>
        Aberto por: <Text style={styles.bold}>{item.aberta_por}</Text>
      </Text>
      
      <View style={styles.footer}>
        <Text style={styles.dateText}>
          {new Date(item.criado_em).toLocaleDateString('pt-BR')}
        </Text>
        <Ionicons name="chevron-forward" size={20} color="#7a7a7a" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Botão de Voltar */}
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => router.back()}
      >
        <Ionicons name="chevron-back-outline" size={40} color="black" />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>Intercorrências Ativas</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#000" style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={intercorrencias}
            keyExtractor={(item) => item.id_intercorrencia.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 20 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="checkmark-circle-outline" size={80} color="#ccc" />
                <Text style={styles.emptyText}>Tudo limpo! Nenhuma intercorrência pendente.</Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  backButton: { padding: 20, marginTop: 10, alignSelf: 'flex-start' },
  content: { flex: 1, paddingHorizontal: 20 },
  title: { fontSize: 26, textAlign: 'center', marginBottom: 25, fontWeight: 'bold', color: '#000' },
  card: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eee',
    borderLeftWidth: 6,
    borderLeftColor: '#FFD700', // Cor dourada para indicar pendência
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardId: { fontSize: 13, color: '#888', fontWeight: 'bold' },
  badgeContainer: { backgroundColor: '#FFD70033', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusBadge: { fontSize: 10, color: '#b8860b', fontWeight: 'bold' },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  cardSub: { fontSize: 15, color: '#555', marginTop: 4 },
  bold: { fontWeight: 'bold', color: '#000' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 8 },
  dateText: { fontSize: 12, color: '#999' },
  emptyState: { alignItems: 'center', marginTop: 100 },
  emptyText: { fontSize: 16, color: '#999', marginTop: 10, textAlign: 'center' }
});