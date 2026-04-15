import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function App() {
  return (
    <View style={styles.container}>
      
      <Text style={styles.title}>
        Bem-Vindo(a) ao painel{'\n'}de Admin
      </Text>

      <Text style={styles.subtitle}>
        Selecione uma das Opções Abaixo:
      </Text>

      {/* Botão Aprovações */}
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Aprovações Pendentes</Text>
      </TouchableOpacity>

      {/* Pagamentos Pendentes */}
      <View style={styles.row}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Pagamentos Pendentes</Text>
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