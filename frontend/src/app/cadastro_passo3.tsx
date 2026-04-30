import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../services/api';

export default function CadastroPasso3() {
  const router = useRouter();
  const { tipo_conta, nome_usuario, senha } = useLocalSearchParams();

  const [cidade, setCidade] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  const cidades = ['Mococa, SP'];

  const handleNext = async () => {
    if (!cidade) {
      Alert.alert("Erro", "Por favor, selecione sua cidade.");
      return;
    }

    setLoading(true);
    try {
      let idUsuarioGerado;

      // 1. TENTA CRIAR O USUÁRIO
      const { data: novoUsuario, error: errorUser } = await supabase
        .from('usuario')
        .insert([{ 
          nome_usuario, 
          senha, 
          tipo_conta, 
          cidade, 
          status_conta: tipo_conta === 'profissional' ? 'pendente' : 'ativa' 
        }])
        .select()
        .single();

      if (errorUser) {
        // SE O ERRO FOR "JÁ EXISTE" (Código 23505), RECUPERAMOS O ID
        if (errorUser.code === '23505') {
          const { data: usuarioExistente, error: errorBusca } = await supabase
            .from('usuario')
            .select('id_usuario')
            .eq('nome_usuario', nome_usuario)
            .single();
          
          if (usuarioExistente) {
            idUsuarioGerado = usuarioExistente.id_usuario;
          } else {
            throw new Error("Usuário já existe, mas houve um erro ao recuperar os dados.");
          }
        } else {
          throw errorUser;
        }
      } else {
        idUsuarioGerado = novoUsuario.id_usuario;
      }

      // 2. LÓGICA ESPECÍFICA PARA PROFISSIONAL
      if (tipo_conta === 'profissional') {
        // Verifica se já existe uma linha na tabela profissional para este usuário
        const { data: profExistente } = await supabase
          .from('profissional')
          .select('id_profissional')
          .eq('id_usuario', idUsuarioGerado)
          .single();

        let idProfissional;

        if (!profExistente) {
          // Se não existe o registro profissional, cria agora
          const { data: novoProf, error: errorProf } = await supabase
            .from('profissional')
            .insert([{ 
              id_usuario: idUsuarioGerado,
              status_aprovacao: 'pendente',
              status_pagamento: 'pendente'
            }])
            .select()
            .single();

          if (errorProf) throw errorProf;
          idProfissional = novoProf.id_profissional;
        } else {
          idProfissional = profExistente.id_profissional;
        }

        // Navega para o passo 4 levando os IDs necessários
        router.push({
          pathname: '/cadastro_passo4',
          params: { 
            tipo_conta, 
            id_usuario: String(idUsuarioGerado), 
            id_profissional: String(idProfissional),
            cidade 
          }
        });

      } else {
        // SE FOR CLIENTE, FINALIZA AQUI
        Alert.alert(
          "Sucesso!",
          "Cadastro realizado com sucesso!",
          [{ text: "OK", onPress: () => router.replace('/login') }]
        );
      }
    } catch (err: any) {
      console.error(err);
      Alert.alert("Erro", "Ocorreu um problema: " + (err.message || "Erro de conexão."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.stepText}>
          {tipo_conta === 'profissional' ? 'Passo 3/5' : 'Passo 3/3'}
        </Text>

        <Text style={styles.label}>Selecione sua Cidade</Text>
        
        <View style={styles.dropdownContainer}>
          <TouchableOpacity
            style={styles.dropdownHeader}
            onPress={() => setShowDropdown(!showDropdown)}
            disabled={loading}
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

        <TouchableOpacity
          style={[styles.nextButton, loading && { opacity: 0.7 }]}
          onPress={handleNext}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.nextButtonText}>
              {tipo_conta === 'profissional' ? 'PRÓXIMO' : 'FINALIZAR'}
            </Text>
          )}
        </TouchableOpacity>

        {!loading && (
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  form: { flex: 1, paddingHorizontal: 40, alignItems: 'center', paddingTop: 80 },
  stepText: { fontSize: 40, color: '#00ff00', fontWeight: '400', marginBottom: 40 },
  label: { fontSize: 22, color: '#000', alignSelf: 'flex-start', marginBottom: 10 },
  dropdownContainer: { width: '100%', marginBottom: 60, zIndex: 10 },
  dropdownHeader: { 
    backgroundColor: '#8b8682', height: 50, flexDirection: 'row', 
    justifyContent: 'space-between', alignItems: 'center', 
    paddingHorizontal: 15, borderBottomWidth: 3, borderBottomColor: '#000'
  },
  inputText: { fontSize: 18, color: '#000' },
  arrow: { fontSize: 25 },
  dropdownOptions: { 
    backgroundColor: '#8b8682', maxHeight: 200, width: '100%', 
    position: 'absolute', top: 50, borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#000'
  },
  option: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#7a7571' },
  optionText: { fontSize: 18, color: '#000' },
  nextButton: { backgroundColor: '#0077c2', width: 180, height: 100, justifyContent: 'center', alignItems: 'center' },
  nextButtonText: { color: '#000', fontSize: 26, fontWeight: 'bold' },
  backButton: { marginTop: 20 },
  backButtonText: { color: '#8b8682', fontSize: 16 }
});