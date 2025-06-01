import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Dashboard: undefined;
  'Novo Recurso': undefined;
  'Retirada de Recursos': undefined;
  'Categorias': undefined; 
  'CadastroProduto': undefined;
};


export type DashboardScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Dashboard'
>;

export type NovoRecursoScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Novo Recurso'
>;

export type CategoriasScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Categorias'
>;