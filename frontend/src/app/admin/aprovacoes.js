import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons'; // FontAwesome5 tem o ícone de cifrão melhor
import { useRouter } from 'expo-router';

export default function VerificacaoProfissionais() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Botão de Voltar */}
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => router.back()}
      >
        <Ionicons name="chevron-back-outline" size={40} color="black" />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>
          Verificação de Profissionais
        </Text>

        <Text style={styles.subtitle}>
          Selecione uma das Opções Abaixo:
        </Text>

        <View style={styles.row}>
          {/* Botão Documentos */}
          <TouchableOpacity 
            style={styles.squareButton}
            onPress={() => console.log('Ir para Documentos')}
          >
            <Ionicons name="attach-outline" size={80} color="black" />
            <Text style={styles.buttonText}>Documentos</Text>
          </TouchableOpacity>

          {/* Botão Pagamento */}
          <TouchableOpacity 
            style={styles.squareButton}
            onPress={() => console.log('Ir para Pagamento')}
          >
            <FontAwesome5 name="dollar-sign" size={70} color="black" />
            <Text style={styles.buttonText}>Pagamento</Text>
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
  backButton: {
    padding: 20,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 26,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 40,
    color: '#000',
  },
  subtitle: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 60,
    color: '#000',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 30, // Espaço entre os botões
  },
  squareButton: {
    width: 150,
    height: 150,
    backgroundColor: '#7a7a7a', // Cinza da imagem
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 0, // Quadrado perfeito sem bordas arredondadas
  },
  buttonText: {
    color: '#000',
    fontSize: 18,
    marginTop: 5,
    fontWeight: '400',
  },
});