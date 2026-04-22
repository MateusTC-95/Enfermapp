import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AgendarServico() {
  const router = useRouter();
  const { idProfissional, servicoId } = useLocalSearchParams();
  
  const [passo, setPasso] = useState(1); // 1: Form, 2: Revisão, 3: Sucesso
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    hora: '',
    descricao: '',
    endereco: '',
    pagamento: 'Dinheiro' // Valor padrão inicial
  });

  const finalizarAgendamento = async () => {
    setLoading(true);
    try {
      const nomeLogado = await AsyncStorage.getItem('nome_logado');
      const { data: user } = await supabase.from('usuario').select('id_usuario').eq('nome_usuario', nomeLogado).single();

      const { error } = await supabase.from('agendamentos').insert([{
        id_cliente: user.id_usuario,
        id_profissional: parseInt(idProfissional),
        id_servico: parseInt(servicoId),
        data_agendamento: new Date().toISOString().split('T')[0],
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

  // --- PASSO 1: FORMULÁRIO ---
  if (passo === 1) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}><Ionicons name="close-outline" size={35} color="red" /></TouchableOpacity>
          <Text style={styles.headerTitle}>Detalhes do Procedimento</Text>
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.label}>Horário Desejado</Text>
          <TextInput style={styles.input} placeholder="Ex: 14:30" value={form.hora} onChangeText={(t) => setForm({...form, hora: t})}/>
          
          <Text style={styles.label}>O que você precisa?</Text>
          <TextInput style={[styles.input, { height: 80 }]} multiline placeholder="Descrição..." value={form.descricao} onChangeText={(t) => setForm({...form, descricao: t})}/>
          
          <Text style={styles.label}>Endereço Completo</Text>
          <TextInput style={styles.input} placeholder="Rua, número..." value={form.endereco} onChangeText={(t) => setForm({...form, endereco: t})}/>
          
          {/* SELEÇÃO DE PAGAMENTO */}
          <Text style={styles.label}>Forma de Pagamento</Text>
          <View style={styles.pagamentoContainer}>
            {['Dinheiro', 'Pix', 'Cartão (na hora)'].map((opcao) => (
              <TouchableOpacity 
                key={opcao} 
                style={styles.radioOption} 
                onPress={() => setForm({...form, pagamento: opcao})}
              >
                <View style={[styles.radioCircle, form.pagamento === opcao && styles.radioSelected]} />
                <Text style={styles.radioText}>{opcao}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <TouchableOpacity 
            style={[styles.mainButton, { marginTop: 30 }]} 
            onPress={() => {
              if(!form.hora || !form.endereco) return Alert.alert("Aviso", "Preencha horário e endereço!");
              setPasso(2);
            }}
          >
            <Text style={styles.mainButtonText}>REVISAR DADOS</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // --- PASSO 2: CONFIRMAÇÃO DE DADOS ---
  if (passo === 2) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setPasso(1)}><Ionicons name="arrow-back" size={30} color="black" /></TouchableOpacity>
          <Text style={styles.headerTitle}>Confirme seus Dados</Text>
        </View>
        <View style={styles.content}>
          <View style={styles.revisaoCard}>
            <Text style={styles.revisaoText}><Text style={styles.bold}>Horário:</Text> {form.hora}</Text>
            <Text style={styles.revisaoText}><Text style={styles.bold}>Endereço:</Text> {form.endereco}</Text>
            <Text style={styles.revisaoText}><Text style={styles.bold}>Pagamento:</Text> {form.pagamento}</Text>
            <Text style={styles.revisaoText}><Text style={styles.bold}>Obs:</Text> {form.descricao}</Text>
          </View>

          <TouchableOpacity style={styles.mainButton} onPress={finalizarAgendamento}>
            {loading ? <ActivityIndicator color="white" /> : <Text style={styles.mainButtonText}>CONFIRMAR E SOLICITAR</Text>}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // --- PASSO 3: TELA DE ESPERA ---
  return (
    <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
      <Ionicons name="time-outline" size={100} color="#FFD700" />
      <Text style={[styles.titleSucesso, { color: '#FFD700' }]}>Solicitação Enviada!</Text>
      <Text style={styles.textSucesso}>
        Sua solicitação foi enviada com sucesso. Por favor, aguarde enquanto o profissional analisa e confirma o atendimento.
      </Text>
      
      <TouchableOpacity 
        style={styles.btnAmarelo} 
        onPress={() => router.replace('/cliente/dashboard')}
      >
        <Text style={styles.btnAmareloText}>VOLTAR AO INÍCIO</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#8C8C8C' },
  header: { paddingTop: 50, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', backgroundColor: '#D9D9D9', paddingBottom: 15 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
  content: { padding: 20 },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 8, marginTop: 15 },
  input: { backgroundColor: '#FFF', padding: 12, borderRadius: 5, fontSize: 16, color: '#000' },
  
  // Estilos do Pagamento (Radio Buttons)
  pagamentoContainer: { backgroundColor: '#D9D9D9', borderRadius: 5, padding: 10, marginTop: 5 },
  radioOption: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
  radioCircle: { height: 22, width: 22, borderRadius: 11, borderWidth: 2, borderColor: '#000', marginRight: 10, justifyContent: 'center', alignItems: 'center' },
  radioSelected: { backgroundColor: '#C5005E', borderColor: '#C5005E' },
  radioText: { fontSize: 16, fontWeight: '500', color: '#000' },

  revisaoCard: { backgroundColor: '#D9D9D9', padding: 20, borderRadius: 10, marginBottom: 30 },
  revisaoText: { fontSize: 18, marginBottom: 10, color: '#000' },
  bold: { fontWeight: 'bold' },
  mainButton: { backgroundColor: '#C5005E', padding: 20, borderRadius: 10, alignItems: 'center' },
  mainButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  titleSucesso: { fontSize: 26, fontWeight: 'bold', marginTop: 20 },
  textSucesso: { textAlign: 'center', fontSize: 18, paddingHorizontal: 30, marginTop: 15, color: 'white' },
  btnAmarelo: { backgroundColor: '#FFD700', padding: 20, borderRadius: 10, marginTop: 40, width: '80%', alignItems: 'center' },
  btnAmareloText: { color: 'black', fontSize: 18, fontWeight: 'bold' }
});