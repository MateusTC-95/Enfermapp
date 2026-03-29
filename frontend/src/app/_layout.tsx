import { Stack } from 'expo-router';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';

// Impede que a tela de abertura (Splash) suma rápido demais
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  
  useEffect(() => {
    // Quando o app carregar, esconde a Splash Screen
    SplashScreen.hideAsync();
  }, []);

  return (
    <Stack 
      screenOptions={{ 
        headerShown: true, // Padrão para as telas internas
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      
      {/*TELA INICIAL (Boas-vindas com os 2 botões) */}
      <Stack.Screen 
        name="index" 
        options={{ headerShown: false }} 
      />

      {/*TELA DE FORMULÁRIO DE LOGIN */}
      <Stack.Screen 
        name="login" 
        options={{ 
          headerShown: false, // Deixamos falso pra usar o design do prototipo
          title: 'Entrar' 
        }} 
      />

      {/*TELA DE FORMULÁRIO DE CADASTRO */}
      <Stack.Screen 
        name="cadastro" 
        options={{ 
          headerShown: false, // Deixamos falso para manter o padrão visual
          title: 'Criar Conta' 
        }} 
      />

      {/* --- DASHBOARDS (Áreas Restritas) --- */}
      
      <Stack.Screen 
        name="cliente/dashboard" 
        options={{ title: 'Área do Paciente' }} 
      />
      
      <Stack.Screen 
        name="profissional/dashboard" 
        options={{ title: 'Área do Profissional' }} 
      />

      <Stack.Screen 
        name="admin/dashboard" 
        options={{ title: 'Painel Admin' }} 
      />

    </Stack>
  );
}