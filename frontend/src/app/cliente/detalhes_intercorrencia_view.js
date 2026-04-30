import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../services/api';

export default function DetalhesIntercorrenciaCliente() {
  const { id } = useLocalSearchParams(); // Aqui está vindo o ID 25 (Agendamento)
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  
  const [comentario, setComentario] = useState('');
  const [imagemNova, setImagemNova] = useState(null);

  useEffect(() => {
    console.log("ID do agendamento recebido:", id);
    if (id) {
      fetchDetalhes();
    }
  }, [id]);

  const fetchDetalhes = async () => {
    try {
      setLoading(true);
      
      // MUDANÇA AQUI: Filtramos pela coluna 'id_agendamento' em vez de 'id_intercorrencia'
      const { data, error } = await supabase
        .from('intercorrencia')
        .select(`
          *,
          agendamentos!inner (
            id_agendamento,
            servico:id_servico ( nome_servico ),
            profissional:id_profissional ( usuario:id_usuario ( nome_usuario ) )
          )
        `)
        .eq('id_agendamento', id) // <--- Alterado para buscar pelo ID do agendamento
        .single();

      if (error) {
        console.error("Erro ao buscar intercorrência pelo agendamento:", error.message);
        throw error;
      }
      
      console.log("Dados da intercorrência encontrados:", data);
      setData(data);
      if (data?.descricao_cliente) setComentario(data.descricao_cliente);

    } catch (error) {
      console.error("Erro Catch:", error);
    } finally {
      setLoading(false);
    }
  };

  const selecionarImagem = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImagemNova(result.assets[0].uri);
    }
  };

  const atualizarReclamacao = async () => {
    if (!comentario) return Alert.alert("Atenção", "O comentário não pode estar vazio.");

    try {
      setEnviando(true);
      let urlFinal = data?.imagem_url || null; 

      if (imagemNova) {
        const response = await fetch(imagemNova);
        const blob = await response.blob();
        const fileName = `reclamacao_ag_${id}_${Date.now()}.jpg`;

        const { error: uploadError } = await supabase.storage
          .from('intercorrencias')
          .upload(fileName, blob, { contentType: 'image/jpeg', upsert: true });

        if (uploadError) throw uploadError;

        const { data: publicUrl } = supabase.storage
          .from('intercorrencias')
          .getPublicUrl(fileName);
          
        urlFinal = publicUrl.publicUrl;
      }

      // Atualiza usando o id_agendamento para garantir que pegue a linha certa
      const { error } = await supabase
        .from('intercorrencia')
        .update({ 
          descricao_cliente: comentario,
          imagem_url: urlFinal 
        })
        .eq('id_agendamento', id);

      if (error) throw error;

      Alert.alert("Sucesso", "Sua reclamação foi atualizada!");
      router.back();
    } catch (error) {
      console.error("Erro no Update:", error);
      Alert.alert("Erro", "Falha ao atualizar.");
    } finally {
      setEnviando(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#C5005E" />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.center}>
        <Ionicons name="search-outline" size={50} color="#ccc" />
        <Text style={styles.notFoundText}>Nenhuma intercorrência vinculada ao agendamento #{id}.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.btnVoltar}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const resolvida = data?.status === 'resolvido';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={30} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Minha Reclamação</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.cardInfo}>
          <Text style={styles.label}>Serviço: <Text style={styles.value}>{data?.agendamentos?.servico?.nome_servico}</Text></Text>
          <Text style={styles.label}>Profissional: <Text style={styles.value}>{data?.agendamentos?.profissional?.usuario?.nome_usuario}</Text></Text>
          <Text style={styles.label}>Status: 
            <Text style={[styles.value, { color: resolvida ? 'green' : '#e67e22' }]}> {data?.status?.toUpperCase()}</Text>
          </Text>
        </View>

        {data?.descricao_profissional && (
          <View style={styles.sectionProfissional}>
            <Text style={styles.sectionTitle}>Resposta do Profissional:</Text>
            <Text style={styles.descricaoTxt}>{data.descricao_profissional}</Text>
            {data?.imagem_url_defesa && (
              <Image source={{ uri: data.imagem_url_defesa }} style={styles.imgDefesa} resizeMode="contain" />
            )}
          </View>
        )}

        <View style={styles.divider} />

        {resolvida && (
          <View style={styles.vereditoCard}>
            <Text style={styles.vereditoTitle}>Decisão Final do Administrador:</Text>
            <Text style={styles.vereditoTxt}>{data?.veredito || 'Caso encerrado pelo administrador.'}</Text>
          </View>
        )}

        <View style={styles.defesaArea}>
          <Text style={styles.sectionTitle}>Sua Reclamação Original:</Text>
          <Text style={styles.motivoTxt}>{data?.motivo_categoria}</Text>
          
          {!resolvida ? (
            <>
              <TextInput
                style={styles.input}
                multiline
                numberOfLines={4}
                value={comentario}
                onChangeText={setComentario}
              />
              <TouchableOpacity style={styles.btnFoto} onPress={selecionarImagem}>
                <Ionicons name="camera" size={20} color="#fff" />
                <Text style={styles.btnFotoText}>Alterar Prova</Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={styles.descricaoTxt}>{data?.descricao_cliente}</Text>
          )}

          {(imagemNova || data?.imagem_url) && (
            <Image source={{ uri: imagemNova || data?.imagem_url }} style={styles.miniImg} />
          )}

          {!resolvida && (
            <TouchableOpacity 
              style={[styles.btnEnviar, enviando && { opacity: 0.5 }]} 
              onPress={atualizarReclamacao}
              disabled={enviando}
            >
              {enviando ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnEnviarText}>Atualizar Reclamação</Text>}
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: '#FFF', elevation: 2, paddingTop: 50 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 15 },
  content: { padding: 20 },
  cardInfo: { backgroundColor: '#FFF', padding: 15, borderRadius: 10, marginBottom: 20, borderLeftWidth: 5, borderLeftColor: '#C5005E' },
  label: { fontSize: 14, color: '#666', marginBottom: 5 },
  value: { fontWeight: 'bold', color: '#333', fontSize: 15 },
  sectionProfissional: { backgroundColor: '#E3F2FD', padding: 15, borderRadius: 10, marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#C5005E' },
  motivoTxt: { fontSize: 18, fontWeight: 'bold', color: 'red', marginBottom: 10 },
  descricaoTxt: { fontSize: 15, color: '#444', lineHeight: 22 },
  imgDefesa: { width: '100%', height: 200, marginTop: 10, borderRadius: 8 },
  divider: { height: 1, backgroundColor: '#DDD', marginVertical: 20 },
  vereditoCard: { backgroundColor: '#E8F5E9', padding: 15, borderRadius: 10, borderLeftWidth: 5, borderLeftColor: 'green', marginBottom: 20 },
  vereditoTitle: { fontWeight: 'bold', color: '#1B5E20' },
  vereditoTxt: { fontSize: 15, color: '#333', marginTop: 5 },
  input: { backgroundColor: '#FFF', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#DDD', textAlignVertical: 'top', fontSize: 15, minHeight: 100 },
  btnFoto: { backgroundColor: '#666', flexDirection: 'row', padding: 12, borderRadius: 8, marginTop: 15, justifyContent: 'center', alignItems: 'center' },
  btnFotoText: { color: '#fff', marginLeft: 10, fontWeight: 'bold' },
  miniImg: { width: '100%', height: 250, borderRadius: 10, marginTop: 15, resizeMode: 'contain', backgroundColor: '#eee' },
  btnEnviar: { backgroundColor: '#C5005E', padding: 18, borderRadius: 10, marginTop: 20, alignItems: 'center', marginBottom: 40 },
  btnEnviarText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  btnVoltar: { backgroundColor: '#C5005E', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, marginTop: 20 },
  notFoundText: { fontSize: 16, color: '#666', marginTop: 10, textAlign: 'center' }
});