import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

export default function Agenda() { // <-- Precisa ter o "default"
  return (
  <View style={styles.container}>

  </View>
  );
}

const styles=StyleSheet.create({

  container:{
    flex: 1,
    backgroundColor: '#8C8C8C',
  },

  button:{
    backgroundColor: '#fff',
    marginTop: 50,
    paddingVertical: 10,
  },

  buttontext:{
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 22,
  }
});