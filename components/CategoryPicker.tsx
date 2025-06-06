import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

interface Category {
  id: number;
  nome: string;
}

interface CategoryPickerProps {
  label: string;
  selectedValue: number | undefined; // Alterado de number | null para number | undefined
  onValueChange: (value: number) => void;
  categories: Category[];
  enabled?: boolean;
}

const CategoryPicker: React.FC<CategoryPickerProps> = ({
  label,
  selectedValue,
  onValueChange,
  categories,
  enabled = true,
}) => (
  <View>
    <Text style={styles.label}>{label}</Text>
    <View style={[styles.pickerContainer, !enabled && styles.disabled]}>
      <Picker
        selectedValue={selectedValue}
        onValueChange={onValueChange}
        enabled={enabled}
        itemStyle={styles.pickerItem}
      >
        <Picker.Item label="Selecione uma categoria" value={undefined} style={styles.pickerPlaceholder} />
        {categories.map((cat) => (
          <Picker.Item key={cat.id} label={cat.nome} value={cat.id} />
        ))}
      </Picker>
    </View>
  </View>
);

// ... (mantenha os estilos como estão)

const styles = StyleSheet.create({
  label: {
    fontWeight: 'bold',
    marginVertical: 10,
    fontSize: 16,
    color: '#495057',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ced4da',
    backgroundColor: '#ffffff',
    marginBottom: 20,
    borderRadius: 8,
    overflow: 'hidden',
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
  disabled: {
    opacity: 0.7,
  },
});

export default CategoryPicker;