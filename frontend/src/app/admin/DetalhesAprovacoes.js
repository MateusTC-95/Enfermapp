import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../services/api'; // Ajuste o caminho se necessário

export default function AprovacaoCorenAdmin() {
  const [profissionais, setProfissionais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selecionado, setSelecionado] = useState(null);

  useEffect(() => {
    fetchPendentes();
  }, []);

  const fetchPendentes = async () => {
    setLoading(true);
    try {
      // Busca profissionais onde o status_aprovacao é pendente e tem URL de COREN
      const { data, error } = await supabase
        .from('profissional')
        .select(`
          id_profissional,
          coren_url,
          status_aprovacao,
          usuario:id_usuario ( nome_usuario )
        `)
        .eq('status_aprovacao', 'pendente')
        .not('coren_url', 'is', null);

      if (error) throw error;
      setProfissionais(data);
    } catch (error) {
      Alert.alert("Erro", "Erro ao carregar documentos pendentes.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const atualizarStatus = async (id, novoStatus) => {
    try {
      const { error } = await supabase
        .from('profissional')
        .update({ status_aprovacao: novoStatus })
        .eq('id_profissional', id);

      if (error) throw error;

      Alert.alert("Sucesso", `Documento ${novoStatus === 'aprovado' ? 'aprovado' : 'rejeitado'}!`);
      setSelecionado(null);
      fetchPendentes(); // Atualiza a lista
    } catch (error) {
      Alert.alert("Erro", "Não foi possível atualizar o status.");
    }
  };

  // Renderização da Lista de Profissionais
  if (!selecionado) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.headerTitle}>Aprovações de COREN</Text>
        
        {loading ? (
          <ActivityIndicator size="large" color="#00ff00" style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={profissionais}
            keyExtractor={(item) => item.id_profissional.toString()}
            ListEmptyComponent={<Text style={styles.emptyText}>Nenhum documento pendente.</Text>}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.card} onPress={() => setSelecionado(item)}>
                <View style={styles.cardInfo}>
                  <Ionicons name="person-circle-outline" size={40} color="#333" />
                  <Text style={styles.nomeProfissional}>{item.usuario?.nome_usuario}</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#666" />
              </TouchableOpacity>
            )}
          />
        )}
      </SafeAreaView>
    );
  }

  // Renderização do Detalhe (Visualizar Imagem e Aprovar)
  return (
    <SafeAreaView style={styles.containerDetalhe}>
      <View style={styles.headerDetalhe}>
        <TouchableOpacity onPress={() => setSelecionado(null)}>
          <Ionicons name="arrow-back" size={30} color="black" />
        </TouchableOpacity>
        <Text style={styles.nomeTitulo}>{selecionado.usuario?.nome_usuario}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>Documento Enviado:</Text>
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: selecionado.coren_url }} 
            style={styles.documentoImg}
            resizeMode="contain"
          />
        </View>

        <View style={styles.actions}>
          <TouchableOpacity 
            style={[styles.btnAction, { backgroundColor: '#ff4444' }]} 
            onPress={() => atualizarStatus(selecionado.id_profissional, 'rejeitado')}
          >
            <Ionicons name="close-outline" size={40} color="white" />
            <Text style={styles.btnLabel}>Rejeitar</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.btnAction, { backgroundColor: '#00C851' }]} 
            onPress={() => atualizarStatus(selecionado.id_profissional, 'aprovado')}
          >
            <Ionicons name="checkmark-outline" size={40} color="white" />
            <Text style={styles.btnLabel}>Aprovar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginVertical: 20 },
  emptyText: { textAlign: 'center', color: '#888', marginTop: 50 },
  card: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    backgroundColor: '#f9f9f9', 
    padding: 15, 
    borderRadius: 10, 
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee'
  },
  cardInfo: { flexDirection: 'row', alignItems: 'center' },
  nomeProfissional: { fontSize: 18, marginLeft: 10, fontWeight: '500' },
  
  // Estilos do Detalhe
  containerDetalhe: { flex: 1, backgroundColor: '#fff' },
  headerDetalhe: { flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderColor: '#eee' },
  nomeTitulo: { fontSize: 20, fontWeight: 'bold', marginLeft: 15 },
  content: { flex: 1, padding: 20, alignItems: 'center' },
  label: { fontSize: 16, color: '#666', marginBottom: 10 },
  imageContainer: { width: '100%', height: '60%', backgroundColor: '#eee', borderRadius: 10, overflow: 'hidden' },
  documentoImg: { width: '100%', height: '100%' },
  actions: { flexDirection: 'row', marginTop: 30, gap: 20 },
  btnAction: { flex: 1, height: 100, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  btnLabel: { color: 'white', fontWeight: 'bold', marginTop: 5 }
});