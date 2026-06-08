import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../services/api';

const CREAM = '#FDFBF7';        
const VERDE_VIVO = '#2E6F40';   
const PETROLEO = '#0F262E';     
const TEXT_MID = '#6E828A';     
const BORDER = '#E3E8E5';       
const WHITE = '#FFFFFF';
const GOLD = '#E6A119';         

export default function PerfilVendedor() {
  const router = useRouter();
  const { id, servicoId, enderecoPreenchido } = useLocalSearchParams(); 
  const [loading, setLoading] = useState(true);
  const [profissional, setProfissional] = useState(null);
  const [nomeServico, setNomeServico] = useState('');

  useEffect(() => {
    fetchPerfil();
    if (servicoId) {
      fetchNomeServico();
    }
  }, [id, servicoId]);

  const fetchPerfil = async () => {
    try {
      const { data, error } = await supabase
        .from('profissional')
        .select(`
          id_profissional,
          descricao,
          media_avaliacao,
          usuario!inner (nome_usuario, cidade, foto_perfil, telefone)
        `)
        .eq('id_profissional', id)
        .single();

      if (error) throw error;
      setProfissional(data);
    } catch (error) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchNomeServico = async () => {
    try {
      const { data, error } = await supabase
        .from('servicos')
        .select('nome_servico')
        .eq('id_servico', servicoId)
        .single();

      if (error) throw error;
      if (data) setNomeServico(data.nome_servico);
    } catch (error) {
      console.error("Erro ao buscar nome do serviço:", error.message);
    }
  };

  const formatarTelefone = (num) => {
    if (!num) return 'Sem telefone';
    const limpo = String(num).replace(/\D/g, '');
    if (limpo.length === 11) {
      return `(${limpo.slice(0, 2)}) ${limpo.slice(2, 7)}-${limpo.slice(7)}`;
    } else if (limpo.length === 10) {
      return `(${limpo.slice(0, 2)}) ${limpo.slice(2, 6)}-${limpo.slice(6)}`;
    }
    return num;
  };

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={VERDE_VIVO} />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={26} color={PETROLEO} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Perfil do Profissional</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            {profissional?.usuario?.foto_perfil ? (
              <Image source={{ uri: profissional.usuario.foto_perfil }} style={styles.avatar} />
            ) : (
              <Ionicons name="person" size={45} color={WHITE} />
            )}
          </View>
          
          <Text style={styles.name}>{profissional?.usuario?.nome_usuario}</Text>

          {nomeServico ? (
            <View style={styles.serviceBadge}>
              <Text style={styles.serviceBadgeText}>{nomeServico}</Text>
            </View>
          ) : null}
          
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons 
                key={star} 
                name={star <= Math.round(profissional?.media_avaliacao || 0) ? "star" : "star-outline"} 
                size={20} 
                color={GOLD} 
              />
            ))}
            <Text style={styles.ratingText}>({profissional?.media_avaliacao ? Number(profissional.media_avaliacao).toFixed(1) : '0.0'})</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={16} color={VERDE_VIVO} />
            <Text style={styles.infoText}>{profissional?.usuario?.cidade || 'Cidade não informada'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={16} color={VERDE_VIVO} />
            <Text style={styles.infoText}>{formatarTelefone(profissional?.usuario?.telefone)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sobre o Profissional</Text>
          <Text style={styles.description}>
            {profissional?.descricao || "Este profissional ainda não adicionou uma descrição detalhada sobre seus serviços."}
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.mainButton}
          activeOpacity={0.8}
          onPress={() => router.push({
            pathname: '/cliente/agendar_servico',
            params: { 
              idProfissional: id, 
              servicoId: servicoId,
              enderecoPreenchido: enderecoPreenchido 
            }
          })}
        >
          <Ionicons name="calendar-outline" size={20} color={WHITE} style={{ marginRight: 8 }} />
          <Text style={styles.mainButtonText}>MARCAR HORÁRIO</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CREAM },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: CREAM },
  header: { paddingTop: 55, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', backgroundColor: WHITE, paddingBottom: 18, borderBottomWidth: 1, borderColor: BORDER },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '700', marginLeft: 12, color: PETROLEO, letterSpacing: -0.3 },
  content: { padding: 24, alignItems: 'center' },
  profileCard: { backgroundColor: WHITE, width: '100%', borderRadius: 20, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: BORDER, shadowColor: PETROLEO, shadowOpacity: 0.03, shadowOffset: { width: 0, height: 4 }, shadowRadius: 12, elevation: 2 },
  avatarContainer: { width: 90, height: 90, borderRadius: 45, backgroundColor: PETROLEO, justifyContent: 'center', alignItems: 'center', marginBottom: 14, borderWidth: 2, borderColor: VERDE_VIVO, overflow: 'hidden' },
  avatar: { width: '100%', height: '100%' },
  name: { fontSize: 22, fontWeight: '700', color: PETROLEO, textAlign: 'center' },
  serviceBadge: { backgroundColor: CREAM, borderColor: VERDE_VIVO, borderWidth: 1, paddingVertical: 4, paddingHorizontal: 12, borderRadius: 20, marginTop: 8 },
  serviceBadgeText: { color: VERDE_VIVO, fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 10, gap: 2 },
  ratingText: { marginLeft: 6, fontSize: 15, fontWeight: '600', color: PETROLEO },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 6 },
  infoText: { fontSize: 14, color: TEXT_MID, fontWeight: '500' },
  section: { width: '100%', marginTop: 20, backgroundColor: WHITE, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: BORDER },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: PETROLEO, marginBottom: 10 },
  description: { fontSize: 15, lineHeight: 22, color: PETROLEO, fontWeight: '400' },
  mainButton: { backgroundColor: VERDE_VIVO, width: '100%', padding: 16, borderRadius: 16, marginTop: 24, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', shadowColor: VERDE_VIVO, shadowOpacity: 0.15, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: 3 },
  mainButtonText: { color: WHITE, fontSize: 16, fontWeight: '700', letterSpacing: 0.5 }
});