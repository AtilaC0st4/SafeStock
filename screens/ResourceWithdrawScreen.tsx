import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Slider from '@react-native-community/slider';

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

export default function ResourceWithdrawScreen() {
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>('');
  const [itemSelecionado, setItemSelecionado] = useState<string>('');
  const [quantidadeRetirada, setQuantidadeRetirada] = useState<string>('');

  const itensDaCategoria = categoriaSelecionada
    ? categorias.find(cat => cat.titulo === categoriaSelecionada)?.itens ?? []
    : [];

  const itemSelecionadoObj = itensDaCategoria.find(it => it.nome === itemSelecionado);

  useEffect(() => {
    setItemSelecionado('');
    setQuantidadeRetirada('');
  }, [categoriaSelecionada]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'baixo':
        return { backgroundColor: '#e74c3c' }; // vermelho
      case 'médio':
        return { backgroundColor: '#f1c40f' }; // amarelo
      case 'ideal':
        return { backgroundColor: '#2ecc71' }; // verde
      default:
        return { backgroundColor: '#ccc' };
    }
  };

  const handleRetirada = () => {
    if (!categoriaSelecionada || !itemSelecionado || !quantidadeRetirada) {
      Alert.alert('Erro', 'Selecione uma categoria, um recurso e a quantidade.');
      return;
    }

    const qtd = parseInt(quantidadeRetirada);
    if (isNaN(qtd) || qtd <= 0) {
      Alert.alert('Erro', 'Informe uma quantidade válida.');
      return;
    }

    if (itemSelecionadoObj && qtd > itemSelecionadoObj.quantidade) {
      Alert.alert('Erro', 'Quantidade superior à disponível.');
      return;
    }

    Alert.alert(
      'Confirmar Retirada',
      `Deseja realmente retirar ${qtd} de "${itemSelecionado}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: () => {
            const novaQuantidade = (itemSelecionadoObj?.quantidade ?? 0) - qtd;

            console.log('Atualizar recurso:', {
              nome: itemSelecionado,
              categoria: categoriaSelecionada,
              novaQuantidade,
            });

            // Aqui futuramente virá o PUT/PATCH para a API

            Alert.alert('Sucesso', 'Recurso atualizado com sucesso!');
            setCategoriaSelecionada('');
            setItemSelecionado('');
            setQuantidadeRetirada('');
          },
        },
      ]
    );
  };

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

      {itemSelecionadoObj && (
        <View>
          <Text style={styles.label}>Quantidade Atual: {itemSelecionadoObj.quantidade}</Text>

          {/* STATUS COLORIDO */}
          <View style={[styles.statusBox, getStatusStyle(itemSelecionadoObj.status)]}>
            <Text style={styles.statusText}>
              Status: {itemSelecionadoObj.status.charAt(0).toUpperCase() + itemSelecionadoObj.status.slice(1)}
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Quantidade a retirar: {quantidadeRetirada || 0}</Text>
            <Slider
              style={{ width: '100%', height: 40 }}
              minimumValue={1}
              maximumValue={itemSelecionadoObj?.quantidade || 1}
              step={1}
              value={Number(quantidadeRetirada) || 1}
              onValueChange={(value) => setQuantidadeRetirada(String(value))}
              minimumTrackTintColor="#2196F3"
              maximumTrackTintColor="#ccc"
              thumbTintColor="#2196F3"
            />
          </View>
        </View>
      )}

      <View style={styles.button}>
        <Button title="Retirar Recurso" onPress={handleRetirada} />
      </View>
    </ScrollView>
  );
}

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
  inputContainer: {
    marginTop: 16,
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
  },
  button: {
    marginTop: 20,
  },
  statusBox: {
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 10,
  },
  statusText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
