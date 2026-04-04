import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, Image, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

export default function CadastroPasso4() {
  const router = useRouter();
  // Recebe os dados acumulados (tipo_conta, nome, senha, cidade)
  const params = useLocalSearchParams(); 
  
  const [image, setImage] = useState(null);
  const [isWaiting, setIsWaiting] = useState(false);

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
      quality: 0.5, // Reduzi a qualidade para 0.5 para não travar o app no envio futuro
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSend = () => {
    if (!image) {
      Alert.alert("Aviso", "Por favor, anexe a imagem do seu COREN para continuar.");
      return;
    }
    // Ativa a tela de "sucesso/aguardando"
    setIsWaiting(true);
  };

  // Tela de Simulação de Envio
  if (isWaiting) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.form}>
          <Text style={styles.stepText}>Passo 4/5</Text>
          <View style={styles.waitingContainer}>
            <ActivityIndicator size="large" color="#00ff00" />
            <Text style={styles.instructionText}>Documento enviado com sucesso!</Text>
            <Text style={{ fontSize: 16, color: '#8b8682', textAlign: 'center', marginBottom: 30 }}>
              O sistema pré-validou sua imagem. Prossiga para a escolha do plano.
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.nextButton} 
            onPress={() => router.push({
              pathname: '/cadastro_passo5',
              params: { ...params, foto_coren: image } // Adiciona a foto na mochila
            })}
          >
            <Text style={styles.nextButtonText}>PROSSEGUIR</Text>
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
          
          <TouchableOpacity style={styles.attachButton} onPress={pickImage}>
            <Text style={styles.attachButtonText}>
                {image ? "Trocar Imagem 📸" : "Anexar Imagem"}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={handleSend}>
          <Text style={styles.nextButtonText}>PRÓXIMO</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()} style={{marginTop: 20}}>
          <Text style={{color: '#8b8682'}}>Voltar</Text>
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
     },
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
    width: 220, height: 80, 
    justifyContent: 'center', 
    alignItems: 'center'
   },
  nextButtonText: { 
    color: '#000', 
    fontSize: 22, 
    fontWeight: 'bold'
   },
  waitingContainer: { 
    alignItems: 'center', 
    marginVertical: 40 
  }
});