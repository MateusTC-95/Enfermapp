import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
// 1. Importar a biblioteca
import * as ImagePicker from 'expo-image-picker';

export default function CadastroPasso4() {
  const router = useRouter();
  
  // O estado 'image' agora vai guardar a URI (o endereço) da foto real
  const [image, setImage] = useState(null);
  const [isWaiting, setIsWaiting] = useState(false);

  // 2. Função para abrir a galeria
  const pickImage = async () => {
    // Pede permissão para acessar a galeria
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      alert("Precisamos de permissão para acessar suas fotos!");
      return;
    }

    // Abre o seletor de imagens
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, // Permite cortar a foto
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri); // Salva o caminho da imagem escolhida
    }
  };

  const handleSend = () => {
    if (!image) {
      alert("Anexe a imagem antes de continuar.");
      return;
    }
    setIsWaiting(true);
  };

  if (isWaiting) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.form}>
          <Text style={styles.stepText}>Passo 4/5</Text>
          <View style={styles.waitingContainer}>
            <ActivityIndicator size="large" color="#00ff00" />
            <Text style={styles.instructionText}>Documento enviado com sucesso!</Text>
            <Text style={{ fontSize: 16, color: '#8b8682', textAlign: 'center' }}>
              Aguarde a aprovação do administrador.
            </Text>
          </View>
          <TouchableOpacity style={styles.nextButton} onPress={() => router.push('/cadastro_passo5')}>
            <Text style={styles.nextButtonText}>SIMULAR APROVAÇÃO</Text>
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
             {/* 3. Se tiver imagem, mostra ela. Se não, mostra o ícone cinza */}
             {image ? (
               <Image source={{ uri: image }} style={styles.previewImage} />
             ) : (
               <View style={styles.mountainIcon} />
             )}
          </View>
          
          <TouchableOpacity style={styles.attachButton} onPress={pickImage}>
            <Text style={styles.attachButtonText}>
                {image ? "Trocar Imagem 📸" : "Anexar Imagem"}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={handleSend}>
          <Text style={styles.nextButtonText}>PRÓXIMO</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  form: { 
    flex: 1, 
    paddingHorizontal: 30, 
    alignItems: 'center', 
    paddingTop: 60 
  },
  stepText: { 
    fontSize: 40, 
    color: '#00ff00', 
    marginBottom: 40 
  },
  instructionText: { 
    fontSize: 20, 
    textAlign: 'center', 
    marginBottom: 20 
  },
  imageViewer: { 
    width: '100%', 
    backgroundColor: '#8b8682', 
    height: 350, 
    justifyContent: 'space-between', 
    marginBottom: 40 
  },
  placeholderBox: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  previewImage: { 
    width: '100%', 
    height: '100%', 
    resizeMode: 'cover' 
  }, // Mostra a foto real
  mountainIcon: { 
    width: 150, 
    height: 100, 
    borderWidth: 2, 
    borderColor: '#333', 
    borderRadius: 10 
  },
  attachButton: { 
    backgroundColor: '#333', 
    height: 60, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  attachButtonText: { 
    color: '#fff', 
    fontSize: 22 
  },
  nextButton: { 
    backgroundColor: '#0077c2', 
    width: 220, 
    height: 80, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  nextButtonText: { 
    color: '#000', 
    fontSize: 22, 
    fontWeight: 'bold' 
  },
});