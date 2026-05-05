import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, Modal, KeyboardAvoidingView, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getCategorias, getSubcategorias, addCategoria, deleteCategoria, updateCategoria } from '../database/db';

function NodoCategoria({ categoria, nivel, onAgregar, onEditar, onEliminar }) {
  const [expandida, setExpandida] = useState(false);
  const [hijos, setHijos] = useState([]);

  const toggleExpandir = () => {
    if (!expandida) {
      setHijos(getSubcategorias(categoria.id));
    }
    setExpandida(!expandida);
  };

  const recargarHijos = () => {
    setHijos(getSubcategorias(categoria.id));
  };

  const colorNivel = nivel === 0 ? '#7C3AED' : nivel === 1 ? '#2196F3' : nivel === 2 ? '#E91E63' : '#FF9800';

  return (
    <View style={styles.nodoContainer}>
      <View style={[styles.nodoCard, { borderLeftColor: colorNivel, borderLeftWidth: 3 }]}>
        <TouchableOpacity style={styles.nodoMain} onPress={toggleExpandir}>
          <View style={{ width: nivel * 12 }} />
          <Ionicons name={expandida ? 'chevron-down' : 'chevron-forward'} size={16} color={colorNivel} />
          <Text style={[styles.nodoNombre, { color: nivel === 0 ? '#1A1A1A' : '#333' }]}>
            {categoria.nombre}
          </Text>
        </TouchableOpacity>
        <View style={styles.acciones}>
          <TouchableOpacity onPress={() => onAgregar(categoria.id, recargarHijos)} style={styles.accionBtn}>
            <Ionicons name="add" size={18} color={colorNivel} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onEditar(categoria, recargarHijos)} style={styles.accionBtn}>
            <Ionicons name="pencil-outline" size={16} color="#888" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onEliminar(categoria)} style={styles.accionBtn}>
            <Ionicons name="trash-outline" size={16} color="#FF4444" />
          </TouchableOpacity>
        </View>
      </View>

      {expandida && (
        <View style={{ paddingLeft: 12 }}>
          {hijos.map(hijo => (
            <NodoCategoria
              key={hijo.id}
              categoria={hijo}
              nivel={nivel + 1}
              onAgregar={onAgregar}
              onEditar={onEditar}
              onEliminar={onEliminar}
            />
          ))}
          <TouchableOpacity
            style={[styles.addHijoBtn, { marginLeft: (nivel + 1) * 12 }]}
            onPress={() => onAgregar(categoria.id, recargarHijos)}
          >
            <Ionicons name="add-circle-outline" size={15} color={colorNivel} />
            <Text style={[styles.addHijoText, { color: colorNivel }]}>Agregar subcategoría</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export default function CategoriasScreen() {
  const [categorias, setCategorias] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [nombre, setNombre] = useState('');
  const [padreId, setPadreId] = useState(null);
  const [editando, setEditando] = useState(null);
  const [callbackRecargar, setCallbackRecargar] = useState(null);

  useEffect(() => { cargarCategorias(); }, []);

  const cargarCategorias = () => setCategorias(getCategorias());

  const abrirModalNueva = (padre, callback) => {
    setPadreId(padre);
    setNombre('');
    setCallbackRecargar(() => callback);
    setModalVisible(true);
  };

  const guardar = () => {
    if (!nombre.trim()) {
      Alert.alert('Error', 'El nombre es obligatorio');
      return;
    }
    addCategoria(nombre, padreId);
    setModalVisible(false);
    setNombre('');
    if (padreId && callbackRecargar) {
      callbackRecargar();
    } else {
      cargarCategorias();
    }
  };

  const abrirEditar = (cat, callback) => {
    setEditando(cat);
    setNombre(cat.nombre);
    setCallbackRecargar(() => callback);
    setModalEditar(true);
  };

  const guardarEdicion = () => {
    if (!nombre.trim()) return;
    updateCategoria(editando.id, nombre);
    setModalEditar(false);
    if (callbackRecargar) callbackRecargar();
    cargarCategorias();
  };

  const confirmarEliminar = (cat) => {
    Alert.alert('Eliminar', `¿Eliminar "${cat.nombre}" y todo su contenido?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => { deleteCategoria(cat.id); cargarCategorias(); } }
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        {categorias.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="folder-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>No hay categorías aún</Text>
            <Text style={styles.emptySubText}>Tocá el + para crear tu primera categoría</Text>
          </View>
        ) : (
          categorias.map(cat => (
            <NodoCategoria
              key={cat.id}
              categoria={cat}
              nivel={0}
              onAgregar={abrirModalNueva}
              onEditar={abrirEditar}
              onEliminar={confirmarEliminar}
            />
          ))
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => abrirModalNueva(null, null)}>
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      {/* Modal nueva */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitulo}>
                {padreId ? 'Nueva Subcategoría' : 'Nueva Categoría'}
              </Text>
              <TextInput style={styles.input} placeholder="Nombre *"
                placeholderTextColor="#aaa" value={nombre} onChangeText={setNombre} />
              <View style={styles.modalBtns}>
                <TouchableOpacity style={styles.btnCancelar} onPress={() => setModalVisible(false)}>
                  <Text style={styles.btnCancelarText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnGuardar} onPress={guardar}>
                  <Text style={styles.btnGuardarText}>Guardar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal editar */}
      <Modal visible={modalEditar} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitulo}>Editar</Text>
              <TextInput style={styles.input} placeholder="Nombre *"
                placeholderTextColor="#aaa" value={nombre} onChangeText={setNombre} />
              <View style={styles.modalBtns}>
                <TouchableOpacity style={styles.btnCancelar} onPress={() => setModalEditar(false)}>
                  <Text style={styles.btnCancelarText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnGuardar} onPress={guardarEdicion}>
                  <Text style={styles.btnGuardarText}>Guardar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E8EAF0' },
  nodoContainer: { marginBottom: 6 },
  nodoCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, padding: 12, elevation: 1 },
  nodoMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  nodoNombre: { fontSize: 15, fontWeight: '600', flex: 1 },
  acciones: { flexDirection: 'row', gap: 2 },
  accionBtn: { padding: 6 },
  addHijoBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 8, marginBottom: 4 },
  addHijoText: { fontSize: 13 },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyText: { color: '#aaa', fontSize: 18, marginTop: 16 },
  emptySubText: { color: '#bbb', fontSize: 13, marginTop: 6 },
  fab: { position: 'absolute', bottom: 24, right: 24, backgroundColor: '#7C3AED', width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center', elevation: 5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalTitulo: { color: '#1A1A1A', fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  input: { backgroundColor: '#E8EAF0', color: '#222', borderRadius: 10, padding: 12, marginBottom: 12, fontSize: 15 },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 8 },
  btnCancelar: { flex: 1, padding: 14, borderRadius: 10, backgroundColor: '#E8EAF0', alignItems: 'center' },
  btnCancelarText: { color: '#888', fontWeight: 'bold' },
  btnGuardar: { flex: 1, padding: 14, borderRadius: 10, backgroundColor: '#7C3AED', alignItems: 'center' },
  btnGuardarText: { color: '#fff', fontWeight: 'bold' },
});