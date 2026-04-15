import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

export default function Notificacoes() { // <-- Precisa ter o "default"
  return (
  <View style={styles.container}>

  <View style={styles.card}>
  <Text style={styles.title}>Atendimento Confirmado</Text>

  <Text style={styles.texto}>Ana Luiza Jardim confirmou o atendimento</Text>

  <Text style={styles.texto}>Vá até "Agenda" para visualizar o atendimento</Text>
  </View>

  </View>
  );
}

const styles = StyleSheet.create({

  container:{
    flex: 1,
    backgroundColor: '#8C8C8C',
  },

  card:{
    backgroundColor: '#fff',
    alignItems: 'center',
    marginTop: 36,
  },

  title:{
    fontSize: 22,
    fontWeight: 'bold',
  }, 

  texto:{
    fontSize: 20,
    textAlign: 'center',
    marginTop: 10,
  } 
});