import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Image, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

export default function TelaPagamento() {
  const router = useRouter();
  // PEGA TUDO: nome, senha, tipo, cidade, foto_coren e plano!
  const params = useLocalSearchParams(); 
  
  const [comprovante, setComprovante] = useState<string | null>(null);
  const [aguardando, setAguardando] = useState(false);

  const selecionarComprovante = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
    });

    if (!result.canceled) {
      setComprovante(result.assets[0].uri);
    }
  };

  const finalizarPagamento = async () => {
    setAguardando(true);

    try {
      // 1. Prepara o objeto com todos os dados acumulados
      const dadosCadastro = {
        acao: "cadastrar",
        nome_usuario: params.nome_usuario,
        senha: params.senha,
        tipo_conta: params.tipo_conta,
        cidade: params.cidade,
        plano: params.plano,
        foto_coren: params.foto_coren || null, 
        comprovante_pix: comprovante || null
      };

      // 2. Chamada ao servidor com Headers de navegador para evitar bloqueio
      const response = await fetch('https://enfermapp.great-site.net/backend/public/index.php', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(dadosCadastro),
      });

      // 3. Captura como texto primeiro para investigar possíveis erros HTML do InfinityFree
      const respostaTexto = await response.text();
      console.log("RESPOSTA BRUTA DO SERVIDOR:", respostaTexto);

      // 4. Tenta converter para JSON
      try {
        const resultado = JSON.parse(respostaTexto);
        
        if (resultado.status === "sucesso") {
          console.log("Cadastro salvo com sucesso!");
          // Mantém a tela de 'aguardando' ativa conforme sua lógica
        } else {
          setAguardando(false);
          Alert.alert("Erro no Cadastro", resultado.message || "O servidor recusou os dados.");
        }
      } catch (e) {
        setAguardando(false);
        console.error("Erro ao converter JSON. O servidor mandou HTML.");
        Alert.alert("Erro de Servidor", "O InfinityFree bloqueou a conexão do App. Tente abrir o link do backend no navegador do celular uma vez e tente de novo.");
      }

    } catch (error) {
      setAguardando(false);
      Alert.alert("Erro de Conexão", "Não foi possível contatar o servidor.");
      console.error(error);
    }
  };

  // TELA DE AGUARDANDO APROVAÇÃO (RENDERIZAÇÃO CONDICIONAL)
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
          Finalize sua inscrição efetuando o pagamento do seu plano {params.plano === 'premium' ? 'Premium' : 'Normal'}
        </Text>

        {/* Card do PIX */}
        <View style={styles.pixCard}>
          <View style={styles.pixHeader}>
            <Text style={styles.pixHeaderText}>pix</Text>
            <Text style={styles.pixHeaderSub}>Powered by Banco Central</Text>
          </View>
          <View style={styles.pixBody}>
            <Text style={styles.pixInfoText}>• Chave PIX:</Text>
            <Text style={styles.pixKey}>enfermapp@gmail.com</Text>
            <Text style={styles.pixInfoText}>Valor do Plano:</Text>
            <Text style={styles.pixKey}>{params.plano === 'premium' ? 'R$ 69,00' : 'R$ 49,00'}</Text>
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