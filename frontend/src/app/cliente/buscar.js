import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import {Ionicons} from '@expo/vector-icons';

export default function Servicos() { // <-- Precisa ter o "default"
  return (
  <View style={styles.container}>

    <View>
    <TouchableOpacity style={styles.button}>
      <Text style={styles.titletext}>Clique aqui para buscar um serviço</Text>
    </TouchableOpacity>  
    </View>

    <Text style={styles.texto}>
    Busque um serviço desejado e encontre profissionais disponíveis na sua região de forma rápida e segura.  
    </Text>

    <View style={styles.centralizacao}>
    <Ionicons name="search-outline" size={100} color="black" position="center"/>
    </View>

  </View>
    
  );
}

const styles = StyleSheet.create({

container:{
  flex: 1,
  backgroundColor: '#8C8C8C',
},

  button:{
 backgroundColor: '#fff',
   padding: 20,
   borderRadius: 0,
   elevation: 3,
   marginTop: 10,
   paddingVertical: 10,
   paddingHorizontal: 10,
 },

 titletext:{
   fontSize: 22,
   textAlign: 'center',
 },

 texto:{
   fontSize: 17,
   textAlign: 'center',
   marginTop: 30,
 },

 centralizacao:{
   alignItems: 'center',
   marginTop: 35,
   borderColor: '#333',
   borderRadius: 30,
   borderWidth: 1.5,
   paddingVertical: 30,
   marginLeft: 100,
   marginRight: 100,
 }
});