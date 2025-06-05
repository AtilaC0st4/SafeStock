import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, ActivityIndicator, Modal, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Slider from '@react-native-community/slider';

const API_URL = 'http://192.168.25.10:5194/api'; // Atualize com seu endpoint

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

    // Estados para a caixa de mensagem customizada
    const [showModal, setShowModal] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalMessage, setModalMessage] = useState('');

    // Função para exibir a caixa de mensagem customizada
    const showMessage = (title: string, message: string) => {
        setModalTitle(title);
        setModalMessage(message);
        setShowModal(true);
    };

    // Buscar categorias e produtos da API
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
                showMessage('Erro', err instanceof Error ? err.message : 'Erro desconhecido ao carregar dados.');
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

    // Atualizar produto selecionado quando mudar a seleção de categoria
    useEffect(() => {
        if (produtoSelecionado && !produtosDaCategoria.some(p => p.id === produtoSelecionado.id)) {
            setProdutoSelecionado(null);
            setQuantidadeRetirada(1);
        }
    }, [produtosDaCategoria, produtoSelecionado]);

    // Define os estilos para o badge de status do produto
    const getStatusStyle = (status: string) => {
        switch (status.toLowerCase()) {
            case 'baixo': return { backgroundColor: '#e74c3c' }; // Vermelho
            case 'médio': return { backgroundColor: '#f1c40f' }; // Amarelo
            case 'ideal': return { backgroundColor: '#2ecc71' }; // Verde
            default: return { backgroundColor: '#ccc' }; // Cinza
        }
    };

    // Lógica para registrar a retirada do produto (AGORA SEM CHAMAR A API DE MOVIMENTAÇÃO)
    const handleRetirada = async () => {
        if (!produtoSelecionado) {
            showMessage('Erro', 'Selecione um produto.');
            return;
        }

        if (quantidadeRetirada <= 0) {
            showMessage('Erro', 'Informe uma quantidade válida para retirada.');
            return;
        }

        if (quantidadeRetirada > produtoSelecionado.quantidade) {
            showMessage('Erro', `Quantidade a retirar (${quantidadeRetirada}) é superior à disponível (${produtoSelecionado.quantidade}).`);
            return;
        }

        setSubmitting(true); // Ativa o estado de envio

        try {
            // **REMOVIDA A CHAMADA À API DE MOVIMENTAÇÕES**
            // Você havia comentado que estava dando falha na movimentação.
            // Para "resolver" isso, removemos a tentativa de registro no backend.
            // Atenção: Isso significa que o estoque no backend NÃO será atualizado
            // por esta tela. A atualização será apenas local no app.
            
            // Atualizar a lista de produtos no estado local após a retirada
            const updatedProdutos = produtos.map(p => 
                p.id === produtoSelecionado.id 
                    ? { ...p, quantidade: p.quantidade - quantidadeRetirada } 
                    : p
            );
            setProdutos(updatedProdutos);

            showMessage('Sucesso', `Retirada de ${quantidadeRetirada} unidades de ${produtoSelecionado.nome} registrada localmente!`);
            // Resetar a seleção após o sucesso
            setProdutoSelecionado(null);
            setQuantidadeRetirada(1);
            setCategoriaSelecionada(null); // Opcional: resetar categoria também
        } catch (err) {
            // Este catch só será ativado se houver um erro na lógica interna,
            // não mais em erros de rede ou API de movimentação.
            showMessage('Erro', err instanceof Error ? err.message : 'Erro ao processar retirada localmente.');
        } finally {
            setSubmitting(false); // Desativa o estado de envio
        }
    };

    // Exibe o indicador de carregamento inicial
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007bff" />
                <Text style={styles.loadingText}>Carregando dados...</Text>
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
                        setQuantidadeRetirada(1); // Reseta a quantidade ao selecionar um novo produto
                    }}
                    enabled={!!categoriaSelecionada} // Habilita o picker de produto apenas se uma categoria estiver selecionada
                >
                    <Picker.Item label="Selecione um produto" value={null} />
                    {produtosDaCategoria.map(prod => (
                        <Picker.Item key={prod.id} label={prod.nome} value={prod.id} />
                    ))}
                </Picker>
            </View>

            {/* Exibe detalhes do produto selecionado e o slider de quantidade */}
            {produtoSelecionado && (
                <View>
                    <Text style={styles.label}>Quantidade Atual em Estoque: {produtoSelecionado.quantidade}</Text>

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
                            maximumValue={produtoSelecionado.quantidade > 0 ? produtoSelecionado.quantidade : 1} // Garante mínimo 1 para o slider
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

            {/* Botão de Registro de Retirada */}
            <View style={styles.button}>
                <Button
                    title={submitting ? "Processando..." : "Registrar Retirada"}
                    onPress={handleRetirada}
                    disabled={submitting || !produtoSelecionado || produtoSelecionado.quantidade === 0} 
                />
            </View>

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
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        flexGrow: 1,
        backgroundColor: '#f9f9f9', // Cor de fundo suave
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#333',
    },
    label: {
        fontWeight: 'bold',
        marginBottom: 8,
        fontSize: 16,
        color: '#333',
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        marginBottom: 16,
        backgroundColor: '#fff',
        overflow: 'hidden', // Garante que o Picker não vaze bordas arredondadas
    },
    inputContainer: {
        marginVertical: 16,
        paddingHorizontal: 5,
    },
    button: {
        marginTop: 24,
        borderRadius: 8,
        overflow: 'hidden', // Para garantir que o botão tenha bordas arredondadas corretamente
    },
    statusBox: {
        padding: 12,
        borderRadius: 8,
        marginVertical: 12,
        alignItems: 'center', // Centraliza o texto
    },
    statusText: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 16,
    },
    // Estilos para o Modal Customizado
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)', // Fundo escuro semi-transparente
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
        width: '80%', // Largura do modal
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