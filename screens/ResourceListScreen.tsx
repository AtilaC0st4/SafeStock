import { View, Text, FlatList, StyleSheet, Button } from 'react-native'
import { FC } from 'react'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '../types'

type ResourceListScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Recursos'>

type Props = {
  navigation: ResourceListScreenNavigationProp
}

const recursos = [
  { id: '1', nome: 'Água', consumo: 200 },
  { id: '2', nome: 'Energia', consumo: 300 },
  { id: '3', nome: 'Papel', consumo: 150 },
]

const ResourceListScreen: FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lista de Recursos</Text>
      <FlatList
        data={recursos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>{item.nome}</Text>
            <Text>{item.consumo}</Text>
          </View>
        )}
      />
      <Button title="Adicionar Recurso" onPress={() => navigation.navigate('Novo Recurso')} />
    </View>
  )
}

export default ResourceListScreen

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#c8e6c9',
    borderRadius: 6,
  },
})
