import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
// Importamos o supabase que configuramos no seu services/api
import { supabase } from '../services/api'; 

export default function LoginScreen() {
  const router = useRouter();
  const [tipo, setTipo] = useState('');
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogin = async () => {
    if (!tipo || !usuario || !senha) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }

    try {
      const tipoRota = tipo.toLowerCase();
      
      // CONSULTA DIRETA AO SUPABASE
      // Buscamos o usuário onde nome, senha e tipo sejam iguais aos digitados
      const { data, error } = await supabase
        .from('usuario')
        .select('*')
        .eq('nome_usuario', usuario)
        .eq('senha', senha)
        .eq('tipo_conta', tipoRota === 'administrador' ? 'admin' : tipoRota) // Ajuste para bater com o ENUM 'admin'
        .single(); // Esperamos apenas um resultado

      if (error || !data) {
        Alert.alert("Erro", "Usuário ou senha inválidos.");
        return;
      }

      // Se chegamos aqui, o login deu certo
      router.replace(`/${tipoRota}/dashboard` as any);

    } catch (error) {
      Alert.alert("Erro", "Não foi possível conectar ao banco de dados.");
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Selecione o Tipo de Conta</Text>
        <TouchableOpacity 
          style={styles.dropdownHeader} 
          onPress={() => setShowDropdown(!showDropdown)}
        >
          <Text style={styles.inputText}>{tipo || "Clique para selecionar"}</Text>
          <Text style={styles.arrow}>{showDropdown ? '↑' : '↓'}</Text>
        </TouchableOpacity>

        {showDropdown && (
          <View style={styles.dropdownOptions}>
            {['Cliente', 'Profissional', 'Administrador'].map((item) => (
              <TouchableOpacity 
                key={item} 
                style={styles.option} 
                onPress={() => { setTipo(item); setShowDropdown(false); }}
              >
                <Text style={styles.optionText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={styles.label}>Nome de Usuário</Text>
        <TextInput 
          style={styles.input} 
          value={usuario} 
          onChangeText={setUsuario} 
          autoCapitalize="none" 
        />

        <Text style={styles.label}>Senha</Text>
        <TextInput 
          style={styles.input} 
          value={senha} 
          onChangeText={setSenha} 
          secureTextEntry 
        />

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>LOGIN</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  form: { 
    flex: 1, 
    paddingHorizontal: 30, 
    justifyContent: 'center' 
  },
  label: { 
    fontSize: 18, 
    color: '#000', 
    marginBottom: 5, 
    marginTop: 20 
  },
  input: { 
    backgroundColor: '#8b8682', 
    height: 60, 
    paddingHorizontal: 15, 
    fontSize: 16, 
    color: '#000' 
  },
  dropdownHeader: { 
    backgroundColor: '#8b8682', 
    height: 40, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 15 
  },
  inputText: { 
    fontSize: 16, 
    color: '#000' 
  },
  arrow: { 
    fontSize: 20, 
    fontWeight: 'bold' 
  },
  dropdownOptions: { 
    backgroundColor: '#8b8682', 
    marginTop: 1 
  },
  option: { 
    padding: 10, 
    borderBottomWidth: 0.5, 
    borderBottomColor: '#7a7571' 
  },
  optionText: { 
    fontSize: 16, 
    color: '#000' 
  },
  loginButton: { 
    backgroundColor: '#cc0000', 
    width: 150, 
    height: 70, 
    alignSelf: 'center', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 50 
  },
  loginButtonText: { 
    color: '#000', 
    fontSize: 24, 
    fontWeight: 'bold' 
  },
});