import { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions, StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function TeleprompterScreen({ route, navigation }) {
  const { cancion } = route.params;
  const [playing, setPlaying] = useState(false);
  const [fontSize, setFontSize] = useState(22);
  const [velocidad, setVelocidad] = useState(1);
  const velocidades = [0.25, 0.5, 0.75, 1, 2, 3, 4, 5, 6, 7, 8];
  const scrollRef = useRef(null);
  const scrollY = useRef(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
    return () => clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    clearInterval(intervalRef.current);
    if (playing) {
      intervalRef.current = setInterval(() => {
        scrollY.current += velocidad;
        scrollRef.current?.scrollTo({ y: scrollY.current, animated: false });
      }, 16);
    }
  }, [playing, velocidad]);

  const texto = cancion.letra || 'No hay letra agregada para esta canción.';

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* Controles superiores */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.topTitulo} numberOfLines={1}>{cancion.titulo}</Text>
        <View style={styles.fontControls}>
          <TouchableOpacity onPress={() => setFontSize(f => Math.max(14, f - 2))} style={styles.iconBtn}>
            <Ionicons name="remove" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.fontSizeText}>{fontSize}</Text>
          <TouchableOpacity onPress={() => setFontSize(f => Math.min(40, f + 2))} style={styles.iconBtn}>
            <Ionicons name="add" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Letra */}
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        scrollEventThrottle={16}
        onScroll={e => { scrollY.current = e.nativeEvent.contentOffset.y; }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.letra, { fontSize }]}>{texto}</Text>
        <View style={{ height: 300 }} />
      </ScrollView>

      {/* Controles inferiores */}
      <View style={styles.bottomBar}>
        {/* Velocidad */}
        <View style={styles.velocidadRow}>
          <TouchableOpacity onPress={() => {
            const idx = velocidades.indexOf(velocidad);
            if (idx > 0) setVelocidad(velocidades[idx - 1]);
          }} style={styles.iconBtn}>
            <Ionicons name="remove-circle-outline" size={26} color="#aaa" />
          </TouchableOpacity>
          <Text style={styles.velocidadText}>Vel: {velocidad}</Text>
          <TouchableOpacity onPress={() => {
            const idx = velocidades.indexOf(velocidad);
            if (idx < velocidades.length - 1) setVelocidad(velocidades[idx + 1]);
          }} style={styles.iconBtn}>
            <Ionicons name="add-circle-outline" size={26} color="#aaa" />
          </TouchableOpacity>
        </View>

        {/* Play/Pause */}
        <TouchableOpacity
          style={styles.playBtn}
          onPress={() => setPlaying(p => !p)}
        >
          <Ionicons name={playing ? 'pause' : 'play'} size={32} color="#1A1A1A" />
        </TouchableOpacity>

        {/* Reset */}
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => {
            setPlaying(false);
            scrollY.current = 0;
            scrollRef.current?.scrollTo({ y: 0, animated: true });
          }}
        >
          <Ionicons name="refresh" size={26} color="#aaa" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1A2E' },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingTop: 40, paddingBottom: 10, backgroundColor: '#252540' },
  topTitulo: { flex: 1, color: '#fff', fontSize: 16, fontWeight: 'bold', marginHorizontal: 8 },
  fontControls: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  fontSizeText: { color: '#aaa', fontSize: 14, minWidth: 24, textAlign: 'center' },
  iconBtn: { padding: 6 },
  scroll: { flex: 1, paddingHorizontal: 20 },
  letra: { color: '#fff', lineHeight: 38, marginTop: 20 },
  bottomBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#252540', paddingHorizontal: 24, paddingVertical: 16 },
  velocidadRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  velocidadText: { color: '#aaa', fontSize: 13, minWidth: 45, textAlign: 'center' },
  playBtn: { backgroundColor: '#7C3AED', width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', elevation: 4 },
});