import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function CadastroPasso5() {
  const router = useRouter();
  // Pega TUDO que veio acumulado até agora
  const params = useLocalSearchParams(); 
  
  const [planoSelecionado, setPlanoSelecionado] = useState(null);

  const planos = [
    { 
      id: 'normal', 
      nome: 'Plano Normal', 
      preco: 'R$ 49/mês', 
      beneficios: [
        'Perfil profissional na plataforma',
        'Recebimento de solicitações de pacientes',
        'Chat para comunicação com pacientes',
        'Agendamento de atendimentos',
        'Avaliações no perfil'
      ],
      corHeader: '#8b8682',
      corTexto: '#fff' 
    },
    { 
      id: 'premium', 
      nome: 'Plano Premium', 
      preco: 'R$ 69/mês', 
      beneficios: [
        'Todos os benefícios do Plano Normal',
        'Destaque nas buscas do aplicativo',
        'Maior prioridade nas solicitações de atendimento'
      ],
      corHeader: '#1a0505',
      corTexto: '#FFD700' 
    },
  ];

  const handleIrParaPagamento = () => {
    if (!planoSelecionado) {
      Alert.alert("Atenção", "Selecione um plano para prosseguir ao pagamento.");
      return;
    }
    
    // Agora enviamos o "Pacote Completo" para a tela final
    router.push({
      pathname: '/tela_pagamento',
      params: { 
        ...params, // Espalha nome, senha, tipo, cidade e foto
        plano: planoSelecionado 
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <Text style={styles.stepText}>Passo 5/5</Text>
        <Text style={styles.mainTitle}>Escolha um Plano Para seu Perfil Profissional</Text>

        {planos.map((plano) => (
          <View key={plano.id} style={styles.planWrapper}>
            <View style={styles.cardContainer}>
              <View style={[styles.cardHeader, { backgroundColor: plano.corHeader }]}>
                <Text style={[styles.cardTitle, { color: plano.corTexto }]}>{plano.nome}</Text>
                <Text style={[styles.cardPrice, { color: plano.corTexto }]}>({plano.preco})</Text>
              </View>
              
              <View style={styles.cardBody}>
                {plano.beneficios.map((b, index) => (
                  <View key={index} style={styles.benefitRow}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.benefitText}>{b}</Text>
                  </View>
                ))}
              </View>
            </View>

            <TouchableOpacity 
              style={[
                styles.selectButton, 
                planoSelecionado === plano.id ? styles.selectedButtonBg : styles.defaultButtonBg
              ]}
              onPress={() => setPlanoSelecionado(plano.id)}
            >
              <Text style={styles.selectButtonText}>
                {planoSelecionado === plano.id ? "Plano Escolhido" : "Escolher Esse Plano"}
              </Text>
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity style={styles.nextButton} onPress={handleIrParaPagamento}>
          <Text style={styles.nextButtonText}>PRÓXIMO</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()} style={{marginTop: 20}}>
          <Text style={{color: '#8b8682'}}>Voltar</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff'
   },
  scrollContent: {
     paddingHorizontal: 35, 
     alignItems: 'center',
      paddingTop: 40, 
      paddingBottom: 60 
    },
  stepText: { 
    fontSize: 38, 
    color: '#00ff00', 
    marginBottom: 20 
  },
  mainTitle: { 
    fontSize: 22, 
    color: '#000', 
    textAlign: 'center',
     marginBottom: 40
     },
  planWrapper: { 
    width: '100%',
     alignItems: 'center',
      marginBottom: 50 
    },
  cardContainer: {
     width: '100%', 
     backgroundColor: '#8b8682', 
     borderRadius: 30, 
     overflow: 'hidden', 
     marginBottom: 20 
    },
  cardHeader: { 
    paddingVertical: 15,
     alignItems: 'center' 
    },
  cardTitle: { 
    fontSize: 24, 
    fontWeight: 'bold'
   },
  cardPrice: {
     fontSize: 24 
    },
  cardBody: { 
    padding: 20
   },
  benefitRow: { 
    flexDirection: 'row',
     marginBottom: 5
     },
  bullet: { 
    fontSize: 25, 
    color: '#000',
     marginRight: 10
     },
  benefitText: { 
    fontSize: 18, 
    color: '#000',
     flexShrink: 1
     },
  selectButton: { 
    width: '75%', 
    height: 70, 
    justifyContent: 'center', 
    alignItems: 'center'
   },
  defaultButtonBg: { 
    backgroundColor: '#8b8682'
   },
  selectedButtonBg: { 
    backgroundColor: '#00aa00' 
  },
  selectButtonText: { 
    fontSize: 22, 
    color: '#000'
   },
  nextButton: { 
    backgroundColor: '#0077c2',
     width: 180, height: 100,
      justifyContent: 'center',
       alignItems: 'center', 
       marginTop: 20
       },
  nextButtonText: { 
    color: '#000', 
    fontSize: 26 
  },
});