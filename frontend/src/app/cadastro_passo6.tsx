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
  
  const [telefone, setTelefone] = useState('');
  const [descricao, setDescricao] = useState('');
  const [servicosDoBanco, setServicosDoBanco] = useState<any[]>([]);
  const [servicosSelecionados, setServicosSelecionados] = useState<number[]>([]);
  const [pagamentos, setPagamentos] = useState<string[]>([]);
  const [semHorarioFixo, setSemHorarioFixo] = useState(false);
  const [horaInicio, setHoraInicio] = useState('08:00');
  const [horaFim, setHoraFim] = useState('18:00');

  useEffect(() => {
    async function fetchServicos() {
      try {
        setCarregandoServicos(true);
        const { data, error } = await supabase.from('servicos').select('*').order('nome_servico', { ascending: true });
        if (error) throw error;
        setServicosDoBanco(data || []);
      } catch (error: any) {
        Alert.alert("Erro", "Erro ao carregar serviços: " + error.message);
      } finally {
        setCarregandoServicos(false);
      }
    }
    fetchServicos();
  }, []);

  const mascaraHora = (v: string) => v.replace(/\D/g, "").replace(/(\d{2})(\d)/, "$1:$2").substring(0, 5);

  const toggleSelect = (id: any, lista: any[], setLista: Function) => {
    if (lista.includes(id)) setLista(lista.filter(item => item !== id));
    else setLista([...lista, id]);
  };

  const finalizarCadastro = async () => {
    if (!idUsuario) return Alert.alert("Erro", "ID não encontrado.");
    if (servicosSelecionados.length === 0) return Alert.alert("Atenção", "Selecione ao menos um serviço.");

    setCarregando(true);
    try {
      const { data: prof, error: profErr } = await supabase.from('profissional').select('id_profissional').eq('id_usuario', idUsuario).single();
      if (profErr || !prof) throw new Error("Erro ao localizar perfil profissional.");
      const idP = prof.id_profissional;

      // 1. Atualizar Descrição e Ativar Conta
      await supabase.from('profissional').update({ descricao }).eq('id_profissional', idP);
      await supabase.from('usuario').update({ status_conta: 'ativa' }).eq('id_usuario', idUsuario);

      // 2. Salvar Horários (Upsert)
      await supabase.from('horarios_profissional').upsert({
        id_profissional: idP,
        tipo_horario: semHorarioFixo ? 'sem_horario_fixo' : 'definido',
        horario_inicio: semHorarioFixo ? '00:00' : horaInicio,
        horario_fim: semHorarioFixo ? '23:59' : horaFim
      }, { onConflict: 'id_profissional' });

      // 3. Salvar Serviços
      await supabase.from('servicos_profissional').delete().eq('id_profissional', idP);
      await supabase.from('servicos_profissional').insert(servicosSelecionados.map(idS => ({ id_profissional: idP, id_servico: idS })));
      
      // 4. Salvar Pagamentos
      await supabase.from('pagamentos_profissional').delete().eq('id_profissional', idP);
      if (pagamentos.length > 0) {
        await supabase.from('pagamentos_profissional').insert(pagamentos.map(m => ({ id_profissional: idP, metodo: m })));
      }

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
        <View style={styles.headerSection}>
            <Text style={styles.stepHeader}>Configurações Finais</Text>
            <View style={styles.divider} />
            <Text style={styles.welcomeText}>Seja Bem-Vindo(a) ao Enfermapp.</Text>
            <Text style={styles.subHeader}>Antes de começar a prestar seus serviços, finalize as configurações da sua conta</Text>
        </View>

        <View style={styles.dividerBold} />

        <View style={styles.section}>
          <Text style={styles.mainLabel}>Descrição de Conta</Text>
          <Text style={styles.instructionText}>Apresente sua experiência, especialidades e forma de atendimento.</Text>
          <TextInput style={styles.inputBio} placeholder="..." multiline value={descricao} onChangeText={setDescricao} />
        </View>

        <View style={styles.dividerBold} />

        <View style={styles.section}>
          <Text style={styles.mainLabel}>Tipo de Serviço a Ser Realizado</Text>
          <View style={styles.cardContainer}>
            {carregandoServicos ? <ActivityIndicator color="#000" /> : servicosDoBanco.map((s) => (
              <TouchableOpacity key={s.id_servico} style={styles.checkItem} onPress={() => toggleSelect(s.id_servico, servicosSelecionados, setServicosSelecionados)}>
                <View style={[styles.circle, servicosSelecionados.includes(s.id_servico) && styles.circleActive]} />
                <Text style={styles.itemText}>{s.nome_servico}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.dividerBold} />

        <View style={styles.section}>
          <Text style={styles.mainLabel}>Tipos de Pagamentos Aceitos</Text>
          <View style={styles.cardContainer}>
            {[{ id: 'PIX', label: 'PIX' }, { id: 'CARTAO', label: 'Cartão' }, { id: 'DINHEIRO', label: 'Dinheiro' }].map((m) => (
              <TouchableOpacity key={m.id} style={styles.checkItem} onPress={() => toggleSelect(m.id, pagamentos, setPagamentos)}>
                <View style={[styles.circle, pagamentos.includes(m.id) && styles.circleActive]} />
                <Text style={styles.itemText}>{m.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.dividerBold} />

        <View style={styles.section}>
          <Text style={styles.mainLabel}>Horários de Atendimento</Text>
          {!semHorarioFixo && (
            <View style={styles.timePickerContainer}>
              <View style={styles.timeBox}>
                <Text style={styles.timeLabelLabel}>Começo:</Text>
                <View style={styles.inputWithIcon}>
                    <TextInput style={styles.timeInput} value={horaInicio} onChangeText={(t) => setHoraInicio(mascaraHora(t))} keyboardType="numeric" maxLength={5} />
                </View>
              </View>
              <View style={styles.timeBox}>
                <Text style={styles.timeLabelLabel}>Fim:</Text>
                <View style={styles.inputWithIcon}>
                    <TextInput style={styles.timeInput} value={horaFim} onChangeText={(t) => setHoraFim(mascaraHora(t))} keyboardType="numeric" maxLength={5} />
                </View>
              </View>
            </View>
          )}

          <TouchableOpacity style={[styles.btnSemHorario, semHorarioFixo && styles.btnSemHorarioActive]} onPress={() => setSemHorarioFixo(!semHorarioFixo)}>
            <Text style={styles.btnSemHorarioText}>Marcar Como{"\n"}“Sem Horário Fixo”</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dividerBold} />

        <TouchableOpacity style={styles.btnFinalizar} onPress={finalizarCadastro} disabled={carregando}>
          {carregando ? <ActivityIndicator color="#000" /> : <Text style={styles.btnText}>Finalizar Configurações</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 20 },
  headerSection: { alignItems: 'center' },
  stepHeader: { fontSize: 24, fontWeight: '400', color: '#000' },
  welcomeText: { fontSize: 18, marginVertical: 10, textAlign: 'center' },
  subHeader: { fontSize: 14, textAlign: 'center', color: '#000' },
  divider: { width: '100%', height: 1, backgroundColor: '#000', marginVertical: 5 },
  dividerBold: { width: '120%', height: 4, backgroundColor: '#000', marginLeft: -20, marginVertical: 20 },
  section: { marginBottom: 10, alignItems: 'center' },
  mainLabel: { fontSize: 24, textAlign: 'center', marginBottom: 10 },
  instructionText: { fontSize: 16, textAlign: 'center', marginBottom: 15 },
  inputBio: { width: '100%', borderWidth: 1, borderColor: '#ccc', padding: 15, height: 150, textAlignVertical: 'top', backgroundColor: '#ccc' },
  cardContainer: { width: '100%' },
  checkItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  circle: { width: 35, height: 35, borderRadius: 17.5, borderWidth: 2, borderColor: '#000', marginRight: 15 },
  circleActive: { backgroundColor: '#000' },
  itemText: { fontSize: 16, fontWeight: 'bold', flex: 1 },
  timePickerContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 20 },
  timeBox: { width: '45%', alignItems: 'center' },
  timeLabelLabel: { fontSize: 18, marginBottom: 5 },
  inputWithIcon: { backgroundColor: '#777', width: '100%' },
  timeInput: { padding: 10, fontSize: 18, color: '#000', textAlign: 'center' },
  btnSemHorario: { backgroundColor: '#bbb', padding: 12, width: '60%', marginTop: 10 },
  btnSemHorarioActive: { backgroundColor: '#888' },
  btnSemHorarioText: { textAlign: 'center', fontSize: 14 },
  btnFinalizar: { backgroundColor: '#00FF00', height: 65, justifyContent: 'center', alignItems: 'center', marginBottom: 30 },
  btnText: { color: '#000', fontSize: 22 }
});