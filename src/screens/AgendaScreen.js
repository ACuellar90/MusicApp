import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Alert, Modal, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

const TIPOS = [
  { label: 'Misa', icon: 'church', color: '#7C3AED' },
  { label: 'Ensayo', icon: 'musical-notes', color: '#2196F3' },
  { label: 'Concierto', icon: 'mic', color: '#E91E63' },
  { label: 'Otro', icon: 'calendar', color: '#FF9800' },
];

export default function AgendaScreen() {
  const [eventos, setEventos] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({ nombre: '', fecha: '', hora: '', lugar: '', tipo: 'Misa', notas: '' });

  const cargarEventos = () => setEventos([]);

  useEffect(() => { cargarEventos(); }, []);
  useFocusEffect(useCallback(() => { cargarEventos(); }, []));

  const guardarEvento = () => {
    if (!form.nombre.trim() || !form.fecha.trim()) {
      Alert.alert('Error', 'Nombre y fecha son obligatorios');
      return;
    }
    setEventos(prev => [...prev, { id: Date.now(), ...form }]);
    setForm({ nombre: '', fecha: '', hora: '', lugar: '', tipo: 'Misa', notas: '' });
    setModalVisible(false);
  };

  const confirmarEliminar = (id, nombre) => {
    Alert.alert('Eliminar', `¿Eliminar "${nombre}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => setEventos(prev => prev.filter(e => e.id !== id)) }
    ]);
  };

  const getTipo = (label) => TIPOS.find(t => t.label === label) || TIPOS[3];

  const renderEvento = ({ item }) => {
    const tipo = getTipo(item.tipo);
    return (
      <TouchableOpacity style={styles.card} onLongPress={() => confirmarEliminar(item.id, item.nombre)}>
        <View style={[styles.cardIcon, { backgroundColor: tipo.color + '22' }]}>
          <Ionicons name={tipo.icon} size={24} color={tipo.color} />
        </View>
        <View style={styles.cardLeft}>
          <Text style={styles.cardTitulo}>{item.nombre}</Text>
          <Text style={styles.cardSub}>
            📅 {item.fecha}{item.hora ? ` • 🕐 ${item.hora}` : ''}{item.lugar ? ` • 📍 ${item.lugar}` : ''}
          </Text>
          <View style={[styles.badge, { backgroundColor: tipo.color + '22' }]}>
            <Text style={[styles.badgeText, { color: tipo.color }]}>{item.tipo}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#bbb" />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={eventos}
        keyExtractor={item => item.id.toString()}
        renderItem={renderEvento}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="calendar-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>No hay eventos aún</Text>
            <Text style={styles.emptySubText}>Tocá el + para agregar un evento</Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitulo}>Nuevo Evento</Text>

              <TextInput style={styles.input} placeholder="Nombre del evento *"
                placeholderTextColor="#aaa" value={form.nombre} onChangeText={v => setForm({ ...form, nombre: v })} />
              <TextInput style={styles.input} placeholder="Fecha (ej: 25/12/2026) *"
                placeholderTextColor="#aaa" value={form.fecha} onChangeText={v => setForm({ ...form, fecha: v })} />
              <TextInput style={styles.input} placeholder="Hora (ej: 10:00 AM)"
                placeholderTextColor="#aaa" value={form.hora} onChangeText={v => setForm({ ...form, hora: v })} />
              <TextInput style={styles.input} placeholder="Lugar"
                placeholderTextColor="#aaa" value={form.lugar} onChangeText={v => setForm({ ...form, lugar: v })} />
              <TextInput style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]}
                placeholder="Notas adicionales" placeholderTextColor="#aaa"
                multiline value={form.notas} onChangeText={v => setForm({ ...form, notas: v })} />

              <Text style={styles.label}>Tipo de evento:</Text>
              <View style={styles.tiposRow}>
                {TIPOS.map(tipo => (
                  <TouchableOpacity
                    key={tipo.label}
                    style={[styles.tipoBtn, form.tipo === tipo.label && { backgroundColor: tipo.color }]}
                    onPress={() => setForm({ ...form, tipo: tipo.label })}
                  >
                    <Ionicons name={tipo.icon} size={18} color={form.tipo === tipo.label ? '#fff' : tipo.color} />
                    <Text style={[styles.tipoText, form.tipo === tipo.label && { color: '#fff' }]}>{tipo.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.modalBtns}>
                <TouchableOpacity style={styles.btnCancelar} onPress={() => setModalVisible(false)}>
                  <Text style={styles.btnCancelarText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnGuardar} onPress={guardarEvento}>
                  <Text style={styles.btnGuardarText}>Guardar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E8EAF0' },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, elevation: 2 },
  cardIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  cardLeft: { flex: 1 },
  cardTitulo: { color: '#1A1A1A', fontSize: 16, fontWeight: 'bold' },
  cardSub: { color: '#888', fontSize: 12, marginTop: 2 },
  badge: { marginTop: 6, alignSelf: 'flex-start', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { fontSize: 11, fontWeight: 'bold' },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyText: { color: '#aaa', fontSize: 18, marginTop: 16 },
  emptySubText: { color: '#bbb', fontSize: 13, marginTop: 6 },
  fab: { position: 'absolute', bottom: 24, right: 24, backgroundColor: '#7C3AED', width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center', elevation: 5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalTitulo: { color: '#1A1A1A', fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  input: { backgroundColor: '#E8EAF0', color: '#222', borderRadius: 10, padding: 12, marginBottom: 12, fontSize: 15 },
  label: { color: '#888', fontSize: 13, marginBottom: 8 },
  tiposRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  tipoBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#E8EAF0' },
  tipoText: { fontSize: 13, fontWeight: '600', color: '#555' },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 8 },
  btnCancelar: { flex: 1, padding: 14, borderRadius: 10, backgroundColor: '#E8EAF0', alignItems: 'center' },
  btnCancelarText: { color: '#888', fontWeight: 'bold' },
  btnGuardar: { flex: 1, padding: 14, borderRadius: 10, backgroundColor: '#7C3AED', alignItems: 'center' },
  btnGuardarText: { color: '#fff', fontWeight: 'bold' },
});