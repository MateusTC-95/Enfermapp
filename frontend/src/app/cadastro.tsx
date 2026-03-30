import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
// import das função do react ( o react, as funções e o use router (bilioteca de navegação))

export default function CadastroScreen() {
  const router = useRouter(); // variavel do router
  const [tipo, setTipo] = useState(''); // variavel do tipo da conta
  const [showDropdown, setShowDropdown] = useState(false); // dropdown (quando a lista desce)

  const handleNext = () => {
    if (!tipo) {
      alert("Por favor, selecione o tipo de conta."); // alerta caso n escolham a conta 
      return;
    }
    // Lógica para ir para o Passo 2 = router.push('/cadastro_passo2')
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.form}>
        
        
        <Text style={styles.stepText}>Passo 1/3</Text>

        <Text style={styles.label}>Selecione o Tipo de Conta</Text>
        
        <View style={styles.dropdownContainer}>
          <TouchableOpacity 
            style={styles.dropdownHeader} 
            onPress={() => setShowDropdown(!showDropdown)} // pra listinha aparecer quando clica
          >

          
            <Text style={styles.inputText}>{tipo || ""}</Text>
            <Text style={styles.arrow}>{showDropdown ? '↑' : '↑'}</Text> 
          </TouchableOpacity> 
        

          {showDropdown && (
            <View style={styles.dropdownOptions}>
              {['Cliente', 'Profissional'].map((item) => (
                <TouchableOpacity 
                  key={item} 
                  style={styles.option} 
                  onPress={() => { 
                    setTipo(item); 
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
          <Text style={styles.nextButtonText}>PRÓXIMO</Text>
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
    marginBottom: 5,
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
    fontSize: 20, 
    color: '#000' 
  },
  arrow: { 
    fontSize: 30, 
    fontWeight: '400',
  },
  dropdownOptions: { 
    backgroundColor: '#8b8682', 
  },
  option: { 
    padding: 12, 
    borderBottomWidth: 0.5, 
    borderBottomColor: '#7a7571' 
  },
  optionText: { 
    fontSize: 20, 
    color: '#000' 
  },
  nextButton: { 
    backgroundColor: '#808000', 
    width: 180, 
    height: 110, 
    justifyContent: 'center', 
    alignItems: 'center', 
  },
  nextButtonText: { 
    color: '#000', 
    fontSize: 28, 
    fontWeight: '400', 
  },
});