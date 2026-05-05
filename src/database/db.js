import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('musicapp6.db');

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
      fecha_creacion TEXT DEFAULT (datetime('now'))
    )`);

    db.runSync(`CREATE TABLE IF NOT EXISTS categorias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      padre_id INTEGER,
      FOREIGN KEY (padre_id) REFERENCES categorias(id)
    )`);

    db.runSync(`CREATE TABLE IF NOT EXISTS cancion_categorias (
      cancion_id INTEGER,
      categoria_id INTEGER,
      PRIMARY KEY (cancion_id, categoria_id),
      FOREIGN KEY (cancion_id) REFERENCES canciones(id),
      FOREIGN KEY (categoria_id) REFERENCES categorias(id)
    )`);

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

    db.runSync(`CREATE TABLE IF NOT EXISTS evento_canciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      evento_id INTEGER,
      cancion_id INTEGER,
      orden INTEGER,
      FOREIGN KEY (evento_id) REFERENCES eventos(id),
      FOREIGN KEY (cancion_id) REFERENCES canciones(id)
    )`);
  });
};

export const getCanciones = () => {
  return db.getAllSync('SELECT * FROM canciones ORDER BY titulo ASC');
};

export const addCancion = (cancion) => {
  const { titulo, artista, tono, bpm, letra, acordes } = cancion;
  return db.runSync(
    'INSERT INTO canciones (titulo, artista, tono, bpm, letra, acordes) VALUES (?, ?, ?, ?, ?, ?)',
    [titulo, artista || '', tono || '', bpm || null, letra || '', acordes || '']
  );
};

export const deleteCancion = (id) => {
  return db.runSync('DELETE FROM canciones WHERE id = ?', [id]);
};

// CATEGORIAS
export const getCategorias = () => {
  return db.getAllSync('SELECT * FROM categorias WHERE padre_id IS NULL ORDER BY nombre ASC');
};

export const getSubcategorias = (padre_id) => {
  return db.getAllSync('SELECT * FROM categorias WHERE padre_id = ? ORDER BY nombre ASC', [padre_id]);
};

export const addCategoria = (nombre, padre_id = null) => {
  return db.runSync('INSERT INTO categorias (nombre, padre_id) VALUES (?, ?)', [nombre, padre_id]);
};

export const deleteCategoria = (id) => {
  db.runSync('DELETE FROM categorias WHERE padre_id = ?', [id]);
  db.runSync('DELETE FROM cancion_categorias WHERE categoria_id = ?', [id]);
  db.runSync('DELETE FROM categorias WHERE id = ?', [id]);
};

export const updateCategoria = (id, nombre) => {
  return db.runSync('UPDATE categorias SET nombre = ? WHERE id = ?', [nombre, id]);
};

// CATEGORIAS DE CANCION
export const getCategoriasCancion = (cancion_id) => {
  return db.getAllSync(`
    SELECT c.* FROM categorias c
    JOIN cancion_categorias cc ON c.id = cc.categoria_id
    WHERE cc.cancion_id = ?
  `, [cancion_id]);
};

export const addCategoriaCancion = (cancion_id, categoria_id) => {
  return db.runSync('INSERT OR IGNORE INTO cancion_categorias (cancion_id, categoria_id) VALUES (?, ?)', [cancion_id, categoria_id]);
};

export const removeCategoriaCancion = (cancion_id, categoria_id) => {
  return db.runSync('DELETE FROM cancion_categorias WHERE cancion_id = ? AND categoria_id = ?', [cancion_id, categoria_id]);
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
    [nombre, fecha || '', hora || '', lugar || '', tipo || '', notas || '']
  );
};

export const deleteEvento = (id) => {
  db.runSync('DELETE FROM evento_canciones WHERE evento_id = ?', [id]);
  return db.runSync('DELETE FROM eventos WHERE id = ?', [id]);
};

// CANCIONES DE EVENTO
export const getCancionesEvento = (evento_id) => {
  return db.getAllSync(`
    SELECT c.*, ec.orden FROM canciones c
    JOIN evento_canciones ec ON c.id = ec.cancion_id
    WHERE ec.evento_id = ?
    ORDER BY ec.orden ASC
  `, [evento_id]);
};

export const addCancionEvento = (evento_id, cancion_id, orden) => {
  return db.runSync(
    'INSERT INTO evento_canciones (evento_id, cancion_id, orden) VALUES (?, ?, ?)',
    [evento_id, cancion_id, orden]
  );
};

export const deleteCancionEvento = (evento_id, cancion_id) => {
  return db.runSync(
    'DELETE FROM evento_canciones WHERE evento_id = ? AND cancion_id = ?',
    [evento_id, cancion_id]
  );
};

export const updateOrdenEvento = (evento_id, canciones) => {
  canciones.forEach((c, index) => {
    db.runSync(
      'UPDATE evento_canciones SET orden = ? WHERE evento_id = ? AND cancion_id = ?',
      [index, evento_id, c.id]
    );
  });
};

export const updateCancion = (id, cancion) => {
  const { titulo, artista, tono, bpm, letra, acordes } = cancion;
  return db.runSync(
    'UPDATE canciones SET titulo=?, artista=?, tono=?, bpm=?, letra=?, acordes=? WHERE id=?',
    [titulo, artista || '', tono || '', bpm || null, letra || '', acordes || '', id]
  );
};

export default db;