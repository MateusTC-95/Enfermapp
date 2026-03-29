import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Enfermapp</Text>

        <View style={styles.buttonContainer}>
          {/* Botão de Login - Azul Escuro */}
          <TouchableOpacity 
            style={[styles.button, styles.loginButton]} 
            onPress={() => router.push('/login')}
          >
            <Text style={styles.buttonText}>LOGIN</Text>
          </TouchableOpacity>

          {/* Botão de Cadastro - Verde Oliva */}
          <TouchableOpacity 
            style={[styles.button, styles.registerButton]} 
            onPress={() => router.push('/cadastro')}
          >
            <Text style={styles.buttonText}>CADASTRE-SE</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 48,
    fontWeight: '400', // Estilo mais limpo como no print
    color: '#000',
    marginBottom: 100,
  },
  buttonContainer: {
    width: '100%',
    gap: 20, // Espaçamento entre os botões
  },
  button: {
    width: '100%',
    height: 70,
    borderRadius: 50, // Bem arredondado como no print
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3, // Sombrinha leve
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  loginButton: {
    backgroundColor: '#06bbe9', // cor do login
  },
  registerButton: {
    backgroundColor: '#606c38', // cor do cadastro
  },
  buttonText: {
    color: '#000', // cor do enfermapp
    fontSize: 24,
    fontWeight: '500',
    letterSpacing: 1.5,
  },
});