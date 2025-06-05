import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, ScrollView, Modal, TouchableOpacity, Animated } from 'react-native';
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

    // Estados para a caixa de mensagem customizada (Modal)
    const [showModal, setShowModal] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalMessage, setModalMessage] = useState('');

    // Animação para o botão de cadastro
    const buttonAnimation = new Animated.Value(1);

    // Função para exibir a caixa de mensagem customizada
    const showMessage = (title: string, message: string) => {
        setModalTitle(title);
        setModalMessage(message);
        setShowModal(true);
    };

    // Função para animar o botão ao ser pressionado
    const animateButton = () => {
        Animated.sequence([
            Animated.timing(buttonAnimation, {
                toValue: 0.95, // Encolhe um pouco
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(buttonAnimation, {
                toValue: 1, // Volta ao tamanho normal
                duration: 150,
                useNativeDriver: true,
            }),
        ]).start();
    };

    // Buscar categorias da API
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
                // Se houver categorias, pré-seleciona a primeira para melhorar a UX
                if (data.length > 0) {
                    setCategoriaId(data[0].id);
                }
            } catch (err) {
                showMessage('Erro ao Carregar Categorias', err instanceof Error ? err.message : 'Não foi possível carregar as categorias. Tente novamente.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchCategorias();
    }, []);

    const handleCadastrar = async () => {
        animateButton(); // Ativa a animação do botão

        if (!nomeProduto.trim()) {
            showMessage('Erro de Validação', 'Por favor, preencha o nome do produto.');
            return;
        }
        if (categoriaId === null) {
            showMessage('Erro de Validação', 'Por favor, selecione uma categoria.');
            return;
        }

        setSubmitting(true); // Ativa o estado de envio

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
                // Tenta pegar a mensagem de erro da API ou uma genérica
                throw new Error(errorData.message || `Erro ao cadastrar produto. Status: ${response.status}`);
            }

            showMessage('Sucesso!', 'Produto cadastrado com sucesso!');
            // Limpa os campos após o cadastro
            setNomeProduto('');
            // Opcional: navegar de volta ou para a tela principal
            // navigation.goBack(); 
        } catch (err) {
            showMessage('Erro ao Cadastrar', err instanceof Error ? err.message : 'Erro desconhecido ao cadastrar o produto.');
            console.error('Erro no cadastro do produto:', err);
        } finally {
            setSubmitting(false); // Desativa o estado de envio
        }
    };

    // Estado de Carregamento
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007bff" />
                <Text style={styles.loadingText}>Carregando categorias...</Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Cadastrar Novo Produto</Text>

            <Text style={styles.label}>Nome do Produto:</Text>
            <TextInput
                style={styles.input}
                placeholder="Ex: Água Potável 5L"
                placeholderTextColor="#999"
                value={nomeProduto}
                onChangeText={setNomeProduto}
                editable={!submitting} // Desabilita o input durante o envio
            />

            <Text style={styles.label}>Categoria:</Text>
            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={categoriaId}
                    onValueChange={(itemValue) => setCategoriaId(itemValue)}
                    enabled={!submitting} // Desabilita o picker durante o envio
                    itemStyle={styles.pickerItem} // Estilo para os itens do picker (Android)
                >
                    <Picker.Item label="Selecione uma categoria" value={null} style={styles.pickerPlaceholder} />
                    {categorias.map((cat) => (
                        <Picker.Item key={cat.id} label={cat.nome} value={cat.id} />
                    ))}
                </Picker>
            </View>

            <Animated.View style={[styles.buttonWrapper, { transform: [{ scale: buttonAnimation }] }]}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleCadastrar}
                    disabled={submitting} // Desabilita o botão durante o envio
                    activeOpacity={0.7} // Feedback visual ao toque
                >
                    {submitting ? (
                        <ActivityIndicator color="#ffffff" />
                    ) : (
                        <Text style={styles.buttonText}>Cadastrar Produto</Text>
                    )}
                </TouchableOpacity>
            </Animated.View>

            {/* Modal de Mensagem Customizada */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={showModal}
                onRequestClose={() => setShowModal(false)}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalTitle}>{modalTitle}</Text>
                        <Text style={styles.modalText}>{modalMessage}</Text>
                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={() => setShowModal(false)}
                        >
                            <Text style={styles.modalButtonText}>Ok</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        flexGrow: 1, // Para permitir rolagem se o conteúdo for grande
        backgroundColor: '#f0f2f5', // Fundo suave e claro
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f2f5',
    },
    loadingText: {
        marginTop: 20,
        fontSize: 18,
        color: '#333',
        fontWeight: 'bold',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#212529',
        marginBottom: 30,
        textAlign: 'center',
    },
    label: {
        fontWeight: 'bold',
        marginVertical: 10,
        fontSize: 16,
        color: '#495057',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ced4da', // Cor de borda mais suave
        backgroundColor: '#ffffff',
        padding: 14,
        marginBottom: 20,
        borderRadius: 8, // Bordas mais arredondadas
        fontSize: 16,
        color: '#343a40',
        shadowColor: '#000', // Sombra sutil para profundidade
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ced4da',
        backgroundColor: '#ffffff',
        marginBottom: 20,
        borderRadius: 8,
        overflow: 'hidden', // Garante que o Picker respeite o borderRadius
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    pickerItem: {
        fontSize: 16,
        color: '#343a40',
    },
    pickerPlaceholder: {
        color: '#999',
    },
    buttonWrapper: {
        marginTop: 30,
        borderRadius: 8,
        overflow: 'hidden',
    },
    actionButton: {
        backgroundColor: '#007bff', // Azul vibrante
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 8,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    // Estilos para o Modal Customizado (reutilizados da tela de retirada)
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '80%',
        maxWidth: 400,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
    },
    modalText: {
        marginBottom: 20,
        textAlign: 'center',
        fontSize: 16,
        color: '#555',
    },
    modalButton: {
        backgroundColor: '#007bff',
        borderRadius: 10,
        padding: 12,
        elevation: 2,
        minWidth: 100,
        alignItems: 'center',
    },
    modalButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default CadastroProdutoScreen;