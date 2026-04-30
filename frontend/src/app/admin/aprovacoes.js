import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, FlatList, Image, ActivityIndicator, Alert } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '../../services/api'; 

export default function VerificacaoProfissionais() {
  const router = useRouter();
  
  const [viewMode, setViewMode] = useState('menu'); // 'menu', 'lista_docs', 'lista_pagos'
  const [itemSelecionado, setItemSelecionado] = useState(null); 
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (viewMode !== 'menu') {
      fetchPendentes();
    }
  }, [viewMode]);

  const fetchPendentes = async () => {
    setLoading(true);
    try {
      // Buscamos as colunas necessárias de ambas as etapas
      let query = supabase.from('profissional').select(`
        id_profissional, id_usuario, coren_url, comprovante_url, status_aprovacao, status_pagamento,
        usuario:id_usuario ( nome_usuario )
      `);

      if (viewMode === 'lista_docs') {
        // FILTRO DOCUMENTOS: Status aprovacao pendente E tem imagem do coren
        query = query.eq('status_aprovacao', 'pendente').not('coren_url', 'is', null);
      } else if (viewMode === 'lista_pagos') {
        // FILTRO PAGAMENTOS: Status pagamento pendente E tem imagem do comprovante
        // IMPORTANTE: Aqui filtramos pela coluna status_pagamento!
        query = query.eq('status_pagamento', 'pendente').not('comprovante_url', 'is', null);
      }

      const { data, error } = await query;
      if (error) throw error;
      setLista(data);
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Falha ao carregar dados.");
    } finally {
      setLoading(false);
    }
  };

  const julgarStatus = async (status) => {
    try {
      // Definimos qual coluna vamos atualizar baseado no modo que estamos
      const colunaParaAtualizar = viewMode === 'lista_docs' ? 'status_aprovacao' : 'status_pagamento';
      
      const objetoUpdate = {};
      objetoUpdate[colunaParaAtualizar] = status;

      const { error } = await supabase
        .from('profissional')
        .update(objetoUpdate)
        .eq('id_profissional', itemSelecionado.id_profissional);

      if (error) throw error;

      Alert.alert("Sucesso", `${viewMode === 'lista_docs' ? 'Documento' : 'Pagamento'} foi ${status}!`);
      setItemSelecionado(null);
      fetchPendentes();
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível atualizar o status.");
    }
  };

  // --- RENDER 1: DETALHE (FOTO + BOTÕES) ---
  if (itemSelecionado) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: '#8C8C8C' }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => setItemSelecionado(null)}>
          <Ionicons name="arrow-back" size={40} color="black" />
        </TouchableOpacity>
        
        <View style={styles.detailContent}>
          <Text style={styles.detailName}>{itemSelecionado.usuario?.nome_usuario}</Text>
          <Text style={styles.detailSub}>
            {viewMode === 'lista_docs' ? 'Documento COREN:' : 'Comprovante PIX:'}
          </Text>
          
          <Image 
            source={{ uri: viewMode === 'lista_docs' ? itemSelecionado.coren_url : itemSelecionado.comprovante_url }} 
            style={styles.fullImage}
            resizeMode="contain"
          />

          <View style={styles.rowActions}>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#00C851' }]} onPress={() => julgarStatus('aprovado')}>
              <Ionicons name="checkmark" size={60} color="black" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#ff4444' }]} onPress={() => julgarStatus('rejeitado')}>
              <Ionicons name="close" size={60} color="black" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // --- RENDER 2: LISTA DE NOMES ---
  if (viewMode !== 'menu') {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => setViewMode('menu')}>
          <Ionicons name="chevron-back-outline" size={40} color="black" />
        </TouchableOpacity>
        
        <Text style={styles.title}>{viewMode === 'lista_docs' ? 'Documentos Pendentes' : 'Pagamentos Pendentes'}</Text>
        
        {loading ? (
          <ActivityIndicator size="large" color="#00ff00" style={{marginTop: 50}} />
        ) : (
          <FlatList
            data={lista}
            keyExtractor={item => String(item.id_profissional)}
            contentContainerStyle={{ paddingHorizontal: 20 }}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.nameCard} onPress={() => setItemSelecionado(item)}>
                <Text style={styles.nameText}>{item.usuario?.nome_usuario}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma pendência encontrada.</Text>}
          />
        )}
      </SafeAreaView>
    );
  }

  // --- RENDER 3: MENU INICIAL ---
  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="chevron-back-outline" size={40} color="black" />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>Verificação de Profissionais</Text>
        <Text style={styles.subtitle}>Selecione uma das Opções Abaixo:</Text>

        <View style={styles.row}>
          <TouchableOpacity style={styles.squareButton} onPress={() => setViewMode('lista_docs')}>
            <Ionicons name="attach-outline" size={80} color="black" />
            <Text style={styles.buttonText}>Documentos</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.squareButton} onPress={() => setViewMode('lista_pagos')}>
            <FontAwesome5 name="dollar-sign" size={70} color="black" />
            <Text style={styles.buttonText}>Pagamento</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  backButton: { padding: 20, marginTop: 10, alignSelf: 'flex-start' },
  content: { flex: 1, alignItems: 'center', paddingHorizontal: 20 },
  title: { fontSize: 26, textAlign: 'center', marginTop: 20, marginBottom: 40, fontWeight: 'bold' },
  subtitle: { fontSize: 20, textAlign: 'center', marginBottom: 60 },
  row: { flexDirection: 'row', justifyContent: 'center', gap: 30 },
  squareButton: { width: 150, height: 150, backgroundColor: '#7a7a7a', justifyContent: 'center', alignItems: 'center' },
  buttonText: { color: '#000', fontSize: 18, marginTop: 5 },
  nameCard: { backgroundColor: '#7a7a7a', padding: 20, marginBottom: 15, alignItems: 'center' },
  nameText: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#888' },
  detailContent: { flex: 1, alignItems: 'center', padding: 20 },
  detailName: { fontSize: 24, fontWeight: 'bold', marginBottom: 5 },
  detailSub: { fontSize: 18, marginBottom: 20 },
  fullImage: { width: '100%', height: 300, backgroundColor: '#fff', borderRadius: 10 },
  rowActions: { flexDirection: 'row', gap: 40, marginTop: 40 },
  actionBtn: { width: 100, height: 100, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderRadius: 5 }
});