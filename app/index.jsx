import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

import SplashScreen   from './screens/SplashScreen';
import LoginScreen    from './screens/LoginScreen';
import CadastroScreen from './screens/CadastroScreen';
import MapaScreen     from './screens/MapaScreen';
import AutorizacaoScreen from './screens/AutorizacaoScreen';
import AbastecendoScreen from './screens/AbastecendoScreen';
import ComprovanteScreen from './screens/ComprovanteScreen';
import HistoricoScreen   from './screens/HistoricoScreen';
import FrotaScreen       from './screens/FrotaScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" backgroundColor="#0d1117" />
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0d1117' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Splash"       component={SplashScreen} />
        <Stack.Screen name="Login"        component={LoginScreen} />
        <Stack.Screen name="Cadastro"     component={CadastroScreen} />
        <Stack.Screen name="Mapa"         component={MapaScreen} />
        <Stack.Screen name="Autorizacao"  component={AutorizacaoScreen} />
        <Stack.Screen name="Abastecendo"  component={AbastecendoScreen} />
        <Stack.Screen name="Comprovante"  component={ComprovanteScreen} />
        <Stack.Screen name="Historico"    component={HistoricoScreen} />
        <Stack.Screen name="Frota"        component={FrotaScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
