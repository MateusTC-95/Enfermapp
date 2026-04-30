import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView, ScrollView, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../services/api'; 

export default function TelaPagamento() {
  const params = useLocalSearchParams();
  const router = useRouter();
  
  const [status, setStatus] = useState('upload'); 
  const [comprovanteUri, setComprovanteUri] = useState(null);
  const [userIdGerado, setUserIdGerado] = useState(null);
  const [pagamentoAprovado, setPagamentoAprovado] = useState(false);

  // --- MONITORAMENTO REALTIME DA APROVAÇÃO DO PAGAMENTO ---
  useEffect(() => {
    if (status === 'concluido' && userIdGerado) {
      const subscription = supabase
        .channel('check_pagamento')
        .on(
          'postgres_changes',
          { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'profissional', 
            filter: `id_usuario=eq.${userIdGerado}` 
          },
          (payload) => {
            if (payload.new.status_pagamento === 'aprovado') {
              setPagamentoAprovado(true);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [status, userIdGerado]);

  const selecionarComprovante = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.5,
      });

      if (!result.canceled) {
        setComprovanteUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível abrir a galeria.");
    }
  };

  const finalizarPagamento = async () => {
    if (!comprovanteUri) {
      Alert.alert("Atenção", "Por favor, selecione a imagem do comprovante PIX.");
      return;
    }

    setStatus('processando');

    try {
      // 1. UPLOAD DO COMPROVANTE
      const response = await fetch(comprovanteUri);
      const arrayBuffer = await response.arrayBuffer();
      const fileName = `comprovante_${Date.now()}.jpg`;

      const { error: storageError } = await supabase.storage
        .from('comprovantes')
        .upload(fileName, arrayBuffer, { contentType: 'image/jpeg', upsert: true });

      if (storageError) throw storageError;

      const { data: { publicUrl } } = supabase.storage
        .from('comprovantes').getPublicUrl(fileName);

      // 2. CRIAR USUÁRIO
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
        if (erroUsuario.code === '23505') {
          throw new Error("Este nome de usuário já existe. Por favor, volte e escolha outro.");
        }
        throw erroUsuario;
      }

      const idCriado = novoUsuario.id_usuario || novoUsuario.id; 
      setUserIdGerado(idCriado);

      // 3. CRIAR PROFISSIONAL (Status inicial como pendente)
      const { error: erroProfissional } = await supabase
        .from('profissional')
        .insert([{ 
          id_usuario: idCriado, 
          plano: params.planoId, 
          status_aprovacao: 'pendente',
          status_pagamento: 'pendente', // Garante que comece pendente
          url_comprovante_pix: publicUrl, // Corrigido para bater com a tabela
          coren_url: params.coren_url,
          descricao: "" 
        }]);

      if (erroProfissional) throw erroProfissional;

      setStatus('concluido');

    } catch (error) {
      console.error("Erro no processo:", error);
      Alert.alert("Erro no Cadastro", error.message);
      setStatus('upload');
    }
  };

  if (status === 'processando' || status === 'concluido') {
    return (
      <SafeAreaView style={styles.containerCentro}>
        <View style={styles.successCard}>
          {status === 'processando' ? (
            <>
              <ActivityIndicator size="large" color="#00ff00" />
              <Text style={styles.tituloSucesso}>Processando Cadastro...</Text>
              <Text style={styles.subtituloSucesso}>Criando sua conta e vinculando seus documentos...</Text>
            </>
          ) : (
            <>
              {!pagamentoAprovado ? (
                <>
                  <ActivityIndicator size={60} color="#00ff00" style={{ marginBottom: 20 }} />
                  <Text style={styles.tituloSucesso}>Aguardando Aprovação do PIX</Text>
                  <Text style={styles.subtituloSucesso}>
                    Recebemos seu comprovante! Um administrador irá validar o pagamento para liberar seu acesso.
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.emoji}>✅</Text>
                  <Text style={styles.tituloSucesso}>Pagamento Confirmado!</Text>
                  <Text style={styles.subtituloSucesso}>Sua conta foi liberada. Vamos para o último passo.</Text>
                  
                  <TouchableOpacity 
                    style={styles.botaoProximo} 
                    onPress={() => {
                      router.push({
                        pathname: '/cadastro_passo6', 
                        params: { id_usuario: String(userIdGerado) } 
                      });
                    }}
                  >
                    <Text style={styles.botaoTextoProximo}>CONFIGURAÇÕES FINAIS ➔</Text>
                  </TouchableOpacity>
                </>
              )}
            </>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.stepText}>Passo 5/5</Text>
        <Text style={styles.mainTitle}>Efetue o pagamento e envie o comprovante</Text>

        <View style={styles.pixCard}>
          <View style={styles.pixHeader}><Text style={styles.pixHeaderText}>pix</Text></View>
          <View style={styles.pixBody}>
            <Text style={styles.pixLabel}>Valor: R$ {params.valor}</Text>
            <Text style={styles.pixValue}>enfermapp@gmail.com</Text>
          </View>
        </View>

        <View style={styles.comprovanteSection}>
           <TouchableOpacity 
              style={[styles.uploadBox, comprovanteUri ? styles.uploadBoxActive : null]} 
              onPress={selecionarComprovante}
           >
              {comprovanteUri ? (
                <Image source={{ uri: comprovanteUri }} style={styles.previewImagem} />
              ) : (
                <Text style={styles.uploadText}>Selecionar Comprovante PIX</Text>
              )}
           </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.botaoFinalizar} onPress={finalizarPagamento}>
          <Text style={styles.botaoTexto}>CONCLUIR CADASTRO</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  containerCentro: { flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingHorizontal: 30, paddingTop: 40, alignItems: 'center' },
  stepText: { fontSize: 32, color: '#00ff00', fontWeight: 'bold' },
  mainTitle: { fontSize: 18, textAlign: 'center', marginVertical: 20 },
  pixCard: { width: '100%', borderWidth: 1, borderColor: '#ccc', borderRadius: 10, overflow: 'hidden' },
  pixHeader: { backgroundColor: '#333', padding: 5 },
  pixHeaderText: { color: '#fff', textAlign: 'center' },
  pixBody: { padding: 20, alignItems: 'center' },
  pixLabel: { color: '#888' },
  pixValue: { fontSize: 18, fontWeight: 'bold' },
  comprovanteSection: { width: '100%', marginVertical: 30 },
  uploadBox: { height: 200, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center', borderRadius: 10, borderStyle: 'dashed', borderWidth: 2, borderColor: '#ccc' },
  uploadBoxActive: { borderStyle: 'solid', borderColor: '#00ff00' },
  previewImagem: { width: '100%', height: '100%', borderRadius: 10 },
  uploadText: { color: '#666' },
  botaoFinalizar: { backgroundColor: '#0077c2', width: '100%', height: 60, justifyContent: 'center', alignItems: 'center', borderRadius: 10 },
  botaoTexto: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  successCard: { padding: 30, alignItems: 'center', width: '90%' },
  emoji: { fontSize: 60, marginBottom: 20 },
  tituloSucesso: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 10, textAlign: 'center' },
  subtituloSucesso: { textAlign: 'center', color: '#666', marginBottom: 30 },
  botaoProximo: { backgroundColor: '#00ff00', paddingHorizontal: 20, paddingVertical: 15, borderRadius: 10 },
  botaoTextoProximo: { fontWeight: 'bold', color: '#000' }
});