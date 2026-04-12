import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView, ScrollView, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';
import { decode } from 'base64-arraybuffer';

export default function TelaPagamento() {
  const params = useLocalSearchParams();
  const router = useRouter();
  
  const [aguardando, setAguardando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  
  // Estados para a imagem
  const [comprovanteUri, setComprovanteUri] = useState<string | null>(null);
  const [comprovanteBase64, setComprovanteBase64] = useState<string | null>(null);

  // Função para selecionar a imagem
  const selecionarComprovante = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.5,
        base64: true, // Crucial para o upload funcionar
      });

      if (!result.canceled && result.assets[0].base64) {
        setComprovanteUri(result.assets[0].uri);
        setComprovanteBase64(result.assets[0].base64);
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível abrir a galeria.");
    }
  };

  const finalizarPagamento = async () => {
    // Validação: Não deixa prosseguir sem a foto
    if (!comprovanteBase64) {
      Alert.alert("Atenção", "Por favor, selecione a imagem do comprovante PIX.");
      return;
    }

    setAguardando(true);

    try {
      // 1. UPLOAD DA IMAGEM PARA O STORAGE
      // O nome do arquivo será único baseado no tempo para não sobrescrever
      const fileName = `comprovante_${Date.now()}.jpg`;
      
      const { data: storageData, error: storageError } = await supabase.storage
        .from('comprovantes')
        .upload(fileName, decode(comprovanteBase64), {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (storageError) throw new Error("Erro no Storage: " + storageError.message);

      // Pegar a URL pública que o Admin vai acessar
      const { data: { publicUrl } } = supabase.storage
        .from('comprovantes')
        .getPublicUrl(fileName);

      // 2. CRIAR USUÁRIO (Tabela 10)
      const { data: novoUsuario, error: erroUsuario } = await supabase
        .from('usuario')
        .insert([{ 
          nome_usuario: params.nome_usuario, 
          senha: params.senha, 
          tipo_conta: 'profissional', 
          cidade: params.cidade,
          status_conta: 'pendente' 
        }])
        .select()
        .single();

      if (erroUsuario) {
        if (erroUsuario.code === '23505') throw new Error("Este nome de usuário já existe.");
        throw erroUsuario;
      }

      // 3. CRIAR PROFISSIONAL (Tabela 7)
      const { error: erroProfissional } = await supabase
        .from('profissional')
        .insert([{ 
          id_usuario: novoUsuario.id, 
          plano: params.planoId, 
          status_aprovacao: 'pendente',
          comprovante_url: publicUrl, // Link da imagem salvo no banco
          descricao: ""
        }]);

      if (erroProfissional) throw erroProfissional;

      setAguardando(false);
      setSucesso(true);

    } catch (error: any) {
      setAguardando(false);
      console.error("Erro detalhado:", error);
      Alert.alert("Erro ao Finalizar", error.message);
    }
  };

  // Tela de confirmação após sucesso
  if (sucesso) {
    return (
      <SafeAreaView style={styles.containerCentro}>
        <View style={styles.successCard}>
           <Text style={styles.emoji}>✅</Text>
           <Text style={styles.tituloSucesso}>Pagamento Enviado!</Text>
           <Text style={styles.subtituloSucesso}>
             Recebemos seu comprovante. Agora nossa equipe vai validar os dados e ativar sua conta em breve.
           </Text>
           <TouchableOpacity style={styles.botaoVoltar} onPress={() => router.replace('/')}>
             <Text style={styles.botaoTextoVoltar}>VOLTAR PARA O INÍCIO</Text>
           </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <Text style={styles.stepText}>Passo 5/5</Text>
        <Text style={styles.mainTitle}>Efetue o pagamento e envie o comprovante abaixo</Text>

        {/* Informações do PIX */}
        <View style={styles.pixCard}>
          <View style={styles.pixHeader}><Text style={styles.pixHeaderText}>pix</Text></View>
          <View style={styles.pixBody}>
            <Text style={styles.pixLabel}>Chave PIX (E-mail):</Text>
            <Text style={styles.pixValue}>enfermapp@gmail.com</Text>
            
            <View style={styles.separator} />
            
            <Text style={styles.pixLabel}>Valor a pagar:</Text>
            <Text style={styles.pixValue}>R$ {params.valor}</Text>
          </View>
        </View>

        {/* Campo de Seleção de Imagem */}
        <View style={styles.comprovanteSection}>
           <Text style={styles.comprovanteTitle}>• Anexar Comprovante</Text>
           <TouchableOpacity 
              style={[styles.uploadBox, comprovanteUri ? styles.uploadBoxActive : null]} 
              onPress={selecionarComprovante}
              activeOpacity={0.8}
           >
              {comprovanteUri ? (
                <Image source={{ uri: comprovanteUri }} style={styles.previewImagem} />
              ) : (
                <View style={{ alignItems: 'center' }}>
                  <View style={styles.iconPlaceholder} />
                  <Text style={styles.uploadText}>Toque para selecionar a foto</Text>
                </View>
              )}
           </TouchableOpacity>
        </View>

        {/* Botão Finalizar */}
        <TouchableOpacity 
          style={[styles.botaoFinalizar, aguardando && { opacity: 0.7 }]} 
          onPress={finalizarPagamento}
          disabled={aguardando}
        >
          {aguardando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.botaoTexto}>CONCLUIR CADASTRO</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingHorizontal: 30, paddingTop: 40, paddingBottom: 50, alignItems: 'center' },
  stepText: { fontSize: 35, color: '#00ff00', fontWeight: 'bold', marginBottom: 10 },
  mainTitle: { fontSize: 18, textAlign: 'center', marginBottom: 30, color: '#333' },
  
  pixCard: { width: '100%', borderRadius: 20, overflow: 'hidden', backgroundColor: '#f9f9f9', marginBottom: 25, borderWidth: 1, borderColor: '#eee', elevation: 2 },
  pixHeader: { backgroundColor: '#008080', padding: 12, alignItems: 'center' },
  pixHeaderText: { color: '#fff', fontSize: 22, fontWeight: 'bold', fontStyle: 'italic' },
  pixBody: { padding: 20, alignItems: 'center' },
  pixLabel: { fontSize: 13, color: '#888', fontWeight: 'bold', textTransform: 'uppercase' },
  pixValue: { fontSize: 18, color: '#000', marginBottom: 5 },
  separator: { height: 1, width: '80%', backgroundColor: '#eee', marginVertical: 10 },

  comprovanteSection: { width: '100%', marginBottom: 30 },
  comprovanteTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#000' },
  uploadBox: { width: '100%', height: 220, backgroundColor: '#f0f0f0', borderRadius: 15, justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed', borderWidth: 2, borderColor: '#ccc', overflow: 'hidden' },
  uploadBoxActive: { borderStyle: 'solid', borderColor: '#008080' },
  previewImagem: { width: '100%', height: '100%', resizeMode: 'cover' },
  iconPlaceholder: { width: 50, height: 50, backgroundColor: '#ddd', borderRadius: 10, marginBottom: 10 },
  uploadText: { color: '#999', fontSize: 14, fontWeight: '500' },

  botaoFinalizar: { backgroundColor: '#0077c2', width: '100%', height: 65, borderRadius: 12, justifyContent: 'center', alignItems: 'center', elevation: 3 },
  botaoTexto: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

  containerCentro: { flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', padding: 30 },
  successCard: { alignItems: 'center' },
  emoji: { fontSize: 70, marginBottom: 20 },
  tituloSucesso: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: '#000' },
  subtituloSucesso: { textAlign: 'center', color: '#666', marginVertical: 20, lineHeight: 22 },
  botaoVoltar: { backgroundColor: '#007bff', paddingVertical: 15, paddingHorizontal: 40, borderRadius: 10 },
  botaoTextoVoltar: { color: '#fff', fontWeight: 'bold' }
});