import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { supabase } from '../../services/api';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';

export default function PerfilProfissional() {
  const router = useRouter();
  const [foto, setFoto] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false); 
  
  const [dados, setDados] = useState({
    nome_usuario: '',
    cidade: '',
    telefone: '',
    pagamentos: [],
    descricao: '',
    media_avaliacao: 0,
    total_avaliacoes: 0,
    horario: '',
  });

  const buscarDados = async () => {
    try {
      setFetching(true);
      const nomeSalvo = await AsyncStorage.getItem('nome_logado');
      if (!nomeSalvo) { router.replace('/login'); return; }

      // Ajustado para os nomes de colunas corretos: media_avaliacao e total_avaliacoes
      const { data: prof, error: profError } = await supabase
        .from('profissional')
        .select(`
          id_profissional, 
          descricao, 
          media_avaliacao, 
          total_avaliacoes,
          usuario!inner (id_usuario, nome_usuario, cidade, telefone, foto_perfil)
        `)
        .eq('usuario.nome_usuario', nomeSalvo)
        .maybeSingle();

      if (profError) throw profError;

      if (prof) {
        const idP = prof.id_profissional;

        const [resH, resP] = await Promise.all([
          supabase.from('horarios_profissional').select('*').eq('id_profissional', idP).maybeSingle(),
          supabase.from('pagamentos_profissional').select('metodo').eq('id_profissional', idP)
        ]);

        setDados({
          nome_usuario: prof.usuario?.nome_usuario || 'Não informado',
          cidade: prof.usuario?.cidade || 'Não informada',
          telefone: prof.usuario?.telefone || 'Não informado',
          pagamentos: resP.data ? resP.data.map(item => item.metodo) : [],
          descricao: prof.descricao || 'Nenhuma descrição informada.',
          media_avaliacao: prof.media_avaliacao || 0,
          total_avaliacoes: prof.total_avaliacoes || 0,
          horario: resH.data?.tipo_horario === 'sem_horario_fixo' 
            ? 'Atendimento 24h' 
            : (resH.data?.horario_inicio ? `${resH.data.horario_inicio.slice(0,5)} - ${resH.data.horario_fim.slice(0,5)}` : 'Horário não definido'),
        });
        
        if (prof.usuario?.foto_perfil) setFoto(prof.usuario.foto_perfil);
      }
    } catch (error) {
      console.error("Erro ao carregar perfil:", error.message);
    } finally {
      setFetching(false);
    }
  };

  const escolherFoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permissão", "Precisamos de acesso às suas fotos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      uploadImagem(result.assets[0].base64);
    }
  };

  const uploadImagem = async (base64) => {
    try {
      setLoading(true);
      const nomeSalvo = await AsyncStorage.getItem('nome_logado');
      const fileName = `${nomeSalvo}-${Date.now()}.png`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, decode(base64), { contentType: 'image/png' });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('usuario')
        .update({ foto_perfil: publicUrl })
        .eq('nome_usuario', nomeSalvo);

      if (updateError) throw updateError;

      setFoto(publicUrl);
      Alert.alert("Sucesso", "Foto de perfil atualizada!");
    } catch (error) {
      Alert.alert("Erro", error.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { buscarDados(); }, []));

  if (fetching) return <View style={styles.center}><ActivityIndicator size="large" color="#00FFFF" /></View>;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        
        <View style={styles.headerCard}>
          <TouchableOpacity 
            style={styles.buttonIcon} 
            onPress={escolherFoto} 
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#00FFFF" />
            ) : foto ? (
              <Image source={{ uri: foto }} style={styles.fotoAvatar} />
            ) : (
              <Ionicons name="person-outline" size={40} color="grey" />
            )}
          </TouchableOpacity>
          <View style={styles.userInfo}>
            <Text style={styles.name}>{dados.nome_usuario}</Text>
            {/* Exibe a média formatada e o total de avaliações */}
            <Text style={styles.avisoText}>
              ⭐ {Number(dados.media_avaliacao).toFixed(1)} ({dados.total_avaliacoes} avaliações)
            </Text>
          </View>
        </View>

        <View style={styles.separator} /> 

        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>DADOS DO PERFIL</Text>

          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color="black" />
            <Text style={styles.infoLabel}>Cidade: <Text style={styles.infoValue}>{dados.cidade}</Text></Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={20} color="black" />
            <Text style={styles.infoLabel}>WhatsApp: <Text style={styles.infoValue}>{dados.telefone}</Text></Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={20} color="black" />
            <Text style={styles.infoLabel}>Horário: <Text style={styles.infoValue}>{dados.horario}</Text></Text>
          </View>

          <View style={styles.subSection}>
            <Text style={styles.subTitle}>FORMAS DE PAGAMENTO</Text>
            <Text style={styles.infoValueBold}>{dados.pagamentos.join(' • ') || 'Não informado'}</Text>
          </View>

          <View style={styles.subSection}>
            <Text style={styles.subTitle}>DESCRIÇÃO</Text>
            <Text style={styles.descricaoText}>{dados.descricao}</Text>
          </View>

          <TouchableOpacity style={styles.button} onPress={() => router.push('/profissional/editar_dados')}>
            <Text style={styles.buttonText}>EDITAR DADOS</Text>
          </TouchableOpacity>
        </View> 
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#8C8C8C' },
  center: { flex: 1, backgroundColor: '#8C8C8C', justifyContent: 'center', alignItems: 'center' },
  headerCard: { flexDirection: 'row', marginTop: 50, paddingHorizontal: 20, alignItems: 'center' },
  buttonIcon: { backgroundColor: 'black', width: 80, height: 80, justifyContent: 'center', alignItems: 'center', borderRadius: 40, overflow: 'hidden', borderWidth: 2, borderColor: '#00FFFF' },
  fotoAvatar: { width: '100%', height: '100%' },
  userInfo: { marginLeft: 20 },
  name: { fontSize: 22, fontWeight: 'bold', color: 'black' },
  avisoText: { fontSize: 14, color: '#333', fontWeight: 'bold' },
  separator: { height: 2, backgroundColor: '#000', marginVertical: 20, marginHorizontal: 20 },
  detailsSection: { paddingHorizontal: 25 },
  sectionTitle: { fontSize: 20, fontWeight: '900', color: '#000', marginBottom: 20, textAlign: 'center' },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  infoLabel: { fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
  infoValue: { fontWeight: 'normal' },
  infoValueBold: { fontWeight: 'bold', fontSize: 16, color: 'black' },
  subSection: { marginTop: 20, marginBottom: 10 },
  subTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8, color: '#222' },
  descricaoText: { fontSize: 16, color: '#1a1a1a', fontStyle: 'italic', lineHeight: 22 },
  button: { backgroundColor: '#00FFFF', paddingVertical: 15, borderRadius: 10, marginTop: 30, alignItems: 'center' },
  buttonText: { fontSize: 18, color: '#000', fontWeight: 'bold' },
});