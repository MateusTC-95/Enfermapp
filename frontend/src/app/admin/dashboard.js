import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';

export default function DashboardAdmin() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        
        <Text style={styles.title}>
          Bem-Vindo(a) ao painel{'\n'}de administrador
        </Text>

        <Text style={styles.subtitle}>
          Selecione uma das Opções Abaixo:
        </Text>

        {/* Botão Aprovações */}
        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.push('/admin/aprovacoes')} // Ajuste a rota conforme seus arquivos
        >
          <Text style={styles.buttonText}>APROVAÇÕES{'\n'}PENDENTES</Text>
        </TouchableOpacity>

        {/* Botão Intercorrências */}
        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.push('/admin/intercorrencias')} // Ajuste a rota conforme seus arquivos
        >
          <Text style={styles.buttonText}>INTERCORRÊNCIAS{'\n'}PENDENTES</Text>
        </TouchableOpacity>

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
    backgroundColor: '#fff', // Fundo branco como na imagem
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 80, // Espaçamento superior para o título
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28, // Título maior como na imagem
    textAlign: 'center',
    marginBottom: 40,
    color: '#000',
    lineHeight: 35,
  },
  subtitle: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 50,
    color: '#000',
  },
  button: {
    width: '90%', // Botão largo
    height: 80,   // Altura retangular
    backgroundColor: '#7a7a7a', // Cinza escuro da imagem
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30, // Espaço entre os botões
    // Se quiser o efeito de borda leve:
    borderRadius: 2, 
  },
  buttonText: {
    color: '#000', // Texto preto como na imagem
    fontSize: 20,
    textAlign: 'center',
    fontWeight: '400',
    letterSpacing: 1,
  },
   logoutButton: {
    marginTop: 50,
  },
  logoutText: {
    color: '#cc0000',
    fontWeight: 'bold',
  }
});