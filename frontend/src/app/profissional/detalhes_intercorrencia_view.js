import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../services/api';

export default function DetalhesIntercorrenciaProfissional() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  
  const [comentarioDefesa, setComentarioDefesa] = useState('');
  const [imagemDefesa, setImagemDefesa] = useState(null);

  useEffect(() => {
    fetchDetalhes();
  }, [id]);

  const fetchDetalhes = async () => {
    try {
      const { data, error } = await supabase
        .from('intercorrencia')
        .select(`
          *,
          agendamentos (
            servico:id_servico ( nome_servico ),
            cliente:id_cliente ( nome_usuario )
          )
        `)
        .eq('id_intercorrencia', id)
        .single();

      if (error) throw error;
      setData(data);
      // Se já houver uma defesa, preenche o campo (opcional)
      if(data.descricao_profissional) setComentarioDefesa(data.descricao_profissional);
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível carregar os detalhes.");
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
      setImagemDefesa(result.assets[0].uri);
    }
  };

  const enviarDefesa = async () => {
    if (!comentarioDefesa) {
      return Alert.alert("Atenção", "Escreva um comentário antes de enviar.");
    }

    try {
      setEnviando(true);
      
      // IMPORTANTE: Começa como null para não duplicar a imagem do cliente
      let urlDefesaFinal = data.imagem_url_defesa || null; 

      if (imagemDefesa) {
        // CONVERSÃO PARA BLOB (Resolve o erro de upload e problemas com .jfif/.jpg)
        const response = await fetch(imagemDefesa);
        const blob = await response.blob();
        
        const fileName = `defesa_${id}_${Date.now()}.jpg`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('intercorrencias')
          .upload(fileName, blob, {
            contentType: 'image/jpeg',
            upsert: true
          });

        if (uploadError) throw uploadError;

        const { data: publicUrl } = supabase.storage
          .from('intercorrencias')
          .getPublicUrl(fileName);
          
        urlDefesaFinal = publicUrl.publicUrl;
      }

      // ATUALIZAÇÃO NO BANCO
      const { error } = await supabase
        .from('intercorrencia')
        .update({ 
          descricao_profissional: comentarioDefesa,
          imagem_url_defesa: urlDefesaFinal 
        })
        .eq('id_intercorrencia', id);

      if (error) throw error;

      Alert.alert("Sucesso", "Sua defesa foi enviada com sucesso!");
      router.back();
    } catch (error) {
      console.error("Erro no envio:", error);
      Alert.alert("Erro", "Falha ao enviar defesa. Verifique as colunas do banco.");
    } finally {
      setEnviando(false);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#C5005E" /></View>;

  const resolvida = data.status === 'resolvido';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={30} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes da Disputa</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.cardInfo}>
          <Text style={styles.label}>Serviço: <Text style={styles.value}>{data.agendamentos.servico.nome_servico}</Text></Text>
          <Text style={styles.label}>Cliente: <Text style={styles.value}>{data.agendamentos.cliente.nome_usuario}</Text></Text>
          <Text style={styles.label}>Status: 
            <Text style={[styles.value, { color: resolvida ? 'green' : '#e67e22' }]}> {data.status.toUpperCase()}</Text>
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Motivo do Cliente:</Text>
          <Text style={styles.motivoTxt}>{data.motivo_categoria}</Text>
          <Text style={styles.descricaoTxt}>{data.descricao_cliente || "Sem descrição detalhada."}</Text>
        </View>

        {/* PROVA DO CLIENTE */}
        {data.imagem_url && (
          <View style={styles.imageContainer}>
            <Text style={styles.sectionTitle}>Foto do Cliente:</Text>
            <Image 
              source={{ uri: data.imagem_url }} 
              style={styles.img} 
              resizeMode="contain" 
            />
          </View>
        )}

        {resolvida && (
          <View style={styles.vereditoCard}>
            <Text style={styles.vereditoTitle}>Decisão do Administrador:</Text>
            <Text style={styles.vereditoTxt}>{data.veredito}</Text>
          </View>
        )}

        {!resolvida && (
          <View style={styles.defesaArea}>
            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>Sua Resposta (Defesa):</Text>
            <TextInput
              style={styles.input}
              placeholder="Conte sua versão dos fatos..."
              multiline
              numberOfLines={4}
              value={comentarioDefesa}
              onChangeText={setComentarioDefesa}
            />
            
            <TouchableOpacity style={styles.btnFoto} onPress={selecionarImagem}>
              <Ionicons name="camera" size={20} color="#fff" />
              <Text style={styles.btnFotoText}>
                {imagemDefesa || data.imagem_url_defesa ? "Trocar Imagem" : "Anexar Prova"}
              </Text>
            </TouchableOpacity>

            {(imagemDefesa || data.imagem_url_defesa) && (
              <Image source={{ uri: imagemDefesa || data.imagem_url_defesa }} style={styles.miniImg} />
            )}

            <TouchableOpacity 
              style={[styles.btnEnviar, enviando && { opacity: 0.5 }]} 
              onPress={enviarDefesa}
              disabled={enviando}
            >
              {enviando ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnEnviarText}>Enviar Defesa</Text>}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: '#FFF', elevation: 2, paddingTop: 50 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 15 },
  content: { padding: 20 },
  cardInfo: { backgroundColor: '#FFF', padding: 15, borderRadius: 10, marginBottom: 20, borderLeftWidth: 5, borderLeftColor: '#C5005E' },
  label: { fontSize: 14, color: '#666', marginBottom: 5 },
  value: { fontWeight: 'bold', color: '#333', fontSize: 15 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#C5005E' },
  motivoTxt: { fontSize: 18, fontWeight: 'bold', color: 'red', marginBottom: 5 },
  descricaoTxt: { fontSize: 15, color: '#444', lineHeight: 20 },
  imageContainer: { width: '100%', marginBottom: 20 },
  img: { width: '100%', height: 250, backgroundColor: '#EEE', borderRadius: 10, marginTop: 5 },
  vereditoCard: { backgroundColor: '#E8F5E9', padding: 15, borderRadius: 10, borderLeftWidth: 5, borderLeftColor: 'green', marginTop: 20 },
  vereditoTitle: { fontWeight: 'bold', color: '#1B5E20' },
  vereditoTxt: { fontSize: 15, color: '#333', marginTop: 5 },
  defesaArea: { marginTop: 10 },
  divider: { height: 1, backgroundColor: '#DDD', marginVertical: 20 },
  input: { backgroundColor: '#FFF', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#DDD', textAlignVertical: 'top', fontSize: 15, minHeight: 100 },
  btnFoto: { backgroundColor: '#666', flexDirection: 'row', padding: 12, borderRadius: 8, marginTop: 15, justifyContent: 'center', alignItems: 'center' },
  btnFotoText: { color: '#fff', marginLeft: 10, fontWeight: 'bold' },
  miniImg: { width: '100%', height: 200, borderRadius: 10, marginTop: 10, resizeMode: 'contain', backgroundColor: '#eee' },
  btnEnviar: { backgroundColor: '#C5005E', padding: 18, borderRadius: 10, marginTop: 20, alignItems: 'center', marginBottom: 40 },
  btnEnviarText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});