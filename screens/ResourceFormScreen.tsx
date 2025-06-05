import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ActivityIndicator, ScrollView, Modal, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const API_URL = 'http://192.168.25.10:5194/api'; // Atualize com seu endpoint

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

    // Estados para a caixa de mensagem customizada (Modal)
    const [showModal, setShowModal] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalMessage, setModalMessage] = useState('');

    // Animação para o botão de adicionar estoque
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
                setLoadingCategorias(true);

                const response = await fetch(`${API_URL}/categorias`);

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Erro ${response.status}: ${errorText || 'Sem detalhes.'}`);
                }

                const data = await response.json();
                setCategorias(data);
                // Pré-seleciona a primeira categoria se houver para melhorar a UX
                if (data.length > 0) {
                    setCategoriaSelecionada(data[0].id);
                }
            } catch (err) {
                showMessage('Erro ao Carregar Categorias', err instanceof Error ? err.message : 'Não foi possível carregar as categorias. Tente novamente.');
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
                setProdutoSelecionado(null); // Limpa o produto selecionado
                return;
            }

            setLoadingProdutos(true);
            try {
                const response = await fetch(`${API_URL}/produtos/por-categoria/${categoriaSelecionada}`);

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Erro ${response.status}: ${errorText || 'Sem detalhes.'}`);
                }

                const data: Produto[] = await response.json();
                setProdutos(data);
                setProdutoSelecionado(null); // Limpa o produto selecionado ao mudar de categoria
            } catch (err) {
                showMessage('Erro ao Carregar Produtos', err instanceof Error ? err.message : 'Não foi possível carregar os produtos desta categoria.');
                console.error(err);
            } finally {
                setLoadingProdutos(false);
            }
        };

        fetchProdutosDaCategoria();
    }, [categoriaSelecionada]); // Depende da categoria selecionada

    const handleAdicionarEstoque = async () => {
        animateButton(); // Ativa a animação do botão

        if (!produtoSelecionado || !quantidade.trim()) {
            showMessage('Erro de Validação', 'Por favor, selecione um produto e informe a quantidade a adicionar.');
            return;
        }

        const quantidadeNum = parseInt(quantidade);
        if (isNaN(quantidadeNum)) {
            showMessage('Erro de Validação', 'A quantidade deve ser um número válido.');
            return;
        }

        if (quantidadeNum <= 0) {
            showMessage('Erro de Validação', 'A quantidade a adicionar deve ser maior que zero.');
            return;
        }

        setSubmitting(true); // Ativa o estado de envio

        try {
            // Chamar o endpoint de ADICIONAR estoque (assumindo que a API aceita um PUT com a quantidade no body)
            const response = await fetch(`${API_URL}/produtos/${produtoSelecionado}/adicionar`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(quantidadeNum) // Envia a quantidade como JSON
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Erro ao adicionar ao estoque. Status: ${response.status}. Detalhes: ${errorText || 'Sem detalhes.'}`);
            }

            // Atualiza a lista de produtos localmente para refletir a nova quantidade
            const updatedProdutos = produtos.map(p =>
                p.id === produtoSelecionado ? { ...p, quantidade: p.quantidade + quantidadeNum } : p
            );
            setProdutos(updatedProdutos);

            showMessage('Sucesso!', `${quantidadeNum} itens adicionados ao estoque com sucesso!`);
            setQuantidade(''); // Limpa o campo de quantidade
            // Opcional: manter o produto selecionado ou resetar tudo
            // setProdutoSelecionado(null);
        } catch (err) {
            showMessage('Erro ao Adicionar Estoque', err instanceof Error ? err.message : 'Erro desconhecido ao adicionar ao estoque.');
            console.error(err);
        } finally {
            setSubmitting(false); // Desativa o estado de envio
        }
    };

    // Renderização do estado de carregamento inicial
    if (loadingCategorias) {
        return (
            <View style={styles.fullScreenLoading}>
                <ActivityIndicator size="large" color="#007bff" />
                <Text style={styles.loadingText}>Carregando categorias...</Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.headerTitle}>Adicionar Estoque</Text>

            <Text style={styles.label}>Selecione a Categoria</Text>
            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={categoriaSelecionada}
                    onValueChange={(itemValue) => {
                        setCategoriaSelecionada(itemValue);
                        setProdutoSelecionado(null); // Limpa o produto selecionado ao mudar de categoria
                        setQuantidade(''); // Limpa a quantidade também
                    }}
                    enabled={!submitting}
                >
                    <Picker.Item label="Selecione uma categoria" value={null} style={styles.pickerPlaceholder} />
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
                            <View style={styles.loadingProdutosContainer}>
                                <ActivityIndicator size="small" color="#007bff" />
                                <Text style={styles.loadingProdutosText}>Carregando produtos...</Text>
                            </View>
                        ) : produtos.length === 0 ? (
                            <Text style={styles.noProductsText}>Nenhum produto disponível nesta categoria.</Text>
                        ) : (
                            <Picker
                                selectedValue={produtoSelecionado}
                                onValueChange={(itemValue) => setProdutoSelecionado(itemValue)}
                                enabled={!submitting}
                            >
                                <Picker.Item label="Selecione um produto" value={null} style={styles.pickerPlaceholder} />
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
                                placeholderTextColor="#999"
                                keyboardType="numeric"
                                value={quantidade}
                                onChangeText={setQuantidade}
                                editable={!submitting}
                            />
                        </>
                    )}
                </>
            )}

            {produtoSelecionado && (
                <Animated.View style={[styles.buttonWrapper, { transform: [{ scale: buttonAnimation }] }]}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={handleAdicionarEstoque}
                        disabled={submitting || !quantidade.trim()}
                        activeOpacity={0.7}
                    >
                        {submitting ? (
                            <ActivityIndicator color="#ffffff" />
                        ) : (
                            <Text style={styles.buttonText}>Adicionar ao Estoque</Text>
                        )}
                    </TouchableOpacity>
                </Animated.View>
            )}

            {/* Modal de Mensagem Customizada (Sucesso/Erro) */}
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
                            style={[styles.modalButton, styles.modalSingleButton]}
                            onPress={() => setShowModal(false)}
                        >
                            <Text style={styles.modalButtonText}>Ok</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        flexGrow: 1,
        backgroundColor: '#f0f2f5', // Fundo suave
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#212529',
        marginBottom: 30,
        textAlign: 'center',
    },
    fullScreenLoading: {
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
    loadingProdutosContainer: {
        paddingVertical: 15,
        alignItems: 'center',
    },
    loadingProdutosText: {
        marginTop: 5,
        fontSize: 14,
        color: '#666',
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ced4da', // Cor de borda mais suave
        backgroundColor: '#ffffff',
        borderRadius: 8,
        marginBottom: 20,
        overflow: 'hidden', // Garante que o Picker respeite o borderRadius
        shadowColor: '#000', // Sombra sutil
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    label: {
        fontWeight: 'bold',
        marginBottom: 8,
        fontSize: 16,
        color: '#495057',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ced4da',
        backgroundColor: '#ffffff',
        padding: 14,
        marginBottom: 20,
        borderRadius: 8,
        fontSize: 16,
        color: '#343a40',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    buttonWrapper: {
        marginTop: 30,
        borderRadius: 8,
        overflow: 'hidden',
    },
    actionButton: {
        backgroundColor: '#28a745', // Verde para adicionar
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
    noProductsText: {
        textAlign: 'center',
        padding: 15,
        color: '#6c757d',
        fontSize: 15,
    },
    pickerPlaceholder: { // Estilo para o item "Selecione..." do Picker
        color: '#999',
    },
    // Estilos para o Modal Customizado (reutilizados)
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 15,
        padding: 30,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4
        },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
        width: '85%',
        maxWidth: 450,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 18,
        color: '#333',
        textAlign: 'center',
    },
    modalText: {
        marginBottom: 25,
        textAlign: 'center',
        fontSize: 17,
        color: '#555',
        lineHeight: 24,
    },
    modalButton: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        elevation: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalSingleButton: {
        width: '50%',
        alignSelf: 'center',
        backgroundColor: '#007bff',
    },
    modalButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});