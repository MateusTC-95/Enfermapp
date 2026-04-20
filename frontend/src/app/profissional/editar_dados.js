import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../services/api'; 

export default function EditarDadosProfissional() {
  const router = useRouter();
  const [carregando, setCarregando] = useState(false);
  const [carregandoDados, setCarregandoDados] = useState(true);

  const [telefone, setTelefone] = useState('');
  const [descricao, setDescricao] = useState('');
  const [pagamentos, setPagamentos] = useState([]);
  const [semHorarioFixo, setSemHorarioFixo] = useState(false);
  const [horaInicio, setHoraInicio] = useState('08:00');
  const [horaFim, setHoraFim] = useState('18:00');
  const [idP, setIdP] = useState(null);

  useEffect(() => { fetchDadosIniciais(); }, []);

  const fetchDadosIniciais = async () => {
    try {
      const nomeSalvo = await AsyncStorage.getItem('nome_logado');
      
      const { data: prof, error } = await supabase
        .from('profissional')
        .select(`id_profissional, descricao, usuario!inner (id_usuario, telefone)`)
        .eq('usuario.nome_usuario', nomeSalvo)
        .single();

      if (error || !prof) throw new Error("Perfil não encontrado");
      
      setIdP(prof.id_profissional);
      setDescricao(prof.descricao || '');
      setTelefone(prof.usuario?.telefone || '');

      const { data: h } = await supabase.from('horarios_profissional').select('*').eq('id_profissional', prof.id_profissional).maybeSingle();
      if (h) {
        setSemHorarioFixo(h.tipo_horario === 'sem_horario_fixo');
        if (h.horario_inicio) setHoraInicio(h.horario_inicio.slice(0, 5));
        if (h.horario_fim) setHoraFim(h.horario_fim.slice(0, 5));
      }

      const { data: p } = await supabase.from('pagamentos_profissional').select('metodo').eq('id_profissional', prof.id_profissional);
      setPagamentos(p?.map(item => item.metodo) || []);
      
    } catch (e) { 
      console.error("Erro no fetch inicial:", e);
    } finally { setCarregandoDados(false); }
  };

  const salvarAlteracoes = async () => {
    if (!idP) {
      Alert.alert("Erro", "Sessão inválida.");
      return;
    }
    
    setCarregando(true);
    try {
      const nomeSalvo = await AsyncStorage.getItem('nome_logado');
      
      // 1. Telefone
      await supabase.from('usuario').update({ telefone }).eq('nome_usuario', nomeSalvo);
      
      // 2. Descrição
      await supabase.from('profissional').update({ descricao: descricao }).eq('id_profissional', idP);

      // 3. Horários (Upsert funcional com a nova constraint do banco)
      const { error: hError } = await supabase.from('horarios_profissional').upsert({
        id_profissional: idP,
        tipo_horario: semHorarioFixo ? 'sem_horario_fixo' : 'definido',
        horario_inicio: semHorarioFixo ? '00:00' : horaInicio,
        horario_fim: semHorarioFixo ? '23:59' : horaFim
      }, { onConflict: 'id_profissional' });

      if (hError) throw hError;

      // 4. Pagamentos (Enviando em minúsculo para bater com o ENUM do banco)
      await supabase.from('pagamentos_profissional').delete().eq('id_profissional', idP);
      if (pagamentos.length > 0) {
        const insertPags = pagamentos.map(m => ({ id_profissional: idP, metodo: m.toLowerCase() }));
        const { error: pError } = await supabase.from('pagamentos_profissional').insert(insertPags);
        if (pError) throw pError;
      }

      Alert.alert("Sucesso", "Perfil atualizado!", [{ text: "OK", onPress: () => router.back() }]);
    } catch (e) { 
      console.error("Erro ao salvar:", e);
      Alert.alert("Erro ao salvar", e.message); 
    } finally { setCarregando(false); }
  };

  const mascaraTelefone = (v) => v.replace(/\D/g, "").replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2").substring(0, 15);
  const mascaraHora = (v) => v.replace(/\D/g, "").replace(/(\d{2})(\d)/, "$1:$2").substring(0, 5);

  if (carregandoDados) return <View style={styles.centered}><ActivityIndicator size="large" color="#0077c2" /></View>;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.stepHeader}>EDITAR PERFIL</Text>
        
        <View style={styles.section}>
          <Text style={styles.label}>Telefone WhatsApp</Text>
          <TextInput 
            style={styles.timeInput} 
            value={telefone} 
            onChangeText={(t) => setTelefone(mascaraTelefone(t))} 
            keyboardType="phone-pad" 
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Sua Descrição/Bio</Text>
          <TextInput 
            style={styles.inputBio} 
            multiline 
            value={descricao} 
            onChangeText={setDescricao} 
            placeholder="Descreva seu trabalho..." 
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Formas de Pagamento</Text>
          <View style={styles.row}>
            {['pix', 'dinheiro', 'cartao'].map((m) => (
              <TouchableOpacity 
                key={m} 
                style={[styles.chip, pagamentos.includes(m) && styles.chipActive]} 
                onPress={() => {
                  if (pagamentos.includes(m)) setPagamentos(pagamentos.filter(i => i !== m));
                  else setPagamentos([...pagamentos, m]);
                }}
              >
                <Text style={[styles.chipText, pagamentos.includes(m) && styles.chipTextActive]}>
                  {m === 'cartao' ? 'CARTÃO' : m.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Disponibilidade</Text>
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
                <Text style={styles.timeLabel}>Início:</Text>
                <TextInput 
                  style={styles.timeInput} 
                  value={horaInicio} 
                  onChangeText={(t) => setHoraInicio(mascaraHora(t))} 
                  keyboardType="numeric" 
                  maxLength={5} 
                />
              </View>
              <View style={styles.timeBox}>
                <Text style={styles.timeLabel}>Fim:</Text>
                <TextInput 
                  style={styles.timeInput} 
                  value={horaFim} 
                  onChangeText={(t) => setHoraFim(mascaraHora(t))} 
                  keyboardType="numeric" 
                  maxLength={5} 
                />
              </View>
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.btnFinalizar} onPress={salvarAlteracoes} disabled={carregando}>
          {carregando ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>SALVAR ALTERAÇÕES</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { padding: 20 },
  stepHeader: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 25, color: '#0077c2' },
  section: { marginBottom: 25 },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  inputBio: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 15, height: 100, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  chip: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#ddd' },
  chipActive: { backgroundColor: '#0077c2', borderColor: '#0077c2' },
  chipText: { color: '#000' },
  chipTextActive: { color: '#fff', fontWeight: 'bold' },
  horarioCard: { flexDirection: 'row', alignItems: 'center', padding: 15, borderWidth: 1, borderColor: '#ddd', borderRadius: 10 },
  circle: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#999', marginRight: 10 },
  circleActive: { backgroundColor: '#00ff00', borderColor: '#000' },
  itemText: { fontSize: 16 },
  timePickerContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
  timeBox: { width: '45%' },
  timeLabel: { fontSize: 14, marginBottom: 5 },
  timeInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, textAlign: 'center', fontSize: 16 },
  btnFinalizar: { backgroundColor: '#0077c2', height: 50, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 10, marginBottom: 30 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});