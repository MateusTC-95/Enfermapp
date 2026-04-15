import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image} from 'react-native';
import {Ionicons} from '@expo/vector-icons';

export default function Perfil({ navigation }) { // <-- Precisa ter o "default"
  return (
  
    <View style={styles.container}>
    <ScrollView>
    <View style={styles.row}>
    <TouchableOpacity style={styles.buttonIcon} onPress={() => navigation.navigate('Foto')}>
    <Ionicons name="person-outline" size={40} color="grey"/>
    </TouchableOpacity>
    <View style={styles.userInfo}>
    <Text style={styles.name}>Fulana de Tal</Text>
    <Text style={styles.aviso}>Avisos:</Text>
    </View>
    </View>

    <View style={styles.separator} /> 

    <View style={styles.detailsSection}>
    <Text style={styles.sectionTitle}>Dados Pessoais</Text>

    <View style={styles.infoList}>
    <Text style={styles.texto}>Cidade:</Text>
    <Text style={styles.texto}>Número de Serviços Recebidos</Text>
    <Text style={styles.texto}>Avisos:</Text>
    <Text style={styles.texto}>Telefone:</Text>
    <Text style={styles.texto}>Pagamento Usado:</Text> 
    </View> 
    

    <TouchableOpacity style={styles.button}>
    <Text style={styles.buttonText}>Editar Dados</Text>
    </TouchableOpacity>
    </View> 
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 4,
    backgroundColor:'#8C8C8C', 
    paddingBottom: 20,
  },

  row: {
    flexDirection: 'row',
    marginTop: 20,
  },

  button: {
    backgroundColor: '#00FFFF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    marginBottom: 30,
  },

  buttonIcon: {
    backgroundColor: 'black',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginLeft: 12,
  },

  buttonText: {
    fontSize: 22,
    color: '#000',
  },

  name: {
    fontSize: 20,
  },
  aviso: {
    fontSize: 20,
  },

  userInfo: {
    flex: 1,
    textAlign: 'center',
    marginLeft: 22,
  },

  separator: {
  height: 3,
  backgroundColor: '#000000', 
  marginVertical: 10, 
},

 texto: {
    fontSize: 16,
    color: '#000',
    marginBottom: 15,
  },

 infoList: {
    alignItems: 'center',
    marginBottom: 40,
  },

detailsSection: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: '400',
    color: '#000',
    marginBottom: 20,
  },
});