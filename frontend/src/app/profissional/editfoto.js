import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Para o ícone de fechar (X)
import * as ImagePicker from 'expo-image-picker';

export default function ProfilePhotoScreen() {
  const [image, setImage] = useState(null);

  const pickImage = async () => {
    // Solicita permissão e abre a galeria
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Botão de Fechar (X) */}
      <TouchableOpacity style={styles.closeButton}>
        <Ionicons name="close" size={40} color="red" />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>Anexar uma Foto{"\n"}de Perfil</Text>

        <View style={styles.imageContainer}>
          {/* Mostra a imagem selecionada ou o placeholder cinza */}
          <View style={styles.placeholderBox}>
            {image ? (
              <Image source={{ uri: image }} style={styles.previewImage} />
            ) : (
              <Ionicons name="image-outline" size={100} color="#555" />
            )}
          </View>

          {/* Botão de Anexar */}
          <TouchableOpacity style={styles.attachButton} onPress={pickImage}>
            <Text style={styles.attachText}>Anexar Imagem</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8E8E8E', // Fundo cinza como na imagem
  },
  closeButton: {
    padding: 20,
    alignSelf: 'flex-start',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '500',
    textAlign: 'center',
    color: '#000',
    marginBottom: 40,
  },
  imageContainer: {
    width: '80%',
    backgroundColor: '#666', // Fundo do quadrado maior
    borderRadius: 8,
    overflow: 'hidden',
  },
  placeholderBox: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  attachButton: {
    backgroundColor: '#333',
    paddingVertical: 15,
    alignItems: 'center',
  },
  attachText: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
});
