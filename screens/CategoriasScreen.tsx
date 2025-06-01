import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, Alert, Modal, TouchableOpacity } from 'react-native';
import { CategoriasScreenNavigationProp } from '../types';

type Categoria = {
  id: string;
  nome: string;
};

const CategoriasScreen: React.FC<{ navigation: CategoriasScreenNavigationProp }> = ({ navigation }) => {
  const [categorias, setCategorias] = useState<Categoria[]>([
    { id: '1', nome: 'Higiene e Limpeza' },
    { id: '2', nome: 'Alimentos e Bebidas' },
  ]);
  
  const [novaCategoria, setNovaCategoria] = useState('');
  const [editando, setEditando] = useState<Categoria | null>(null);

  const adicionarCategoria = () => {
    if (!novaCategoria.trim()) {
      Alert.alert('Erro', 'Digite um nome para a categoria');
      return;
    }
    
    setCategorias([...categorias, { 
      id: Date.now().toString(), 
      nome: novaCategoria 
    }]);
    setNovaCategoria('');
  };

  const salvarEdicao = () => {
    if (!editando?.nome.trim()) return;
    
    setCategorias(categorias.map(cat => 
      cat.id === editando.id ? { ...cat, nome: editando.nome } : cat
    ));
    setEditando(null);
  };

  const removerCategoria = (id: string) => {
    Alert.alert(
      'Confirmar',
      'Tem certeza que deseja excluir esta categoria?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', onPress: () => 
          setCategorias(categorias.filter(cat => cat.id !== id)) 
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Nova categoria"
        value={novaCategoria}
        onChangeText={setNovaCategoria}
      />
      <Button title="Adicionar" onPress={adicionarCategoria} />

      <FlatList
        data={categorias}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>{item.nome}</Text>
            <View style={styles.botoes}>
              <Button title="Editar" onPress={() => setEditando(item)} />
              <Button title="Excluir" onPress={() => removerCategoria(item.id)} color="red" />
            </View>
          </View>
        )}
      />

      {/* Modal de Edição */}
      <Modal visible={!!editando} animationType="slide">
        <View style={styles.modalContainer}>
          <Text>Editar Categoria</Text>
          <TextInput
            value={editando?.nome || ''}
            onChangeText={text => editando && setEditando({...editando, nome: text})}
          />
          <Button title="Salvar" onPress={salvarEdicao} />
          <Button title="Cancelar" onPress={() => setEditando(null)} />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  input: { borderWidth: 1, padding: 10, marginBottom: 10 },
  item: { flexDirection: 'row', justifyContent: 'space-between', padding: 10 },
  botoes: { flexDirection: 'row' },
  modalContainer: { flex: 1, justifyContent: 'center', padding: 20 }
});

export default CategoriasScreen;