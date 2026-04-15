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
  const [mostrarSenha, setMostrarSenha] = useState(false); // Estado para o cadeado

  const handleLogin = async () => {
    // Validação básica
    if (!tipo || !usuario || !senha) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }

    try {
      // 1. Tratamos o tipo para a consulta no banco e para a rota da pasta
      // Se for 'Administrador', vira 'admin'. Caso contrário, vira 'cliente' ou 'profissional'
      const tipoNormalizado = tipo.toLowerCase() === 'administrador' ? 'admin' : tipo.toLowerCase();
      
      // CONSULTA AO SUPABASE
      const { data, error } = await supabase
        .from('usuario')
        .select('*')
        .eq('nome_usuario', usuario)
        .eq('senha', senha) // No futuro, usaremos hash aqui!
        .eq('tipo_conta', tipoNormalizado)
        .single();

      if (error || !data) {
        Alert.alert("Erro", "Usuário ou senha inválidos.");
        return;
      }

      // 2. NAVEGAÇÃO
      // Agora o redirecionamento usa o nome da pasta correto (admin, cliente ou profissional)
      router.replace(`/${tipoNormalizado}/dashboard` as any);

    } catch (error) {
      Alert.alert("Erro", "Não foi possível conectar ao banco de dados.");
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.form}>
        
        {/* SELETOR DE TIPO DE CONTA */}
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

        {/* NOME DE USUÁRIO */}
        <Text style={styles.label}>Nome de Usuário</Text>
        <TextInput 
          style={styles.input} 
          value={usuario} 
          onChangeText={setUsuario} 
          autoCapitalize="none" 
        />

        {/* SENHA COM CADEADO (MOSTRAR/OCULTAR) */}
        <Text style={styles.label}>Senha</Text>
        <View style={styles.passwordContainer}>
          <TextInput 
            style={styles.inputSenha} 
            value={senha} 
            onChangeText={setSenha} 
            secureTextEntry={!mostrarSenha} 
          />
          <TouchableOpacity 
            style={styles.eyeButton} 
            onPress={() => setMostrarSenha(!mostrarSenha)}
          >
            <Text style={{ fontSize: 20 }}>{mostrarSenha ? '🔓' : '🔒'}</Text>
          </TouchableOpacity>
        </View>

        {/* BOTÃO DE LOGIN */}
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8b8682',
    height: 60,
  },
  inputSenha: {
    flex: 1,
    height: 60,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#000',
  },
  eyeButton: {
    paddingHorizontal: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownHeader: { 
    backgroundColor: '#8b8682', 
    height: 50, // Aumentado para melhor toque
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
    marginTop: 1,
    zIndex: 10, // Garante que fique por cima
  },
  option: { 
    padding: 15, 
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
    color: '#fff', 
    fontSize: 24, 
    fontWeight: 'bold' 
  },
});