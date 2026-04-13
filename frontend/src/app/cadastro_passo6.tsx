import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../services/api'; 
import { Ionicons } from '@expo/vector-icons';

export default function CadastroPasso6() {
  const params = useLocalSearchParams();
  const router = useRouter();
  
  const idUsuario = params.id_usuario ? parseInt(params.id_usuario as string) : null;

  const [carregando, setCarregando] = useState(false);
  const [carregandoServicos, setCarregandoServicos] = useState(true);
  
  const [descricao, setDescricao] = useState('');
  const [servicosDoBanco, setServicosDoBanco] = useState<any[]>([]);
  const [servicosSelecionados, setServicosSelecionados] = useState<number[]>([]);
  const [pagamentos, setPagamentos] = useState<string[]>([]);
  const [semHorarioFixo, setSemHorarioFixo] = useState(false);

  // Estados para o seletor de horário manual (baseado na sua print)
  const [horaInicio, setHoraInicio] = useState('08:00');
  const [horaFim, setHoraFim] = useState('18:00');

  useEffect(() => {
    async function fetchServicos() {
      try {
        setCarregandoServicos(true);
        const { data, error } = await supabase
          .from('servicos')
          .select('*')
          .order('nome_servico', { ascending: true });

        if (error) throw error;
        
        console.log("Serviços carregados:", data?.length); // Debug no console
        setServicosDoBanco(data || []);
      } catch (error: any) {
        Alert.alert("Erro", "Erro ao carregar serviços: " + error.message);
      } finally {
        setCarregandoServicos(false);
      }
    }
    fetchServicos();
  }, []);

  const toggleSelect = (id: any, lista: any[], setLista: Function) => {
    if (lista.includes(id)) {
      setLista(lista.filter(item => item !== id));
    } else {
      setLista([...lista, id]);
    }
  };

  const finalizarCadastro = async () => {
    if (!idUsuario) return Alert.alert("Erro", "ID não encontrado.");
    if (servicosSelecionados.length === 0) return Alert.alert("Atenção", "Selecione ao menos um serviço.");

    setCarregando(true);
    try {
      const { data: prof } = await supabase.from('profissional').select('id_profissional').eq('id_usuario', idUsuario).single();
      const idP = prof.id_profissional;

      const promises = [
        supabase.from('profissional').update({ descricao }).eq('id_profissional', idP),
        supabase.from('usuario').update({ status_conta: 'ativa' }).eq('id_usuario', idUsuario),
        supabase.from('horarios_profissional').insert({
          id_profissional: idP,
          tipo_horario: semHorarioFixo ? 'sem_horario_fixo' : 'definido',
          hora_inicio: semHorarioFixo ? '00:00' : horaInicio,
          hora_fim: semHorarioFixo ? '23:59' : horaFim
        })
      ];

      if (servicosSelecionados.length > 0) {
        promises.push(supabase.from('servicos_profissional').insert(servicosSelecionados.map(idS => ({ id_profissional: idP, id_servico: idS }))));
      }
      
      if (pagamentos.length > 0) {
        promises.push(supabase.from('pagamentos_profissional').insert(pagamentos.map(m => ({ id_profissional: idP, metodo: m }))));
      }

      await Promise.all(promises);
      Alert.alert("Sucesso!", "Perfil configurado!", [{ text: "OK", onPress: () => router.replace('/(tabs)/dashboard') }]);
    } catch (e: any) {
      Alert.alert("Erro", e.message);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.stepHeader}>Passo 6/6</Text>
        <Text style={styles.subHeader}>Configurações de Perfil</Text>

        <View style={styles.section}>
          <Text style={styles.label}>Fale um pouco sobre você</Text>
          <TextInput
            style={styles.inputBio}
            placeholder="Sua experiência..."
            multiline
            value={descricao}
            onChangeText={setDescricao}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Serviços Prestados</Text>
          <View style={styles.cardContainer}>
            {carregandoServicos ? (
              <ActivityIndicator color="#00ff00" style={{ padding: 20 }} />
            ) : servicosDoBanco.length === 0 ? (
              <Text style={styles.emptyText}>Nenhum serviço encontrado no banco.</Text>
            ) : (
              servicosDoBanco.map((s) => (
                <TouchableOpacity 
                  key={s.id_servico} 
                  style={styles.checkItem} 
                  onPress={() => toggleSelect(s.id_servico, servicosSelecionados, setServicosSelecionados)}
                >
                  <View style={[styles.circle, servicosSelecionados.includes(s.id_servico) && styles.circleActive]} />
                  <Text style={styles.itemText}>{s.nome_servico}</Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Formas de Pagamento</Text>
          <View style={styles.row}>
            {['PIX', 'DINHEIRO', 'CARTAO'].map((m) => (
              <TouchableOpacity 
                key={m} 
                style={[styles.chip, pagamentos.includes(m) && styles.chipActive]} 
                onPress={() => toggleSelect(m, pagamentos, setPagamentos)}
              >
                <Text style={[styles.chipText, pagamentos.includes(m) && styles.chipTextActive]}>{m}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Sua Disponibilidade</Text>
          
          <TouchableOpacity 
            style={[styles.horarioCard, semHorarioFixo && styles.horarioCardActive]} 
            onPress={() => setSemHorarioFixo(!semHorarioFixo)}
          >
            <View style={[styles.circle, semHorarioFixo && styles.circleActive]} />
            <Text style={styles.itemText}>Atendimento 24h / Sem horário fixo</Text>
          </TouchableOpacity>

          {!semHorarioFixo && (
            <View style={styles.timePickerContainer}>
              <View style={styles.timeBox}>
                <Text style={styles.timeLabel}>Começo:</Text>
                <TextInput style={styles.timeInput} value={horaInicio} onChangeText={setHoraInicio} keyboardType="numeric" maxLength={5} />
              </View>
              <View style={styles.timeBox}>
                <Text style={styles.timeLabel}>Fim:</Text>
                <TextInput style={styles.timeInput} value={horaFim} onChangeText={setHoraFim} keyboardType="numeric" maxLength={5} />
              </View>
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.btnFinalizar} onPress={finalizarCadastro} disabled={carregando}>
          {carregando ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>CONCLUIR CADASTRO</Text>}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 20 },
  stepHeader: { fontSize: 28, color: '#00ff00', fontWeight: 'bold', textAlign: 'center' },
  subHeader: { textAlign: 'center', color: '#666', marginBottom: 25 },
  section: { marginBottom: 25 },
  label: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  inputBio: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 15, height: 100, textAlignVertical: 'top', backgroundColor: '#fff' },
  cardContainer: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#eee', padding: 10, elevation: 1 },
  checkItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f9f9f9' },
  circle: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#000', marginRight: 12 },
  circleActive: { backgroundColor: '#00ff00', borderColor: '#000' },
  itemText: { fontSize: 16, color: '#333', flex: 1 },
  emptyText: { textAlign: 'center', color: '#999', padding: 20 },
  row: { flexDirection: 'row', gap: 10 },
  chip: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#ddd' },
  chipActive: { backgroundColor: '#0077c2', borderColor: '#0077c2' },
  chipText: { color: '#666' },
  chipTextActive: { color: '#fff', fontWeight: 'bold' },
  horarioCard: { flexDirection: 'row', alignItems: 'center', padding: 15, borderWidth: 1, borderColor: '#ddd', borderRadius: 12, backgroundColor: '#f9fff9' },
  horarioCardActive: { borderColor: '#00ff00' },
  timePickerContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
  timeBox: { width: '48%' },
  timeLabel: { fontSize: 14, color: '#666', marginBottom: 5 },
  timeInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, textAlign: 'center', fontSize: 18, fontWeight: 'bold' },
  btnFinalizar: { backgroundColor: '#0077c2', height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 }
});