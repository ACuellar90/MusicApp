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

export default db;