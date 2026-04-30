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

  useEffect(() => {
    fetchServicos();
  }, []);

  const fetchServicos = async () => {
    try {
      const { data, error } = await supabase.from('servicos').select('*');
      if (error) throw error;
      setServicos(data || []);
    } catch (err) {
      console.error(err);
      Alert.alert("Erro", "Falha ao carregar serviços.");
    }
  };

  const buscarProfissionais = async (idServico) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profissional')
        .select(`
          id_profissional,
          plano,
          usuario!inner (nome_usuario, cidade, foto_perfil, telefone),
          servicos_profissional!inner (id_servico)
        `)
        .eq('servicos_profissional.id_servico', idServico)
        .order('plano', { ascending: false }); // Premium vem antes de Normal (P > N)

      if (error) throw error;

      setProfissionais(data || []);
      setPasso(3); 
    } catch (error) {
      Alert.alert("Erro na Busca", error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- TELA 1: INICIAL ---
  if (passo === 1) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.buttonWhite} onPress={() => setPasso(2)}>
          <Text style={styles.titletext}>Clique Aqui para Buscar um Serviço</Text>
        </TouchableOpacity>
        <Text style={styles.texto}>Busque o serviço desejado e encontre profissionais disponíveis na sua região.</Text>
        <View style={styles.centralizacaoIcon}>
          <Ionicons name="search-outline" size={100} color="black" />
        </View>
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
          <Text style={styles.headerTitle}>Selecione o Serviço</Text>
        </View>

        <ScrollView style={{ flex: 1 }}>
          {servicos.map((item) => (
            <TouchableOpacity 
              key={item.id_servico} 
              style={styles.radioOption}
              onPress={() => setServicoSelecionado(item)}
            >
              <View style={[styles.radioCircle, servicoSelecionado?.id_servico === item.id_servico && styles.radioSelected]} />
              <Text style={styles.radioText}>{item.nome_servico}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity 
          style={[styles.btnProcurar, !servicoSelecionado && {opacity: 0.5}]} 
          onPress={() => servicoSelecionado && buscarProfissionais(servicoSelecionado.id_servico)}
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
            <Text style={styles.subTitleResult}>{servicoSelecionado?.nome_servico}</Text>
          </View>
        </View>

        <FlatList
          data={profissionais}
          keyExtractor={(item) => item.id_profissional.toString()}
          contentContainerStyle={{ paddingVertical: 10 }}
          renderItem={({ item }) => {
            const isPremium = item.plano === 'premium';
            
            return (
              <TouchableOpacity 
                style={[
                  styles.cardProfissional, 
                  isPremium && styles.cardPremium // Aplica fundo preto se for premium
                ]}
                onPress={() => {
                  router.push({
                    pathname: '/cliente/perfil_vendedor',
                    params: { id: item.id_profissional, servicoId: servicoSelecionado?.id_servico }
                  });
                }}
              >
                <View style={styles.rowCard}>
                  {isPremium && <Ionicons name="star" size={20} color="#FFD700" style={{ marginRight: 10 }} />}
                  <Text style={[
                    styles.nomeProfissional, 
                    isPremium && styles.textoPremium // Aplica texto amarelo se for premium
                  ]}>
                    {item.usuario?.nome_usuario || "Sem Nome"}
                  </Text>
                  {isPremium && <Text style={styles.badgePremium}>PREMIUM</Text>}
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={<Text style={styles.texto}>Nenhum profissional encontrado.</Text>}
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
  cardProfissional: { backgroundColor: '#D9D9D9', padding: 20, marginVertical: 6, marginHorizontal: 15, borderRadius: 10, elevation: 3 },
  
  // ESTILOS PREMIUM
  cardPremium: { 
    backgroundColor: '#000', 
    borderColor: '#FFD700', 
    borderWidth: 1.5,
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },
  textoPremium: { 
    color: '#FFD700', // Amarelo Gold
  },
  rowCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  badgePremium: {
    backgroundColor: '#FFD700',
    color: '#000',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 5,
    marginLeft: 10
  },
  nomeProfissional: { fontSize: 18, fontWeight: 'bold', color: '#000' }
});