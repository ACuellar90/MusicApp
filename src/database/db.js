import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('musicapp3.db');

export const initDB = () => {
  db.withTransactionSync(() => {
    db.runSync(`CREATE TABLE IF NOT EXISTS canciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      artista TEXT,
      tono TEXT,
      bpm INTEGER,
      letra TEXT,
      acordes TEXT,
      categoria TEXT DEFAULT 'General',
      fecha_creacion TEXT DEFAULT (datetime('now'))
    )`);

    db.runSync(`CREATE TABLE IF NOT EXISTS categorias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL UNIQUE
    )`);

    db.runSync(`INSERT OR IGNORE INTO categorias (nombre) VALUES ('General')`);
    db.runSync(`INSERT OR IGNORE INTO categorias (nombre) VALUES ('Misa')`);
    db.runSync(`INSERT OR IGNORE INTO categorias (nombre) VALUES ('Concierto')`);

    db.runSync(`CREATE TABLE IF NOT EXISTS setlists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      fecha TEXT,
      fecha_creacion TEXT DEFAULT (datetime('now'))
    )`);

    db.runSync(`CREATE TABLE IF NOT EXISTS setlist_canciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      setlist_id INTEGER,
      cancion_id INTEGER,
      orden INTEGER,
      FOREIGN KEY (setlist_id) REFERENCES setlists(id),
      FOREIGN KEY (cancion_id) REFERENCES canciones(id)
    )`);

    db.runSync(`CREATE TABLE IF NOT EXISTS eventos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      fecha TEXT,
      hora TEXT,
      lugar TEXT,
      tipo TEXT DEFAULT 'Otro',
      notas TEXT,
      fecha_creacion TEXT DEFAULT (datetime('now'))
    )`);
  });
};

export const getCanciones = () => {
  return db.getAllSync('SELECT * FROM canciones ORDER BY titulo ASC');
};

export const addCancion = (cancion) => {
  const { titulo, artista, tono, bpm, letra, acordes, categoria } = cancion;
  return db.runSync(
    'INSERT INTO canciones (titulo, artista, tono, bpm, letra, acordes, categoria) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [titulo, artista || '', tono || '', bpm || null, letra || '', acordes || '', categoria || 'General']
  );
};

export const deleteCancion = (id) => {
  return db.runSync('DELETE FROM canciones WHERE id = ?', [id]);
};

export const getCategorias = () => {
  return db.getAllSync('SELECT * FROM categorias ORDER BY nombre ASC');
};

export const addCategoria = (nombre) => {
  return db.runSync('INSERT OR IGNORE INTO categorias (nombre) VALUES (?)', [nombre]);
};

export const updateCancion = (id, cancion) => {
  const { titulo, artista, tono, bpm, letra, acordes, categoria } = cancion;
  return db.runSync(
    'UPDATE canciones SET titulo=?, artista=?, tono=?, bpm=?, letra=?, acordes=?, categoria=? WHERE id=?',
    [titulo, artista || '', tono || '', bpm || null, letra || '', acordes || '', categoria || 'General', id]
  );
};

// SETLISTS
export const getSetlists = () => {
  return db.getAllSync('SELECT * FROM setlists ORDER BY fecha_creacion DESC');
};

export const addSetlist = (nombre, fecha) => {
  return db.runSync('INSERT INTO setlists (nombre, fecha) VALUES (?, ?)', [nombre, fecha || '']);
};

export const deleteSetlist = (id) => {
  db.runSync('DELETE FROM setlist_canciones WHERE setlist_id = ?', [id]);
  db.runSync('DELETE FROM setlists WHERE id = ?', [id]);
};

export const getCancionesSetlist = (setlist_id) => {
  return db.getAllSync(`
    SELECT c.*, sc.orden FROM canciones c
    JOIN setlist_canciones sc ON c.id = sc.cancion_id
    WHERE sc.setlist_id = ?
    ORDER BY sc.orden ASC
  `, [setlist_id]);
};

export const addCancionSetlist = (setlist_id, cancion_id, orden) => {
  return db.runSync('INSERT INTO setlist_canciones (setlist_id, cancion_id, orden) VALUES (?, ?, ?)', [setlist_id, cancion_id, orden]);
};

export const deleteCancionSetlist = (setlist_id, cancion_id) => {
  return db.runSync('DELETE FROM setlist_canciones WHERE setlist_id = ? AND cancion_id = ?', [setlist_id, cancion_id]);
};

export const updateOrdenSetlist = (setlist_id, canciones) => {
  canciones.forEach((c, index) => {
    db.runSync('UPDATE setlist_canciones SET orden = ? WHERE setlist_id = ? AND cancion_id = ?', [index, setlist_id, c.id]);
  });
};

// EVENTOS
export const getEventos = () => {
  return db.getAllSync('SELECT * FROM eventos ORDER BY fecha ASC');
};

export const addEvento = (evento) => {
  const { nombre, fecha, hora, lugar, tipo, notas } = evento;
  return db.runSync(
    'INSERT INTO eventos (nombre, fecha, hora, lugar, tipo, notas) VALUES (?, ?, ?, ?, ?, ?)',
    [nombre, fecha || '', hora || '', lugar || '', tipo || 'Otro', notas || '']
  );
};

export const deleteEvento = (id) => {
  return db.runSync('DELETE FROM eventos WHERE id = ?', [id]);
};

export default db;