import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Picker } from '@react-native-picker/picker';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CadastroProduto'>;
};

type Categoria = {
  id: number;
  nome: string;
};

const API_URL = 'http://192.168.25.10:5194/api'; // Atualize com seu endpoint

const CadastroProdutoScreen: React.FC<Props> = ({ navigation }) => {
  const [nomeProduto, setNomeProduto] = useState('');
  const [categoriaId, setCategoriaId] = useState<number | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
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

  const handleCadastrar = async () => {
    if (!nomeProduto.trim() || !categoriaId) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/produtos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: nomeProduto,
          categoriaId: categoriaId,
          quantidadeInicial: 0 // Sempre zero como solicitado
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao cadastrar');
      }

      Alert.alert('Sucesso', 'Produto cadastrado com sucesso!');
      navigation.goBack();
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
          selectedValue={categoriaId}
          onValueChange={(itemValue) => setCategoriaId(itemValue)}
        >
          <Picker.Item label="Selecione uma categoria" value={null} />
          {categorias.map((cat) => (
            <Picker.Item key={cat.id} label={cat.nome} value={cat.id} />
          ))}
        </Picker>
      </View>

      <Button 
        title={submitting ? "Cadastrando..." : "Cadastrar Produto"} 
        onPress={handleCadastrar} 
        disabled={submitting}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    padding: 20,
    flex: 1,
    backgroundColor: '#fff'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  label: { 
    fontWeight: 'bold', 
    marginVertical: 8,
    fontSize: 16
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#ccc', 
    padding: 12,
    marginBottom: 15,
    borderRadius: 5,
    fontSize: 16
  },
  pickerContainer: { 
    borderWidth: 1, 
    borderColor: '#ccc', 
    marginBottom: 20,
    borderRadius: 5,
    overflow: 'hidden'
  }
});

export default CadastroProdutoScreen;