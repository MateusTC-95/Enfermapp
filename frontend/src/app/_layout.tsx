import { Stack } from 'expo-router';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar'; // Adicione isso para um visual profissional

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <>
      {/* Define o estilo da barra de status do celular (hora, bateria, etc) */}
      <StatusBar style="dark" /> 

      <Stack 
        screenOptions={{ 
          headerShown: true, 
          headerTitleStyle: { fontWeight: 'bold' },
          headerBackTitle: 'Voltar', // Texto no botão de voltar (iOS)
        }}
      >
        
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="cadastro" options={{ headerShown: false }} />

        {/* DICA: Se você tiver cadastro_passo2, passo3, etc, 
          garanta que eles também tenham headerShown: false aqui 
          ou use um padrão global.
        */}
        <Stack.Screen name="cadastro_passo2" options={{ headerShown: false }} />
        <Stack.Screen name="cadastro_passo3" options={{ headerShown: false }} />
        <Stack.Screen name="cadastro_passo4" options={{ headerShown: false }} />
        <Stack.Screen name="cadastro_passo5" options={{ headerShown: false }} />
        <Stack.Screen name="cadastro_passo6" options={{ headerShown: false }} />

        {/* --- DASHBOARDS --- */}
        {/* Se o nome do arquivo for (ex: app/cliente/dashboard.js), 
           o Expo Router entende o caminho abaixo:
        */}
        <Stack.Screen 
          name="cliente/dashboard" 
          options={{ title: 'Área do Paciente', headerLeft: () => null }} // headerLeft null impede voltar pro Login
        />
        
        <Stack.Screen 
          name="profissional/dashboard" 
          options={{ title: 'Área do Profissional', headerLeft: () => null }} 
        />

        <Stack.Screen 
          name="admin/dashboard" 
          options={{ title: 'Painel Admin', headerLeft: () => null }} 
        />

      </Stack>
    </>
  );
}