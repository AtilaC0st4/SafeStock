import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Modal, TouchableOpacity, Animated } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Slider from '@react-native-community/slider';

const API_URL = 'http://192.168.25.10:5194/api';

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
    const [showModal, setShowModal] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalMessage, setModalMessage] = useState('');
    const buttonAnimation = new Animated.Value(1);

    const showMessage = (title: string, message: string) => {
        setModalTitle(title);
        setModalMessage(message);
        setShowModal(true);
    };

    const animateButton = () => {
        Animated.sequence([
            Animated.timing(buttonAnimation, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(buttonAnimation, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const catResponse = await fetch(`${API_URL}/categorias`);
            if (!catResponse.ok) {
                const errorText = await catResponse.text();
                throw new Error(`Erro ${catResponse.status}: ${errorText || 'Erro ao carregar categorias.'}`);
            }
            const categoriasData = await catResponse.json();
            setCategorias(categoriasData);

            const prodResponse = await fetch(`${API_URL}/produtos`);
            if (!prodResponse.ok) {
                const errorText = await prodResponse.text();
                throw new Error(`Erro ${prodResponse.status}: ${errorText || 'Erro ao carregar produtos.'}`);
            }
            const produtosData = await prodResponse.json();
            setProdutos(produtosData);

        } catch (err) {
            showMessage('Erro ao Carregar Dados', err instanceof Error ? err.message : 'Erro desconhecido ao carregar dados. Tente novamente.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const produtosDaCategoria = categoriaSelecionada
        ? produtos.filter(p => p.categoriaId === categoriaSelecionada)
        : produtos;

    useEffect(() => {
        if (categoriaSelecionada === null) {
            setProdutoSelecionado(null);
            setQuantidadeRetirada(1);
        } else if (produtoSelecionado && !produtosDaCategoria.some(p => p.id === produtoSelecionado.id)) {
            setProdutoSelecionado(null);
            setQuantidadeRetirada(1);
        } else if (categoriaSelecionada && produtosDaCategoria.length > 0 && !produtoSelecionado) {
            setProdutoSelecionado(produtosDaCategoria[0]);
            setQuantidadeRetirada(1);
        }
    }, [produtosDaCategoria, produtoSelecionado, categoriaSelecionada]);

    const getStatusStyle = (status: string) => {
        switch (status.toLowerCase()) {
            case 'baixo': return { backgroundColor: '#dc3545' };
            case 'medio': return { backgroundColor: '#ffc107' };
            case 'ideal': return { backgroundColor: '#28a745' };
            default: return { backgroundColor: '#6c757d' };
        }
    };

    const handleRetirada = async () => {
        animateButton();

        if (!produtoSelecionado) {
            showMessage('Erro de Validação', 'Por favor, selecione um produto para a retirada.');
            return;
        }

        if (quantidadeRetirada <= 0) {
            showMessage('Erro de Validação', 'A quantidade para retirada deve ser maior que zero.');
            return;
        }

        if (quantidadeRetirada > produtoSelecionado.quantidade) {
            showMessage('Erro de Validação', `Quantidade a retirar (${quantidadeRetirada}) é superior à disponível (${produtoSelecionado.quantidade}).`);
            return;
        }

        setSubmitting(true);

        try {
            const response = await fetch(`${API_URL}/produtos/retirar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    produtoId: produtoSelecionado.id,
                    quantidade: quantidadeRetirada,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = errorData.message || `Erro HTTP ${response.status}: Falha ao registrar retirada.`;
                throw new Error(errorMessage);
            }

            showMessage('Sucesso!', `Retirada de ${quantidadeRetirada} unidade(s) de "${produtoSelecionado.nome}" registrada com sucesso!`);
            await fetchData();
            setQuantidadeRetirada(1);

        } catch (err) {
            showMessage('Erro na Retirada', err instanceof Error ? err.message : 'Erro desconhecido ao processar retirada.');
            console.error('Erro na retirada:', err);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007bff" />
                <Text style={styles.loadingText}>Carregando dados do estoque...</Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.headerTitle}>Registrar Retirada</Text>

            <Text style={styles.label}>Selecione a Categoria</Text>
            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={categoriaSelecionada}
                    onValueChange={(itemValue) => {
                        setCategoriaSelecionada(itemValue);
                        setProdutoSelecionado(null);
                        setQuantidadeRetirada(1);
                    }}
                    enabled={!submitting}
                >
                    <Picker.Item label="Todas as Categorias" value={null} />
                    {categorias.map(cat => (
                        <Picker.Item key={cat.id} label={cat.nome} value={cat.id} />
                    ))}
                </Picker>
            </View>

            <Text style={styles.label}>Selecione o Produto</Text>
            <View style={styles.pickerContainer}>
                {produtosDaCategoria.length === 0 ? (
                    <View style={styles.noItemsContainer}>
                        <Text style={styles.noItemsText}>
                            {categoriaSelecionada ? 'Nenhum produto nesta categoria.' : 'Nenhum produto disponível no estoque.'}
                        </Text>
                    </View>
                ) : (
                    <Picker
                        selectedValue={produtoSelecionado?.id || null}
                        onValueChange={(itemValue) => {
                            const produto = produtosDaCategoria.find(p => p.id === itemValue) || null;
                            setProdutoSelecionado(produto);
                            setQuantidadeRetirada(1);
                        }}
                        enabled={!submitting && produtosDaCategoria.length > 0}
                    >
                        <Picker.Item label="Selecione um produto" value={null} />
                        {produtosDaCategoria.map(prod => (
                            <Picker.Item 
                                key={prod.id} 
                                label={`${prod.nome} (Estoque: ${prod.quantidade})`} 
                                value={prod.id} 
                            />
                        ))}
                    </Picker>
                )}
            </View>

            {produtoSelecionado && (
                <View style={styles.detailsCard}>
                    <Text style={styles.detailLabel}>Informações do Produto:</Text>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailText}>Nome:</Text>
                        <Text style={styles.detailValue}>{produtoSelecionado.nome}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailText}>Estoque Atual:</Text>
                        <Text style={styles.detailValue}>{produtoSelecionado.quantidade}</Text>
                    </View>

                    <View style={[styles.statusBadge, getStatusStyle(produtoSelecionado.status)]}>
                        <Text style={styles.statusBadgeText}>
                            Status: {produtoSelecionado.status.charAt(0).toUpperCase() + produtoSelecionado.status.slice(1)}
                        </Text>
                    </View>

                    {produtoSelecionado.quantidade > 0 ? (
                        <View style={styles.quantitySliderContainer}>
                            <Text style={styles.label}>
                                Quantidade a Retirar:
                                <Text style={styles.quantityValue}> {quantidadeRetirada}</Text>
                            </Text>
                            <Slider
                                style={styles.slider}
                                minimumValue={1}
                                maximumValue={produtoSelecionado.quantidade}
                                step={1}
                                value={quantidadeRetirada}
                                onValueChange={setQuantidadeRetirada}
                                minimumTrackTintColor="#007bff"
                                maximumTrackTintColor="#a0aec0"
                                thumbTintColor="#007bff"
                                disabled={submitting}
                            />
                        </View>
                    ) : (
                        <Text style={styles.outOfStockText}>Produto sem estoque para retirada.</Text>
                    )}
                </View>
            )}

            {produtoSelecionado && produtoSelecionado.quantidade > 0 && (
                <Animated.View style={[styles.buttonWrapper, { transform: [{ scale: buttonAnimation }] }]}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={handleRetirada}
                        disabled={submitting || quantidadeRetirada <= 0 || quantidadeRetirada > produtoSelecionado.quantidade}
                        activeOpacity={0.7}
                    >
                        {submitting ? (
                            <ActivityIndicator color="#ffffff" />
                        ) : (
                            <Text style={styles.buttonText}>Registrar Retirada</Text>
                        )}
                    </TouchableOpacity>
                </Animated.View>
            )}

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
        backgroundColor: '#f8f9fa',
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#212529',
        marginBottom: 30,
        textAlign: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
    },
    loadingText: {
        marginTop: 15,
        fontSize: 17,
        color: '#495057',
        fontWeight: '500',
    },
    label: {
        fontWeight: 'bold',
        marginBottom: 8,
        fontSize: 16,
        color: '#495057',
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 10,
        marginBottom: 20,
        backgroundColor: '#ffffff',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
    },
    noItemsContainer: {
        padding: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noItemsText: {
        textAlign: 'center',
        color: '#6c757d',
        fontSize: 15,
        fontStyle: 'italic',
    },
    detailsCard: {
        backgroundColor: '#ffffff',
        borderRadius: 10,
        padding: 20,
        marginBottom: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    detailLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#343a40',
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        paddingBottom: 5,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    detailText: {
        fontSize: 16,
        color: '#495057',
    },
    detailValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#212529',
    },
    statusBadge: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        alignSelf: 'flex-start',
        marginTop: 15,
        marginBottom: 15,
    },
    statusBadgeText: {
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    quantitySliderContainer: {
        marginTop: 15,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    quantityValue: {
        color: '#007bff',
        fontWeight: 'bold',
        fontSize: 18,
    },
    slider: {
        width: '100%',
        height: 40,
        marginTop: 10,
    },
    outOfStockText: {
        textAlign: 'center',
        color: '#dc3545',
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 20,
        padding: 10,
        backgroundColor: '#f8d7da',
        borderRadius: 8,
    },
    buttonWrapper: {
        marginTop: 30,
        borderRadius: 10,
        overflow: 'hidden',
    },
    actionButton: {
        backgroundColor: '#007bff',
        paddingVertical: 16,
        paddingHorizontal: 25,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
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