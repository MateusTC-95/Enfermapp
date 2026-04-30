import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../services/api';
import { useFocusEffect, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function NotificacoesProfissional() {
  const router = useRouter();
  const [notificacoes, setNotificacoes] = useState([]);
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const buscarDados = async () => {
    try {
      setLoading(true);
      const nomeLogado = await AsyncStorage.getItem('nome_logado');

      // 1. Pegar ID e dados de advertência do profissional
      const { data: prof } = await supabase
        .from('profissional')
        .select('id_profissional, advertencias, usuario!inner(id_usuario, nome_usuario)')
        .eq('usuario.nome_usuario', nomeLogado)
        .single();

      if (prof) {
        setPerfil(prof);

        // 2. Buscar agendamentos
        const { data: agendamentos } = await supabase
          .from('agendamentos')
          .select(`
            id_agendamento, status, hora_agendamento,
            usuario:id_cliente (nome_usuario),
            servico:id_servico (nome_servico)
          `)
          .eq('id_profissional', prof.id_profissional);

        // 3. Buscar Intercorrências (Disputas)
        const { data: disputas } = await supabase
          .from('intercorrencia')
          .select(`
            *,
            agendamentos!inner ( 
                id_profissional,
                servico:id_servico (nome_servico) 
            )
          `)
          .eq('agendamentos.id_profissional', prof.id_profissional);

        // 4. Buscar Avaliações Novas (Opcional: você pode criar uma tabela 'avaliacoes')
        // Exemplo básico assumindo que você tenha essa tabela:
        const { data: avaliacoes } = await supabase
          .from('avaliacoes')
          .select('*')
          .eq('id_profissional', prof.id_profissional);

        // 5. Unificar Tudo
        const listaNotificacoes = [
          ...(agendamentos || []).map(a => ({ ...a, tipo: 'agendamento' })),
          ...(disputas || []).map(d => ({ ...d, tipo: 'disputa' })),
          ...(avaliacoes || []).map(av => ({ ...av, tipo: 'avaliacao' }))
        ];

        // Ordenar por ID decrescente
        listaNotificacoes.sort((a, b) => (b.id_agendamento || b.id_intercorrencia || b.id) - (a.id_agendamento || a.id_intercorrencia || a.id));
        
        setNotificacoes(listaNotificacoes);
      }
    } catch (error) {
      console.error("Erro:", error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      buscarDados();
    }, [])
  );

  const renderItem = ({ item }) => {
    // --- NOTIFICAÇÃO DE DISPUTA ---
    if (item.tipo === 'disputa') {
      const contraMim = item.aberta_por === 'cliente';
      const resolvida = item.status === 'resolvido';

      return (
        <TouchableOpacity 
          style={[styles.cardDisputa, resolvida && styles.cardResolvido]}
          onPress={() => router.push({ pathname: '/profissional/detalhes_intercorrencia_view', params: { id: item.id_intercorrencia } })}
        >
          <Ionicons name={resolvida ? "checkmark-circle" : "alert-circle"} size={30} color={resolvida ? "#2ecc71" : "#e74c3c"} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={[styles.cardTitle, { textAlign: 'left', marginBottom: 2 }]}>
              {resolvida ? "Disputa Resolvida" : (contraMim ? "Nova Reclamação de Cliente" : "Sua Disputa em Análise")}
            </Text>
            <Text style={[styles.cardSub, { textAlign: 'left' }]}>
              {resolvida ? `Veredito: ${item.veredito}` : `Serviço: ${item.agendamentos?.servico?.nome_servico}`}
            </Text>
          </View>
        </TouchableOpacity>
      );
    }

    // --- NOTIFICAÇÃO DE AVALIAÇÃO ---
    if (item.tipo === 'avaliacao') {
      return (
        <View style={styles.cardAvaliacao}>
          <Ionicons name="star" size={24} color="#f1c40f" />
          <View style={{marginLeft: 10}}>
            <Text style={styles.cardTitle}>Você recebeu uma avaliação!</Text>
            <Text style={styles.cardSub}>Um cliente avaliou seu último serviço.</Text>
          </View>
        </View>
      );
    }

    // --- NOTIFICAÇÃO DE AGENDAMENTO (ORIGINAL) ---
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
          <Text style={styles.cardSub}>Cliente: {item.usuario?.nome_usuario}</Text>
          <Text style={styles.link}>Clique para aceitar ou recusar</Text>
        </TouchableOpacity>
      );
    }

    if (item.status === 'rejeitado' || item.status === 'cancelado') {
        return (
          <View style={[styles.cardInformativo, { borderLeftWidth: 5, borderLeftColor: 'red' }]}>
            <Text style={[styles.cardTitle, { color: '#600' }]}>Atendimento Recusado</Text>
            <Text style={styles.cardSub}>Você recusou a solicitação de {item.usuario?.nome_usuario}.</Text>
          </View>
        );
    }

    return (
      <View style={styles.cardInformativo}>
        <Text style={styles.cardTitle}>Atendimento Confirmado</Text>
        <Text style={styles.cardSub}>Pedido de {item.servico?.nome_servico} agendado.</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close-outline" size={40} color="red" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notificações</Text>
      </View>

      {/* BANNER DE AVISO / SUSPENSÃO */}
      {perfil?.advertencias > 0 && (
        <View style={[styles.bannerAviso, perfil.advertencias >= 3 ? styles.bannerSuspenso : null]}>
          <Ionicons name="shield-alert" size={30} color="#fff" />
          <View style={{flex: 1, marginLeft: 10}}>
            <Text style={styles.bannerTitle}>
              {perfil.advertencias >= 3 ? "CONTA BLOQUEADA" : `AVISO DE SEGURANÇA (${perfil.advertencias}/3)`}
            </Text>
            <Text style={styles.bannerSub}>
              {perfil.advertencias >= 3 
                ? "Sua conta foi suspensa permanentemente." 
                : "Você recebeu uma advertência do administrador. Evite novas infrações."}
            </Text>
          </View>
        </View>
      )}

      <FlatList
        data={notificacoes}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 15 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={buscarDados} />}
        ListEmptyComponent={<Text style={styles.vazio}>Nenhuma notificação por enquanto.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#8C8C8C' },
  header: { paddingTop: 50, backgroundColor: '#D9D9D9', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingBottom: 10 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', marginLeft: 10 },
  
  // Estilos Novos
  cardDisputa: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 15, flexDirection: 'row', alignItems: 'center', borderLeftWidth: 8, borderLeftColor: '#e74c3c' },
  cardResolvido: { borderLeftColor: '#2ecc71', backgroundColor: '#f0fff4' },
  cardAvaliacao: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 15, flexDirection: 'row', alignItems: 'center', borderLeftWidth: 8, borderLeftColor: '#f1c40f' },
  
  bannerAviso: { backgroundColor: '#e67e22', padding: 15, flexDirection: 'row', alignItems: 'center', margin: 15, borderRadius: 10, elevation: 5 },
  bannerSuspenso: { backgroundColor: '#c0392b' },
  bannerTitle: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  bannerSub: { color: '#fff', fontSize: 13 },

  cardAviso: { backgroundColor: '#D9D9D9', padding: 20, borderRadius: 5, marginBottom: 15, borderBottomWidth: 4, borderBottomColor: '#777' },
  cardInformativo: { backgroundColor: '#D9D9D9', padding: 15, borderRadius: 5, marginBottom: 15, opacity: 0.9 },
  cardTitle: { fontSize: 17, fontWeight: 'bold', color: '#000' },
  cardSub: { fontSize: 15, color: '#333', marginTop: 5 },
  link: { fontSize: 14, marginTop: 10, fontWeight: 'bold', color: '#C5005E', textDecorationLine: 'underline' },
  vazio: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#eee' }
});