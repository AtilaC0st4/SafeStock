import React from 'react';
import { View, Text, StyleSheet, FlatList, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DashboardScreenNavigationProp } from '../types'


type Item = {
  nome: string;
  quantidade: number;
  status: 'baixo' | 'médio' | 'ideal';
};

type Categoria = {
  titulo: string;
  itens: Item[];
};

const categorias: Categoria[] = [
  {
    titulo: 'Higiene e Limpeza',
    itens: [
      { nome: 'Papel Higiênico', quantidade: 12, status: 'ideal' },
      { nome: 'Sabonete', quantidade: 3, status: 'médio' },
      { nome: 'Detergente', quantidade: 1, status: 'baixo' },
      { nome: 'Álcool em Gel', quantidade: 2, status: 'médio' },
    ],
  },
  {
    titulo: 'Alimentos e Bebidas',
    itens: [
      { nome: 'Arroz', quantidade: 5, status: 'ideal' },
      { nome: 'Feijão', quantidade: 2, status: 'médio' },
      { nome: 'Óleo de Cozinha', quantidade: 1, status: 'baixo' },
      { nome: 'Café', quantidade: 0, status: 'baixo' },
    ],
  },
  {
    titulo: 'Primeiros Socorros',
    itens: [
      { nome: 'Curativos', quantidade: 10, status: 'ideal' },
      { nome: 'Álcool 70%', quantidade: 1, status: 'baixo' },
      { nome: 'Antisséptico', quantidade: 2, status: 'médio' },
      { nome: 'Analgésico', quantidade: 5, status: 'ideal' },
    ],
  },
  {
    titulo: 'Outros Úteis',
    itens: [
      { nome: 'Pilhas', quantidade: 3, status: 'médio' },
      { nome: 'Lanterna', quantidade: 1, status: 'ideal' },
      { nome: 'Máscaras', quantidade: 0, status: 'baixo' },
      { nome: 'Papel e Caneta', quantidade: 4, status: 'médio' },
    ],
  },
];

const getStatusStyle = (status: 'baixo' | 'médio' | 'ideal') => {
  switch (status) {
    case 'ideal':
      return styles.statusIdeal;
    case 'médio':
      return styles.statusMedio;
    case 'baixo':
      return styles.statusBaixo;
  }
};

export default function DashboardScreen() {
  const navigation = useNavigation<DashboardScreenNavigationProp>();

  return (
    <>
      <FlatList
        data={categorias}
        keyExtractor={(item) => item.titulo}
        contentContainerStyle={styles.container}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.titulo}>{item.titulo}</Text>
            {item.itens.map((subItem) => (
              <View style={styles.item} key={subItem.nome}>
                <View>
                  <Text style={styles.nome}>{subItem.nome}</Text>
                  <Text style={styles.quantidade}>
                    Quantidade: {subItem.quantidade}
                  </Text>
                </View>
                <View style={[styles.status, getStatusStyle(subItem.status)]}>
                  <Text style={styles.statusTexto}>{subItem.status}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      />

      <View style={styles.buttonContainer}>
        <Button
          title="Cadastrar Novo Recurso"
          onPress={() => navigation.navigate('Novo Recurso')}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  nome: {
    fontSize: 16,
  },
  quantidade: {
    fontSize: 14,
    color: '#777',
  },
  status: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    alignSelf: 'center',
  },
  statusTexto: {
    color: '#fff',
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  statusIdeal: {
    backgroundColor: '#34D399',
  },
  statusMedio: {
    backgroundColor: '#FBBF24',
  },
  statusBaixo: {
    backgroundColor: '#F87171',
  },
  buttonContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
});
