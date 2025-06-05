import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, Alert, Modal, ActivityIndicator } from 'react-native';
import { CategoriasScreenNavigationProp } from '../types';

const API_URL = 'http://192.168.152.141:5194/api/categorias'; // Update with your API URL

type Categoria = {
  id: number;
  nome: string;
};

const CategoriasScreen: React.FC<{ navigation: CategoriasScreenNavigationProp }> = ({ navigation }) => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [novaCategoria, setNovaCategoria] = useState('');
  const [editando, setEditando] = useState<Categoria | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories from API
  const fetchCategorias = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setCategorias(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Add new category
  const adicionarCategoria = async () => {
    if (!novaCategoria.trim()) {
      Alert.alert('Erro', 'Digite um nome para a categoria');
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nome: novaCategoria })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const novaCat = await response.json();
      setCategorias([...categorias, novaCat]);
      setNovaCategoria('');
    } catch (err) {
      Alert.alert('Erro', 'Falha ao adicionar categoria');
      console.error('Add error:', err);
    }
  };

  // Update category
  const salvarEdicao = async () => {
    if (!editando?.nome.trim()) return;

    try {
      const response = await fetch(`${API_URL}/${editando.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: editando.id, nome: editando.nome })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setCategorias(categorias.map(cat => 
        cat.id === editando.id ? { ...cat, nome: editando.nome } : cat
      ));
      setEditando(null);
    } catch (err) {
      Alert.alert('Erro', 'Falha ao atualizar categoria');
      console.error('Update error:', err);
    }
  };

  // Delete category confirmation
  const confirmarExclusao = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setCategorias(categorias.filter(cat => cat.id !== id));
    } catch (err) {
      Alert.alert('Erro', 'Falha ao excluir categoria');
      console.error('Delete error:', err);
    }
  };

  const removerCategoria = (id: number) => {
    Alert.alert(
      'Confirmar',
      'Tem certeza que deseja excluir esta categoria?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          onPress: () => confirmarExclusao(id)
        }
      ]
    );
  };

  // Load categories on mount
  useEffect(() => {
    fetchCategorias();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text>Carregando categorias...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Erro ao carregar categorias</Text>
        <Text style={styles.errorDetail}>{error}</Text>
        <Button title="Tentar novamente" onPress={fetchCategorias} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nova categoria"
          value={novaCategoria}
          onChangeText={setNovaCategoria}
        />
        <Button title="Adicionar" onPress={adicionarCategoria} />
      </View>

      <FlatList
        data={categorias}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemText}>{item.nome}</Text>
            <View style={styles.buttonsContainer}>
              <Button 
                title="Editar" 
                onPress={() => setEditando(item)} 
                color="#007AFF"
              />
              <Button 
                title="Excluir" 
                onPress={() => removerCategoria(item.id)} 
                color="#FF3B30"
              />
            </View>
          </View>
        )}
      />

      {/* Edit Modal */}
      <Modal visible={!!editando} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Editar Categoria</Text>
            <TextInput
              style={styles.modalInput}
              value={editando?.nome || ''}
              onChangeText={text => editando && setEditando({...editando, nome: text})}
              placeholder="Nome da categoria"
            />
            <View style={styles.modalButtons}>
              <Button title="Cancelar" onPress={() => setEditando(null)} />
              <Button title="Salvar" onPress={salvarEdicao} color="#007AFF" />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  errorText: {
    fontSize: 18,
    color: '#FF3B30',
    marginBottom: 10
  },
  errorDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center'
  },
  formContainer: {
    marginBottom: 20
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fff'
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    backgroundColor: '#fff',
    borderRadius: 4,
    elevation: 2
  },
  itemText: {
    fontSize: 16,
    flex: 1
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 8
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalContainer: {
    margin: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 8
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 12,
    marginBottom: 16
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8
  }
});

export default CategoriasScreen;