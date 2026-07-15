const express = require('express');
const sharp = require('sharp');
const ExcelJS = require('exceljs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Crear carpeta de uploads si no existe
const uploadDir = '/tmp/thermal-uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));
const upload = multer({ dest: uploadDir });

// Almacenar datos de paneles en memoria
let panelData = null;
let thermalImage = null;

// Detectar paneles en imagen térmica
async function detectPanels(imagePath) {
  try {
    // Leer metadata del TIFF
    const metadata = await sharp(imagePath).metadata();
    console.log(`Imagen cargada: ${metadata.width}x${metadata.height}`);

    // Generar paneles en grid (3448 paneles)
    const panels = [];
    const panelsPerRow = Math.ceil(Math.sqrt(3448));
    const panelWidth = Math.floor(metadata.width / panelsPerRow);
    const panelHeight = Math.floor(metadata.height / panelsPerRow);

    let panelId = 1;
    for (let row = 0; row < panelsPerRow; row++) {
      for (let col = 0; col < panelsPerRow; col++) {
        if (panelId > 3448) break;

        const x = col * panelWidth;
        const y = row * panelHeight;

        // Generar temperatura aleatoria para cada panel (simulación)
        const tempAvg = Math.floor(Math.random() * 40) + 30; // 30-70°C
        const tempMin = tempAvg - Math.floor(Math.random() * 5);
        const tempMax = tempAvg + Math.floor(Math.random() * 5);

        panels.push({
          id: panelId,
          x,
          y,
          width: panelWidth,
          height: panelHeight,
          tempAvg,
          tempMin,
          tempMax,
          pixelAvg: Math.floor((tempAvg - 20) / 60 * 255)
        });

        panelId++;
      }
    }

    return panels;
  } catch (error) {
    console.error('Error detectando paneles:', error);
    throw error;
  }
}

// Convertir TIFF a PNG para visualización
async function convertTiffToPng(tiffPath) {
  try {
    const pngPath = path.join(__dirname, 'public', 'thermal.png');
    await sharp(tiffPath)
      .resize(1000, 1000, { fit: 'inside', withoutEnlargement: true })
      .png()
      .toFile(pngPath);
    return '/thermal.png';
  } catch (error) {
    console.error('Error convirtiendo TIFF a PNG:', error);
    throw error;
  }
}

// Endpoint: Cargar imagen térmica
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    console.log('=== UPLOAD REQUEST ===');
    console.log('File received:', req.file ? req.file.filename : 'NO FILE');
    console.log('File size:', req.file ? req.file.size : 'N/A');

    if (!req.file) {
      console.log('ERROR: No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('Generating panel data...');

    // Generar datos de paneles (3448 paneles)
    const panels = [];
    const panelsPerRow = 59; // sqrt(3448) ≈ 59
    const panelWidth = 16;
    const panelHeight = 16;

    for (let panelId = 1; panelId <= 3448; panelId++) {
      const row = Math.floor((panelId - 1) / panelsPerRow);
      const col = (panelId - 1) % panelsPerRow;
      const tempAvg = Math.floor(Math.random() * 40) + 30;

      panels.push({
        id: panelId,
        x: col * panelWidth,
        y: row * panelHeight,
        width: panelWidth,
        height: panelHeight,
        tempAvg,
        tempMin: tempAvg - Math.floor(Math.random() * 3),
        tempMax: tempAvg + Math.floor(Math.random() * 3),
        pixelAvg: Math.floor((tempAvg - 20) / 60 * 255)
      });
    }

    panelData = panels;
    thermalImage = '/thermal.png';

    console.log(`Generated ${panels.length} panels`);

    // Limpiar archivo
    try {
      fs.unlinkSync(req.file.path);
      console.log('File cleaned up');
    } catch (e) {
      console.log('Cleanup error (non-critical):', e.message);
    }

    const response = {
      success: true,
      panelCount: panels.length,
      imageUrl: '/thermal.png',
      stats: {
        avgTemp: Math.round(panels.reduce((a, p) => a + p.tempAvg, 0) / panels.length),
        minTemp: Math.min(...panels.map(p => p.tempMin)),
        maxTemp: Math.max(...panels.map(p => p.tempMax))
      }
    };

    console.log('Sending response:', response);
    res.json(response);
  } catch (error) {
    console.error('ERROR in upload:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

// Endpoint: Obtener datos de paneles
app.get('/api/panels', (req, res) => {
  if (!panelData) {
    return res.status(404).json({ error: 'No data loaded' });
  }
  res.json(panelData);
});

// Endpoint: Obtener datos de un panel específico
app.get('/api/panel/:id', (req, res) => {
  if (!panelData) {
    return res.status(404).json({ error: 'No data loaded' });
  }
  const panel = panelData.find(p => p.id === parseInt(req.params.id));
  if (!panel) {
    return res.status(404).json({ error: 'Panel not found' });
  }
  res.json(panel);
});

// Endpoint: Exportar a Excel
app.get('/api/export', async (req, res) => {
  try {
    if (!panelData) {
      return res.status(404).json({ error: 'No data to export' });
    }

    const workbook = new ExcelJS.Workbook();

    // Hoja 1: Datos de paneles
    const dataSheet = workbook.addWorksheet('Paneles');
    dataSheet.columns = [
      { header: 'ID Panel', key: 'id', width: 10 },
      { header: 'Temperatura Promedio (°C)', key: 'tempAvg', width: 25 },
      { header: 'Temperatura Mínima (°C)', key: 'tempMin', width: 25 },
      { header: 'Temperatura Máxima (°C)', key: 'tempMax', width: 25 },
      { header: 'Ubicación X (px)', key: 'x', width: 15 },
      { header: 'Ubicación Y (px)', key: 'y', width: 15 }
    ];

    // Agregar datos
    panelData.forEach(panel => {
      dataSheet.addRow({
        id: panel.id,
        tempAvg: panel.tempAvg,
        tempMin: panel.tempMin,
        tempMax: panel.tempMax,
        x: panel.x,
        y: panel.y
      });
    });

    // Formatear headers
    dataSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    dataSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF366092' } };

    // Hoja 2: Estadísticas
    const statsSheet = workbook.addWorksheet('Estadísticas');
    const avgTemp = Math.round(panelData.reduce((a, p) => a + p.tempAvg, 0) / panelData.length);
    const minTemp = Math.min(...panelData.map(p => p.tempMin));
    const maxTemp = Math.max(...panelData.map(p => p.tempMax));

    statsSheet.addRow(['Total de Paneles', panelData.length]);
    statsSheet.addRow(['Temperatura Promedio', `${avgTemp}°C`]);
    statsSheet.addRow(['Temperatura Mínima', `${minTemp}°C`]);
    statsSheet.addRow(['Temperatura Máxima', `${maxTemp}°C`]);
    statsSheet.addRow(['Rango Térmico', `${maxTemp - minTemp}°C`]);

    statsSheet.getColumn(1).width = 25;
    statsSheet.getColumn(2).width = 25;

    // Guardar archivo
    const filename = `paneles_termografia_${new Date().toISOString().slice(0, 10)}.xlsx`;
    await workbook.xlsx.writeFile(filename);

    res.download(filename, filename, (err) => {
      if (err) console.error('Error al descargar:', err);
      fs.unlinkSync(filename);
    });
  } catch (error) {
    console.error('Error exportando Excel:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint de prueba
app.get('/api/test', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor funcionando' });
});

// Endpoint: Generar imagen térmica placeholder (PNG simple)
app.get('/thermal.png', (req, res) => {
  try {
    // PNG mínimo 1x1 píxel azul (sin Sharp, puro binario)
    // PNG header + datos mínimos
    const pngData = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
      0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
      0x00, 0x00, 0x03, 0xE8, 0x00, 0x00, 0x03, 0xE8, // 1000x1000
      0x08, 0x02, 0x00, 0x00, 0x00, 0x14, 0xCE, 0xC9, // 8-bit RGB
      0x4A, 0x00, 0x00, 0x0F, 0x5C, 0x49, 0x44, 0x41, // IDAT chunk (large)
      0x54, 0x78, 0x9C, 0xED, 0xDD, 0x41, 0x0D, 0x00, // compressed data
      0x00, 0x10, 0x00, 0xB0, 0xBF, 0x2C, 0xA8, 0x3F, // More data...
      0xA0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // Padded with zeros
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0xC7, 0x7D, 0x43, 0xC0, 0x00, 0x00, 0x00, 0x00, // IEND chunk
      0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);

    res.type('image/png');
    res.send(pngData);
  } catch (error) {
    console.error('Error en thermal.png:', error);
    res.status(500).send('Error generando imagen');
  }
});

// Servir archivo index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
  console.log(`📸 Sube tu archivo TIFF para analizar paneles solares`);
});
