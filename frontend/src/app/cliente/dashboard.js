import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function DashboardCliente() {
  const router = useRouter();

  // Função auxiliar para testar se o clique funciona
  const navegar = (rota) => {
    console.log("Tentando navegar para:", rota);
    router.push(rota);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Painel do Cliente</Text>

        <View style={styles.grid}>
          {/* BOTÃO PERFIL */}
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => navegar('/cliente/perfil')}
          >
            <Ionicons name="person" size={30} color="#fff" />
            <Text style={styles.buttonText}>Perfil</Text>
          </TouchableOpacity>

          {/* BOTÃO BUSCAR */}
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => navegar('/cliente/buscar')}
          >
            <Ionicons name="search" size={30} color="#fff" />
            <Text style={styles.buttonText}>Buscar</Text>
          </TouchableOpacity>

          {/* BOTÃO AGENDA */}
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => navegar('/cliente/agenda')}
          >
            <Ionicons name="calendar" size={30} color="#fff" />
            <Text style={styles.buttonText}>Agenda</Text>
          </TouchableOpacity>

          {/* BOTÃO NOTIFICAÇÕES */}
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => navegar('/cliente/notificacoes')}
          >
            <Ionicons name="notifications" size={30} color="#fff" />
            <Text style={styles.buttonText}>Avisos</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.btnSair} 
          onPress={() => navegar('/login')}
        >
          <Text style={{color: 'red', fontWeight: 'bold'}}>Sair do App</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
  },
  button: {
    backgroundColor: '#4A90E2', // Azul para destacar o clique
    width: '40%',
    aspectRatio: 1, // Faz o botão ser um quadrado perfeito
    margin: 10,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  buttonText: {
    color: '#fff',
    marginTop: 10,
    fontWeight: 'bold',
    fontSize: 16,
  },
  btnSair: {
    marginTop: 50,
    padding: 10,
  }
});