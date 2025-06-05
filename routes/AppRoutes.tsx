import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackNavigationOptions } from '@react-navigation/native-stack';
import DashboardScreen from '../screens/DashboardScreen';
import ResourceFormScreen from '../screens/ResourceFormScreen';
import ResourceWithdrawScreen from '../screens/ResourceWithdrawScreen';
import CategoriasScreen from '../screens/CategoriasScreen';
import CadastroProdutoScreen from '../screens/CadastroProdutoScreen';
import { RootStackParamList } from '../types'; 

// Use a tipagem criada
const Stack = createNativeStackNavigator<RootStackParamList>();

// Opções comuns de navegação
const screenOptions: NativeStackNavigationOptions = {
  headerStyle: {
    backgroundColor: '#34495e', // Um tom de azul mais escuro, comum em apps modernos
  },
  headerTintColor: '#ffffff', // Cor do texto do título e ícones de volta
  headerTitleStyle: {
    fontWeight: '600', // Um pouco menos bold que 'bold', para suavizar
    fontSize: 18,      // Tamanho da fonte ligeiramente maior para o título
  },
  contentStyle: {
    backgroundColor: '#f8f9fa', // Fundo mais claro para o conteúdo da tela, contrastando com o cabeçalho
  },
  headerShadowVisible: false, // Remove a sombra padrão do cabeçalho para um visual mais limpo
  // REMOVIDO: headerBackTitleVisible: false, // Esta propriedade não existe em NativeStackNavigationOptions
  // A NativeStack geralmente lida com isso de forma nativa ou você pode usar headerBackTitle: '' se precisar
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
          options={{ title: 'Visão Geral do Estoque' }} // Título mais descritivo
        />
        <Stack.Screen
          name="Novo Recurso"
          component={ResourceFormScreen}
          options={{ title: 'Adicionar Item ao Estoque' }} // Mais claro sobre a ação
        />
        <Stack.Screen
          name="Retirada de Recursos"
          component={ResourceWithdrawScreen}
          options={{ title: 'Registrar Retirada' }} // Título mais conciso e acionável
        />
        <Stack.Screen
          name="Categorias"
          component={CategoriasScreen}
          options={{ title: 'Gerenciamento de Categorias' }} // Título mais formal e claro
        />
        <Stack.Screen
          name="CadastroProduto"
          component={CadastroProdutoScreen}
          options={{ title: 'Cadastrar Novo Item' }} // Título mais amigável e direto
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}