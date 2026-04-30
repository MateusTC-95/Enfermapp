import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../services/api';
import { useFocusEffect, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function NotificacoesCliente() {
  const router = useRouter();
  const [notificacoes, setNotificacoes] = useState([]);
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);

  const buscarDados = async () => {
    try {
      setLoading(true);
      const nomeLogado = await AsyncStorage.getItem('nome_logado');

      // 1. Pegar o Perfil do cliente logado (para ver avisos/advertências)
      const { data: user, error: userError } = await supabase
        .from('usuario')
        .select('id_usuario, nome_usuario, advertencias')
        .eq('nome_usuario', nomeLogado)
        .single();

      if (user) {
        setPerfil(user);

        // 2. Buscar agendamentos normais
        const { data: agendamentos } = await supabase
          .from('agendamentos')
          .select(`
            id_agendamento, status, hora_agendamento,
            profissional:id_profissional ( usuario:id_usuario (nome_usuario) ),
            servico:id_servico (nome_servico)
          `)
          .eq('id_cliente', user.id_usuario);

        // 3. Buscar Intercorrências (Disputas)
        // Buscamos onde o cliente abriu OU onde o agendamento pertence a ele
        const { data: disputas } = await supabase
          .from('intercorrencia')
          .select(`
            *,
            agendamentos!inner ( 
                id_cliente,
                servico:id_servico (nome_servico) 
            )
          `)
          .eq('agendamentos.id_cliente', user.id_usuario);

        // 4. Formatar e Unificar as notificações
        const listaNotificacoes = [
          ...(agendamentos || []).map(a => ({ ...a, tipo: 'agendamento' })),
          ...(disputas || []).map(d => ({ ...d, tipo: 'disputa' }))
        ];

        // Ordenar por ID ou data (mais recentes primeiro)
        listaNotificacoes.sort((a, b) => (b.id_agendamento || b.id_intercorrencia) - (a.id_agendamento || a.id_intercorrencia));
        
        setNotificacoes(listaNotificacoes);
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
    // --- CASO DISPUTA (INTERCORRÊNCIA) ---
    if (item.tipo === 'disputa') {
      const contraMim = item.aberta_por === 'profissional';
      const resolvida = item.status === 'resolvido';

      return (
        <TouchableOpacity 
          style={[styles.cardDisputa, resolvida && styles.cardResolvido]}
          onPress={() => router.push({ pathname: '/cliente/detalhes_intercorrencia_view', params: { id: item.id_agendamento } })}
        >
          <Ionicons name={resolvida ? "checkmark-done-circle" : "warning"} size={24} color={resolvida ? "green" : "#f44336"} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.cardTitle}>
              {resolvida ? "Disputa Encerrada" : (contraMim ? "Disputa contra você!" : "Sua disputa em análise")}
            </Text>
            <Text style={styles.cardSub}>
              {resolvida 
                ? `O administrador decidiu: ${item.veredito || 'Caso encerrado.'}` 
                : `Sobre o serviço de ${item.agendamentos?.servico?.nome_servico}.`}
            </Text>
          </View>
        </TouchableOpacity>
      );
    }

    // --- CASOS DE AGENDAMENTO (CÓDIGO ORIGINAL) ---
    if (item.status === 'pendente') {
      return (
        <View style={styles.cardPendente}>
          <Text style={[styles.cardTitle, { color: '#856404' }]}>Solicitação em Análise</Text>
          <Text style={styles.cardSub}>
            Sua solicitação de <Text style={styles.bold}>{item.servico?.nome_servico}</Text> aguarda confirmação.
          </Text>
        </View>
      );
    }

    if (item.status === 'confirmado') {
      return (
        <View style={[styles.cardInformativo, { borderLeftColor: '#28a745', borderLeftWidth: 5 }]}>
          <Text style={[styles.cardTitle, { color: '#155724' }]}>Atendimento Confirmado!</Text>
          <Text style={styles.cardSub}>
            O profissional <Text style={styles.bold}>{item.profissional?.usuario?.nome_usuario}</Text> aceitou seu pedido.
          </Text>
        </View>
      );
    }

    if (item.status === 'cancelado') {
      return (
        <View style={[styles.cardInformativo, { borderLeftColor: '#dc3545', borderLeftWidth: 5 }]}>
          <Text style={[styles.cardTitle, { color: '#721c24' }]}>Solicitação Recusada</Text>
          <Text style={styles.cardSub}>Infelizmente o profissional recusou o serviço de {item.servico?.nome_servico}.</Text>
        </View>
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close-outline" size={40} color="red" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Minhas Notificações</Text>
      </View>

      {/* Banner de Aviso de Advertências / Suspensão */}
      {perfil?.advertencias > 0 && (
        <View style={[styles.bannerAviso, perfil.advertencias >= 3 ? styles.bannerSuspenso : null]}>
          <Ionicons name="alert-circle" size={24} color="#fff" />
          <Text style={styles.bannerText}>
            {perfil.advertencias >= 3 
              ? "SUA CONTA FOI SUSPENSA POR EXCESSO DE AVISOS." 
              : `Atenção: Você possui ${perfil.advertencias} aviso(s). Com 3 avisos sua conta será deletada.`}
          </Text>
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#fff" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={notificacoes}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 15 }}
          ListEmptyComponent={<Text style={styles.vazio}>Você não tem notificações.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#8C8C8C' },
  header: { paddingTop: 50, backgroundColor: '#D9D9D9', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingBottom: 10 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', marginLeft: 10 },
  
  // Estilo Disputas
  cardDisputa: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 15, flexDirection: 'row', alignItems: 'center', borderLeftWidth: 8, borderLeftColor: '#f44336' },
  cardResolvido: { borderLeftColor: 'green', backgroundColor: '#e8f5e9' },
  
  // Banner Avisos
  bannerAviso: { backgroundColor: '#ff9800', padding: 15, flexDirection: 'row', alignItems: 'center', margin: 10, borderRadius: 8 },
  bannerSuspenso: { backgroundColor: '#b71c1c' },
  bannerText: { color: '#fff', fontWeight: 'bold', flex: 1, marginLeft: 10 },

  cardPendente: { backgroundColor: '#fff3cd', padding: 15, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#ffeeba' },
  cardInformativo: { backgroundColor: '#D9D9D9', padding: 15, borderRadius: 5, marginBottom: 15 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  cardSub: { fontSize: 14, color: '#333', marginTop: 3 },
  bold: { fontWeight: 'bold' },
  vazio: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#fff' }
});