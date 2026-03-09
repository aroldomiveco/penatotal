const express = require('express');
const { put } = require('@vercel/blob');
const path = require('path');

const app = express();

// Servir archivos estáticos (CSS, JS, imágenes subidas localmente si las hubiera)
app.use(express.static(path.join(__dirname, '../public')));

// Endpoint para subir imagen a Vercel Blob
app.post('/upload', express.raw({ type: 'image/*', limit: '5mb' }), async (req, res) => {
  try {
    if (!req.body || req.body.length === 0) {
      return res.status(400).json({ error: 'No se subió ningún archivo' });
    }

    const filename = `meme-${Date.now()}-${Math.round(Math.random() * 1E9)}.jpg`;
    const blob = await put(filename, req.body, {
      access: 'public',
      contentType: req.headers['content-type'],
      addRandomSuffix: true,
    });

    res.json({ success: true, imageUrl: blob.url, filename });
  } catch (error) {
    console.error('Error en /upload:', error);
    res.status(500).json({ error: 'Error al subir la imagen' });
  }
});

// Endpoint para listar imágenes (simplificado: devuelve un array vacío, puedes modificarlo para usar una DB)
app.get('/images', (req, res) => {
  // Si quieres persistencia entre usuarios, aquí deberías consultar una base de datos
  // Por ahora, devolvemos un array vacío y el frontend usará localStorage
  res.json([]);
});

// Ruta principal: sirve el archivo HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/index.html'));
});

// Exportar la app para Vercel (no usar app.listen)
module.exports = app;