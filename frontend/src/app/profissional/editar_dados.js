import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { supabase } from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const CREAM = '#FDFBF7';        
const VERDE_VIVO = '#2E6F40';   
const PETROLEO = '#0F262E';     
const TEXT_MID = '#768A7E';     
const BORDER = '#E3E8E5';       
const WHITE = '#FFFFFF';

function EditarDadosProfissional() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [pagamentosSelecionados, setPagamentosSelecionados] = useState([]); 
  const [descricao, setDescricao] = useState('');
  const [tipoHorario, setTipoHorario] = useState('definido'); 
  const [horarioInicio, setHorarioInicio] = useState('');
  const [horarioFim, setHorarioFim] = useState('');

  const [idUsuario, setIdUsuario] = useState(null);
  const [idProfissional, setIdProfissional] = useState(null);

  const aplicarMascaraTelefone = (text) => {
    const apenasNumeros = text.replace(/\D/g, '');
    let formatado = apenasNumeros;
    if (formatado.length > 2) formatado = `(${formatado.substring(0, 2)}) ${formatado.substring(2)}`;
    if (formatado.length > 10) formatado = `${formatado.substring(0, 10)}-${formatado.substring(10, 15)}`;
    return formatado.substring(0, 15);
  };

  const alternarMetodoPagamento = (tipo) => {
    if (pagamentosSelecionados.includes(tipo)) {
      setPagamentosSelecionados(pagamentosSelecionados.filter(item => item !== tipo));
    } else {
      setPagamentosSelecionados([...pagamentosSelecionados, tipo]);
    }
  };

  useEffect(() => {
    carregarDadosPerfil();
  }, []);

  const carregarDadosPerfil = async () => {
    try {
      setLoading(true);
      const idStorage = await AsyncStorage.getItem('id_usuario');
      
      console.log("====================================");
      console.log("ID QUE O STORAGE DO PC ESTÁ ENTREGANDO:", idStorage);
      console.log("====================================");
      
      if (!idStorage) {
        Alert.alert("Erro de Sessão", "Usuário não identificado.");
        router.replace('/login');
        return;
      }

      const { data: usuario, error: userError } = await supabase
        .from('usuario')
        .select('id_usuario, nome_usuario, telefone, pagamento_usado')
        .eq('id_usuario', idStorage)
        .single();

      if (userError || !usuario) throw new Error("Usuário não localizado.");

      setIdUsuario(usuario.id_usuario);
      setNome(usuario.nome_usuario);
      setTelefone(aplicarMascaraTelefone(usuario.telefone || ''));
      
      if (usuario.pagamento_usado) {
        const metodos = usuario.pagamento_usado.split(',').map(item => item.trim());
        setPagamentosSelecionados(metodos);
      } else {
        setPagamentosSelecionados([]);
      }

      const { data: profesional } = await supabase
        .from('profissional')
        .select('id_profissional, descricao')
        .eq('id_usuario', usuario.id_usuario)
        .maybeSingle();

      if (profesional) {
        setIdProfissional(profesional.id_profissional);
        setDescricao(profesional.descricao || '');

        const { data: horario } = await supabase
          .from('horarios_profissional')
          .select('tipo_horario, horario_inicio, horario_fim')
          .eq('id_profissional', profesional.id_profissional)
          .maybeSingle();

        if (horario) {
          setTipoHorario(horario.tipo_horario || 'definido');
          setHorarioInicio(horario.horario_inicio || '');
          setHorarioFim(horario.horario_fim || '');
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const salvarAlteracoes = async () => {
    if (!nome.trim() || !telefone.trim()) return;
    try {
      setSalvando(true);
      const stringPagamentos = pagamentosSelecionados.join(', ');

      await supabase.from('usuario').update({ 
        nome_usuario: nome, 
        telefone: telefone, 
        pagamento_usado: stringPagamentos 
      }).eq('id_usuario', idUsuario);

      let profId = idProfissional;
      if (!profId) {
        const { data: p } = await supabase.from('profissional').select('id_profissional').eq('id_usuario', idUsuario).single();
        if (p) profId = p.id_profissional;
      }

      if (profId) {
        await supabase.from('profissional').update({ descricao: descricao }).eq('id_profissional', profId);
        await supabase.from('horarios_profissional').upsert({
          id_profissional: profId,
          tipo_horario: tipoHorario,
          horario_inicio: tipoHorario === 'flexivel' ? '00:00' : horarioInicio,
          horario_fim: tipoHorario === 'flexivel' ? '23:59' : horarioFim
        }, { onConflict: 'id_profissional' });
      }

      await AsyncStorage.setItem('nome_logado', nome);
      Alert.alert("Sucesso", "Perfil atualizado!", [{ text: "OK", onPress: () => router.back() }]);
    } catch (error) {
      console.error(error);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={PETROLEO} />
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Perfil</Text>
      </View>

      {loading ? (
        <View style={styles.centerLoading}><ActivityIndicator size="large" color={VERDE_VIVO} /></View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Nome Completo</Text>
            <TextInput style={styles.input} value={nome} onChangeText={setNome} />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Telefone de Contato</Text>
            <TextInput style={styles.input} value={telefone} keyboardType="phone-pad" onChangeText={(t) => setTelefone(aplicarMascaraTelefone(t))} />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Formas de Recebimento</Text>
            <View style={styles.rowButtons}>
              {['Dinheiro', 'Cartão', 'Pix'].map((tipo) => {
                const sel = pagamentosSelecionados.includes(tipo);
                return (
                  <TouchableOpacity key={tipo} style={[styles.selectorButton, sel && styles.selectorButtonActive]} onPress={() => alternarMetodoPagamento(tipo)}>
                    <Text style={[styles.selectorText, sel && styles.selectorTextActive]}>{tipo}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Descrição Profissional</Text>
            <TextInput style={[styles.input, styles.textArea]} value={descricao} onChangeText={setDescricao} multiline numberOfLines={4} />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Horário de Atendimento</Text>
            <View style={styles.rowButtons}>
              <TouchableOpacity style={[styles.selectorButton, tipoHorario === 'definido' && styles.selectorButtonActive]} onPress={() => setTipoHorario('definido')}>
                <Text style={[styles.selectorText, tipoHorario === 'definido' && styles.selectorTextActive]}>Hora Fixa</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.selectorButton, tipoHorario === 'flexivel' && styles.selectorButtonActive]} onPress={() => setTipoHorario('flexivel')}>
                <Text style={[styles.selectorText, tipoHorario === 'flexivel' && styles.selectorTextActive]}>Sem hora fixa</Text>
              </TouchableOpacity>
            </View>
          </View>

          {tipoHorario === 'definido' && (
            <View style={styles.rowHorarios}>
              <View style={[styles.formGroup, { flex: 1 }]}><Text style={styles.label}>Início</Text><TextInput style={styles.input} value={horarioInicio} onChangeText={setHorarioInicio} placeholder="08:00" maxLength={5} /></View>
              <View style={[styles.formGroup, { flex: 1 }]}><Text style={styles.label}>Fim</Text><TextInput style={styles.input} value={horarioFim} onChangeText={setHorarioFim} placeholder="18:00" maxLength={5} /></View>
            </View>
          )}

          <TouchableOpacity style={[styles.saveButton, salvando && styles.saveButtonDisabled]} onPress={salvarAlteracoes} disabled={salvando}>
            {salvando ? <ActivityIndicator size="small" color={WHITE} /> : <Text style={styles.saveButtonText}>Salvar Alterações</Text>}
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CREAM },
  header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 16, borderBottomWidth: 1, borderColor: BORDER, backgroundColor: CREAM },
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 4 },
  backButtonText: { color: PETROLEO, fontSize: 15, fontWeight: '500' },
  headerTitle: { fontSize: 24, fontWeight: '700', color: PETROLEO },
  centerLoading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40 },
  formGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '700', color: PETROLEO, marginBottom: 8 },
  input: { backgroundColor: WHITE, borderWidth: 1.5, borderColor: BORDER, borderRadius: 12, paddingHorizontal: 16, height: 54, fontSize: 15, color: PETROLEO, fontWeight: '500' },
  textArea: { height: 100, paddingTop: 14 },
  rowButtons: { flexDirection: 'row', gap: 10 },
  selectorButton: { flex: 1, height: 48, backgroundColor: WHITE, borderWidth: 1.5, borderColor: BORDER, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  selectorButtonActive: { backgroundColor: VERDE_VIVO, borderColor: VERDE_VIVO },
  selectorText: { fontSize: 14, fontWeight: '600', color: TEXT_MID },
  selectorTextActive: { color: WHITE },
  rowHorarios: { flexDirection: 'row', gap: 16 },
  saveButton: { backgroundColor: VERDE_VIVO, borderRadius: 16, height: 56, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  saveButtonDisabled: { opacity: 0.7 },
  saveButtonText: { color: WHITE, fontSize: 16, fontWeight: '700' }
});

export default EditarDadosProfissional; // <-- EXPORT COMPATÍVEL NO FINAL