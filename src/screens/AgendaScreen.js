import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Alert, Modal, ScrollView, KeyboardAvoidingView, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { initDB, getEventos, addEvento, deleteEvento } from '../database/db';

export default function AgendaScreen({ navigation }) {
  const [eventos, setEventos] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({ nombre: '', fecha: '', hora: '', lugar: '', tipo: '', notas: '' });

  const cargarEventos = () => setEventos(getEventos());

  useEffect(() => { initDB(); cargarEventos(); }, []);
  useFocusEffect(useCallback(() => { cargarEventos(); }, []));

  const guardarEvento = () => {
    if (!form.nombre.trim() || !form.fecha.trim()) {
      Alert.alert('Error', 'Nombre y fecha son obligatorios');
      return;
    }
    addEvento(form);
    cargarEventos();
    setForm({ nombre: '', fecha: '', hora: '', lugar: '', tipo: '', notas: '' });
    setModalVisible(false);
  };

  const confirmarEliminar = (id, nombre) => {
    Alert.alert('Eliminar', `¿Eliminar "${nombre}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => { deleteEvento(id); cargarEventos(); } }
    ]);
  };

  const renderEvento = ({ item }) => (
    <TouchableOpacity style={styles.card}
      onPress={() => navigation.navigate('DetalleEvento', { evento: item })}
      onLongPress={() => confirmarEliminar(item.id, item.nombre)}>
      <View style={styles.cardIcon}>
        <Ionicons name="calendar" size={24} color="#7C3AED" />
      </View>
      <View style={styles.cardLeft}>
        <Text style={styles.cardTitulo}>{item.nombre}</Text>
        <Text style={styles.cardSub}>
          📅 {item.fecha}{item.hora ? ` • 🕐 ${item.hora}` : ''}{item.lugar ? ` • 📍 ${item.lugar}` : ''}
        </Text>
        {item.tipo ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.tipo}</Text>
          </View>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={20} color="#bbb" />
    </TouchableOpacity>
  );

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
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <View style={styles.modalOverlay}>
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }} keyboardShouldPersistTaps="handled">
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
                <TextInput style={styles.input} placeholder="Tipo (ej: Misa, Ensayo, Concierto)"
                  placeholderTextColor="#aaa" value={form.tipo} onChangeText={v => setForm({ ...form, tipo: v })} />
                <TextInput style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]}
                  placeholder="Notas adicionales" placeholderTextColor="#aaa"
                  multiline value={form.notas} onChangeText={v => setForm({ ...form, notas: v })} />
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
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E8EAF0' },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, elevation: 2 },
  cardIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#EDE9FF', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  cardLeft: { flex: 1 },
  cardTitulo: { color: '#1A1A1A', fontSize: 16, fontWeight: 'bold' },
  cardSub: { color: '#888', fontSize: 12, marginTop: 2 },
  badge: { marginTop: 6, alignSelf: 'flex-start', backgroundColor: '#EDE9FF', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { color: '#7C3AED', fontSize: 11, fontWeight: 'bold' },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyText: { color: '#aaa', fontSize: 18, marginTop: 16 },
  emptySubText: { color: '#bbb', fontSize: 13, marginTop: 6 },
  fab: { position: 'absolute', bottom: 24, right: 24, backgroundColor: '#7C3AED', width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center', elevation: 5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalTitulo: { color: '#1A1A1A', fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  input: { backgroundColor: '#E8EAF0', color: '#222', borderRadius: 10, padding: 12, marginBottom: 12, fontSize: 15 },
  label: { color: '#888', fontSize: 13, marginBottom: 8 },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 8 },
  btnCancelar: { flex: 1, padding: 14, borderRadius: 10, backgroundColor: '#E8EAF0', alignItems: 'center' },
  btnCancelarText: { color: '#888', fontWeight: 'bold' },
  btnGuardar: { flex: 1, padding: 14, borderRadius: 10, backgroundColor: '#7C3AED', alignItems: 'center' },
  btnGuardarText: { color: '#fff', fontWeight: 'bold' },
});