import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const API_URL = 'http://192.168.152.182:5194/api'; // Atualize com seu endpoint

type Categoria = {
  id: number;
  nome: string;
};

type ProdutoDTO = {
  nome: string;
  quantidade: number;
  categoriaId: number;
};

export default function ResourceFormScreen() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<number | null>(null);
  const [nomeProduto, setNomeProduto] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Buscar categorias da API
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const response = await fetch(`${API_URL}/categorias`);
        
        if (!response.ok) {
          throw new Error(`Erro ${response.status}`);
        }

        const data = await response.json();
        setCategorias(data);
      } catch (err) {
        Alert.alert('Erro', 'Não foi possível carregar as categorias');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategorias();
  }, []);

  const handleSalvar = async () => {
    if (!categoriaSelecionada || !nomeProduto.trim() || !quantidade) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    const quantidadeNum = parseInt(quantidade);
    if (isNaN(quantidadeNum) || quantidadeNum <= 0) {
      Alert.alert('Erro', 'Informe uma quantidade válida');
      return;
    }

    setSubmitting(true);

    try {
      const produtoDTO: ProdutoDTO = {
        nome: nomeProduto,
        quantidade: quantidadeNum,
        categoriaId: categoriaSelecionada
      };

      const response = await fetch(`${API_URL}/produtos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(produtoDTO)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao cadastrar produto');
      }

      Alert.alert('Sucesso', 'Produto cadastrado com sucesso!');
      setNomeProduto('');
      setQuantidade('');
      setCategoriaSelecionada(null);
    } catch (err) {
      Alert.alert('Erro', err instanceof Error ? err.message : 'Erro desconhecido');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text>Carregando categorias...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Categoria</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={categoriaSelecionada}
          onValueChange={(itemValue) => setCategoriaSelecionada(itemValue)}
        >
          <Picker.Item label="Selecione uma categoria" value={null} />
          {categorias.map(cat => (
            <Picker.Item key={cat.id} label={cat.nome} value={cat.id} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Nome do Produto</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Papel Higiênico"
        value={nomeProduto}
        onChangeText={setNomeProduto}
      />

      <Text style={styles.label}>Quantidade Inicial</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: 10"
        keyboardType="numeric"
        value={quantidade}
        onChangeText={setQuantidade}
      />

      <View style={styles.button}>
        <Button 
          title={submitting ? "Salvando..." : "Salvar Produto"} 
          onPress={handleSalvar} 
          disabled={submitting}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 8,
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  button: {
    marginTop: 20,
  },
});