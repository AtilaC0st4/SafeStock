import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import DashboardScreen from '../screens/DashboardScreen';
import ResourceFormScreen from '../screens/ResourceFormScreen';
import ResourceWithdrawScreen from '../screens/ResourceWithdrawScreen'; // novo import

const Stack = createNativeStackNavigator();

export default function AppRoutes() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Dashboard">
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Novo Recurso" component={ResourceFormScreen} />
        <Stack.Screen name="Retirada de Recursos" component={ResourceWithdrawScreen} /> 
      </Stack.Navigator>
    </NavigationContainer>
  );
}
