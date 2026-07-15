# 🔬 Análisis Térmico de Paneles Solares - Renergeia

Sistema web interactivo para análisis de termografías de paneles solares con detección automática y exportación de datos.

## ✨ Características

- 📸 Carga de imágenes TIFF térmicas
- 🤖 Detección automática de paneles solares (hasta 3448 paneles)
- 🌡️ Visualización en tiempo real con mapa de calor
- 🖱️ Interactividad: Hover + Click para detalles de temperatura
- 📊 Exportación a Excel con estadísticas y gráficas
- 🔍 Búsqueda de paneles por ID
- 📱 Interfaz profesional y responsiva

## 🚀 Inicio Rápido

### Local (Desarrollo)

```bash
npm install
npm start
```

Accede a `http://localhost:3000`

### En la nube (Railway)

1. Conecta tu repositorio de GitHub
2. Deploy automático
3. Obtén tu URL pública

## 📋 Uso

1. **Carga la imagen TIFF**: Arrastra o selecciona un archivo TIFF térmico
2. **Espera a procesamiento**: La app detectará automáticamente los paneles
3. **Interactúa**: Pasa el mouse para ver temperaturas, haz click para más detalles
4. **Busca paneles**: Usa la búsqueda por ID en el panel derecho
5. **Exporta datos**: Descarga un Excel con todas las estadísticas

## 📊 Datos Exportados

- ID de panel
- Temperatura promedio, mínima y máxima
- Ubicación (coordenadas X, Y)
- Estadísticas generales del proyecto

## 🛠️ Tecnologías

- **Backend**: Node.js + Express
- **Procesamiento de imágenes**: Sharp
- **Exportación**: ExcelJS
- **Frontend**: Vanilla JavaScript + Canvas
- **Visualización**: Mapa de calor personalizado

## 📞 Soporte

Renergeia - Análisis Térmico Avanzado

---

**Desarrollado con ❤️ por Renergeia**
