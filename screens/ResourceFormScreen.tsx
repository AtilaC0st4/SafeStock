import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const API_URL = 'http://192.168.25.10:5194/api';

type Categoria = {
  id: number;
  nome: string;
};

type Produto = {
  id: number;
  nome: string;
  quantidade: number;
  categoriaId: number;
};

export default function AdicionarEstoqueScreen() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<number | null>(null);
  const [produtoSelecionado, setProdutoSelecionado] = useState<number | null>(null);
  const [quantidade, setQuantidade] = useState('');
  const [loadingCategorias, setLoadingCategorias] = useState(true);
  const [loadingProdutos, setLoadingProdutos] = useState(false);
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
        setLoadingCategorias(false);
      }
    };

    fetchCategorias();
  }, []);

  // Buscar produtos da categoria selecionada
  useEffect(() => {
    const fetchProdutosDaCategoria = async () => {
      if (!categoriaSelecionada) {
        setProdutos([]);
        return;
      }

      setLoadingProdutos(true);
      try {
        const response = await fetch(`${API_URL}/produtos/por-categoria/${categoriaSelecionada}`);
        
        if (!response.ok) {
          throw new Error(`Erro ${response.status}`);
        }

        const data = await response.json();
        setProdutos(data);
        setProdutoSelecionado(null);
      } catch (err) {
        Alert.alert('Erro', 'Não foi possível carregar os produtos desta categoria');
        console.error(err);
      } finally {
        setLoadingProdutos(false);
      }
    };

    fetchProdutosDaCategoria();
  }, [categoriaSelecionada]);

  const handleAdicionarEstoque = async () => {
    if (!produtoSelecionado || !quantidade) {
      Alert.alert('Erro', 'Selecione um produto e informe a quantidade a adicionar');
      return;
    }

    const quantidadeNum = parseInt(quantidade);
    if (isNaN(quantidadeNum)) {
      Alert.alert('Erro', 'Quantidade deve ser um número válido');
      return;
    }

    if (quantidadeNum <= 0) {
      Alert.alert('Erro', 'Quantidade deve ser maior que zero');
      return;
    }

    setSubmitting(true);

    try {
      // Chamar o endpoint de ADICIONAR estoque
      const response = await fetch(`${API_URL}/produtos/${produtoSelecionado}/adicionar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quantidadeNum)
      });

      if (!response.ok) {
        throw new Error('Erro ao adicionar ao estoque');
      }

      // Atualiza a lista de produtos localmente
      const updatedProdutos = produtos.map(p => 
        p.id === produtoSelecionado ? {...p, quantidade: p.quantidade + quantidadeNum} : p
      );
      setProdutos(updatedProdutos);

      Alert.alert('Sucesso', `${quantidadeNum} itens adicionados ao estoque com sucesso!`);
      setQuantidade('');
      
    } catch (err) {
      Alert.alert('Erro', err instanceof Error ? err.message : 'Erro desconhecido');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingCategorias) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text>Carregando categorias...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Selecione a Categoria</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={categoriaSelecionada}
          onValueChange={(itemValue) => {
            setCategoriaSelecionada(itemValue);
            setProdutoSelecionado(null);
          }}
        >
          <Picker.Item label="Selecione uma categoria" value={null} />
          {categorias.map(cat => (
            <Picker.Item key={cat.id} label={cat.nome} value={cat.id} />
          ))}
        </Picker>
      </View>

      {categoriaSelecionada && (
        <>
          <Text style={styles.label}>Selecione o Produto</Text>
          <View style={styles.pickerContainer}>
            {loadingProdutos ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" />
                <Text>Carregando produtos...</Text>
              </View>
            ) : produtos.length === 0 ? (
              <Text style={styles.noProductsText}>Nenhum produto disponível nesta categoria</Text>
            ) : (
              <Picker
                selectedValue={produtoSelecionado}
                onValueChange={(itemValue) => setProdutoSelecionado(itemValue)}
              >
                <Picker.Item label="Selecione um produto" value={null} />
                {produtos.map(prod => (
                  <Picker.Item 
                    key={prod.id} 
                    label={`${prod.nome} (Estoque atual: ${prod.quantidade})`} 
                    value={prod.id} 
                  />
                ))}
              </Picker>
            )}
          </View>

          {produtoSelecionado && (
            <>
              <Text style={styles.label}>Quantidade a Adicionar</Text>
              <TextInput
                style={styles.input}
                placeholder="Digite a quantidade a adicionar"
                keyboardType="numeric"
                value={quantidade}
                onChangeText={setQuantidade}
              />
            </>
          )}
        </>
      )}

      {produtoSelecionado && (
        <View style={styles.buttonContainer}>
          <Button 
            title={submitting ? "Adicionando..." : "Adicionar ao Estoque"} 
            onPress={handleAdicionarEstoque} 
            disabled={submitting || !quantidade}
            color="#4CAF50" // Verde para indicar ação positiva
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
  },
  loadingContainer: {
    padding: 10,
    alignItems: 'center',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 8,
    fontSize: 16,
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
  buttonContainer: {
    marginTop: 20,
  },
  noProductsText: {
    textAlign: 'center',
    padding: 10,
    color: '#666',
  },
});