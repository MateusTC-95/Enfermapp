import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, Image, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../services/api';

export default function CadastroPasso4() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [image, setImage] = useState(null);
  const [isWaiting, setIsWaiting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [urlFinal, setUrlFinal] = useState(null);
  const [documentoAprovado, setDocumentoAprovado] = useState(false);

  useEffect(() => {
    // Só inicia a escuta se estivermos esperando e tivermos o ID do profissional
    if (isWaiting && params.id_profissional) {
      console.log("Iniciando escuta para o profissional:", params.id_profissional);

      const channel = supabase
        .channel('check_aprovacao')
        .on(
          'postgres_changes',
          { 
            event: 'UPDATE',
            schema: 'public',
            table: 'profissional',
            filter: `id_profissional=eq.${params.id_profissional}`
          },
          (payload) => {
            console.log("Mudança detectada no banco:", payload.new.status_aprovacao);
            if (payload.new.status_aprovacao === 'aprovado') {
              setDocumentoAprovado(true);
            }
          }
        )
        .subscribe((status) => {
          console.log("Status da conexão Realtime:", status);
        });

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isWaiting, params.id_profissional]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permissão Necessária", "Precisamos de acesso às suas fotos.");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5, 
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSend = async () => {
    if (!image) {
      Alert.alert("Aviso", "Por favor, anexe a imagem do seu COREN.");
      return;
    }

    try {
      setIsUploading(true);
      const response = await fetch(image);
      const arrayBuffer = await response.arrayBuffer();
      const fileName = `coren_${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('documentos_profissionais')
        .upload(fileName, arrayBuffer, { contentType: 'image/jpeg', upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage
        .from('documentos_profissionais')
        .getPublicUrl(fileName);

      const url = publicData.publicUrl;
      setUrlFinal(url);

      // ATUALIZA O PROFISSIONAL
      const { error: updateError } = await supabase
        .from('profissional')
        .update({ 
          coren_url: url, 
          status_aprovacao: 'pendente' 
        })
        .eq('id_profissional', params.id_profissional);

      if (updateError) throw updateError;

      setIsWaiting(true);
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não conseguimos salvar a foto.");
    } finally {
      setIsUploading(false);
    }
  };

  if (isWaiting) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.form}>
          <Text style={styles.stepText}>Passo 4/5</Text>
          <View style={styles.waitingContainer}>
            {!documentoAprovado ? (
              <>
                <ActivityIndicator size={80} color="#00ff00" style={{ marginBottom: 30 }} />
                <Text style={styles.instructionText}>Aguardando Aprovação...</Text>
                <Text style={{ fontSize: 16, color: '#8b8682', textAlign: 'center', marginBottom: 30 }}>
                  Nossos admins estão revisando seu documento.
                </Text>
                {/* Botão de teste caso o Realtime falhe */}
                <TouchableOpacity 
                  onPress={async () => {
                    const { data } = await supabase.from('profissional').select('status_aprovacao').eq('id_profissional', params.id_profissional).single();
                    if (data?.status_aprovacao === 'aprovado') setDocumentoAprovado(true);
                  }}
                  style={{ marginTop: 20 }}
                >
                  <Text style={{ color: '#ccc' }}>Verificar manualmente</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={{ fontSize: 60, marginBottom: 20 }}>✅</Text>
                <Text style={styles.instructionText}>Documento Aprovado!</Text>
                <TouchableOpacity
                  style={[styles.nextButton, { backgroundColor: '#00ff00' }]} 
                  onPress={() => router.push({
                    pathname: '/cadastro_passo5',
                    params: { ...params, coren_url: urlFinal } 
                  })}
                >
                  <Text style={styles.nextButtonText}>PROSSEGUIR PARA PLANOS</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.stepText}>Passo 4/5</Text>
        <Text style={styles.instructionText}>Anexe a Imagem da Sua Carteirinha do COREN</Text>
        <View style={styles.imageViewer}>
          <View style={styles.placeholderBox}>
            {image ? (
              <Image source={{ uri: image }} style={styles.previewImage} />
            ) : (
              <View style={styles.mountainIcon} />
            )}
          </View>
          <TouchableOpacity style={styles.attachButton} onPress={pickImage} disabled={isUploading}>
            <Text style={styles.attachButtonText}>{image ? "Trocar Imagem📸" : "Anexar Imagem"}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.nextButton, { opacity: isUploading ? 0.7 : 1 }]} onPress={handleSend} disabled={isUploading}>
          {isUploading ? (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <ActivityIndicator color="#000" style={{ marginRight: 10 }} />
              <Text style={styles.nextButtonText}>ENVIANDO...</Text>
            </View>
          ) : (
            <Text style={styles.nextButtonText}>ENVIAR DOCUMENTO</Text>
          )}
        </TouchableOpacity>

        {!isUploading && (
          <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
            <Text style={{ color: '#8b8682' }}>Voltar</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  form: { flex: 1, paddingHorizontal: 30, alignItems: 'center', paddingTop: 60 },
  stepText: { fontSize: 40, color: '#00ff00', marginBottom: 40, fontWeight: 'bold' },
  instructionText: { fontSize: 20, textAlign: 'center', marginBottom: 20, fontWeight: '500' },
  imageViewer: { width: '100%', backgroundColor: '#f0f0f0', height: 350, justifyContent: 'space-between', marginBottom: 40, borderRadius: 10, overflow: 'hidden' },
  placeholderBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  mountainIcon: { width: 150, height: 100, borderWidth: 2, borderColor: '#ccc', borderRadius: 10, borderStyle: 'dashed' },
  attachButton: { backgroundColor: '#333', height: 60, justifyContent: 'center', alignItems: 'center' },
  attachButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  nextButton: { backgroundColor: '#0077c2', width: '100%', height: 70, justifyContent: 'center', alignItems: 'center', borderRadius: 10 },
  nextButtonText: { color: '#000', fontSize: 20, fontWeight: 'bold' },
  waitingContainer: { alignItems: 'center', marginVertical: 40, width: '100%' }
});