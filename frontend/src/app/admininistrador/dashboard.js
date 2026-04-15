import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function App() {
  return (
    <View style={styles.container}>
      
      <Text style={styles.title}>
        Bem-Vindo(a) ao painel{'\n'}de profissional
      </Text>

      <Text style={styles.subtitle}>
        Selecione uma das Opções Abaixo:
      </Text>

      {/* Botão Perfil */}
      <TouchableOpacity style={styles.button}>
        <Ionicons name="person-outline" size={40} color="black" />
        <Text style={styles.buttonText}>Perfil</Text>
      </TouchableOpacity>

      {/* Linha com 2 botões */}
      <View style={styles.row}>
        <TouchableOpacity style={styles.button}>
          <Ionicons name="calendar-outline" size={40} color="black" />
          <Text style={styles.buttonText}>Agenda</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button}>
          <Ionicons name="notifications-outline" size={40} color="black" />
          <Text style={styles.buttonText}>Notificações</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e5e5e5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },

  title: {
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 40,
  },

  subtitle: {
    fontSize: 16,
    marginBottom: 20,
  },

  row: {
    flexDirection: 'row',
    marginTop: 20,
  },

  button: {
    width: 120,
    height: 120,
    backgroundColor: '#999',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
  },

  buttonText: {
    marginTop: 8,
    fontSize: 16,
  },
});