
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export default function Notificacoes({ navigation }) { // mantém default
  return (
    <View style={{ flex: 1, backgroundColor: "#e9e4d8", padding: 15 }}>

      {/* Título */}
      <Text style={{
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 20,
        color: "#333"
      }}>
        Notificações
      </Text>

      {/* Notificação 1 */}
      <TouchableOpacity
        onPress={() => navigation.navigate("Detalhes")}
        style={{
          backgroundColor: "#fff",
          padding: 18,
          borderRadius: 12,
          marginBottom: 15,
          elevation: 2
        }}
      >
        <Text style={{ fontWeight: "bold", fontSize: 16, marginBottom: 5 }}>
          Erro ao sincronizar
        </Text>
        <Text style={{ color: "#555" }}>
          O servidor encontrou uma falha ao atualizar os dados.
        </Text>
      </TouchableOpacity>

      {/* Notificação 2 */}
      <TouchableOpacity
        onPress={() => navigation.navigate("Detalhes")}
        style={{
          backgroundColor: "#fff",
          padding: 18,
          borderRadius: 12,
          marginBottom: 15,
          elevation: 2
        }}
      >
        <Text style={{ fontWeight: "bold", fontSize: 16, marginBottom: 5 }}>
          Atualização concluída
        </Text>
        <Text style={{ color: "#555" }}>
          Seus dados foram atualizados com sucesso.
        </Text>
      </TouchableOpacity>

      {/* Notificação 3 */}
      <TouchableOpacity
        onPress={() => navigation.navigate("Detalhes")}
        style={{
          backgroundColor: "#fff",
          padding: 18,
          borderRadius: 12,
          elevation: 2
        }}
      >
        <Text style={{ fontWeight: "bold", fontSize: 16, marginBottom: 5 }}>
          Nova atividade detectada
        </Text>
        <Text style={{ color: "#555" }}>
          Foi identificado um novo acesso na sua conta.
        </Text>
      </TouchableOpacity>

    </View>
  );
}