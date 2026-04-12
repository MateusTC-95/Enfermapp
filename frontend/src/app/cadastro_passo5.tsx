import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function CadastroPasso5() {
  const router = useRouter();
  
  // Captura todos os dados das telas anteriores (nome, email, senha, foto, etc)
  const params = useLocalSearchParams(); 
  
  const [planoSelecionado, setPlanoSelecionado] = useState(null);

  const planos = [
    { 
      id: 'normal', 
      nome: 'Plano Normal', 
      preco: 'R$ 49/mês', 
      beneficios: [
        'Perfil profissional na plataforma',
        'Recebimento de solicitações',
        'Chat com pacientes',
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
        'Todos os benefícios do Normal',
        'Destaque nas buscas do app',
        'Prioridade nas solicitações'
      ],
      corHeader: '#1a0505',
      corTexto: '#FFD700' 
    },
  ];

  const handleIrParaPagamento = () => {
    if (!planoSelecionado) {
      Alert.alert("Atenção", "Selecione um plano para prosseguir.");
      return;
    }
    
    // Navega para a tela de pagamento enviando o plano e os dados anteriores
    router.push({
      pathname: '/tela_pagamento',
      params: { 
        ...params, 
        planoId: planoSelecionado,
        // Aqui você pode passar o preço também se facilitar na tela final
        valor: planoSelecionado === 'normal' ? '49.00' : '69.00'
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
                <Text style={[styles.cardPrice, { color: plano.corTexto }]}>{plano.preco}</Text>
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
              activeOpacity={0.7}
              style={[
                styles.selectButton, 
                planoSelecionado === plano.id ? styles.selectedButtonBg : styles.defaultButtonBg
              ]}
              onPress={() => setPlanoSelecionado(plano.id)}
            >
              <Text style={styles.selectButtonText}>
                {planoSelecionado === plano.id ? "PLANO SELECIONADO" : "ESCOLHER ESTE PLANO"}
              </Text>
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity style={styles.nextButton} onPress={handleIrParaPagamento}>
          <Text style={styles.nextButtonText}>IR PARA PAGAMENTO</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingHorizontal: 30, alignItems: 'center', paddingTop: 40, paddingBottom: 60 },
  stepText: { fontSize: 32, fontWeight: 'bold', color: '#00ff00', marginBottom: 10 },
  mainTitle: { fontSize: 20, color: '#333', textAlign: 'center', marginBottom: 30, fontWeight: '600' },
  planWrapper: { width: '100%', alignItems: 'center', marginBottom: 40 },
  cardContainer: { width: '100%', backgroundColor: '#f5f5f5', borderRadius: 20, overflow: 'hidden', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
  cardHeader: { paddingVertical: 20, alignItems: 'center' },
  cardTitle: { fontSize: 22, fontWeight: 'bold' },
  cardPrice: { fontSize: 20, marginTop: 5 },
  cardBody: { padding: 20 },
  benefitRow: { flexDirection: 'row', marginBottom: 8, alignItems: 'flex-start' },
  bullet: { fontSize: 18, color: '#333', marginRight: 10 },
  benefitText: { fontSize: 16, color: '#444', flexShrink: 1 },
  selectButton: { width: '100%', height: 60, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginTop: -10 },
  defaultButtonBg: { backgroundColor: '#8b8682' },
  selectedButtonBg: { backgroundColor: '#00aa00' },
  selectButtonText: { fontSize: 16, color: '#fff', fontWeight: 'bold' },
  nextButton: { backgroundColor: '#0077c2', width: '100%', height: 70, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  nextButtonText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  backButton: { marginTop: 25 },
  backButtonText: { color: '#8b8682', fontSize: 16, textDecorationLine: 'underline' }
});