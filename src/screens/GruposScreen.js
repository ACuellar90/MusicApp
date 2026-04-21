import { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Alert, Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function GruposScreen() {
  const [grupos, setGrupos] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalUnirse, setModalUnirse] = useState(false);
  const [form, setForm] = useState({ nombre: '', descripcion: '' });
  const [codigo, setCodigo] = useState('');

  const generarCodigo = () => Math.random().toString(36).substring(2, 8).toUpperCase();

  const crearGrupo = () => {
    if (!form.nombre.trim()) {
      Alert.alert('Error', 'El nombre es obligatorio');
      return;
    }
    const nuevo = { id: Date.now(), nombre: form.nombre, descripcion: form.descripcion, codigo: generarCodigo(), miembros: 1, rol: 'Admin' };
    setGrupos(prev => [...prev, nuevo]);
    setForm({ nombre: '', descripcion: '' });
    setModalVisible(false);
  };

  const unirseGrupo = () => {
    if (!codigo.trim()) {
      Alert.alert('Error', 'Ingresá el código del grupo');
      return;
    }
    Alert.alert('Buscando...', `Código: ${codigo}\n(Función disponible con servidor en línea)`);
    setCodigo('');
    setModalUnirse(false);
  };

  const confirmarEliminar = (id, nombre) => {
    Alert.alert('Eliminar', `¿Eliminar "${nombre}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => setGrupos(prev => prev.filter(g => g.id !== id)) }
    ]);
  };

  const renderGrupo = ({ item }) => (
    <TouchableOpacity style={styles.card} onLongPress={() => confirmarEliminar(item.id, item.nombre)}>
      <View style={styles.cardIcon}>
        <Ionicons name="people" size={24} color="#7C3AED" />
      </View>
      <View style={styles.cardLeft}>
        <Text style={styles.cardTitulo}>{item.nombre}</Text>
        <Text style={styles.cardSub}>{item.descripcion || 'Sin descripción'}</Text>
        <View style={styles.cardRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.rol}</Text>
          </View>
          <Text style={styles.cardSub}> • {item.miembros} miembro(s)</Text>
          <TouchableOpacity onPress={() => Alert.alert('Código de invitación', `Compartí este código:\n\n${item.codigo}`, [{ text: 'OK' }])} style={styles.codigoBtn}>
            <Ionicons name="share-outline" size={16} color="#7C3AED" />
            <Text style={styles.codigoText}>{item.codigo}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={grupos}
        keyExtractor={item => item.id.toString()}
        renderItem={renderGrupo}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>No pertenecés a ningún grupo</Text>
            <Text style={styles.emptySubText}>Creá uno o unite con un código</Text>
          </View>
        }
      />

      {/* Dos botones abajo */}
      <View style={styles.fabRow}>
        <TouchableOpacity style={styles.fabSecundario} onPress={() => setModalUnirse(true)}>
          <Ionicons name="enter-outline" size={22} color="#7C3AED" />
          <Text style={styles.fabSecundarioText}>Unirme</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={28} color="#fff" />
          <Text style={styles.fabText}>Crear grupo</Text>
        </TouchableOpacity>
      </View>

      {/* Modal crear grupo */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>Nuevo Grupo</Text>
            <TextInput style={styles.input} placeholder="Nombre del grupo *"
              placeholderTextColor="#aaa" value={form.nombre} onChangeText={v => setForm({ ...form, nombre: v })} />
            <TextInput style={styles.input} placeholder="Descripción (opcional)"
              placeholderTextColor="#aaa" value={form.descripcion} onChangeText={v => setForm({ ...form, descripcion: v })} />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.btnCancelar} onPress={() => setModalVisible(false)}>
                <Text style={styles.btnCancelarText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnGuardar} onPress={crearGrupo}>
                <Text style={styles.btnGuardarText}>Crear</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal unirse */}
      <Modal visible={modalUnirse} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>Unirme a un grupo</Text>
            <Text style={styles.modalSub}>Pedile el código de invitación al administrador del grupo.</Text>
            <TextInput style={styles.input} placeholder="Código de invitación"
              placeholderTextColor="#aaa" autoCapitalize="characters"
              value={codigo} onChangeText={setCodigo} />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.btnCancelar} onPress={() => setModalUnirse(false)}>
                <Text style={styles.btnCancelarText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnGuardar} onPress={unirseGrupo}>
                <Text style={styles.btnGuardarText}>Unirme</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
  cardSub: { color: '#888', fontSize: 13, marginTop: 2 },
  cardRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, flexWrap: 'wrap' },
  badge: { backgroundColor: '#EDE9FF', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { color: '#7C3AED', fontSize: 11, fontWeight: 'bold' },
  codigoBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 8 },
  codigoText: { color: '#7C3AED', fontSize: 12, fontWeight: 'bold' },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyText: { color: '#aaa', fontSize: 16, marginTop: 16 },
  emptySubText: { color: '#bbb', fontSize: 13, marginTop: 6 },
  fabRow: { position: 'absolute', bottom: 24, right: 16, flexDirection: 'row', gap: 12, alignItems: 'center' },
  fabSecundario: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, elevation: 3 },
  fabSecundarioText: { color: '#7C3AED', fontWeight: 'bold', fontSize: 14 },
  fab: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#7C3AED', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, elevation: 5 },
  fabText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalTitulo: { color: '#1A1A1A', fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  modalSub: { color: '#888', fontSize: 13, marginBottom: 16 },
  input: { backgroundColor: '#E8EAF0', color: '#222', borderRadius: 10, padding: 12, marginBottom: 12, fontSize: 15 },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 8 },
  btnCancelar: { flex: 1, padding: 14, borderRadius: 10, backgroundColor: '#E8EAF0', alignItems: 'center' },
  btnCancelarText: { color: '#888', fontWeight: 'bold' },
  btnGuardar: { flex: 1, padding: 14, borderRadius: 10, backgroundColor: '#7C3AED', alignItems: 'center' },
  btnGuardarText: { color: '#fff', fontWeight: 'bold' },
});