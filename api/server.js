const express = require('express');
const { put } = require('@vercel/blob');
const path = require('path');

const app = express();

// Servir archivos estáticos (desde /public)
app.use(express.static(path.join(__dirname, '../public')));

// Endpoint para subir imagen (usando Vercel Blob)
app.post('/upload', express.raw({ type: 'image/*', limit: '5mb' }), async (req, res) => {
  try {
    if (!req.body || req.body.length === 0) {
      return res.status(400).json({ error: 'No se subió archivo' });
    }

    const filename = `meme-${Date.now()}-${Math.round(Math.random() * 1E9)}.jpg`;
    const blob = await put(filename, req.body, {
      access: 'public',
      contentType: req.headers['content-type'],
      addRandomSuffix: true,
    });

    res.json({ success: true, imageUrl: blob.url, filename });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al subir' });
  }
});

// Endpoint para listar imágenes (deberías obtener de una DB)
// Por simplicidad, aquí devolvemos un array vacío y usarás localStorage en el frontend
app.get('/images', (req, res) => {
  res.json([]);
});

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/index.html'));
});

// Exportar para Vercel
module.exports = app;