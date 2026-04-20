import { Stack } from 'expo-router';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <>
      <StatusBar style="dark" /> 

      <Stack 
        screenOptions={{ 
          headerShown: false, // Por padrão, deixamos falso e ativamos só nos Dashboards
          headerTitleStyle: { fontWeight: 'bold' },
          headerBackTitle: 'Voltar',
        }}
      >
        {/* --- TELAS DE ACESSO --- */}
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="cadastro" />
        <Stack.Screen name="cadastro_passo2" />
        <Stack.Screen name="cadastro_passo3" />
        <Stack.Screen name="cadastro_passo4" />
        <Stack.Screen name="cadastro_passo5" />
        <Stack.Screen name="cadastro_passo6" />

        {/* --- CLIENTE --- */}
        <Stack.Screen 
          name="cliente/dashboard" 
          options={{ headerShown: true, title: 'Área do Paciente', headerLeft: () => null }} 
        />
        <Stack.Screen name="cliente/perfil" options={{ headerShown: false }} />
        <Stack.Screen 
          name="cliente/editar_dados" 
          options={{ 
            headerShown: true, 
            title: 'Editar Meus Dados',
            headerBackTitle: 'Voltar' 
          }} 
        />
        <Stack.Screen name="cliente/buscar" options={{ headerShown: true, title: 'Buscar Serviços' }} />
        <Stack.Screen name="cliente/agenda" options={{ headerShown: true, title: 'Minha Agenda' }} />
        <Stack.Screen name="cliente/notificacoes" options={{ headerShown: true, title: 'Notificações' }} />

        {/* --- PROFISSIONAL --- */}
        <Stack.Screen 
          name="profissional/dashboard" 
          options={{ headerShown: true, title: 'Área do Profissional', headerLeft: () => null }} 
        />
        <Stack.Screen name="profissional/perfil" options={{ headerShown: false }} />

        {/* --- ADMIN --- */}
        <Stack.Screen 
          name="admin/dashboard" 
          options={{ headerShown: true, title: 'Painel Admin', headerLeft: () => null }} 
        />
        <Stack.Screen 
          name="admin/aprovacoes" 
          options={{ headerShown: false }} // Deixamos false porque você já tem o botão de voltar no código
        />

      </Stack>
    </>
  );
}