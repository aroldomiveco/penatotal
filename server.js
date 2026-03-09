const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Configurar almacenamiento con multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'public/uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'meme-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mime = allowedTypes.test(file.mimetype);
    ext && mime ? cb(null, true) : cb(new Error('Solo se permiten imágenes JPG, PNG o GIF'));
  }
});

app.use(express.static('public'));
app.use(express.json());

// Endpoint para subir imagen
app.post('/upload', upload.single('meme'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se subió ningún archivo' });
  }
  res.json({ 
    success: true, 
    imageUrl: `/uploads/${req.file.filename}`,
    filename: req.file.filename
  });
});

// Endpoint para listar imágenes
app.get('/images', (req, res) => {
  const uploadDir = 'public/uploads/';
  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Error al leer imágenes' });
    }
    const images = files
      .filter(f => /\.(jpeg|jpg|png|gif)$/i.test(f))
      .map(f => `/uploads/${f}`)
      .sort((a, b) => b.localeCompare(a)); // más reciente primero
    res.json(images);
  });
});

// Página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});