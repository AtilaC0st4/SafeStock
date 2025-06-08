import { createNativeStackNavigator, NativeStackNavigationOptions } from '@react-navigation/native-stack';
import DashboardScreen from '../screens/DashboardScreen';
import ResourceFormScreen from '../screens/ResourceFormScreen';
import ResourceWithdrawScreen from '../screens/ResourceWithdrawScreen';
import CategoriasScreen from '../screens/CategoriasScreen';
import CadastroProdutoScreen from '../screens/CadastroProdutoScreen';
import { RootStackParamList } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, View, Text } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';

const Stack = createNativeStackNavigator<RootStackParamList>();

const screenOptions: NativeStackNavigationOptions = {
  headerStyle: { backgroundColor: '#34495e' },
  headerTintColor: '#fff',
  headerTitleStyle: { fontWeight: '600', fontSize: 18 },
  contentStyle: { backgroundColor: '#f8f9fa' },
  headerShadowVisible: false,
};

export default function AppRoutes() {
  return (
    <Stack.Navigator initialRouteName="Dashboard" screenOptions={screenOptions}>
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Visão Geral do Estoque',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => signOut(auth)}
              style={{ marginRight: 10 }}
            >
              <View style={{ alignItems: 'center' }}>
                <Ionicons name="log-out-outline" size={24} color="#fff" />
                <Text style={{ color: '#fff', fontSize: 10 }}>SAIR</Text>
              </View>
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="Novo Recurso"
        component={ResourceFormScreen}
        options={{ title: 'Adicionar Item ao Estoque' }}
      />
      <Stack.Screen
        name="Retirada de Recursos"
        component={ResourceWithdrawScreen}
        options={{ title: 'Registrar Retirada' }}
      />
      <Stack.Screen
        name="Categorias"
        component={CategoriasScreen}
        options={{ title: 'Gerenciamento de Categorias' }}
      />
      <Stack.Screen
        name="CadastroProduto"
        component={CadastroProdutoScreen}
        options={{ title: 'Cadastrar Novo Item' }}
      />
    </Stack.Navigator>
  );
}
