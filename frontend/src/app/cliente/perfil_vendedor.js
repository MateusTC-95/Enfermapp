import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../services/api';

export default function PerfilVendedor() {
  const router = useRouter();
  const { id, servicoId } = useLocalSearchParams(); // Recebe os IDs da busca
  const [loading, setLoading] = useState(true);
  const [profissional, setProfissional] = useState(null);

  useEffect(() => {
    fetchPerfil();
  }, [id]);

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

  if (loading) return (
    <View style={styles.center}><ActivityIndicator size="large" color="#C5005E" /></View>
  );

  return (
    <View style={styles.container}>
      {/* Cabeçalho com botão de voltar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={30} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Perfil do Profissional</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Card do Perfil (Igual sua Foto 4/5) */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            {profissional?.usuario?.foto_perfil ? (
              <Image source={{ uri: profissional.usuario.foto_perfil }} style={styles.avatar} />
            ) : (
              <Ionicons name="person-circle" size={80} color="grey" />
            )}
          </View>
          
          <Text style={styles.name}>{profissional?.usuario?.nome_usuario}</Text>
          
          {/* Estrelas de Avaliação */}
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons 
                key={star} 
                name={star <= Math.round(profissional?.media_avaliacao || 0) ? "star" : "star-outline"} 
                size={24} 
                color="#fd6601" 
              />
            ))}
            <Text style={styles.ratingText}>({profissional?.media_avaliacao || '0.0'})</Text>
          </View>

          <Text style={styles.cidade}>{profissional?.usuario?.cidade}</Text>
          <Text style={styles.cidade}>{profissional?.usuario?.telefone}</Text>
        </View>

        {/* Descrição */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sobre o Profissional</Text>
          <Text style={styles.description}>{profissional?.descricao || "Sem descrição disponível."}</Text>
        </View>

        {/* Botão de Ação (Rosa Pink como na foto) */}
        <TouchableOpacity 
          style={styles.mainButton}
          onPress={() => router.push({
            pathname: '/cliente/agendar_servico', // Próxima tela que vamos criar
            params: { idProfissional: id, servicoId: servicoId }
          })}
        >
          <Text style={styles.mainButtonText}>MARCAR HORÁRIO</Text>
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
    paddingHorizontal: 20, 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#D9D9D9', 
    paddingBottom: 15,
    borderBottomWidth: 1 
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', marginLeft: 15 },
  content: { padding: 20, alignItems: 'center' },
  profileCard: { 
    backgroundColor: '#D9D9D9', 
    width: '100%', 
    borderRadius: 15, 
    padding: 20, 
    alignItems: 'center',
    elevation: 4
  },
  avatarContainer: { 
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    backgroundColor: 'black', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 3,
    borderColor: '#808000',
    overflow: 'hidden'
  },
  avatar: { width: '100%', height: '100%' },
  name: { fontSize: 24, fontWeight: 'bold', color: 'black' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 5 },
  ratingText: { marginLeft: 10, fontSize: 16, fontWeight: 'bold' },
  cidade: { fontSize: 16, color: '#333' },
  section: { width: '100%', marginTop: 25, backgroundColor: '#D9D9D9', padding: 15, borderRadius: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  description: { fontSize: 16, lineHeight: 22, color: '#222' },
  mainButton: { 
    backgroundColor: '#808000', 
    width: '100%', 
    padding: 20, 
    borderRadius: 10, 
    marginTop: 30, 
    alignItems: 'center' 
  },
  mainButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' }
});