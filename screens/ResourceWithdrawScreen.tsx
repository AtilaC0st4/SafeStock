import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Slider from '@react-native-community/slider';

const API_URL = 'http://192.168.152.141:5194/api'; // Atualize com seu endpoint

type Produto = {
  id: number;
  nome: string;
  quantidade: number;
  status: string;
  categoriaId: number;
  categoriaNome: string;
};

type Categoria = {
  id: number;
  nome: string;
};

export default function ResourceWithdrawScreen() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<number | null>(null);
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);
  const [quantidadeRetirada, setQuantidadeRetirada] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Buscar categorias da API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Buscar categorias
        const catResponse = await fetch(`${API_URL}/categorias`);
        if (!catResponse.ok) throw new Error('Erro ao carregar categorias');
        const categoriasData = await catResponse.json();
        setCategorias(categoriasData);

        // Buscar produtos
        const prodResponse = await fetch(`${API_URL}/produtos`);
        if (!prodResponse.ok) throw new Error('Erro ao carregar produtos');
        const produtosData = await prodResponse.json();
        setProdutos(produtosData);

      } catch (err) {
        Alert.alert('Erro', err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtrar produtos por categoria selecionada
  const produtosDaCategoria = categoriaSelecionada
    ? produtos.filter(p => p.categoriaId === categoriaSelecionada)
    : [];

  // Atualizar produto selecionado quando mudar a seleção
  useEffect(() => {
    if (produtoSelecionado && !produtosDaCategoria.some(p => p.id === produtoSelecionado.id)) {
      setProdutoSelecionado(null);
      setQuantidadeRetirada(1);
    }
  }, [produtosDaCategoria, produtoSelecionado]);

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'baixo': return { backgroundColor: '#e74c3c' };
      case 'médio': return { backgroundColor: '#f1c40f' };
      case 'ideal': return { backgroundColor: '#2ecc71' };
      default: return { backgroundColor: '#ccc' };
    }
  };

  const handleRetirada = async () => {
    if (!produtoSelecionado) {
      Alert.alert('Erro', 'Selecione um produto');
      return;
    }

    if (quantidadeRetirada <= 0) {
      Alert.alert('Erro', 'Informe uma quantidade válida');
      return;
    }

    if (quantidadeRetirada > produtoSelecionado.quantidade) {
      Alert.alert('Erro', 'Quantidade superior à disponível');
      return;
    }

    setSubmitting(true);

    try {
      // Primeiro registrar a movimentação
      const movResponse = await fetch(`${API_URL}/movimentacoes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          produtoId: produtoSelecionado.id,
          quantidade: quantidadeRetirada,
          tipo: "SAIDA"
        })
      });

      if (!movResponse.ok) {
        throw new Error('Falha ao registrar movimentação');
      }

      // Atualizar lista de produtos
      const updatedProdutos = produtos.map(p => 
        p.id === produtoSelecionado.id 
          ? { ...p, quantidade: p.quantidade - quantidadeRetirada } 
          : p
      );
      setProdutos(updatedProdutos);

      Alert.alert('Sucesso', 'Retirada registrada com sucesso!');
      setProdutoSelecionado(null);
      setQuantidadeRetirada(1);
    } catch (err) {
      Alert.alert('Erro', err instanceof Error ? err.message : 'Erro ao registrar retirada');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text>Carregando dados...</Text>
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

      <Text style={styles.label}>Produto</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={produtoSelecionado?.id || null}
          onValueChange={(itemValue) => {
            const produto = produtosDaCategoria.find(p => p.id === itemValue) || null;
            setProdutoSelecionado(produto);
            setQuantidadeRetirada(1);
          }}
          enabled={!!categoriaSelecionada}
        >
          <Picker.Item label="Selecione um produto" value={null} />
          {produtosDaCategoria.map(prod => (
            <Picker.Item key={prod.id} label={prod.nome} value={prod.id} />
          ))}
        </Picker>
      </View>

      {produtoSelecionado && (
        <View>
          <Text style={styles.label}>Quantidade Atual: {produtoSelecionado.quantidade}</Text>

          <View style={[styles.statusBox, getStatusStyle(produtoSelecionado.status)]}>
            <Text style={styles.statusText}>
              Status: {produtoSelecionado.status.charAt(0).toUpperCase() + produtoSelecionado.status.slice(1)}
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Quantidade a retirar: {quantidadeRetirada}</Text>
            <Slider
              style={{ width: '100%', height: 40 }}
              minimumValue={1}
              maximumValue={produtoSelecionado.quantidade}
              step={1}
              value={quantidadeRetirada}
              onValueChange={setQuantidadeRetirada}
              minimumTrackTintColor="#2196F3"
              maximumTrackTintColor="#ccc"
              thumbTintColor="#2196F3"
            />
          </View>
        </View>
      )}

      <View style={styles.button}>
        <Button 
          title={submitting ? "Registrando..." : "Registrar Retirada"} 
          onPress={handleRetirada} 
          disabled={submitting || !produtoSelecionado}
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
  inputContainer: {
    marginVertical: 16,
  },
  button: {
    marginTop: 24,
  },
  statusBox: {
    padding: 12,
    borderRadius: 8,
    marginVertical: 12,
  },
  statusText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
});