import { Stack } from 'expo-router';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';

// impede que a tela de abertura (Splash) suma rápido demais
// Isso evita aquele "flash" branco antes do app carregar os dados.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  
  useEffect(() => {
    // quando o componente carregar, mandamos a Splash sumir
    SplashScreen.hideAsync();
  }, []);

  return (
    // O 'Stack' é o tipo de navegação (uma tela em cima da outra, como pilhas de cartas)
    <Stack screenOptions={{ headerShown: true }}>
      
      {/* definimos a tela de Login (index) como a principal e SEM barra no topo */}
      <Stack.Screen 
        name="index" 
        options={{ 
          headerShown: false 
        }} 
      />

      {/* configuramos os nomes que aparecerão no topo das outras telas */}
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