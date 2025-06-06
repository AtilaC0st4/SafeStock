import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import FormInput from '../components/FormInput';
import CategoryPicker from '../components/CategoryPicker';
import AnimatedButton from '../components/AnimatedButton';
import CustomModal from '../components/CustomModal';
import LoadingIndicator from '../components/LoadingIndicator';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CadastroProduto'>;
};

type Categoria = {
  id: number;
  nome: string;
};

const API_URL = 'http://192.168.25.10:5194/api';

const CadastroProdutoScreen: React.FC<Props> = ({ navigation }) => {
  const [nomeProduto, setNomeProduto] = useState('');
  const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined); 
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  const showMessage = (title: string, message: string) => {
    setModalTitle(title);
    setModalMessage(message);
    setShowModal(true);
  };

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/categorias`);

        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${await response.text()}`);
        }

        const data = await response.json();
        setCategorias(data);
        if (data.length > 0) setCategoriaId(data[0].id);
      } catch (err) {
        showMessage('Erro ao Carregar Categorias', err instanceof Error ? err.message : 'Erro desconhecido');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategorias();
  }, []);

  const handleCadastrar = async () => {
    if (!nomeProduto.trim()) {
      showMessage('Erro de Validação', 'Por favor, preencha o nome do produto.');
      return;
    }
    if (categoriaId === undefined) { 
      showMessage('Erro de Validação', 'Por favor, selecione uma categoria.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/produtos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: nomeProduto,
          categoriaId: categoriaId,
          quantidadeInicial: 0
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erro ao cadastrar produto. Status: ${response.status}`);
      }

      showMessage('Sucesso!', 'Produto cadastrado com sucesso!');
      setNomeProduto('');
      setCategoriaId(undefined); 
    } catch (err) {
      showMessage('Erro ao Cadastrar', err instanceof Error ? err.message : 'Erro desconhecido');
      console.error('Erro no cadastro do produto:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingIndicator message="Carregando categorias..." />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Cadastrar Novo Produto</Text>

      <FormInput
        label="Nome do Produto:"
        value={nomeProduto}
        onChangeText={setNomeProduto}
        placeholder="Ex: Água Potável 5L"
        editable={!submitting}
      />

      <CategoryPicker
        label="Categoria:"
        selectedValue={categoriaId}
        onValueChange={(value) => setCategoriaId(value)}
        categories={categorias}
        enabled={!submitting}
      />

      <AnimatedButton
        title="Cadastrar Produto"
        onPress={handleCadastrar}
        loading={submitting}
        disabled={submitting}
      />

      <CustomModal
        visible={showModal}
        title={modalTitle}
        message={modalMessage}
        onClose={() => setShowModal(false)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
    backgroundColor: '#f0f2f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 30,
    textAlign: 'center',
  },
});

export default CadastroProdutoScreen;