import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Dashboard: undefined;
  Recursos: undefined;
  'Novo Recurso': undefined;
  Relatórios: undefined;
  'Retirada de Recursos': undefined; 
};

export type DashboardScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Dashboard'
>;
