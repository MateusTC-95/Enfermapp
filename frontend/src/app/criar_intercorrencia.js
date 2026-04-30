import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, SafeAreaView, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../services/api';

export default function CriarIntercorrencia() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Dados que vem da tela anterior
  const { id_agendamento, aberto_por, contra_quem, nome_servico, tipo_usuario } = params;

  const [motivo, setMotivo] = useState(''); 
  const [descricao, setDescricao] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleEnviar = async () => {
    if (!motivo || !descricao) {
      Alert.alert("Aviso", "Por favor, preencha o motivo e o detalhamento.");
      return;
    }

    setLoading(true);
    try {
      let publicUrl = null;

      // 1. Upload da Imagem (se houver)
      if (image) {
        const response = await fetch(image);
        const arrayBuffer = await response.arrayBuffer();
        const fileName = `disputa_${Date.now()}.jpg`;

        const { error: uploadError } = await supabase.storage
          .from('intercorrencias')
          .upload(fileName, arrayBuffer, { contentType: 'image/jpeg', upsert: true });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('intercorrencias').getPublicUrl(fileName);
        publicUrl = data.publicUrl;
      }

      // 2. Insert na tabela intercorrencia (usando os novos campos)
      const { error } = await supabase
        .from('intercorrencia')
        .insert([{
          id_agendamento: Number(id_agendamento), // Garante que vai como número para o banco
          aberta_por: tipo_usuario, 
          motivo_categoria: motivo,
          descricao: descricao,
          imagem_url: publicUrl,
          status: 'pendente'
        }]);

      if (error) {
        console.error("Erro no Supabase:", error);
        throw error;
      }

      Alert.alert("Sucesso", "Sua intercorrência foi enviada ao administrador.");
      router.back();
    } catch (error) {
      console.error("Detalhes do erro:", error);
      Alert.alert("Erro", "Não foi possível salvar a intercorrência. Verifique se o ID do agendamento é válido.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Intercorrência - Atendimento {id_agendamento}</Text>
        </View>

        <View style={styles.content}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 10 }}>
            <Ionicons name="close" size={40} color="red" />
          </TouchableOpacity>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>Aberto por: <Text style={styles.bold}>{aberto_por}</Text></Text>
            <Text style={styles.infoText}>Contra: <Text style={styles.bold}>{contra_quem}</Text></Text>
            <Text style={styles.infoText}>Serviço: <Text style={styles.bold}>{nome_servico}</Text></Text>
            
            <View style={styles.motivoRow}>
              <Text style={styles.infoText}>Motivo: </Text>
              <TextInput 
                style={styles.motivoInput}
                placeholder="Ex: Atraso, Valor errado..."
                placeholderTextColor="#666"
                value={motivo}
                onChangeText={setMotivo}
              />
            </View>
          </View>

          {/* Seção de Imagem */}
          <View style={styles.imageSection}>
            <Text style={styles.sectionTitle}>Anexar Imagens</Text>
            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
              {image ? (
                <Image source={{ uri: image }} style={styles.preview} />
              ) : (
                <View style={{ alignItems: 'center' }}>
                  <Ionicons name="image-outline" size={100} color="#333" />
                  <Text style={{ color: '#333', marginTop: 10 }}>Clique para selecionar</Text>
                </View>
              )}
              <View style={styles.attachBtn}>
                <Text style={styles.attachBtnText}>{image ? "Trocar Imagem" : "Anexar Imagem"}</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Detalhamento */}
          <Text style={styles.sectionTitle}>Detalhar Acontecimento{"\n"}(Máx: 200 Caracteres)</Text>
          <TextInput 
            style={styles.textArea}
            multiline
            placeholder="Conte o que aconteceu em detalhes..."
            maxLength={200}
            value={descricao}
            onChangeText={setDescricao}
          />

          <TouchableOpacity 
            style={[styles.submitBtn, { opacity: loading ? 0.7 : 1 }]} 
            onPress={handleEnviar}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.submitBtnText}>Enviar Disputa</Text>}
          </TouchableOpacity>
          
          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#9e9e9e' },
  header: { backgroundColor: '#d1d1d1', padding: 15, alignItems: 'center', borderBottomWidth: 1, borderColor: '#000', paddingTop: 40 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  content: { padding: 20 },
  infoBox: { marginVertical: 10 },
  infoText: { fontSize: 18, marginBottom: 10, color: '#000' },
  bold: { fontWeight: 'bold' },
  motivoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  motivoInput: { fontSize: 18, borderBottomWidth: 1, flex: 1, marginLeft: 5, paddingVertical: 2, color: '#000' },
  imageSection: { backgroundColor: '#8a8a8a', padding: 15, borderRadius: 10, marginVertical: 20, borderTopWidth: 2, borderColor: '#000' },
  sectionTitle: { fontSize: 20, textAlign: 'center', marginBottom: 15, fontWeight: 'bold' },
  imagePicker: { backgroundColor: '#757575', height: 250, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#fff', overflow: 'hidden' },
  preview: { width: '100%', height: '100%' },
  attachBtn: { backgroundColor: '#333', width: '100%', padding: 10, position: 'absolute', bottom: 0 },
  attachBtnText: { color: '#fff', textAlign: 'center', fontSize: 18, fontWeight: 'bold' },
  textArea: { backgroundColor: '#d1d1d1', height: 180, borderRadius: 5, padding: 15, fontSize: 16, textAlignVertical: 'top', marginBottom: 20, color: '#000', borderWidth: 1 },
  submitBtn: { backgroundColor: '#00ff00', padding: 20, borderRadius: 5, alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 2 },
  submitBtnText: { fontSize: 22, fontWeight: 'bold', color: '#000' }
});