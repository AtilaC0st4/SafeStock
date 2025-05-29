import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native'
import { BarChart } from 'react-native-chart-kit'
import { FC } from 'react'

const ReportScreen: FC = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Relatórios</Text>

      <BarChart
        data={{
          labels: ['Janeiro', 'Fevereiro', 'Março'],
          datasets: [{ data: [500, 600, 550] }],
        }}
        width={Dimensions.get('window').width - 40}
        height={220}
        yAxisLabel=""
        yAxisSuffix=" L"
        chartConfig={{
          backgroundColor: '#ede7f6',
          backgroundGradientFrom: '#d1c4e9',
          backgroundGradientTo: '#673ab7',
          color: (opacity = 1) => `rgba(103, 58, 183, ${opacity})`,
        }}
        style={styles.chart}
      />
    </ScrollView>
  )
}

export default ReportScreen

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  chart: { borderRadius: 16, marginBottom: 20 },
})
