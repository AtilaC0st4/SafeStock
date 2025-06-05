import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Button, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { DashboardScreenNavigationProp } from '../types';

const API_URL = 'http://192.168.25.10:5194/api';

// Definições de Tipo (inalteradas)
type ProdutoStatusDTO = {
    nome: string;
    categoria: string;
    quantidade: number;
    status: string;
    corStatus: string;
};

type DashboardDTO = {
    totalProdutos: number;
    produtosEmEstoqueBaixo: number;
    totalCategorias: number;
    statusProdutos: ProdutoStatusDTO[]; // Este array deve conter TODOS os produtos da API
};

type CategoriaGroup = {
    titulo: string;
    itens: {
        nome: string;
        quantidade: number;
        status: 'baixo' | 'médio' | 'ideal';
    }[];
};

// Não é estritamente necessário para o código atual, mas bom para tipagem se fosse usar diretamente
type ApiError = {
    message: string;
    status?: number;
};

export default function DashboardScreen() {
    const navigation = useNavigation<DashboardScreenNavigationProp>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dashboardData, setDashboardData] = useState<DashboardDTO | null>(null);
    const [categorias, setCategorias] = useState<CategoriaGroup[]>([]);

    // Helper para tratamento de erros da API
    const handleApiError = (err: unknown): string => {
        if (err instanceof Error) {
            // Verifica se é um erro de aborto (timeout)
            if (err.name === 'AbortError') {
                return 'A requisição demorou muito. Verifique sua conexão ou tente novamente.';
            }
            return err.message;
        }
        if (typeof err === 'string') {
            return err;
        }
        return 'Erro desconhecido ao conectar com a API';
    };

    // Transforma os dados da API para o formato do componente
    // Esta função agrupa os produtos por categoria, baseando-se nos dados que a API enviar
    const transformData = (data: DashboardDTO): CategoriaGroup[] => {
        // Se não houver produtos ou dados de status, retorna um array vazio
        if (!data?.statusProdutos) return [];

        const categoriesMap = new Map<string, CategoriaGroup>();

        // Itera sobre CADA produto recebido em statusProdutos
        data.statusProdutos.forEach(produto => {
            // Se a categoria ainda não foi adicionada ao mapa, cria uma nova entrada para ela
            if (!categoriesMap.has(produto.categoria)) {
                categoriesMap.set(produto.categoria, {
                    titulo: produto.categoria,
                    itens: []
                });
            }

            // Mapeia os status de string da API para os status definidos no front-end
            const statusMap: Record<string, 'baixo' | 'médio' | 'ideal'> = {
                'baixo': 'baixo',
                'médio': 'médio',
                'alto': 'ideal', // Garante que 'alto' seja mapeado para 'ideal'
                'ideal': 'ideal'
            };

            // Adiciona o produto à sua categoria correspondente
            categoriesMap.get(produto.categoria)?.itens.push({
                nome: produto.nome,
                quantidade: produto.quantidade,
                // Converte o status da API para minúsculas e usa o mapeamento,
                // caso contrário, define como 'médio' por padrão
                status: statusMap[produto.status.toLowerCase()] || 'médio'
            });
        });

        // Converte o mapa de categorias de volta para um array
        return Array.from(categoriesMap.values());
    };

    // Função para buscar dados da API
    const fetchDashboardData = useCallback(async () => {
        setLoading(true); // Ativa o estado de carregamento
        setError(null);    // Limpa qualquer erro anterior

        try {
            const controller = new AbortController();
            // Define um timeout de 10 segundos para a requisição
            const timeout = setTimeout(() => controller.abort(), 10000);

            console.log(`Buscando dados de: ${API_URL}/dashboard`); // Log para depuração

            const response = await fetch(`${API_URL}/dashboard`, {
                signal: controller.signal, // Associa o AbortController à requisição
                headers: {
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache' // Garante que não use cache antigo
                }
            });

            clearTimeout(timeout); // Cancela o timeout se a requisição for concluída

            // Se a resposta não for OK (status 2xx), lança um erro
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const data: DashboardDTO = await response.json(); // Analisa a resposta JSON
            // console.log("Dados recebidos da API:", JSON.stringify(data, null, 2)); // Descomente para inspecionar os dados brutos da API

            setDashboardData(data);             // Armazena os dados brutos do dashboard
            setCategorias(transformData(data)); // Transforma e armazena as categorias

        } catch (err) {
            // Trata erros da requisição (rede, timeout, erro HTTP)
            const errorMessage = handleApiError(err);
            setError(errorMessage);
            console.error('Erro na API:', errorMessage); // Loga o erro específico
        } finally {
            setLoading(false); // Desativa o estado de carregamento, independentemente do resultado
        }
    }, []); // Array de dependências vazio significa que a função é criada uma única vez

    // Usa useFocusEffect para refazer a requisição de dados sempre que a tela entrar em foco
    useFocusEffect(
        useCallback(() => {
            fetchDashboardData();
            // Não há necessidade de uma função de limpeza específica aqui,
            // pois `fetch` já é autocontido e o `AbortController` lida com o timeout.
            return () => {};
        }, [fetchDashboardData]) // Garante que o efeito seja executado se `fetchDashboardData` mudar (o que não deve acontecer aqui)
    );

    // Retorna o estilo do badge de status com base no status do produto
    const getStatusStyle = (status: 'baixo' | 'médio' | 'ideal') => {
        switch (status) {
            case 'ideal': return styles.statusIdeal;
            case 'médio': return styles.statusMedio;
            case 'baixo': return styles.statusBaixo;
            default: return styles.statusMedio; // Padrão para médio se o status for desconhecido
        }
    };

    // Estado de Carregamento
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0066cc" />
                <Text style={styles.loadingText}>Carregando dados...</Text>
                <Text style={styles.loadingSubtext}>Conectando em: {API_URL}</Text>
            </View>
        );
    }

    // Estado de Erro
    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorTitle}>Erro ao carregar dados</Text>
                <Text style={styles.errorText}>{error}</Text>
                <Button
                    title="Tentar novamente"
                    onPress={fetchDashboardData}
                    color="#0066cc"
                />
            </View>
        );
    }

    // Estado Vazio (quando não há dados ou categorias para exibir)
    if (!dashboardData || categorias.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Nenhum dado disponível</Text>
                <Button
                    title="Recarregar"
                    onPress={fetchDashboardData}
                    color="#0066cc"
                />
            </View>
        );
    }

    // Renderização Principal do Dashboard
    return (
        <View style={styles.container}>
            <FlatList
                data={categorias}
                keyExtractor={(item) => item.titulo}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={ // Componente exibido no topo da lista
                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryTitle}>Resumo do Estoque</Text>
                        <Text style={styles.summaryText}>Total de Produtos: {dashboardData.totalProdutos}</Text>
                        <Text style={styles.summaryText}>Estoque Baixo: {dashboardData.produtosEmEstoqueBaixo}</Text>
                        <Text style={styles.summaryText}>Categorias: {dashboardData.totalCategorias}</Text>
                    </View>
                }
                renderItem={({ item }) => ( // Renderiza cada grupo de categoria
                    <View style={styles.categoryCard}>
                        <Text style={styles.categoryTitle}>{item.titulo}</Text>
                        {/* Mapeia e renderiza cada item (produto) dentro da categoria */}
                        {item.itens.map((subItem) => (
                            <View style={styles.itemRow} key={`${item.titulo}-${subItem.nome}`}>
                                <View style={styles.itemInfo}>
                                    <Text style={styles.itemName}>{subItem.nome}</Text>
                                    <Text style={styles.itemQuantity}>Quantidade: {subItem.quantidade}</Text>
                                </View>
                                <View style={[styles.statusBadge, getStatusStyle(subItem.status)]}>
                                    <Text style={styles.statusText}>{subItem.status}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            />

            {/* Container dos Botões de Navegação */}
            <View style={styles.buttonsContainer}>
                <View style={styles.buttonWrapper}>
                    <Button
                        title="Cadastrar Recurso"
                        onPress={() => navigation.navigate('Novo Recurso')}
                        color="#0066cc"
                    />
                </View>
                <View style={styles.buttonWrapper}>
                    <Button
                        title="Retirada"
                        onPress={() => navigation.navigate('Retirada de Recursos')}
                        color="#0066cc"
                    />
                </View>
                <View style={styles.buttonWrapper}>
                    <Button
                        title="Categorias"
                        onPress={() => navigation.navigate('Categorias')}
                        color="#0066cc"
                    />
                </View>
                <View style={styles.buttonWrapper}>
                    <Button
                        title="Novo Produto"
                        onPress={() => navigation.navigate('CadastroProduto')}
                        color="#0066cc"
                    />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 20,
        fontSize: 16,
        color: '#333',
    },
    loadingSubtext: {
        marginTop: 8,
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorTitle: {
        fontSize: 18,
        color: '#dc3545',
        fontWeight: 'bold',
        marginBottom: 10,
    },
    errorText: {
        fontSize: 14,
        color: '#6c757d',
        textAlign: 'center',
        marginBottom: 20,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 16,
        color: '#6c757d',
        marginBottom: 20,
    },
    listContent: {
        padding: 16,
        paddingBottom: 20,
    },
    summaryCard: {
        backgroundColor: '#ffffff',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
        elevation: 2, // Sombra para Android
        shadowColor: '#000', // Sombra para iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    summaryTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#212529',
        marginBottom: 12,
    },
    summaryText: {
        fontSize: 14,
        color: '#495057',
        marginBottom: 4,
    },
    categoryCard: {
        backgroundColor: '#ffffff',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    categoryTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#212529',
        marginBottom: 12,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 14,
        color: '#212529',
    },
    itemQuantity: {
        fontSize: 12,
        color: '#6c757d',
        marginTop: 2,
    },
    statusBadge: {
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 12,
    },
    statusText: {
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: 12,
    },
    statusIdeal: {
        backgroundColor: '#28a745', // Verde
    },
    statusMedio: {
        backgroundColor: '#ffc107', // Amarelo
    },
    statusBaixo: {
        backgroundColor: '#dc3545', // Vermelho
    },
    buttonsContainer: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 16,
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#e9ecef',
    },
    buttonWrapper: {
        marginBottom: 12,
    },
});