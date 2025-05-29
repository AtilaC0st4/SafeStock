import { View, Text, TextInput, StyleSheet, Button, Alert } from 'react-native'
import { useState, FC } from 'react'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '../types'

type ResourceFormScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Novo Recurso'>

type Props = {
  navigation: ResourceFormScreenNavigationProp
}

const ResourceFormScreen: FC<Props> = ({ navigation }) => {
  const [nome, setNome] = useState('')
  const [consumo, setConsumo] = useState('')

  function handleSalvar() {
    if (!nome || !consumo) {
      Alert.alert('Erro', 'Preencha todos os campos')
      return
    }
    // aqui você faria a chamada à API para salvar via fetch

    Alert.alert('Sucesso', `Recurso ${nome} salvo com consumo ${consumo}`)
    navigation.goBack()
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Novo Recurso</Text>

      <Text>Nome</Text>
      <TextInput
        style={styles.input}
        value={nome}
        onChangeText={setNome}
        placeholder="Nome do recurso"
      />

      <Text>Consumo</Text>
      <TextInput
        style={styles.input}
        value={consumo}
        onChangeText={setConsumo}
        keyboardType="numeric"
        placeholder="Quantidade consumida"
      />

      <Button title="Salvar" onPress={handleSalvar} />
    </View>
  )
}

export default ResourceFormScreen

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    padding: 8,
    marginBottom: 20,
    borderRadius: 6,
  },
})
