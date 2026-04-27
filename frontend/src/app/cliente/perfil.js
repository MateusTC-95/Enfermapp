import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { supabase } from '../../services/api';
import { decode } from 'base64-arraybuffer'; 

export default function Perfil() {
  const router = useRouter();
  const [foto, setFoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [dadosUsuario, setDadosUsuario] = useState({
    nome_usuario: '',
    cidade: '',
    telefone: '',
    pagamento_usado: '',
    servicos_recebidos: 0 // Adicionado ao estado
  });

  const buscarDados = async () => {
    try {
      setFetching(true);
      const nomeSalvo = await AsyncStorage.getItem('nome_logado');
      if (!nomeSalvo) {
        router.replace('/login');
        return;
      }

      // Adicionado 'servicos_recebidos' no select
      const { data, error } = await supabase
        .from('usuario')
        .select('nome_usuario, cidade, telefone, pagamento_usado, foto_perfil, servicos_recebidos')
        .eq('nome_usuario', nomeSalvo) 
        .single();

      if (error) throw error;

      if (data) {
        setDadosUsuario({
          nome_usuario: data.nome_usuario,
          cidade: data.cidade || 'Não informada',
          telefone: data.telefone || 'Não informado',
          pagamento_usado: data.pagamento_usado || 'Não informado',
          servicos_recebidos: data.servicos_recebidos || 0 // Mapeando o valor do banco
        });
        setFoto(data.foto_perfil);
      }
    } catch (error) {
      console.log("Erro ao buscar dados:", error.message);
    } finally {
      setFetching(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      buscarDados();
    }, [])
  );

  const escolherFoto = async () => {
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
      const fileName = `${Date.now()}-${nomeSalvo}.png`;

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

  if (fetching) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#808000" />
      </View>
    );
  }

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
              <ActivityIndicator color="#808000" />
            ) : foto ? (
              <Image source={{ uri: foto }} style={styles.fotoAvatar} />
            ) : (
              <Ionicons name="person-outline" size={40} color="grey" />
            )}
          </TouchableOpacity>
          
          <View style={styles.userInfo}>
            <Text style={styles.name}>{dadosUsuario.nome_usuario}</Text>
            <Text style={styles.avisoText}>Cliente Particular</Text>
          </View>
        </View>

        <View style={styles.separator} /> 

        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>DADOS DO CLIENTE</Text>

          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color="black" />
            <Text style={styles.infoLabel}>Cidade: <Text style={styles.infoValue}>{dadosUsuario.cidade}</Text></Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={20} color="black" />
            <Text style={styles.infoLabel}>Telefone: <Text style={styles.infoValue}>{dadosUsuario.telefone}</Text></Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="briefcase-outline" size={20} color="black" />
            {/* Agora exibe o valor real vindo do banco de dados */}
            <Text style={styles.infoLabel}>Serviços Recebidos: <Text style={styles.infoValue}>{dadosUsuario.servicos_recebidos}</Text></Text>
          </View>

          <View style={styles.subSection}>
            <Text style={styles.subTitle}>PAGAMENTO PREFERENCIAL</Text>
            <Text style={styles.infoValueBold}>{dadosUsuario.pagamento_usado.toUpperCase()}</Text>
          </View>

          <TouchableOpacity 
            style={styles.button}
            onPress={() => router.push('/cliente/editar_dados')}
          >
            <Text style={styles.buttonText}>EDITAR MEUS DADOS</Text>
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
  buttonIcon: { 
    backgroundColor: 'black', 
    width: 80, 
    height: 80, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderRadius: 40, 
    overflow: 'hidden', 
    borderWidth: 2, 
    borderColor: '#808000' 
  },
  fotoAvatar: { width: '100%', height: '100%' },
  userInfo: { marginLeft: 20 },
  name: { fontSize: 22, fontWeight: 'bold', color: 'black' },
  avisoText: { fontSize: 14, color: '#333' },
  separator: { height: 2, backgroundColor: '#000', marginVertical: 20, marginHorizontal: 20 },
  detailsSection: { paddingHorizontal: 25 },
  sectionTitle: { fontSize: 20, fontWeight: '900', color: '#000', marginBottom: 20, textAlign: 'center' },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  infoLabel: { fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
  infoValue: { fontWeight: 'normal' },
  infoValueBold: { fontWeight: 'bold', fontSize: 16, color: 'black' },
  subSection: { marginTop: 20, marginBottom: 10 },
  subTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8, color: '#222' },
  button: { 
    backgroundColor: '#808000', 
    paddingVertical: 15, 
    borderRadius: 10, 
    marginTop: 30, 
    alignItems: 'center' 
  },
  buttonText: { fontSize: 18, color: '#fff', fontWeight: 'bold' },
});