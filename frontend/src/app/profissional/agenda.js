import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';

export default function Agenda() {
  
  // Função para lidar com o clique
  const handlePress = (atendimento) => {
    Alert.alert("Sucesso", `Você clicou no ${atendimento}`);
  };

  return (
    <View style={styles.container}>
      
      <Text style={styles.title}>
        Tela de Calendario
      </Text>

      {/* Botão 1 */}
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => handlePress("Atendimento 1")}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonText}>Atendimento 1</Text>
      </TouchableOpacity>

      {/* Botão 2 */}
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => handlePress("Atendimento 2")}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonText}>Atendimento 2</Text>
      </TouchableOpacity>

    </View>
  );
}

// Organizando os estilos para deixar o código limpo
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
    padding: 20,
  },
  title: {
    color: "#fff",
    fontSize: 20,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: "#222",
    padding: 25,
    borderRadius: 15, // Aumentei um pouco para um visual mais moderno
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#333", // Um leve contorno para destacar no fundo preto
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});
