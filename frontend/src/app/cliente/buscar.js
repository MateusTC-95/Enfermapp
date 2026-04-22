import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '../../services/api';

export default function BuscarServicos() {
  const router = useRouter();
  const [passo, setPasso] = useState(1);
  const [servicos, setServicos] = useState([]);
  const [servicoSelecionado, setServicoSelecionado] = useState(null);
  const [profissionais, setProfissionais] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. Busca a lista de serviços ao carregar
  useEffect(() => {
    fetchServicos();
  }, []);

  const fetchServicos = async () => {
    try {
      console.log("Tentando buscar serviços no Supabase...");
      const { data, error } = await supabase.from('servicos').select('*');
      
      if (error) {
        console.error("Erro Supabase:", error.message);
        Alert.alert("Erro no Banco", error.message);
        return;
      }

      console.log("Serviços recebidos:", data?.length || 0);
      setServicos(data || []);
    } catch (err) {
      console.error("Erro inesperado:", err);
      Alert.alert("Erro Crítico", "Falha ao conectar com o serviço.");
    }
  };

  const buscarProfissionais = async (idServico) => {
    setLoading(true);
    try {
      console.log("Buscando profissionais para o serviço:", idServico);
      const { data, error } = await supabase
        .from('profissional')
        .select(`
          id_profissional,
          usuario!inner (nome_usuario, cidade, foto_perfil, telefone),
          servicos_profissional!inner (id_servico)
        `)
        .eq('servicos_profissional.id_servico', idServico);
        // Removi temporariamente o filtro de status_aprovacao para testar

      if (error) throw error;

      console.log("Profissionais encontrados:", data?.length || 0);
      setProfissionais(data || []);
      setPasso(3); 
    } catch (error) {
      console.error("Erro na busca:", error.message);
      Alert.alert("Erro na Busca", error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- TELA 1: INICIAL ---
  if (passo === 1) {
    return (
      <View style={styles.container}>
        <TouchableOpacity 
          activeOpacity={0.7}
          style={styles.buttonWhite} 
          onPress={() => {
            console.log("Botão clicado! Mudando para passo 2...");
            setPasso(2);
          }}
        >
          <Text style={styles.titletext}>Clique Aqui para Buscar um Serviço</Text>
        </TouchableOpacity>
        
        <Text style={styles.texto}>
          Busque o serviço desejado e encontre profissionais disponíveis na sua região de forma rápida e segura.
        </Text>
        
        <View style={styles.centralizacaoIcon}>
          <Ionicons name="search-outline" size={100} color="black" />
        </View>

        {/* Aviso visual caso a lista de serviços esteja vazia */}
        {servicos.length === 0 && (
          <Text style={{color: 'red', textAlign: 'center', marginTop: 10}}>
            Aviso: Nenhum serviço carregado do banco ainda.
          </Text>
        )}
      </View>
    );
  }

  // --- TELA 2: SELECIONAR SERVIÇO ---
  if (passo === 2) {
    return (
      <View style={styles.container}>
        <View style={styles.headerSelection}>
          <TouchableOpacity onPress={() => setPasso(1)}>
            <Ionicons name="close-outline" size={40} color="red" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Selecione o Tipo de Serviço</Text>
        </View>

        <ScrollView style={{ flex: 1 }}>
          {servicos.map((item) => (
            <TouchableOpacity 
              key={item.id_servico} 
              style={styles.radioOption}
              onPress={() => {
                console.log("Serviço selecionado:", item.nome_servico);
                setServicoSelecionado(item);
              }}
            >
              <View style={[
                styles.radioCircle, 
                servicoSelecionado?.id_servico === item.id_servico && styles.radioSelected
              ]} />
              <Text style={styles.radioText}>{item.nome_servico}</Text>
            </TouchableOpacity>
          ))}
          {servicos.length === 0 && <Text style={styles.texto}>Carregando serviços...</Text>}
        </ScrollView>

        <TouchableOpacity 
          style={[styles.btnProcurar, !servicoSelecionado && {opacity: 0.5}]} 
          onPress={() => {
            if(!servicoSelecionado) {
                Alert.alert("Aviso", "Selecione um serviço primeiro!");
                return;
            }
            buscarProfissionais(servicoSelecionado.id_servico);
          }}
        >
          {loading ? <ActivityIndicator color="white" /> : <Text style={styles.btnProcurarText}>Procurar Profissionais</Text>}
        </TouchableOpacity>
      </View>
    );
  }

  // --- TELA 3: RESULTADOS ---
  if (passo === 3) {
    return (
      <View style={styles.container}>
        <View style={styles.headerSelection}>
          <TouchableOpacity onPress={() => setPasso(2)}>
            <Ionicons name="close-outline" size={40} color="red" />
          </TouchableOpacity>
          <View style={{flex: 1}}>
            <Text style={styles.headerTitle}>Profissionais Encontrados</Text>
            <Text style={styles.subTitleResult}>Procedimento: {servicoSelecionado?.nome_servico}</Text>
          </View>
        </View>

        <Text style={styles.instrucao}>Selecione um dos profissionais listados para visualizar o perfil completo.</Text>

        <FlatList
          data={profissionais}
          keyExtractor={(item) => item.id_profissional.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.cardProfissional}
              onPress={() => {
                console.log("Navegando para perfil do profissional ID:", item.id_profissional);
                router.push({
                  pathname: '/cliente/perfil_vendedor',
                  params: { id: item.id_profissional, servicoId: servicoSelecionado?.id_servico }
                });
              }}
            >
              <Text style={styles.nomeProfissional}>{item.usuario?.nome_usuario || "Sem Nome"}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.texto}>Nenhum profissional encontrado para este serviço.</Text>}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#8C8C8C' },
  buttonWhite: { backgroundColor: '#D9D9D9', padding: 20, marginTop: 50 },
  titletext: { fontSize: 22, textAlign: 'center', fontWeight: 'bold' },
  texto: { fontSize: 18, textAlign: 'center', marginTop: 30, paddingHorizontal: 20, color: '#000' },
  centralizacaoIcon: { alignItems: 'center', marginTop: 50, borderColor: '#333', borderRadius: 30, borderWidth: 1.5, marginHorizontal: 100, paddingVertical: 40 },
  headerSelection: { backgroundColor: '#D9D9D9', paddingTop: 40, paddingBottom: 10, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 2 },
  headerTitle: { fontSize: 20, marginLeft: 10, fontWeight: 'bold', color: '#000' },
  subTitleResult: { fontSize: 14, marginLeft: 10, fontWeight: '600', color: '#333' },
  radioOption: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 0.5, borderColor: '#777' },
  radioCircle: { height: 30, width: 30, borderRadius: 15, borderWidth: 2, borderColor: '#000', marginRight: 15 },
  radioSelected: { backgroundColor: '#000' },
  radioText: { fontSize: 16, flex: 1, fontWeight: 'bold', color: '#000' },
  btnProcurar: { backgroundColor: '#C5005E', padding: 20, alignItems: 'center' },
  btnProcurarText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  instrucao: { textAlign: 'center', fontSize: 16, padding: 15, color: '#000' },
  cardProfissional: { backgroundColor: '#D9D9D9', padding: 20, marginVertical: 5, marginHorizontal: 10, alignItems: 'center', borderRadius: 5 },
  nomeProfissional: { fontSize: 18, fontWeight: 'bold', color: '#000' }
});