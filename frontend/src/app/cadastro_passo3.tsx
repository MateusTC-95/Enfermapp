import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function CadastroPasso3() {
  const router = useRouter();
  const { tipo } = useLocalSearchParams(); // Recebe 'cliente' ou 'profissional'

  const [cidade, setCidade] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const cidades = ['Mococa, SP']; // Lista de exemplo

  const handleNext = () => {
    if (!cidade) {
      Alert.alert("Erro", "Por favor, selecione sua cidade.");
      return;
    }

    if (tipo === 'profissional') {
      // Profissional vai para o Passo 4
      router.push({
        pathname: '/cadastro_passo4',
        params: { tipo: tipo, cidade: cidade }
      });
    } else {
      // Cliente finaliza aqui
      Alert.alert("Sucesso", "Cadastro concluído!");
      router.replace('/cliente/dashboard');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.form}>
        
        {/* Passo dinâmico */}
        <Text style={styles.stepText}>
          {tipo === 'profissional' ? 'Passo 3/5' : 'Passo 3/3'}
        </Text>

        <Text style={styles.label}>Selecione sua Cidade</Text>
        
        <View style={styles.dropdownContainer}>
          <TouchableOpacity 
            style={styles.dropdownHeader} 
            onPress={() => setShowDropdown(!showDropdown)}
          >
            <Text style={styles.inputText}>{cidade || "Clique para selecionar"}</Text>
            <Text style={styles.arrow}>{showDropdown ? '↑' : '↓'}</Text> 
          </TouchableOpacity> 

          {showDropdown && (
            <View style={styles.dropdownOptions}>
              {cidades.map((item) => (
                <TouchableOpacity 
                  key={item} 
                  style={styles.option} 
                  onPress={() => { 
                    setCidade(item); 
                    setShowDropdown(false); 
                  }}
                >
                  <Text style={styles.optionText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {tipo === 'profissional' ? 'PRÓXIMO' : 'FINALIZAR'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  form: { 
    flex: 1, 
    paddingHorizontal: 40, 
    alignItems: 'center',
    paddingTop: 80
  },
  stepText: {
    fontSize: 40,
    color: '#00ff00', 
    fontWeight: '400',
    marginBottom: 40,
  },
  label: { 
    fontSize: 22, 
    color: '#000', 
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  dropdownContainer: {
    width: '100%',
    marginBottom: 60,
  },
  dropdownHeader: { 
    backgroundColor: '#8b8682', 
    height: 50, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 15,
    borderBottomWidth: 3,
    borderBottomColor: '#000'
  },
  inputText: { 
    fontSize: 18, 
    color: '#000' 
  },
  arrow: { 
    fontSize: 25, 
  },
  dropdownOptions: { 
    backgroundColor: '#8b8682', 
    maxHeight: 200, // Limita a altura se tiver muitas cidades
  },
  option: { 
    padding: 15, 
    borderBottomWidth: 1, 
    borderBottomColor: '#7a7571' 
  },
  optionText: { 
    fontSize: 18, 
    color: '#000' 
  },
  nextButton: { 
    backgroundColor: '#0077c2', 
    width: 180, 
    height: 100, 
    justifyContent: 'center', 
    alignItems: 'center', 
  },
  nextButtonText: { 
    color: '#000', 
    fontSize: 26, 
    fontWeight: 'bold', 
  },
  backButton: {
    marginTop: 20
  },
  backButtonText: {
    color: '#8b8682',
    fontSize: 16
  }
});