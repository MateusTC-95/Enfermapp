import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Perfil({navigation}) {
  return (
    <View style={styles.container}>
    <ScrollView>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Perfil do Profissional</Text>
      </View>

      {/* Informações do Profissional */}
      <View style={styles.profileInfo}>
        <View style={styles.avatarContainer}>
          <Image 
            source={{ uri: 'https://via.placeholder.com/100' }} 
            style={styles.avatar} 
          />
        </View>

        <View style={styles.userInfo}>
          <Text style={styles.name}>Pessoa da Silva</Text>
          <Text style={styles.aviso}>Avisos: 0</Text>
        </View>
      </View>

      {/* Avaliações */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Avaliações do Perfil</Text>
        <View style={styles.stars}>
          {[...Array(5)].map((_, i) => (
            <Ionicons key={i} name="star-outline" size={28} color="#FFD700" />
          ))}
        </View>
        <Text style={styles.evaluationText}>Número de Avaliações: 0</Text>
        <Text style={styles.evaluationText}>Média de Nota Atual: 0</Text>
      </View>

      {/* Serviços Prestados */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tipo de Serviços Prestados</Text>
        <View style={styles.list}>
          <Text style={styles.listItem}>• Curativo Simples</Text>
          <Text style={styles.listItem}>• Curativo Complexo</Text>
          <Text style={styles.listItem}>• Troca de Bolsas Coletoras</Text>
          <Text style={styles.listItem}>• Coleta de Material para Exames</Text>
        </View>
      </View>

      {/* Pagamentos Aceitos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tipos de Pagamentos Aceitos</Text>
        <View style={styles.list}>
          <Text style={styles.listItem}>• Pix</Text>
          <Text style={styles.listItem}>• Dinheiro</Text>
        </View>
      </View>

       <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('EditFoto')}
        >
          <Text style={styles.buttonText}>Editar o seu perfil Proifissional</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2C2C2C',
  },
  buttonText: {
    marginTop: 8,
    fontSize: 19,
    color: "#F7F7F7"
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#555',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#3A3A3A',
    marginBottom: 8,
  },
  avatarContainer: {
    marginRight: 15,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#555',
  },
  userInfo: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  aviso: {
    fontSize: 16,
    color: '#CCC',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#3A3A3A',
    marginBottom: 8,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 10,
  },
  stars: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  evaluationText: {
    fontSize: 15,
    color: '#DDD',
    marginBottom: 4,
  },
  list: {
    paddingLeft: 5,
  },
  listItem: {
    fontSize: 15,
    color: '#EEE',
    marginBottom: 6,
  },
    button: {
    width: 275,
    height: 75,
    backgroundColor: '#555',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 15,
    borderRadius: 15,
  },
});