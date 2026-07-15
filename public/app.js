// Variables globales
let panelData = null;
let thermalImage = null;
let canvas = null;
let ctx = null;
let imageData = null;
let currentHoverPanel = null;

// Elementos del DOM
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const loadingSpinner = document.getElementById('loadingSpinner');
const statsSection = document.getElementById('statsSection');
const actionsSection = document.getElementById('actionsSection');
const viewerContainer = document.getElementById('viewerContainer');
const exportBtn = document.getElementById('exportBtn');
const resetBtn = document.getElementById('resetBtn');
const panelInfo = document.getElementById('panelInfo');
const panelSearch = document.getElementById('panelSearch');
const searchBtn = document.getElementById('searchBtn');
const searchResult = document.getElementById('searchResult');

// Event Listeners
uploadArea.addEventListener('click', () => fileInput.click());
uploadArea.addEventListener('dragover', handleDragOver);
uploadArea.addEventListener('drop', handleDrop);
fileInput.addEventListener('change', handleFileSelect);
exportBtn.addEventListener('click', exportToExcel);
resetBtn.addEventListener('click', resetApp);
searchBtn.addEventListener('click', searchPanel);
panelSearch.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') searchPanel();
});

// Manejo de arrastrar archivo
function handleDragOver(e) {
  e.preventDefault();
  uploadArea.style.background = '#f0f2ff';
  uploadArea.style.borderColor = '#764ba2';
}

function handleDrop(e) {
  e.preventDefault();
  uploadArea.style.background = '';
  uploadArea.style.borderColor = '';
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    fileInput.files = files;
    handleFileSelect();
  }
}

function handleFileSelect() {
  const file = fileInput.files[0];
  if (!file) return;

  if (!file.name.toLowerCase().match(/\.(tif|tiff)$/)) {
    alert('Por favor, carga un archivo TIFF válido');
    return;
  }

  uploadFile(file);
}

async function uploadFile(file) {
  loadingSpinner.style.display = 'flex';
  uploadArea.style.display = 'none';

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Error al subir archivo');
    }

    const data = await response.json();
    console.log('Archivo procesado:', data);

    // Cargar datos de paneles
    await loadPanels();

    // Crear visualización directa (sin imagen externa)
    createThermalVisualization();

    // Actualizar estadísticas
    updateStats(data);

    // Mostrar interfaz
    setTimeout(() => {
      loadingSpinner.style.display = 'none';
      statsSection.style.display = 'block';
      actionsSection.style.display = 'flex';
    }, 500);

  } catch (error) {
    console.error('Error:', error);
    alert('Error al procesar archivo: ' + error.message);
    loadingSpinner.style.display = 'none';
    uploadArea.style.display = 'block';
  }
}

async function loadPanels() {
  try {
    const response = await fetch('/api/panels');
    if (!response.ok) throw new Error('Error cargando paneles');
    panelData = await response.json();
    console.log(`${panelData.length} paneles cargados`);
  } catch (error) {
    console.error('Error cargando paneles:', error);
    throw error;
  }
}

function createThermalVisualization() {
  if (!panelData) return;

  // Crear canvas
  canvas = document.getElementById('thermalCanvas');
  ctx = canvas.getContext('2d');

  // Dimensionar canvas al tamaño del contenedor
  const container = document.getElementById('viewerContainer');
  canvas.width = Math.max(800, container.clientWidth - 10);
  canvas.height = Math.max(600, container.clientHeight - 10);

  // Dibujar fondo
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Dibujar paneles
  panelData.forEach(panel => {
    const color = getThermalColor(panel.tempAvg);
    ctx.fillStyle = color;
    ctx.fillRect(panel.x, panel.y, panel.width, panel.height);

    // Borde
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(panel.x, panel.y, panel.width, panel.height);
  });

  // Mostrar canvas
  canvas.style.display = 'block';
  viewerContainer.innerHTML = '';
  viewerContainer.appendChild(canvas);

  // Event listeners
  canvas.addEventListener('mousemove', handleCanvasMouseMove);
  canvas.addEventListener('click', handleCanvasClick);
  canvas.addEventListener('mouseleave', handleCanvasMouseLeave);

  console.log(`Canvas creado: ${canvas.width}x${canvas.height}`);
}

async function loadThermalImage(imageUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Crear canvas
      canvas = document.getElementById('thermalCanvas');
      ctx = canvas.getContext('2d');

      // Dimensionar canvas al tamaño del contenedor (máximo 1000x1000)
      const maxSize = 1000;
      const ratio = Math.min(1, maxSize / Math.max(img.width, img.height));
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;

      // Dibujar imagen escalada
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Guardar imageData original
      imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Aplicar mapa de calor
      applyThermalOverlay();

      // Mostrar canvas
      canvas.style.display = 'block';
      canvas.style.maxWidth = '100%';
      canvas.style.maxHeight = '100%';
      viewerContainer.innerHTML = '';
      viewerContainer.appendChild(canvas);

      // Event listeners del canvas
      canvas.addEventListener('mousemove', handleCanvasMouseMove);
      canvas.addEventListener('click', handleCanvasClick);
      canvas.addEventListener('mouseleave', handleCanvasMouseLeave);

      console.log(`Canvas renderizado: ${canvas.width}x${canvas.height}`);
      resolve();
    };
    img.onerror = () => reject(new Error('Error cargando imagen'));
    img.src = imageUrl + '?' + Date.now(); // Prevenir cache
  });
}

function applyThermalOverlay() {
  if (!panelData || !ctx || !canvas) return;

  // Dibujar paneles con colores térmicos
  panelData.forEach(panel => {
    const temp = panel.tempAvg;
    const color = getThermalColor(temp);

    // Dibujar rectángulo del panel
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.6;
    ctx.fillRect(panel.x, panel.y, panel.width, panel.height);
    ctx.globalAlpha = 1.0;

    // Dibujar borde
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.strokeRect(panel.x, panel.y, panel.width, panel.height);

    // Dibujar ID del panel (pequeño)
    if (panel.width > 20 && panel.height > 20) {
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 8px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 2;
      ctx.fillText(panel.id.toString(), panel.x + panel.width / 2, panel.y + panel.height / 2);
      ctx.shadowColor = 'transparent';
    }
  });
}

function getThermalColor(temp) {
  // Mapear temperatura (20-80°C) a color (azul a rojo)
  const minTemp = 20;
  const maxTemp = 80;
  const normalized = Math.max(0, Math.min(1, (temp - minTemp) / (maxTemp - minTemp)));

  // Escala de colores: Azul -> Cian -> Verde -> Amarillo -> Naranja -> Rojo
  if (normalized < 0.2) {
    // Azul a Cian
    const t = normalized / 0.2;
    return `rgb(0, ${Math.round(t * 255)}, 255)`;
  } else if (normalized < 0.4) {
    // Cian a Verde
    const t = (normalized - 0.2) / 0.2;
    return `rgb(0, 255, ${Math.round(255 * (1 - t))})`;
  } else if (normalized < 0.6) {
    // Verde a Amarillo
    const t = (normalized - 0.4) / 0.2;
    return `rgb(${Math.round(t * 255)}, 255, 0)`;
  } else if (normalized < 0.8) {
    // Amarillo a Naranja
    const t = (normalized - 0.6) / 0.2;
    return `rgb(255, ${Math.round(255 * (1 - t * 0.5))}, 0)`;
  } else {
    // Naranja a Rojo
    return `rgb(255, ${Math.round((1 - normalized) * 100)}, 0)`;
  }
}

function handleCanvasMouseMove(e) {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  // Encontrar panel en esta posición
  const panel = panelData.find(p =>
    x >= p.x && x <= p.x + p.width &&
    y >= p.y && y <= p.y + p.height
  );

  if (panel && panel !== currentHoverPanel) {
    currentHoverPanel = panel;
    showPanelInfo(panel);

    // Efecto visual: resaltar panel
    redrawThermalWithHighlight(panel.id);
  } else if (!panel && currentHoverPanel) {
    currentHoverPanel = null;
    panelInfo.innerHTML = '<p>Pasa el mouse sobre un panel para ver detalles</p>';
    redrawThermal();
  }
}

function handleCanvasClick(e) {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const panel = panelData.find(p =>
    x >= p.x && x <= p.x + p.width &&
    y >= p.y && y <= p.y + p.height
  );

  if (panel) {
    showPanelInfoDetailed(panel);
  }
}

function handleCanvasMouseLeave() {
  currentHoverPanel = null;
  panelInfo.innerHTML = '<p>Pasa el mouse sobre un panel para ver detalles</p>';
  redrawThermal();
}

function showPanelInfo(panel) {
  const tempColor = getThermalColor(panel.tempAvg);
  panelInfo.innerHTML = `
    <div class="panel-info-content">
      <div class="info-row">
        <span class="info-label">ID Panel:</span>
        <span class="info-value">#${panel.id}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Temperatura:</span>
        <span class="info-value">
          <span class="temp-indicator" style="background: ${tempColor};"></span>
          ${panel.tempAvg}°C
        </span>
      </div>
      <div class="info-row">
        <span class="info-label">Mín/Máx:</span>
        <span class="info-value">${panel.tempMin}°C / ${panel.tempMax}°C</span>
      </div>
    </div>
  `;
}

function showPanelInfoDetailed(panel) {
  const tempColor = getThermalColor(panel.tempAvg);
  const anomaly = isAnomaly(panel);

  panelInfo.innerHTML = `
    <div class="panel-info-content">
      <div class="info-row">
        <span class="info-label">ID Panel:</span>
        <span class="info-value">#${panel.id}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Promedio:</span>
        <span class="info-value">${panel.tempAvg}°C</span>
      </div>
      <div class="info-row">
        <span class="info-label">Mínima:</span>
        <span class="info-value">${panel.tempMin}°C</span>
      </div>
      <div class="info-row">
        <span class="info-label">Máxima:</span>
        <span class="info-value">${panel.tempMax}°C</span>
      </div>
      <div class="info-row">
        <span class="info-label">Rango:</span>
        <span class="info-value">${panel.tempMax - panel.tempMin}°C</span>
      </div>
      <div class="info-row">
        <span class="info-label">Ubicación:</span>
        <span class="info-value">(${panel.x}, ${panel.y})</span>
      </div>
      ${anomaly ? `<div class="info-row" style="color: #ff6600; background: #fff0e6; padding: 5px; border-radius: 3px;">
        ⚠️ Anomalía térmica detectada
      </div>` : ''}
    </div>
  `;
}

function isAnomaly(panel) {
  const avgOfAll = panelData.reduce((sum, p) => sum + p.tempAvg, 0) / panelData.length;
  return Math.abs(panel.tempAvg - avgOfAll) > 5; // Anomalía si difiere >5°C del promedio
}

function redrawThermal() {
  if (!ctx || !canvas || !panelData) return;

  // Limpiar canvas
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Redibujar todos los paneles
  panelData.forEach(panel => {
    const color = getThermalColor(panel.tempAvg);
    ctx.fillStyle = color;
    ctx.fillRect(panel.x, panel.y, panel.width, panel.height);

    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(panel.x, panel.y, panel.width, panel.height);
  });
}

function redrawThermalWithHighlight(panelId) {
  redrawThermal();

  // Resaltar panel específico
  const panel = panelData.find(p => p.id === panelId);
  if (panel) {
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 4;
    ctx.strokeRect(panel.x - 2, panel.y - 2, panel.width + 4, panel.height + 4);
    ctx.shadowColor = 'transparent';
  }
}

function updateStats(data) {
  document.getElementById('totalPanels').textContent = data.panelCount.toLocaleString('es-ES');
  document.getElementById('avgTemp').textContent = data.stats.avgTemp + '°C';
  document.getElementById('minTemp').textContent = data.stats.minTemp + '°C';
  document.getElementById('maxTemp').textContent = data.stats.maxTemp + '°C';
}

async function exportToExcel() {
  try {
    const response = await fetch('/api/export');
    if (!response.ok) throw new Error('Error exportando');

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `paneles_termografia_${new Date().toISOString().slice(0, 10)}.xlsx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error:', error);
    alert('Error al exportar: ' + error.message);
  }
}

function searchPanel() {
  const id = parseInt(panelSearch.value);
  if (!id || id < 1 || id > panelData.length) {
    searchResult.style.display = 'none';
    return;
  }

  const panel = panelData.find(p => p.id === id);
  if (!panel) {
    searchResult.innerHTML = '<p style="color: #f44336;">Panel no encontrado</p>';
    searchResult.style.display = 'block';
    return;
  }

  const tempColor = getThermalColor(panel.tempAvg);
  searchResult.innerHTML = `
    <div class="info-row">
      <span class="info-label">Panel #${panel.id}</span>
      <span class="info-value" style="color: ${tempColor}; font-weight: bold;">${panel.tempAvg}°C</span>
    </div>
    <div class="info-row">
      <span class="info-label">Mín:</span>
      <span class="info-value">${panel.tempMin}°C</span>
    </div>
    <div class="info-row">
      <span class="info-label">Máx:</span>
      <span class="info-value">${panel.tempMax}°C</span>
    </div>
  `;
  searchResult.style.display = 'block';

  // Hacer scroll al panel en el canvas
  if (canvas) {
    const rect = canvas.getBoundingClientRect();
    const scrollX = panel.x + panel.width / 2 - rect.width / 2;
    const scrollY = panel.y + panel.height / 2 - rect.height / 2;

    // Resaltar panel
    redrawThermalWithHighlight(id);
  }
}

function resetApp() {
  if (confirm('¿Descargar una nueva imagen térmica?')) {
    location.reload();
  }
}

// Inicialización
console.log('✅ Aplicación de termografía solar cargada');
