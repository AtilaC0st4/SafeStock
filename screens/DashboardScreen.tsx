import { View, Text, ScrollView, StyleSheet, Dimensions, Button } from 'react-native'
import { BarChart } from 'react-native-chart-kit'
import { DashboardScreenNavigationProp } from '../types'
import { FC } from 'react'

type Props = {
  navigation: DashboardScreenNavigationProp
}

const DashboardScreen: FC<Props> = ({ navigation }) => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Dashboard de Recursos</Text>

      <BarChart
        data={{
          labels: ['Água', 'Energia', 'Papel'],
          datasets: [{ data: [200, 300, 150] }],
        }}
        width={Dimensions.get('window').width - 40}
        height={220}
        yAxisLabel=""        // necessário, pode deixar vazio se quiser
        yAxisSuffix=" L"
        chartConfig={{
          backgroundColor: '#e0f2f1',
          backgroundGradientFrom: '#b2dfdb',
          backgroundGradientTo: '#4db6ac',
          color: (opacity = 1) => `rgba(0, 77, 64, ${opacity})`,
        }}
        style={styles.chart}
      />

      <Button title="Ver Recursos" onPress={() => navigation.navigate('Recursos')} />
      <Button title="Relatórios" onPress={() => navigation.navigate('Relatórios')} />
    </ScrollView>
  )
}

export default DashboardScreen

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  chart: { borderRadius: 16, marginBottom: 20 },
})
