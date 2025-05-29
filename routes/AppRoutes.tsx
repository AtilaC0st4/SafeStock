import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import DashboardScreen from '../screens/DashboardScreen'
import ResourceListScreen from '../screens/ResourceListScreen'
import ResourceFormScreen from '../screens/ResourceFormScreen'
import ReportScreen from '../screens/ReportScreen'

const Stack = createNativeStackNavigator()

export default function AppRoutes() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Dashboard">
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Recursos" component={ResourceListScreen} />
        <Stack.Screen name="Novo Recurso" component={ResourceFormScreen} />
        <Stack.Screen name="Relatórios" component={ReportScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
