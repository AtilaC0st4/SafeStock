
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

export type RootStackParamList = {
  Dashboard: undefined
  Recursos: undefined
  'Novo Recurso': undefined  // <-- adiciona aqui
  Relatórios: undefined
}


export type DashboardScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Dashboard'
>
