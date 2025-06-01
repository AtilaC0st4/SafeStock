import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackNavigationOptions } from '@react-navigation/native-stack';
import DashboardScreen from '../screens/DashboardScreen';
import ResourceFormScreen from '../screens/ResourceFormScreen';
import ResourceWithdrawScreen from '../screens/ResourceWithdrawScreen';
import CategoriasScreen from '../screens/CategoriasScreen';
import { RootStackParamList } from '../types'; // Importe sua tipagem

// Use a tipagem criada
const Stack = createNativeStackNavigator<RootStackParamList>();

// Opções comuns de navegação
const screenOptions: NativeStackNavigationOptions = {
  headerStyle: {
    backgroundColor: '#2c3e50',
  },
  headerTintColor: '#fff',
  headerTitleStyle: {
    fontWeight: 'bold',
  },
  contentStyle: {
    backgroundColor: '#ecf0f1',
  }
};

export default function AppRoutes() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Dashboard"
        screenOptions={screenOptions}
      >
        <Stack.Screen 
          name="Dashboard" 
          component={DashboardScreen} 
          options={{ title: 'Painel de Recursos' }}
        />
        <Stack.Screen 
          name="Novo Recurso" 
          component={ResourceFormScreen} 
          options={{ title: 'Cadastrar Recurso' }}
        />
        <Stack.Screen 
          name="Retirada de Recursos" 
          component={ResourceWithdrawScreen}
          options={{ title: 'Retirada de Recursos' }} 
        />
        <Stack.Screen 
          name="Categorias" 
          component={CategoriasScreen}
          options={{ title: 'Gerenciar Categorias' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}