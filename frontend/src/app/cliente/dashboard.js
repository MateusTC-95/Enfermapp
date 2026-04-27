import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function DashboardCliente() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Painel do Cliente</Text>

        <View style={styles.grid}>
          {/* BOTÃO PERFIL */}
          <TouchableOpacity style={styles.button} onPress={() => router.push('/cliente/perfil')}>
            <Ionicons name="person" size={30} color="white" />
            <Text style={styles.buttonText}>Perfil</Text>
          </TouchableOpacity>

          {/* BOTÃO BUSCAR */}
          <TouchableOpacity style={styles.button} onPress={() => router.push('/cliente/buscar')}>
            <Ionicons name="search" size={30} color="white" />
            <Text style={styles.buttonText}>Buscar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.grid}>
          {/* BOTÃO AGENDA */}
          <TouchableOpacity style={styles.button} onPress={() => router.push('/cliente/agenda')}>
            <Ionicons name="calendar" size={30} color="white" />
            <Text style={styles.buttonText}>Agenda</Text>
          </TouchableOpacity>

          {/* BOTÃO NOTIFICAÇÕES */}
          <TouchableOpacity style={styles.button} onPress={() => router.push('/cliente/notificacoes')}>
            <Ionicons name="notifications" size={30} color="white" />
            <Text style={styles.buttonText}>Avisos</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.btnSair} onPress={() => router.replace('/login')}>
          <Text style={{color: 'red', fontWeight: 'bold'}}>Sair da Conta</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f0f0' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 30, color: '#333' },
  grid: { flexDirection: 'row', marginTop: 10, width: '100%', justifyContent: 'center' },
  button: {
    width: 130,
    height: 130,
    backgroundColor: '#818181', 
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
    borderRadius: 15,
  },
  buttonText: { color: 'white', marginTop: 10, fontWeight: 'bold', fontSize: 16 },
  btnSair: { marginTop: 50, padding: 10 }
});