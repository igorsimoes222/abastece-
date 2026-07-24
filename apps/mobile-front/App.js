import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider, useAuth } from './app/context/AuthContext';

import SplashScreen from './app/screens/SplashScreen';
import OnboardingScreen from './app/screens/OnboardingScreen';
import LoginScreen from './app/screens/LoginScreen';
import MapaScreen from './app/screens/MapaScreen';
import AutorizacaoScreen from './app/screens/AutorizacaoScreen';
import AbastecendoScreen from './app/screens/AbastecendoScreen';
import ComprovanteScreen from './app/screens/ComprovanteScreen';
import HistoricoScreen from './app/screens/HistoricoScreen';
import CarteiraScreen from './app/screens/CarteiraScreen';
import PerfilScreen from './app/screens/PerfilScreen';
import FrotaScreen from './app/screens/FrotaScreen';
import PagamentoScreen from './app/screens/PagamentoScreen';
import ConfirmacaoValorScreen from './app/screens/ConfirmacaoValorScreen';
import PreAutorizacaoScreen from './app/screens/PreAutorizacaoScreen';
import PagoDiretoPostoScreen from './app/screens/PagoDiretoPostoScreen';
import DadosPessoaisScreen from './app/screens/DadosPessoaisScreen';
import SegurancaScreen from './app/screens/SegurancaScreen';
import NotificacoesScreen from './app/screens/NotificacoesScreen';

const Stack = createNativeStackNavigator();

function SessaoGuard({ navRef }) {
  const { sessaoExpirada } = useAuth();

  useEffect(() => {
    if (sessaoExpirada && navRef.current) {
      navRef.current.reset({ index: 0, routes: [{ name: 'Login' }] });
    }
  }, [sessaoExpirada]);

  return null;
}

export default function App() {
  const navRef = useRef(null);
  useEffect(() => {
    // Limpa token mock antigo que não é um JWT real
    AsyncStorage.getItem('@abasteceplus:token').then(token => {
      if (token && !token.startsWith('eyJ')) {
        AsyncStorage.multiRemove(['@abasteceplus:token', '@abasteceplus:user']);
      }
    });
  }, []);

  return (
    <SafeAreaProvider>
    <AuthProvider>
    <NavigationContainer ref={navRef}>
      <StatusBar style="light" backgroundColor="#0D1B2E" />
      <SessaoGuard navRef={navRef} />
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0D1B2E' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Mapa" component={MapaScreen} />
        <Stack.Screen name="Autorizacao" component={AutorizacaoScreen} />
        <Stack.Screen name="Abastecendo" component={AbastecendoScreen} />
        <Stack.Screen name="Comprovante" component={ComprovanteScreen} />
        <Stack.Screen name="Carteira" component={CarteiraScreen} />
        <Stack.Screen name="Historico" component={HistoricoScreen} />
        <Stack.Screen name="Perfil" component={PerfilScreen} />
        <Stack.Screen name="Frota" component={FrotaScreen} />
        <Stack.Screen name="Pagamento" component={PagamentoScreen} />
        <Stack.Screen name="ConfirmacaoValor" component={ConfirmacaoValorScreen} />
        <Stack.Screen name="PreAutorizacao" component={PreAutorizacaoScreen} />
        <Stack.Screen name="PagoDiretoPosto" component={PagoDiretoPostoScreen} />
        <Stack.Screen name="DadosPessoais" component={DadosPessoaisScreen} />
        <Stack.Screen name="Seguranca" component={SegurancaScreen} />
        <Stack.Screen name="Notificacoes" component={NotificacoesScreen} />

      </Stack.Navigator>
    </NavigationContainer>
    </AuthProvider>
    </SafeAreaProvider>
  );
}
