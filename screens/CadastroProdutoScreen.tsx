import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert,} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Picker } from '@react-native-picker/picker';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CadastroProduto'>;
};

const CadastroProdutoScreen: React.FC<Props> = ({ navigation }) => {
  const [nomeProduto, setNomeProduto] = useState('');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');

  // Mock de categorias - substitua pelas suas categorias reais
  const categorias = [
    'Higiene e Limpeza',
    'Alimentos e Bebidas',
    'Primeiros Socorros',
    'Outros Úteis'
  ];

  const handleCadastrar = () => {
    if (!nomeProduto.trim() || !categoriaSelecionada) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    // Aqui você faria a lógica para salvar no estado/banco de dados
    console.log('Produto cadastrado:', {
      nome: nomeProduto,
      categoria: categoriaSelecionada,
      quantidade: 0, // Inicia com 0
      status: 'baixo' // Status inicial
    });

    Alert.alert('Sucesso', 'Produto cadastrado com sucesso!');
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Nome do Produto:</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Papel Higiênico"
        value={nomeProduto}
        onChangeText={setNomeProduto}
      />

      <Text style={styles.label}>Categoria:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={categoriaSelecionada}
          onValueChange={(itemValue) => setCategoriaSelecionada(itemValue)}
        >
          <Picker.Item label="Selecione uma categoria" value="" />
          {categorias.map((cat, index) => (
            <Picker.Item key={index} label={cat} value={cat} />
          ))}
        </Picker>
      </View>

      <Button 
        title="Cadastrar Produto" 
        onPress={handleCadastrar} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  label: { fontWeight: 'bold', marginVertical: 8 },
  input: { 
    borderWidth: 1, 
    borderColor: '#ccc', 
    padding: 10, 
    marginBottom: 15,
    borderRadius: 5
  },
  pickerContainer: { 
    borderWidth: 1, 
    borderColor: '#ccc', 
    marginBottom: 20,
    borderRadius: 5
  }
});

export default CadastroProdutoScreen;