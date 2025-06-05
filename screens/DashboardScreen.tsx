import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Button, ActivityIndicator, TouchableOpacity, Animated } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { DashboardScreenNavigationProp, RootStackParamList } from '../types'; 

const API_URL = 'http://192.168.25.10:5194/api';


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
    statusProdutos: ProdutoStatusDTO[];
};

type CategoriaGroup = {
    titulo: string;
    itens: {
        nome: string;
        quantidade: number;
        status: 'baixo' | 'médio' | 'ideal';
    }[];
};

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
    
    const [buttonAnimations, setButtonAnimations] = useState({
        adicionarEstoque: new Animated.Value(1),
        retirarEstoque: new Animated.Value(1),
        gerenciarCategorias: new Animated.Value(1),
        cadastrarProduto: new Animated.Value(1),
    });

    const handleApiError = (err: unknown): string => {
        if (err instanceof Error) {
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

    const transformData = (data: DashboardDTO): CategoriaGroup[] => {
        if (!data?.statusProdutos) return [];

        const categoriesMap = new Map<string, CategoriaGroup>();

        data.statusProdutos.forEach(produto => {
            if (!categoriesMap.has(produto.categoria)) {
                categoriesMap.set(produto.categoria, {
                    titulo: produto.categoria,
                    itens: []
                });
            }

            const statusMap: Record<string, 'baixo' | 'médio' | 'ideal'> = {
                'baixo': 'baixo',
                'médio': 'médio',
                'alto': 'ideal',
                'ideal': 'ideal'
            };

            categoriesMap.get(produto.categoria)?.itens.push({
                nome: produto.nome,
                quantidade: produto.quantidade,
                status: statusMap[produto.status.toLowerCase()] || 'médio'
            });
        });

        return Array.from(categoriesMap.values());
    };

    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 10000);

            console.log(`Buscando dados de: ${API_URL}/dashboard`);

            const response = await fetch(`${API_URL}/dashboard`, {
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache'
                }
            });

            clearTimeout(timeout);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const data: DashboardDTO = await response.json();
            setDashboardData(data);
            setCategorias(transformData(data));

        } catch (err) {
            const errorMessage = handleApiError(err);
            setError(errorMessage);
            console.error('Erro na API:', errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchDashboardData();
            return () => { };
        }, [fetchDashboardData])
    );

    const getStatusStyle = (status: 'baixo' | 'médio' | 'ideal') => {
        switch (status) {
            case 'ideal': return styles.statusIdeal;
            case 'médio': return styles.statusMedio;
            case 'baixo': return styles.statusBaixo;
            default: return styles.statusMedio;
        }
    };

    const handleButtonPress = (buttonName: keyof typeof buttonAnimations, navigateTo: keyof RootStackParamList) => {
        Animated.sequence([
            Animated.timing(buttonAnimations[buttonName], {
                toValue: 0.9, 
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(buttonAnimations[buttonName], {
                toValue: 1, 
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => navigation.navigate(navigateTo));
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0066cc" />
                <Text style={styles.loadingText}>Carregando dados...</Text>
                <Text style={styles.loadingSubtext}>Conectando em: {API_URL}</Text>
            </View>
        );
    }

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

    return (
        <View style={styles.container}>
            <FlatList
                data={categorias}
                keyExtractor={(item) => item.titulo}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={
                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryTitle}>Resumo do Estoque</Text>
                        <Text style={styles.summaryText}>Total de Produtos: {dashboardData.totalProdutos}</Text>
                        <Text style={styles.summaryText}>Estoque Baixo: {dashboardData.produtosEmEstoqueBaixo}</Text>
                        <Text style={styles.summaryText}>Categorias: {dashboardData.totalCategorias}</Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <View style={styles.categoryCard}>
                        <Text style={styles.categoryTitle}>{item.titulo}</Text>
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

            {/* Área de Botões - Posicionada na parte inferior */}
            <View style={styles.bottomActionsContainer}>
                <Animated.View style={[styles.buttonWrapperBottom, { transform: [{ scale: buttonAnimations.adicionarEstoque }] }]}>
                    <TouchableOpacity
                        style={styles.actionButtonBottom}
                        onPress={() => handleButtonPress('adicionarEstoque', 'Novo Recurso')}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.buttonTextBottom}>Adicionar</Text>
                        <Text style={styles.buttonSubTextBottom}>ao Estoque</Text>
                    </TouchableOpacity>
                </Animated.View>

                <Animated.View style={[styles.buttonWrapperBottom, { transform: [{ scale: buttonAnimations.retirarEstoque }] }]}>
                    <TouchableOpacity
                        style={styles.actionButtonBottom}
                        onPress={() => handleButtonPress('retirarEstoque', 'Retirada de Recursos')}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.buttonTextBottom}>Retirar</Text>
                        <Text style={styles.buttonSubTextBottom}>do Estoque</Text>
                    </TouchableOpacity>
                </Animated.View>

                <Animated.View style={[styles.buttonWrapperBottom, { transform: [{ scale: buttonAnimations.cadastrarProduto }] }]}>
                    <TouchableOpacity
                        style={styles.actionButtonBottom}
                        onPress={() => handleButtonPress('cadastrarProduto', 'CadastroProduto')}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.buttonTextBottom}>Novo</Text>
                        <Text style={styles.buttonSubTextBottom}>Produto</Text>
                    </TouchableOpacity>
                </Animated.View>

                <Animated.View style={[styles.buttonWrapperBottom, { transform: [{ scale: buttonAnimations.gerenciarCategorias }] }]}>
                    <TouchableOpacity
                        style={styles.actionButtonBottom}
                        onPress={() => handleButtonPress('gerenciarCategorias', 'Categorias')}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.buttonTextBottom}>Gerenciar</Text>
                        <Text style={styles.buttonSubTextBottom}>Categorias</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f2f5', 
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
    loadingSubtext: {
        marginTop: 8,
        fontSize: 14, 
        color: '#666',
        textAlign: 'center',
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
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f0f2f5',
    },
    emptyText: {
        fontSize: 18,
        color: '#6c757d',
        marginBottom: 25,
        textAlign: 'center',
    },
    listContent: {
        padding: 16,
        paddingBottom: 95, // Aumenta o padding para que a FlatList não fique coberta pelos botões de baixo
        paddingTop: 10, 
    },
    summaryCard: {
        backgroundColor: '#ffffff',
        borderRadius: 12, 
        padding: 20, 
        marginBottom: 20, 
        elevation: 4, 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
    },
    summaryTitle: {
        fontSize: 20, 
        fontWeight: 'bold',
        color: '#212529',
        marginBottom: 15,
        textAlign: 'center', 
    },
    summaryText: {
        fontSize: 16, 
        color: '#495057',
        marginBottom: 6,
        lineHeight: 22, 
    },
    categoryCard: {
        backgroundColor: '#ffffff',
        borderRadius: 12, 
        padding: 18, 
        marginBottom: 18, 
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
    categoryTitle: {
        fontSize: 18, 
        fontWeight: '700', 
        color: '#212529',
        marginBottom: 15,
        borderBottomWidth: 1, 
        borderBottomColor: '#e9ecef',
        paddingBottom: 10,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10, 
        borderBottomWidth: 0.5, 
        borderBottomColor: '#f0f2f5', 
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 16, 
        color: '#343a40', 
        fontWeight: '500', 
    },
    itemQuantity: {
        fontSize: 14, 
        color: '#6c757d',
        marginTop: 4, 
    },
    statusBadge: {
        paddingVertical: 6, 
        paddingHorizontal: 16, 
        borderRadius: 16, 
        minWidth: 80, 
        alignItems: 'center', 
        justifyContent: 'center', 
    },
    statusText: {
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: 13, 
    },
    statusIdeal: {
        backgroundColor: '#28a745', 
    },
    statusMedio: {
        backgroundColor: '#ffc107', 
    },
    statusBaixo: {
        backgroundColor: '#dc3545', 
    },
    // Estilos para a área de botões na parte inferior
    bottomActionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 12, // Aumenta o padding vertical para a área dos botões
        paddingHorizontal: 8, 
        backgroundColor: '#ffffff',
        borderTopWidth: 1, 
        borderTopColor: '#e9ecef',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 }, 
        shadowOpacity: 0.08, 
        shadowRadius: 4,
        elevation: 8, 
        position: 'absolute', 
        bottom: 0,
        left: 0,
        right: 0,
        height: 80, // Altura fixa da barra para dar mais espaço
    },
    buttonWrapperBottom: {
        flex: 1, 
        marginHorizontal: 4, // Aumenta um pouco a margem entre os botões
    },
    actionButtonBottom: {
        backgroundColor: '#007bff', 
        paddingVertical: 6, // Reduz o padding vertical dos botões individuais
        paddingHorizontal: 5, 
        borderRadius: 8, 
        elevation: 2, 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        alignItems: 'center',
        justifyContent: 'center',
        height: 60, // Mantém a altura dos botões, mas agora a área tem mais espaço
    },
    buttonTextBottom: {
        color: '#ffffff', 
        fontSize: 14, 
        fontWeight: 'bold',
        textAlign: 'center',
    },
    buttonSubTextBottom: {
        color: '#ffffff',
        fontSize: 10, 
        textAlign: 'center',
        marginTop: 2, 
    },
});