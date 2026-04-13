import React, { useState } from 'react';
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

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert("Permissão Necessária", "Precisamos de acesso às suas fotos para validar seu registro.");
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
      Alert.alert("Aviso", "Por favor, anexe a imagem do seu COREN para continuar.");
      return;
    }

    try {
      setIsUploading(true);

      // --- USANDO ARRAYBUFFER PARA ESTABILIDADE ---
      const uri = image;
      const response = await fetch(uri);
      const arrayBuffer = await response.arrayBuffer();
      
      const fileName = `coren_${Date.now()}.jpg`;

      // Upload para o Storage
      const { data, error } = await supabase.storage
        .from('documentos_profissionais')
        .upload(fileName, arrayBuffer, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (error) throw error;

      // Pegar a URL pública
      const { data: publicData } = supabase.storage
        .from('documentos_profissionais')
        .getPublicUrl(fileName);

      setUrlFinal(publicData.publicUrl);
      setIsWaiting(true); // Ativa a tela de confirmação de sucesso

    } catch (error) {
      console.error("ERRO DETALHADO:", error);
      Alert.alert("Erro no Upload", "Não conseguimos salvar a foto. Verifique sua conexão.");
    } finally {
      setIsUploading(false);
    }
  };

  // --- TELA DE ESPERA / SUCESSO (Aparece após o upload) ---
  if (isWaiting) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.form}>
          <Text style={styles.stepText}>Passo 4/5</Text>
          <View style={styles.waitingContainer}>
            <Text style={{ fontSize: 60, marginBottom: 20 }}>✅</Text>
            <Text style={styles.instructionText}>Documento Validado!</Text>
            <Text style={{ fontSize: 16, color: '#8b8682', textAlign: 'center', marginBottom: 30 }}>
              Sua carteira do COREN foi enviada para nossos servidores.
            </Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.nextButton, { backgroundColor: '#00ff00' }]} 
            onPress={() => router.push({
              pathname: '/cadastro_passo5',
              params: { ...params, coren_url: urlFinal } 
            })}
          >
            <Text style={styles.nextButtonText}>PROSSEGUIR PARA PLANOS</Text>
          </TouchableOpacity>
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
          
          <TouchableOpacity 
            style={styles.attachButton} 
            onPress={pickImage}
            disabled={isUploading}
          >
            <Text style={styles.attachButtonText}>
                {image ? "Trocar Imagem 📸" : "Anexar Imagem"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Botão Dinâmico: Se estiver subindo, mostra ActivityIndicator */}
        <TouchableOpacity 
            style={[styles.nextButton, { opacity: isUploading ? 0.7 : 1 }]} 
            onPress={handleSend}
            disabled={isUploading}
        >
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
          <TouchableOpacity onPress={() => router.back()} style={{marginTop: 20}}>
            <Text style={{color: '#8b8682'}}>Voltar</Text>
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
  waitingContainer: { alignItems: 'center', marginVertical: 40 }
});