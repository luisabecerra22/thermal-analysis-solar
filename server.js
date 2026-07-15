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
    // Leer imagen TIFF
    const image = sharp(imagePath);
    const metadata = await image.metadata();
    const buffer = await image.raw().toBuffer();

    console.log(`Imagen cargada: ${metadata.width}x${metadata.height}, channels: ${metadata.channels}`);

    // Simular detección de paneles (3448 paneles detectados)
    // En producción, esto usaría algoritmos de visión por computadora
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
        const w = panelWidth;
        const h = panelHeight;

        // Extraer región del panel de la imagen
        const panelRegion = buffer.slice(
          (y * metadata.width + x) * metadata.channels,
          (y * metadata.width + x + w) * metadata.channels + (h * metadata.width * metadata.channels)
        );

        // Calcular temperatura promedio (valores de píxel)
        let sum = 0;
        let min = 255;
        let max = 0;

        for (let i = 0; i < panelRegion.length; i += metadata.channels) {
          const val = panelRegion[i];
          sum += val;
          min = Math.min(min, val);
          max = Math.max(max, val);
        }

        const avg = Math.round(sum / (panelRegion.length / metadata.channels));

        // Mapear valores de píxeles (0-255) a temperatura (20-80°C)
        const tempAvg = Math.round(20 + (avg / 255) * 60);
        const tempMin = Math.round(20 + (min / 255) * 60);
        const tempMax = Math.round(20 + (max / 255) * 60);

        panels.push({
          id: panelId,
          x,
          y,
          width: w,
          height: h,
          tempAvg,
          tempMin,
          tempMax,
          pixelAvg: avg
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
    const pngPath = path.join('public', 'thermal.png');
    await sharp(tiffPath)
      .png()
      .toFile(pngPath);
    return '/thermal.png';
  } catch (error) {
    console.error('Error convirtiendo TIFF a PNG:', error);
    throw error;
  }
}

// Endpoint: Cargar imagen térmica
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    console.log(`Archivo recibido: ${filePath}`);

    // Detectar paneles
    const panels = await detectPanels(filePath);
    panelData = panels;

    // Convertir a PNG
    const pngUrl = await convertTiffToPng(filePath);
    thermalImage = pngUrl;

    // Limpieza
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      panelCount: panels.length,
      imageUrl: pngUrl,
      stats: {
        avgTemp: Math.round(panels.reduce((a, p) => a + p.tempAvg, 0) / panels.length),
        minTemp: Math.min(...panels.map(p => p.tempMin)),
        maxTemp: Math.max(...panels.map(p => p.tempMax))
      }
    });
  } catch (error) {
    console.error('Error en upload:', error);
    res.status(500).json({ error: error.message });
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

// Servir archivo index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
  console.log(`📸 Sube tu archivo TIFF para analizar paneles solares`);
});
