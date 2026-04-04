import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

export default function TelaPagamento() {
  const router = useRouter();
  const { plano } = useLocalSearchParams(); // Recebe o plano escolhido na tela anterior
  
  const [comprovante, setComprovante] = useState<string | null>(null);
  const [aguardando, setAguardando] = useState(false);

  const selecionarComprovante = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setComprovante(result.assets[0].uri);
    }
  };

  const finalizarPagamento = () => {
    // Aqui você faria a chamada para o seu Back-end para criar a conta
    setAguardando(true);
    
    // Simulação: Após 4 segundos, ele poderia ser redirecionado ou apenas ficar na tela
    // No cenário real, aqui a conta já estaria salva no banco como "pendente"
  };

  if (aguardando) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#00ff00" />
          <Text style={styles.waitingTitle}>Aguardando Aprovação dos Administradores</Text>
          <Text style={styles.waitingSubtitle}>
            Sua conta está sendo analisada. Você receberá uma notificação assim que for aprovado!
          </Text>
          <TouchableOpacity 
            style={[styles.payButton, { marginTop: 40 }]} 
            onPress={() => router.replace('/')}
          >
            <Text style={styles.payButtonText}>VOLTAR AO INÍCIO</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <Text style={styles.mainTitle}>
          Finalize sua inscrição efetuando o pagamento do seu plano
        </Text>

        {/* Card do PIX (Estilo image_ac4a0f) */}
        <View style={styles.pixCard}>
          <View style={styles.pixHeader}>
            <Text style={styles.pixHeaderText}>pix</Text>
            <Text style={styles.pixHeaderSub}>Powered by Banco Central</Text>
          </View>
          <View style={styles.pixBody}>
            <Text style={styles.pixInfoText}>• Chave PIX:</Text>
            <Text style={styles.pixKey}>enfermapp@gmail.com</Text>
            <Text style={styles.pixInfoText}>Telefone de Contato:</Text>
            <Text style={styles.pixKey}>+55 19 4002-8922</Text>
          </View>
        </View>

        {/* Área de Comprovante */}
        <Text style={styles.labelAdicionar}>• Adicionar Comprovante (opcional)</Text>
        
        <View style={styles.imageViewer}>
          <View style={styles.placeholderBox}>
             {comprovante ? (
               <Image source={{ uri: comprovante }} style={styles.previewImage} />
             ) : (
               <View style={styles.mountainIcon} />
             )}
          </View>
          
          <TouchableOpacity style={styles.attachButton} onPress={selecionarComprovante}>
            <Text style={styles.attachButtonText}>
                {comprovante ? "Comprovante Anexado" : "Anexar Imagem"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Botão Pagamento Efetuado (Estilo image_ac4a4e) */}
        <TouchableOpacity style={styles.payButton} onPress={finalizarPagamento}>
          <Text style={styles.payButtonText}>Pagamento Efetuado</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff'
 },
  scrollContent: { 
    paddingHorizontal: 30, 
    alignItems: 'center', 
    paddingTop: 50, 
    paddingBottom: 40 
},
  mainTitle: { 
    fontSize: 20,
     textAlign: 'center', 
     marginBottom: 40, 
     color: '#000' 
    },
  
  // Card PIX Estilizado
  pixCard: {
     width: '100%',
      borderRadius: 30, 
      overflow: 'hidden', 
      marginBottom: 40 
    },
  pixHeader: { 
    backgroundColor: '#008080', 
    padding: 15, 
    alignItems: 'center' 
},
  pixHeaderText: { 
    color: '#fff', 
    fontSize: 32, 
    fontWeight: 'bold', 
    fontStyle: 'italic' },
  pixHeaderSub: { 
    color: '#fff', 
    fontSize: 10 
},
  pixBody: { 
    backgroundColor: '#8b8682', 
    padding: 25, 
    alignItems: 'center' 
},
  pixInfoText: { 
    fontSize: 18, 
    color: '#000', 
    marginBottom: 5 
},
  pixKey: { 
    fontSize: 18, 
    color: '#000', 
    fontWeight: 'bold', marginBottom: 15 },
  labelAdicionar: { 
    fontSize: 18, 
    color: '#000', alignSelf: 'flex-start', marginBottom: 15 },

  // Área de Anexo
  imageViewer: { width: '100%', backgroundColor: '#8b8682', height: 320, justifyContent: 'space-between', marginBottom: 40 },
  placeholderBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  mountainIcon: { width: 180, height: 130, borderWidth: 2, borderColor: '#333', borderRadius: 15 },
  attachButton: { backgroundColor: '#333', height: 60, justifyContent: 'center', alignItems: 'center' },
  attachButtonText: { color: '#fff', fontSize: 22 },

  // Botão Final
  payButton: { backgroundColor: '#0077c2', width: 220, height: 90, justifyContent: 'center', alignItems: 'center' },
  payButtonText: { color: '#000', fontSize: 22, fontWeight: '400', textAlign: 'center' },

  // Tela de Aguardando
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  waitingTitle: { fontSize: 24, fontWeight: 'bold', color: '#000', textAlign: 'center', marginTop: 20 },
  waitingSubtitle: { fontSize: 16, color: '#8b8682', textAlign: 'center', marginTop: 15 }
});