import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, TextInput, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function CadastroPasso2() {
  const router = useRouter();
  const { tipo_conta } = useLocalSearchParams(); // Pega o tipo vindo do Passo 1

  const [nome, setNome] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const handleNext = () => {
    // Validação básica de campos vazios
    if (!nome || !senha || !confirmarSenha) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }

    // Validação de coincidência de senha
    if (senha !== confirmarSenha) {
      Alert.alert("Erro", "As senhas não coincidem!");
      return;
    }

    // Navega para o Passo 3 levando o "pacotão" de dados acumulados
    router.push({
      pathname: '/cadastro_passo3',
      params: { 
        tipo_conta: tipo_conta, 
        nome_usuario: nome, 
        senha: senha 
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.form}>
        
        {/* Lógica dinâmica do passo baseada no tipo de conta */}
        <Text style={styles.stepText}>
          {tipo_conta === 'profissional' ? 'Passo 2/5' : 'Passo 2/3'}
        </Text>

        <Text style={styles.label}>Crie seu Nome de Usuário</Text>
        <TextInput 
          style={styles.input}
          placeholder="Digite seu nome"
          placeholderTextColor="#444"
          value={nome}
          onChangeText={setNome}
          autoCapitalize="none" // Importante para nomes de usuário
        />

        <Text style={styles.label}>Crie uma senha</Text>
        <View style={styles.inputContainer}>
          <TextInput 
            style={styles.inputFlex}
            placeholder="Digite sua senha"
            placeholderTextColor="#444"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry={!mostrarSenha}
          />
          <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)}>
            <Text style={styles.eye}>{mostrarSenha ? '🔒' : '🔓'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Confirme sua senha</Text>
        <TextInput 
          style={styles.input}
          placeholder="Digite novamente sua senha"
          placeholderTextColor="#444"
          value={confirmarSenha}
          onChangeText={setConfirmarSenha}
          secureTextEntry={!mostrarSenha}
        />

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>PRÓXIMO</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()} style={{marginTop: 20}}>
          <Text style={{color: '#8b8682'}}>Voltar</Text>
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
    paddingHorizontal: 40, 
    alignItems: 'center',
    paddingTop: 80
  },
  stepText: {
    fontSize: 40,
    color: '#00ff00', 
    fontWeight: '400',
    marginBottom: 40,
  },
  label: { 
    fontSize: 22, 
    color: '#000', 
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#8b8682',
    paddingHorizontal: 15,
    fontSize: 18,
    marginBottom: 30,
    borderBottomWidth: 3,
    borderBottomColor: '#000'
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#8b8682',
    borderBottomWidth: 3,
    borderBottomColor: '#000',
    marginBottom: 30,
    paddingRight: 10
  },
  inputFlex: {
    flex: 1,
    height: 50,
    paddingHorizontal: 15,
    fontSize: 18,
  },
  eye: {
    fontSize: 22
  },
  nextButton: { 
    backgroundColor: '#0077c2', // Ajustado para o azul padrão dos outros botões
    width: 180, 
    height: 110, 
    justifyContent: 'center', 
    alignItems: 'center', 
  },
  nextButtonText: { 
    color: '#000', 
    fontSize: 28, 
    fontWeight: '400', 
  },
});