

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function DashboardProfissional() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>
          Bem-Vindo(a) ao painel{'\n'}de Profissional
        </Text>

        <Text style={styles.subtitle}>
          Selecione uma das Opções Abaixo:
        </Text>

        {/* Botão Perfil */}
        <TouchableOpacity 
          style={styles.fullButton} 
          onPress={() => router.push('/profissional/perfil')}
        >
          <Ionicons name="person-outline" size={40} color="black" />
          <Text style={styles.buttonText}>Meu Perfil</Text>
        </TouchableOpacity>

        {/* Linha com 2 botões */}
        <View style={styles.row}>
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => router.push('/profissional/agenda')}
          >
            <Ionicons name="calendar-outline" size={40} color="black" />
            <Text style={styles.buttonText}>Minha Agenda</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.button} 
            onPress={() => router.push('/profissional/notificacoes')}
          >
            <Ionicons name="notifications-outline" size={40} color="black" />
            <Text style={styles.buttonText}>Notificações</Text>
          </TouchableOpacity>
        </View>

        {/* Botão de Logout (Opcional, mas útil) */}
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={() => router.replace('/login')}
        >
          <Text style={styles.logoutText}>Sair da Conta</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 40,
    color: '#666',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  fullButton: {
    width: 260,
    height: 120,
    backgroundColor: '#929292',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  button: {
    width: 120,
    height: 120,
    backgroundColor: '#929292',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  buttonText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  logoutButton: {
    marginTop: 50,
  },
  logoutText: {
    color: '#cc0000',
    fontWeight: 'bold',
  }
});


