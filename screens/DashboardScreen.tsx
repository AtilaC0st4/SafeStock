import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Button, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DashboardScreenNavigationProp } from '../types';

const API_URL = 'http://192.168.152.141:5194/api';

// Type definitions
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

  // Error handling helper
  const handleApiError = (err: unknown): string => {
    if (err instanceof Error) {
      return err.message;
    }
    if (typeof err === 'string') {
      return err;
    }
    return 'Erro desconhecido ao conectar com a API';
  };

  // Fetch data from API
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      console.log(`Fetching data from: ${API_URL}/dashboard`);
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
      if (err instanceof Error && err.name === 'AbortError') {
        setError('A requisição demorou muito. Tente novamente.');
      } else {
        setError(handleApiError(err));
      }
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Transform API data to component format
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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Get status badge style
  const getStatusStyle = (status: 'baixo' | 'médio' | 'ideal') => {
    switch (status) {
      case 'ideal': return styles.statusIdeal;
      case 'médio': return styles.statusMedio;
      case 'baixo': return styles.statusBaixo;
      default: return styles.statusMedio;
    }
  };

  // Loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Carregando dados...</Text>
        <Text style={styles.loadingSubtext}>Conectando em: {API_URL}</Text>
      </View>
    );
  }

  // Error state
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

  // Empty state
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

  // Main render
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

// Styles
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
    elevation: 2,
    shadowColor: '#000',
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
    backgroundColor: '#28a745',
  },
  statusMedio: {
    backgroundColor: '#ffc107',
  },
  statusBaixo: {
    backgroundColor: '#dc3545',
  },
  buttonsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  buttonWrapper: {
    marginBottom: 12,
  },
});