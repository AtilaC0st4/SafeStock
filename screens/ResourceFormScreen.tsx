import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker'; 
type Item = {
  nome: string;
  quantidade: number;
  status: 'baixo' | 'médio' | 'ideal';
};

type Categoria = {
  titulo: string;
  itens: Item[];
};

const categorias: Categoria[] = [
  {
    titulo: 'Higiene e Limpeza',
    itens: [
      { nome: 'Papel Higiênico', quantidade: 12, status: 'ideal' },
      { nome: 'Sabonete', quantidade: 3, status: 'médio' },
      { nome: 'Detergente', quantidade: 1, status: 'baixo' },
      { nome: 'Álcool em Gel', quantidade: 2, status: 'médio' },
    ],
  },
  {
    titulo: 'Alimentos e Bebidas',
    itens: [
      { nome: 'Arroz', quantidade: 5, status: 'ideal' },
      { nome: 'Feijão', quantidade: 2, status: 'médio' },
      { nome: 'Óleo de Cozinha', quantidade: 1, status: 'baixo' },
      { nome: 'Café', quantidade: 0, status: 'baixo' },
    ],
  },
  {
    titulo: 'Primeiros Socorros',
    itens: [
      { nome: 'Curativos', quantidade: 10, status: 'ideal' },
      { nome: 'Álcool 70%', quantidade: 1, status: 'baixo' },
      { nome: 'Antisséptico', quantidade: 2, status: 'médio' },
      { nome: 'Analgésico', quantidade: 5, status: 'ideal' },
    ],
  },
  {
    titulo: 'Outros Úteis',
    itens: [
      { nome: 'Pilhas', quantidade: 3, status: 'médio' },
      { nome: 'Lanterna', quantidade: 1, status: 'ideal' },
      { nome: 'Máscaras', quantidade: 0, status: 'baixo' },
      { nome: 'Papel e Caneta', quantidade: 4, status: 'médio' },
    ],
  },
];

export default function ResourceFormScreen() {
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>('');
  const [itemSelecionado, setItemSelecionado] = useState<string>('');
  const [quantidade, setQuantidade] = useState<string>('');

  // Quando categoria muda, resetar item selecionado
  useEffect(() => {
    setItemSelecionado('');
  }, [categoriaSelecionada]);

  // Busca o status do item selecionado
  const getStatusDoItem = (): 'baixo' | 'médio' | 'ideal' | '' => {
    if (!categoriaSelecionada || !itemSelecionado) return '';
    const categoria = categorias.find(cat => cat.titulo === categoriaSelecionada);
    if (!categoria) return '';
    const item = categoria.itens.find(it => it.nome === itemSelecionado);
    return item ? item.status : '';
  };

  const handleSalvar = () => {
    if (!categoriaSelecionada || !itemSelecionado || !quantidade) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }

    const status = getStatusDoItem();
    if (!status) {
      Alert.alert('Erro', 'Status do recurso não encontrado.');
      return;
    }

    console.log({
      nome: itemSelecionado,
      quantidade: Number(quantidade),
      categoria: categoriaSelecionada,
      status,
    });

    Alert.alert('Sucesso', 'Recurso cadastrado com sucesso!');
    setCategoriaSelecionada('');
    setItemSelecionado('');
    setQuantidade('');
  };

  // Itens disponíveis na categoria selecionada
  const itensDaCategoria = categoriaSelecionada
    ? categorias.find(cat => cat.titulo === categoriaSelecionada)?.itens ?? []
    : [];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Categoria</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={categoriaSelecionada}
          onValueChange={(itemValue) => setCategoriaSelecionada(itemValue)}
        >
          <Picker.Item label="Selecione uma categoria" value="" />
          {categorias.map(cat => (
            <Picker.Item key={cat.titulo} label={cat.titulo} value={cat.titulo} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Recurso</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={itemSelecionado}
          onValueChange={(itemValue) => setItemSelecionado(itemValue)}
          enabled={!!categoriaSelecionada}
        >
          <Picker.Item label="Selecione um recurso" value="" />
          {itensDaCategoria.map(it => (
            <Picker.Item key={it.nome} label={it.nome} value={it.nome} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Quantidade</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: 5"
        keyboardType="numeric"
        value={quantidade}
        onChangeText={setQuantidade}
      />

      <Text style={styles.label}>Status: {getStatusDoItem() || '-'}</Text>

      <View style={styles.button}>
        <Button title="Salvar Recurso" onPress={handleSalvar} />
      </View>
    </ScrollView>
  );
}

import { TextInput } from 'react-native';

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  pickerContainer: {
    backgroundColor: '#f3f3f3',
    borderRadius: 8,
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#f3f3f3',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  button: {
    marginTop: 10,
  },
});
