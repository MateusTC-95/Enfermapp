import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CREAM = '#FDFBF7';        
const VERDE_VIVO = '#2E6F40';   
const PETROLEO = '#0F262E';     
const TEXT_MID = '#6E828A';     
const BORDER = '#E3E8E5';       
const WHITE = '#FFFFFF';
const TERRACOTA = '#B85A3A';    

const { width } = Dimensions.get('window');

export default function AgendarServico() {
  const router = useRouter();
  const { idProfissional, servicoId, enderecoPreenchido } = useLocalSearchParams(); 
  
  const [passo, setPasso] = useState(1); 
  const [loading, setLoading] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  
  const [dataSelecionada, setDataSelecionada] = useState(new Date().toISOString().split('T')[0]);
  const [horariosOcupados, setHorariosOcupados] = useState([]);
  const [gradeHorarios, setGradeHorarios] = useState([]);
  
  const [form, setForm] = useState({
    hora: '',
    descricao: '',
    endereco: enderecoPreenchido || '', 
    pagamento: 'Dinheiro' 
  });

  // Força o preenchimento do input assim que o endereço vindo das telas anteriores for carregado
  useEffect(() => {
    if (enderecoPreenchido) {
      setForm(prevForm => ({
        ...prevForm,
        endereco: enderecoPreenchido
      }));
    }
  }, [enderecoPreenchido]);

  useEffect(() => {
    carregarExpedienteProfissional();
  }, [idProfissional]);

  useEffect(() => {
    if (dataSelecionada && gradeHorarios.length > 0) {
      buscarHorariosOcupados();
    }
  }, [dataSelecionada, gradeHorarios]);

  const carregarExpedienteProfissional = async () => {
    try {
      setLoadingConfig(true);
      const { data, error } = await supabase
        .from('horarios_profissional')
        .select('tipo_horario, horario_inicio, horario_fim')
        .eq('id_profissional', parseInt(idProfissional))
        .maybeSingle();

      if (error) throw error;

      let listaHoras = [];

      if (data && data.tipo_horario === 'definido' && data.horario_inicio && data.horario_fim) {
        const inicio = parseInt(data.horario_inicio.split(':')[0]);
        const fim = parseInt(data.horario_fim.split(':')[0]);

        for (let h = inicio; h <= fim; h++) {
          listaHoras.push(`${String(h).padStart(2, '0')}:00`);
        }
      } else {
        for (let h = 0; h < 24; h++) {
          listaHoras.push(`${String(h).padStart(2, '0')}:00`);
        }
      }
      setGradeHorarios(listaHoras);
    } catch (err) {
      console.error("Erro ao carregar expediente:", err.message);
      setGradeHorarios(['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00']);
    } finally {
      setLoadingConfig(false);
    }
  };

  const buscarHorariosOcupados = async () => {
    try {
      setLoadingHorarios(true);
      const { data, error } = await supabase
        .from('agendamentos')
        .select('hora_agendamento')
        .eq('id_profissional', parseInt(idProfissional))
        .eq('data_agendamento', dataSelecionada)
        .in('status', ['pendente', 'aceito', 'confirmado']);

      if (error) throw error;

      const ocupados = (data || []).map(item => {
        if (!item.hora_agendamento) return '';
        const partes = item.hora_agendamento.split(':');
        return `${partes[0]}:${partes[1]}`;
      });

      setHorariosOcupados(ocupados);
    } catch (err) {
      console.error("Erro ao cruzar horários marcados:", err.message);
    } finally {
      setLoadingHorarios(false);
    }
  };

  const gerarDiasDoMes = () => {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = hoje.getMonth();
    const totalDias = new Date(ano, mes + 1, 0).getDate();
    
    const listaDias = [];
    for (let i = 1; i <= totalDias; i++) {
      const diaFormatado = String(i).padStart(2, '0');
      const mesFormatado = String(mes + 1).padStart(2, '0');
      const stringData = `${ano}-${mesFormatado}-${diaFormatado}`;
      
      listaDias.push({
        numero: i,
        isoString: stringData,
        passou: new Date(stringData + 'T23:59:59') < hoje 
      });
    }
    return listaDias;
  };

  const finalizarAgendamento = async () => {
    setLoading(true);
    try {
      const nomeLogado = await AsyncStorage.getItem('nome_logado');
      const { data: user } = await supabase.from('usuario').select('id_usuario').eq('nome_usuario', nomeLogado).single();

      const { error } = await supabase.from('agendamentos').insert([{
        id_cliente: user.id_usuario,
        id_profissional: parseInt(idProfissional),
        id_servico: parseInt(servicoId),
        data_agendamento: dataSelecionada,
        hora_agendamento: form.hora,
        status: 'pendente',
        endereco: form.endereco,
        observacao: form.descricao,
        metodo_pagamento: form.pagamento
      }]);

      if (error) throw error;
      setPasso(3);
    } catch (error) {
      Alert.alert("Erro", error.message);
    } finally {
      setLoading(false);
    }
  };

  const nomeDoMesAtual = new Date().toLocaleString('pt-BR', { month: 'long' }).toUpperCase();

  if (loadingConfig) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={VERDE_VIVO} />
        <Text style={{ marginTop: 10, color: TEXT_MID }}>Carregando agenda do profissional...</Text>
      </View>
    );
  }

  if (passo === 1) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}><Ionicons name="close-outline" size={32} color="#C94A4A" /></TouchableOpacity>
          <Text style={styles.headerTitle}>Agendar Atendimento</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.labelCalendario}>Selecione o Dia ({nomeDoMesAtual})</Text>
          <View style={styles.calendarGrid}>
            {gerarDiasDoMes().map((dia) => {
              const estaSelecionado = dataSelecionada === dia.isoString;
              return (
                <TouchableOpacity
                  key={dia.isoString}
                  disabled={dia.passou}
                  style={[styles.dayCell, estaSelecionado && styles.dayCellSelected, dia.passou && styles.dayCellDisabled]}
                  onPress={() => {
                    setDataSelecionada(dia.isoString);
                    setForm({ ...form, hora: '' });
                  }}
                >
                  <Text style={[styles.dayText, estaSelecionado && styles.dayTextSelected, dia.passou && styles.dayTextDisabled]}>
                    {dia.numero}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.label}>Horários Disponíveis para {dataSelecionada.split('-').reverse().join('/')}</Text>
          {loadingHorarios ? (
            <ActivityIndicator size="small" color={VERDE_VIVO} style={{ marginVertical: 15 }} />
          ) : (
            <View style={styles.timeGrid}>
              {gradeHorarios.map((hora) => {
                const ocupado = horariosOcupados.includes(hora);
                const selecionado = form.hora === hora;

                return (
                  <TouchableOpacity
                    key={hora}
                    disabled={ocupado}
                    style={[styles.timeCell, selecionado && styles.timeCellSelected, ocupado && styles.timeCellOccupied]}
                    onPress={() => setForm({ ...form, hora: hora })}
                  >
                    <Text style={[styles.timeCellText, selecionado && styles.timeCellTextSelected, ocupado && styles.timeCellTextOccupied]}>
                      {hora} {ocupado ? '(Ocupado)' : ''}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
          
          <Text style={styles.label}>O que você precisa?</Text>
          <TextInput style={[styles.input, { height: 75, textAlignVertical: 'top' }]} multiline placeholder="Descreva os detalhes aqui..." placeholderTextColor={TEXT_MID} value={form.descricao} onChangeText={(t) => setForm({...form, descricao: t})} />
          
          <Text style={styles.label}>Endereço Completo</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Rua, número, bairro..." 
            placeholderTextColor={TEXT_MID} 
            value={form.endereco} 
            onChangeText={(t) => setForm({...form, endereco: t})} 
          />
          
          <Text style={styles.label}>Forma de Pagamento</Text>
          <View style={styles.pagamentoContainer}>
            {['Dinheiro', 'Pix', 'Cartão (na hora)'].map((opcao) => (
              <TouchableOpacity key={opcao} style={styles.radioOption} onPress={() => setForm({...form, pagamento: opcao})}>
                <View style={[styles.radioCircle, form.pagamento === opcao && styles.radioSelected]} />
                <Text style={styles.radioText}>{opcao}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <TouchableOpacity 
            style={[styles.mainButton, { marginTop: 30 }]} 
            activeOpacity={0.8}
            onPress={() => {
              if(!form.hora || !form.endereco) return Alert.alert("Aviso", "Selecione o horário e informe o endereço!");
              setPasso(2);
            }}
          >
            <Text style={styles.mainButtonText}>REVISAR AGENDAMENTO</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  if (passo === 2) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setPasso(1)}><Ionicons name="arrow-back" size={26} color={PETROLEO} /></TouchableOpacity>
          <Text style={styles.headerTitle}>Confirme seu Pedido</Text>
        </View>
        <View style={styles.content}>
          <View style={styles.revisaoCard}>
            <Text style={styles.revisaoText}><Text style={styles.bold}>Data:</Text> {dataSelecionada.split('-').reverse().join('/')}</Text>
            <Text style={styles.revisaoText}><Text style={styles.bold}>Horário:</Text> {form.hora}</Text>
            <Text style={styles.revisaoText}><Text style={styles.bold}>Endereço:</Text> {form.endereco}</Text>
            <Text style={styles.revisaoText}><Text style={styles.bold}>Pagamento:</Text> {form.pagamento}</Text>
            <Text style={styles.revisaoText}><Text style={styles.bold}>Notas:</Text> {form.descricao || "Sem observações."}</Text>
          </View>

          <TouchableOpacity style={styles.mainButton} activeOpacity={0.8} onPress={finalizarAgendamento}>
            {loading ? <ActivityIndicator color={WHITE} /> : <Text style={styles.mainButtonText}>CONFIRMAR AGENDAMENTO</Text>}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }]}>
      <Ionicons name="checkmark-circle-outline" size={90} color={VERDE_VIVO} />
      <Text style={styles.titleSucesso}>Solicitação Enviada!</Text>
      <Text style={styles.textSucesso}>Seu pedido de atendimento foi encaminhado com sucesso e o profissional foi notificado.</Text>
      <TouchableOpacity style={styles.btnVoltar} activeOpacity={0.8} onPress={() => router.replace('/cliente/dashboard')}>
        <Text style={styles.btnVoltarText}>VOLTAR AO PAINEL</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CREAM },
  header: { paddingTop: 55, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', backgroundColor: WHITE, paddingBottom: 18, borderBottomWidth: 1, borderColor: BORDER },
  headerTitle: { fontSize: 18, fontWeight: '700', marginLeft: 12, color: PETROLEO },
  content: { padding: 20 },
  labelCalendario: { fontSize: 14, fontWeight: '700', color: TEXT_MID, textTransform: 'uppercase', marginBottom: 12, letterSpacing: 0.5 },
  label: { fontSize: 15, fontWeight: '700', color: PETROLEO, marginBottom: 8, marginTop: 15 },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', backgroundColor: WHITE, borderRadius: 16, padding: 10, borderWidth: 1, borderColor: BORDER },
  dayCell: { width: (width - 60) / 7, height: 40, justifyContent: 'center', alignItems: 'center', marginVertical: 4, borderRadius: 8 },
  dayCellSelected: { backgroundColor: VERDE_VIVO },
  dayCellDisabled: { backgroundColor: '#F5F5F5', opacity: 0.4 },
  dayText: { fontSize: 14, fontWeight: '600', color: PETROLEO },
  dayTextSelected: { color: WHITE, fontWeight: '700' },
  dayTextDisabled: { color: '#CCC' },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 5 },
  timeCell: { backgroundColor: WHITE, paddingVertical: 10, paddingHorizontal: 10, borderRadius: 10, borderWidth: 1, borderColor: BORDER, minWidth: '22%', alignItems: 'center' },
  timeCellSelected: { backgroundColor: TERRACOTA, borderColor: TERRACOTA },
  timeCellOccupied: { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' },
  timeCellText: { fontSize: 12, fontWeight: '600', color: PETROLEO },
  timeCellTextSelected: { color: WHITE },
  timeCellTextOccupied: { color: '#EF4444', textDecorationLine: 'line-through' },
  input: { backgroundColor: WHITE, padding: 12, borderRadius: 12, fontSize: 15, color: PETROLEO, borderWidth: 1, borderColor: BORDER },
  pagamentoContainer: { backgroundColor: WHITE, borderRadius: 14, padding: 12, marginTop: 4, borderWidth: 1, borderColor: BORDER },
  radioOption: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
  radioCircle: { height: 20, width: 20, borderRadius: 10, borderWidth: 2, borderColor: BORDER, marginRight: 12 },
  radioSelected: { backgroundColor: TERRACOTA, borderColor: TERRACOTA },
  radioText: { fontSize: 15, fontWeight: '500', color: PETROLEO },
  revisaoCard: { backgroundColor: WHITE, padding: 20, borderRadius: 16, marginBottom: 30, borderWidth: 1, borderColor: BORDER },
  revisaoText: { fontSize: 15, marginBottom: 12, color: PETROLEO, lineHeight: 22 },
  bold: { fontWeight: '700', color: TEXT_MID },
  mainButton: { backgroundColor: TERRACOTA, padding: 16, borderRadius: 16, alignItems: 'center' },
  mainButtonText: { color: WHITE, fontSize: 15, fontWeight: '700', letterSpacing: 0.5 },
  titleSucesso: { fontSize: 24, fontWeight: '700', marginTop: 20, color: PETROLEO },
  textSucesso: { textAlign: 'center', fontSize: 15, lineHeight: 22, marginTop: 12, color: TEXT_MID, paddingHorizontal: 16 },
  btnVoltar: { backgroundColor: VERDE_VIVO, padding: 16, borderRadius: 16, marginTop: 35, width: '100%', alignItems: 'center' },
  btnVoltarText: { color: WHITE, fontSize: 15, fontWeight: '700' }
});