import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../services/api';

export default function EditarDados() {
  const router = useRouter();
  const [tel, setTel] = useState("");
  const [pag, setPag] = useState("");
  const [loading, setLoading] = useState(false);

  // Função para aplicar a máscara de telefone (00) 00000-0000
  const mascaraTelefone = (valor) => {
    return valor
      .replace(/\D/g, "") // Remove tudo que não é número
      .replace(/(\d{2})(\d)/, "($1) $2") // Coloca parênteses no DDD
      .replace(/(\d{5})(\d)/, "$1-$2") // Coloca o hífen após o 5º dígito
      .replace(/(-\d{4})\d+?$/, "$1"); // Limita a quantidade de números
  };

  const handleTelefoneChange = (text) => {
    setTel(mascaraTelefone(text));
  };

  const salvar = async () => {
    if (!tel || !pag) {
      Alert.alert("Aviso", "Preencha todos os campos antes de salvar.");
      return;
    }

    try {
      setLoading(true);

      // 1. Pega o nome do usuário que salvamos no Login
      const nomeSalvo = await AsyncStorage.getItem('nome_logado');

      if (!nomeSalvo) {
        Alert.alert("Erro", "Sessão expirada. Faça login novamente.");
        return;
      }

      // 2. Faz o UPDATE no banco de dados Supabase
      const { error } = await supabase
        .from('usuario')
        .update({ 
          telefone: tel, 
          pagamento_usado: pag 
        })
        .eq('nome_usuario', nomeSalvo); // Filtra pelo usuário logado

      if (error) throw error;

      Alert.alert("Sucesso", "Dados salvos no banco de dados!");
      
      // 3. Volta para a tela anterior (Perfil)
      router.back();

    } catch (error) {
      Alert.alert("Erro ao salvar", error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Editar Informações</Text>
      
      <Text style={styles.label}>Telefone</Text>
      <TextInput 
        style={styles.input} 
        placeholder="(00) 00000-0000"
        value={tel}
        onChangeText={handleTelefoneChange}
        keyboardType="phone-pad"
        maxLength={15} // Limita o tamanho do input com a máscara
      />

      <Text style={styles.label}>Forma de Pagamento</Text>
      <TextInput 
        style={styles.input} 
        placeholder="Ex: Cartão de Crédito ou Pix"
        value={pag}
        onChangeText={setPag}
      />

      <TouchableOpacity 
        style={[styles.btnSalvar, loading && { opacity: 0.7 }]} 
        onPress={salvar}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>Salvar Alterações</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity 
        style={{ marginTop: 20, alignItems: 'center' }} 
        onPress={() => router.back()}
      >
        <Text style={{ color: '#666' }}>Cancelar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 30, 
    backgroundColor: '#fff', 
    justifyContent: 'center' 
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 30, 
    textAlign: 'center' 
  },
  label: { 
    fontSize: 16, 
    marginBottom: 8, 
    color: '#666' 
  },
  input: { 
    backgroundColor: '#f0f0f0', 
    height: 55, 
    borderRadius: 10, 
    paddingHorizontal: 15, 
    marginBottom: 20,
    fontSize: 16
  },
  btnSalvar: { 
    backgroundColor: '#28a745', 
    height: 55, 
    borderRadius: 10, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 20 
  },
  btnText: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: 'bold' 
  }
});