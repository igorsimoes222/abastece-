import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import BombasScreen      from './app/screens/BombasScreen';
import BicosScreen       from './app/screens/BicosScreen';
import SolicitacaoScreen from './app/screens/SolicitacaoScreen';
import AbastecendoScreen from './app/screens/AbastecendoScreen';
import ConclusaoScreen   from './app/screens/ConclusaoScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" backgroundColor="#0D1821" />
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#0D1821' },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="Bombas"      component={BombasScreen} />
          <Stack.Screen name="Bicos"       component={BicosScreen} />
          <Stack.Screen name="Solicitacao" component={SolicitacaoScreen} />
          <Stack.Screen name="Abastecendo" component={AbastecendoScreen} />
          <Stack.Screen name="Conclusao"   component={ConclusaoScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
