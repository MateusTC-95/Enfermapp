import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  FlatList,
  Alert,
  TextInput,
  Dimensions,
  Platform
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '../../services/api';
import * as Location from 'expo-location';

const CREAM = '#FDFBF7';        
const VERDE_VIVO = '#2E6F40';   
const VERDE_CLARO = '#EFF6F1';  
const PETROLEO = '#0F262E';     
const TEXT_MID = '#6E828A';     
const BORDER = '#E3E8E5';       
const WHITE = '#FFFFFF';

const { width } = Dimensions.get('window');

export default function BuscarServicos() {
  const router = useRouter();

  const [passo, setPasso] = useState(1);
  const [servicos, setServicos] = useState([]);
  const [servicoSelecionado, setServicoSelecionado] = useState(null);
  const [profissionais, setProfissionais] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busca, setBusca] = useState('');
  const [enderecoAutomatico, setEnderecoAutomatico] = useState('');

  useEffect(() => {
    fetchServicos();
    obterLocalizacaoAtual();
  }, []);

  const obterLocalizacaoAtual = async () => {
    try {
      // 🌐 SE ESTIVER RODANDO NA WEB (SEU CASO ATUAL)
      if (Platform.OS === 'web') {
        if (!navigator.geolocation) {
          console.log("Geolocalização não suportada neste navegador.");
          return;
        }

        navigator.geolocation.getCurrentPosition(async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Usa uma API pública e gratuita para converter as coordenadas em endereço na Web
          try {
            const resposta = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const dados = await resposta.json();
            
            if (dados && dados.address) {
              const rua = dados.address.road || dados.address.pedestrian || '';
              const numero = dados.address.house_number ? `, ${dados.address.house_number}` : '';
              const bairro = dados.address.suburb || dados.address.neighbourhood || '';
              
              const enderecoFormatado = `${rua}${numero}${bairro ? ' - ' + bairro : ''}`;
              setEnderecoAutomatico(enderecoFormatado);
            }
          } catch (err) {
            console.error("Erro ao converter coordenadas na Web:", err);
          }
        }, (error) => {
          console.log("Erro de permissão ou captura de GPS na Web:", error);
        });

      } else {
        // 📱 SE ESTIVER RODANDO NO CELULAR (ANDROID / IOS)
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('Permissão de localização negada');
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        let geocode = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        if (geocode.length > 0) {
          const local = geocode[0];
          const rua = local.street || '';
          const numero = local.streetNumber ? `, ${local.streetNumber}` : '';
          const bairro = local.district ? ` - ${local.district}` : '';
          
          setEnderecoAutomatico(`${rua}${numero}${bairro}`);
        }
      }
    } catch (error) {
      console.error("Erro geral ao obter localização:", error);
    }
  };

  const fetchServicos = async () => {
    try {
      const { data, error } = await supabase.from('servicos').select('*');
      if (error) throw error;
      setServicos(data || []);
    } catch (err) {
      console.error(err);
      Alert.alert('Erro', 'Falha ao carregar serviços.');
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
        .order('plano', { ascending: false });

      if (error) throw error;
      setProfissionais(data || []);
      setPasso(3);
    } catch (error) {
      Alert.alert('Erro na Busca', error.message);
    } finally {
      setLoading(false);
    }
  };

  const servicosFiltrados = servicos.filter((item) =>
    item.nome_servico?.toLowerCase().includes(busca.toLowerCase())
  );

  if (passo === 1) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.heroContainer}>
          <Text style={styles.heroTitle}>Encontre profissionais confiáveis</Text>
          <Text style={styles.heroSubtitle}>Busque serviços disponíveis na sua região com rapidez e segurança.</Text>

          {enderecoAutomatico ? (
            <View style={styles.gpsBadge}>
              <Ionicons name="location" size={14} color={VERDE_VIVO} />
              <Text style={styles.gpsBadgeText} numberOfLines={1}>Localizado em: {enderecoAutomatico}</Text>
            </View>
          ) : null}

          <TouchableOpacity activeOpacity={0.9} onPress={() => setPasso(2)} style={styles.searchBox}>
            <Ionicons name="search-outline" size={22} color={VERDE_VIVO} />
            <Text style={styles.searchPlaceholder}>Qual serviço você precisa?</Text>
          </TouchableOpacity>

          <Text style={styles.categoryTitle}>Categorias populares</Text>
          <View style={styles.categoriesContainer}>
            <View style={styles.categoryCard}><Text style={styles.categoryEmoji}>💊</Text><Text style={styles.categoryText}>Administração de medicamentos</Text></View>
            <View style={styles.categoryCard}><Text style={styles.categoryEmoji}>🚿</Text><Text style={styles.categoryText}>Banho</Text></View>
            <View style={styles.categoryCard}><Text style={styles.categoryEmoji}>💉</Text><Text style={styles.categoryText}>Aplicação de injetáveis</Text></View>
            <View style={styles.categoryCard}><Text style={styles.categoryEmoji}>🚑</Text><Text style={styles.categoryText}>Transporte e transferência</Text></View>
          </View>

          <View style={styles.benefitsContainer}>
            <View style={styles.benefitRow}><Ionicons name="checkmark-circle" size={22} color={VERDE_VIVO} /><Text style={styles.benefitText}>Profissionais avaliados</Text></View>
            <View style={styles.benefitRow}><Ionicons name="location" size={22} color={VERDE_VIVO} /><Text style={styles.benefitText}>Atendimento na sua região</Text></View>
            <View style={styles.benefitRow}><Ionicons name="shield-checkmark" size={22} color={VERDE_VIVO} /><Text style={styles.benefitText}>Plataforma segura</Text></View>
          </View>
        </View>
      </ScrollView>
    );
  }

  if (passo === 2) {
    return (
      <View style={styles.container}>
        <View style={styles.headerSelection}>
          <TouchableOpacity onPress={() => setPasso(1)}><Ionicons name="arrow-back" size={28} color={PETROLEO} /></TouchableOpacity>
          <Text style={styles.headerTitle}>Escolha um serviço</Text>
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="search-outline" size={20} color={VERDE_VIVO} />
          <TextInput placeholder="Buscar serviço..." placeholderTextColor={TEXT_MID} value={busca} onChangeText={setBusca} style={styles.input} />
        </View>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {servicosFiltrados.map((item) => (
            <TouchableOpacity
              key={item.id_servico}
              style={[styles.serviceCard, servicoSelecionado?.id_servico === item.id_servico && styles.serviceCardSelected]}
              onPress={() => setServicoSelecionado(item)}
            >
              <View style={[styles.radioCircle, servicoSelecionado?.id_servico === item.id_servico && styles.radioSelected]} />
              <Text style={styles.radioText}>{item.nome_servico}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity
          style={[styles.btnProcurar, !servicoSelecionado && { opacity: 0.5 }]}
          onPress={() => servicoSelecionado && buscarProfissionais(servicoSelecionado.id_servico)}
        >
          {loading ? <ActivityIndicator color={WHITE} /> : <Text style={styles.btnProcurarText}>Buscar Profissionais</Text>}
        </TouchableOpacity>
      </View>
    );
  }

  if (passo === 3) {
    return (
      <View style={styles.container}>
        <View style={styles.headerSelection}>
          <TouchableOpacity onPress={() => setPasso(2)}><Ionicons name="arrow-back" size={28} color={PETROLEO} /></TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Profissionais Encontrados</Text>
            <Text style={styles.subTitleResult}>{servicoSelecionado?.nome_servico}</Text>
          </View>
        </View>

        <FlatList
          data={profissionais}
          keyExtractor={(item) => item.id_profissional.toString()}
          contentContainerStyle={{ paddingVertical: 15 }}
          renderItem={({ item }) => {
            const isPremium = item.plano === 'premium';
            return (
              <TouchableOpacity
                style={[styles.cardProfissional, isPremium && styles.cardPremium]}
                onPress={() => {
                  router.push({
                    pathname: '/cliente/perfil_vendedor',
                    params: {
                      id: item.id_profissional,
                      servicoId: servicoSelecionado?.id_servico,
                      enderecoPreenchido: enderecoAutomatico, 
                    },
                  });
                }}
              >
                <View style={styles.rowCard}>
                  <View style={[styles.avatarFake, isPremium && { backgroundColor: WHITE }]}>
                    <Ionicons name="person" size={22} color={isPremium ? PETROLEO : WHITE} />
                  </View>

                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={[styles.nomeProfissional, isPremium && styles.textoPremium]}>
                        {item.usuario?.nome_usuario || 'Sem Nome'}
                      </Text>
                      {isPremium && (
                        <View style={styles.badgePremium}>
                          <Text style={{ fontSize: 10, fontWeight: 'bold', color: PETROLEO }}>PREMIUM</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.cityText, isPremium && { color: '#A5B5B9' }]}>
                      {item.usuario?.cidade || 'Cidade não informada'}
                    </Text>
                  </View>

                  <Ionicons name="chevron-forward" size={22} color={isPremium ? '#FFD700' : TEXT_MID} />
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="sad-outline" size={60} color={TEXT_MID} />
              <Text style={styles.emptyText}>Nenhum profissional encontrado</Text>
            </View>
          }
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CREAM },
  heroContainer: { paddingTop: 70, paddingHorizontal: 24 },
  heroTitle: { fontSize: 28, fontWeight: '700', color: PETROLEO, textAlign: 'center', letterSpacing: -0.5 },
  heroSubtitle: { fontSize: 15, color: TEXT_MID, textAlign: 'center', marginTop: 12, lineHeight: 22 },
  gpsBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'center', backgroundColor: VERDE_CLARO, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginTop: 15, borderWidth: 1, borderColor: BORDER, maxWidth: '90%' },
  gpsBadgeText: { color: VERDE_VIVO, fontSize: 12, fontWeight: '600', marginLeft: 6 },
  searchBox: { backgroundColor: WHITE, marginTop: 15, borderRadius: 18, padding: 18, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: BORDER, elevation: 2 },
  searchPlaceholder: { marginLeft: 12, color: TEXT_MID, fontSize: 16, fontWeight: '500' },
  categoryTitle: { marginTop: 35, fontSize: 18, fontWeight: '700', color: PETROLEO },
  categoriesContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 16 },
  categoryCard: { width: '48%', backgroundColor: WHITE, borderRadius: 16, paddingVertical: 20, paddingHorizontal: 12, alignItems: 'center', marginBottom: 14, borderWidth: 1, borderColor: BORDER, elevation: 1 },
  categoryEmoji: { fontSize: 28 },
  categoryText: { marginTop: 10, fontSize: 13, fontWeight: '600', color: PETROLEO, textAlign: 'center' },
  benefitsContainer: { marginTop: 15, backgroundColor: WHITE, borderRadius: 18, padding: 20, borderWidth: 1, borderColor: BORDER },
  benefitRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  benefitText: { marginLeft: 12, fontSize: 14, color: PETROLEO, fontWeight: '500' },
  headerSelection: { paddingTop: 55, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', backgroundColor: WHITE, borderBottomWidth: 1, borderBottomColor: BORDER },
  headerTitle: { fontSize: 20, fontWeight: '700', marginLeft: 15, color: PETROLEO },
  subTitleResult: { fontSize: 14, marginLeft: 15, marginTop: 2, color: VERDE_VIVO, fontWeight: '500' },
  inputContainer: { backgroundColor: WHITE, margin: 20, borderRadius: 15, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: BORDER },
  input: { flex: 1, paddingVertical: 14, paddingLeft: 10, color: PETROLEO, fontSize: 16 },
  serviceCard: { backgroundColor: WHITE, marginHorizontal: 20, marginBottom: 12, borderRadius: 16, padding: 18, flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: BORDER },
  serviceCardSelected: { borderColor: VERDE_VIVO, backgroundColor: VERDE_CLARO },
  radioCircle: { height: 22, width: 22, borderRadius: 11, borderWidth: 2, borderColor: BORDER, marginRight: 15 },
  radioSelected: { borderColor: VERDE_VIVO, backgroundColor: VERDE_VIVO },
  radioText: { fontSize: 15, fontWeight: '600', color: PETROLEO },
  btnProcurar: { backgroundColor: VERDE_VIVO, margin: 20, borderRadius: 16, padding: 16, alignItems: 'center', elevation: 2 },
  btnProcurarText: { color: WHITE, fontSize: 16, fontWeight: '700' },
  cardProfissional: { backgroundColor: WHITE, marginHorizontal: 20, marginBottom: 15, borderRadius: 18, padding: 18, borderWidth: 1, borderColor: BORDER, elevation: 1 },
  cardPremium: { backgroundColor: PETROLEO, borderWidth: 1.5, borderColor: '#FFD700' },
  rowCard: { flexDirection: 'row', alignItems: 'center' },
  avatarFake: { width: 48, height: 48, borderRadius: 24, backgroundColor: VERDE_VIVO, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  nomeProfissional: { fontSize: 16, fontWeight: '700', color: PETROLEO },
  textoPremium: { color: WHITE },
  cityText: { marginTop: 4, color: TEXT_MID, fontSize: 13 },
  badgePremium: { backgroundColor: '#FFD700', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginLeft: 10 },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 15, color: TEXT_MID, fontSize: 15, fontWeight: '500' },
});