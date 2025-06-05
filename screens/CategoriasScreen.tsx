import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ActivityIndicator, Modal, TouchableOpacity, Animated, FlatList, StyleSheet } from 'react-native';
import { CategoriasScreenNavigationProp } from '../types';
import { useFocusEffect } from '@react-navigation/native';

const API_URL = 'http://192.168.25.10:5194/api/categorias'; // Atualize com seu endpoint

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
    const [submitting, setSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [buttonAnimations, setButtonAnimations] = useState({
        adicionar: new Animated.Value(1),
        salvar: new Animated.Value(1),
        cancelar: new Animated.Value(1),
    });

    const [showModal, setShowModal] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalMessage, setModalMessage] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState<(() => Promise<void>) | null>(null);

    const showMessage = (title: string, message: string) => {
        setModalTitle(title);
        setModalMessage(message);
        setShowModal(true);
    };

    const showConfirmation = (title: string, message: string, onConfirm: () => Promise<void>) => {
        setModalTitle(title);
        setModalMessage(message);
        setConfirmAction(() => onConfirm);
        setShowConfirmModal(true);
    };

    const animateButton = (buttonName: keyof typeof buttonAnimations) => {
        Animated.sequence([
            Animated.timing(buttonAnimations[buttonName], {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(buttonAnimations[buttonName], {
                toValue: 1,
                duration: 150,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const fetchCategorias = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(API_URL);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Erro HTTP! status: ${response.status}. Detalhes: ${errorText || 'Sem detalhes.'}`);
            }

            const data = await response.json();
            setCategorias(data);
        } catch (err) {
            showMessage('Erro ao Carregar', err instanceof Error ? err.message : 'Falha ao carregar categorias. Tente novamente.');
            console.error('Fetch error:', err);
            setError(err instanceof Error ? err.message : 'Falha ao carregar categorias.');
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchCategorias();
        }, [])
    );

    const adicionarCategoria = async () => {
        animateButton('adicionar');
        if (!novaCategoria.trim()) {
            showMessage('Erro de Validação', 'Por favor, digite um nome para a categoria.');
            return;
        }

        setSubmitting(true);
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nome: novaCategoria })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Erro HTTP! status: ${response.status}. Detalhes: ${errorText || 'Sem detalhes.'}`);
            }

            const novaCat = await response.json();
            setCategorias([...categorias, novaCat]);
            setNovaCategoria('');
            showMessage('Sucesso!', 'Categoria adicionada com sucesso!');
        } catch (err) {
            showMessage('Erro ao Adicionar', err instanceof Error ? err.message : 'Falha ao adicionar categoria.');
            console.error('Add error:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const salvarEdicao = async () => {
        animateButton('salvar');
        if (!editando?.nome.trim()) {
            showMessage('Erro de Validação', 'O nome da categoria não pode ser vazio.');
            return;
        }

        setSubmitting(true);
        try {
            const response = await fetch(`${API_URL}/${editando.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: editando.id, nome: editando.nome })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Erro HTTP! status: ${response.status}. Detalhes: ${errorText || 'Sem detalhes.'}`);
            }

            setCategorias(categorias.map(cat =>
                cat.id === editando.id ? { ...cat, nome: editando.nome } : cat
            ));
            setEditando(null);
            showMessage('Sucesso!', 'Categoria atualizada com sucesso!');
        } catch (err) {
            showMessage('Erro ao Atualizar', err instanceof Error ? err.message : 'Falha ao atualizar categoria.');
            console.error('Update error:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const confirmarExclusao = async (id: number) => {
        setDeletingId(id);
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Erro HTTP! status: ${response.status}. Detalhes: ${errorText || 'Sem detalhes.'}`);
            }

            setCategorias(categorias.filter(cat => cat.id !== id));
            showMessage('Sucesso!', 'Categoria excluída com sucesso!');
        } catch (err) {
            showMessage('Erro ao Excluir', err instanceof Error ? err.message : 'Falha ao excluir categoria.');
            console.error('Delete error:', err);
        } finally {
            setDeletingId(null);
            setShowConfirmModal(false);
        }
    };

    const removerCategoria = (id: number, nome: string) => {
        showConfirmation(
            'Confirmar Exclusão',
            `Tem certeza que deseja excluir a categoria "${nome}"?`,
            () => confirmarExclusao(id)
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007bff" />
                <Text style={styles.loadingText}>Carregando categorias...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorTitle}>Erro ao carregar categorias</Text>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchCategorias}>
                    <Text style={styles.retryButtonText}>Tentar novamente</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.headerTitle}>Gerenciar Categorias</Text>

            <View style={styles.formContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Nome da nova categoria"
                    placeholderTextColor="#999"
                    value={novaCategoria}
                    onChangeText={setNovaCategoria}
                    editable={!submitting}
                />
                <Animated.View style={[styles.buttonWrapper, { transform: [{ scale: buttonAnimations.adicionar }] }]}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={adicionarCategoria}
                        disabled={submitting || !novaCategoria.trim()}
                        activeOpacity={0.7}
                    >
                        {submitting ? (
                            <ActivityIndicator color="#ffffff" />
                        ) : (
                            <Text style={styles.buttonText}>Adicionar Categoria</Text>
                        )}
                    </TouchableOpacity>
                </Animated.View>
            </View>

            <FlatList
                data={categorias}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.itemCard}>
                        <Text style={styles.itemCardText}>{item.nome}</Text>
                        <View style={styles.itemCardButtons}>
                            <TouchableOpacity
                                style={[styles.itemActionButton, styles.editButton]}
                                onPress={() => setEditando(item)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.itemActionButtonText}>Editar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.itemActionButton, styles.deleteButton]}
                                onPress={() => removerCategoria(item.id, item.nome)}
                                disabled={deletingId === item.id}
                                activeOpacity={0.7}
                            >
                                {deletingId === item.id ? (
                                    <ActivityIndicator color="#ffffff" />
                                ) : (
                                    <Text style={styles.itemActionButtonText}>Excluir</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                ListEmptyComponent={
                    <View style={styles.emptyListContainer}>
                        <Text style={styles.emptyListText}>Nenhuma categoria cadastrada.</Text>
                        <Text style={styles.emptyListSubText}>Comece adicionando uma acima!</Text>
                    </View>
                }
            />

            {/* Modal de Edição */}
            <Modal visible={!!editando} animationType="fade" transparent={true} onRequestClose={() => setEditando(null)}>
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalTitle}>Editar Categoria</Text>
                        <TextInput
                            style={styles.modalInput}
                            value={editando?.nome || ''}
                            onChangeText={text => editando && setEditando({ ...editando, nome: text })}
                            placeholder="Nome da categoria"
                            placeholderTextColor="#999"
                            editable={!submitting}
                        />
                        <View style={styles.modalButtons}>
                            <Animated.View style={{ transform: [{ scale: buttonAnimations.cancelar }] }}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.modalCancelButton]}
                                    onPress={() => { animateButton('cancelar'); setEditando(null); }}
                                    activeOpacity={0.7}
                                    disabled={submitting}
                                >
                                    <Text style={styles.modalButtonText}>Cancelar</Text>
                                </TouchableOpacity>
                            </Animated.View>
                            <Animated.View style={{ transform: [{ scale: buttonAnimations.salvar }] }}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.modalSaveButton]}
                                    onPress={salvarEdicao}
                                    activeOpacity={0.7}
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <ActivityIndicator color="#ffffff" />
                                    ) : (
                                        <Text style={styles.modalButtonText}>Salvar</Text>
                                    )}
                                </TouchableOpacity>
                            </Animated.View>
                        </View>
                    </View>
                </View>
            </Modal>

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
                        {/* Ajuste aqui: use o novo estilo modalSingleButton */}
                        <TouchableOpacity
                            style={[styles.modalButton, styles.modalSingleButton]}
                            onPress={() => setShowModal(false)}
                        >
                            <Text style={styles.modalButtonText}>Ok</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Modal de Confirmação de Exclusão */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={showConfirmModal}
                onRequestClose={() => setShowConfirmModal(false)}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalTitle}>{modalTitle}</Text>
                        <Text style={styles.modalText}>{modalMessage}</Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalCancelButton]}
                                onPress={() => setShowConfirmModal(false)}
                            >
                                <Text style={styles.modalButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalDeleteConfirmButton]}
                                onPress={() => { if (confirmAction) confirmAction(); }}
                            >
                                <Text style={styles.modalButtonText}>Confirmar</Text>
                            </TouchableOpacity>
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
        padding: 20,
        backgroundColor: '#f0f2f5',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#212529',
        marginBottom: 30,
        textAlign: 'center',
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
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f0f2f5',
    },
    errorTitle: {
        fontSize: 20,
        color: '#dc3545',
        fontWeight: 'bold',
        marginBottom: 15,
    },
    errorText: {
        fontSize: 16,
        color: '#6c757d',
        textAlign: 'center',
        marginBottom: 25,
    },
    retryButton: {
        backgroundColor: '#007bff',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    formContainer: {
        marginBottom: 30,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
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
        borderRadius: 8,
        overflow: 'hidden',
    },
    actionButton: {
        backgroundColor: '#28a745',
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
    itemCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 18,
        marginBottom: 12,
        backgroundColor: '#ffffff',
        borderRadius: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        borderLeftWidth: 5,
        borderLeftColor: '#007bff',
    },
    itemCardText: {
        fontSize: 17,
        flex: 1,
        color: '#343a40',
        fontWeight: '500',
    },
    itemCardButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    itemActionButton: {
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 70,
    },
    itemActionButtonText: {
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    editButton: {
        backgroundColor: '#ffc107',
    },
    deleteButton: {
        backgroundColor: '#dc3545',
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
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'center', // Ajustado para centralizar botões
        width: '100%',
        marginTop: 10,
        gap: 10,
    },
    modalButton: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        elevation: 2,
        alignItems: 'center',
        justifyContent: 'center',
        // Removido flex: 1 para controle mais preciso quando há apenas um botão
    },
    modalSingleButton: { // Novo estilo para o botão "Ok"
        width: '50%', // Define uma largura para o botão único
        alignSelf: 'center', // Garante que ele fique centralizado
        backgroundColor: '#007bff', // Uma cor padrão para o botão "Ok"
    },
    modalButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    modalCancelButton: {
        backgroundColor: '#6c757d',
        flex: 1, // Adiciona flex: 1 novamente para botões lado a lado
    },
    modalSaveButton: {
        backgroundColor: '#28a745',
        flex: 1, // Adiciona flex: 1 novamente para botões lado a lado
    },
    modalDeleteConfirmButton: {
        backgroundColor: '#dc3545',
        flex: 1, // Adiciona flex: 1 novamente para botões lado a lado
    },
    emptyListContainer: {
        alignItems: 'center',
        marginTop: 50,
        padding: 20,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
    },
    emptyListText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#6c757d',
        marginBottom: 10,
        textAlign: 'center',
    },
    emptyListSubText: {
        fontSize: 15,
        color: '#888',
        textAlign: 'center',
    },
    modalInput: {
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
});

export default CategoriasScreen;