# duo-prints

## créditos

herramientas y afiches de impresión de duo, creados por emilia guerra.

## qué hay acá

código para generar afiches A3 (297 × 420 mm, 300 ppp) de las lámparas de duo, con una estética bitmap de 1 bit: azul RGB `#0000FF` sobre papel blanco.

- `pixel/editor-bitmap.html`: editor para cualquier imagen. es el que se usa.
- `pixel/uzu001-bitmap.html`, `pixel/uzu002-bitmap.html`: editores de foto de cada lámpara (versiones anteriores).
- `pixel/uzu001-planimetria-bitmap.html`: editor de la planimetría de la uzu001 (versión anterior).
- `pixel/uzu001-pixel.html`: primer experimento de pixelado.
- `pixel/uzu001-bitmap.py`, `pixel/bitmap.py`: la misma trama en python, para exportar sin navegador.
- `uzu001-a3-claro.jsx`, `uzu001-a3-oscuro.jsx`: scripts de photoshop que arman el afiche A3 en capas.
- `uzu001-a3-mezcla.html`: maqueta del afiche en html.

cada html es un solo archivo: la imagen y las tipografías van incrustadas, así que se abre con doble clic, sin servidor ni instalación.

## cómo usar el editor

abrir `pixel/editor-bitmap.html` en el navegador (chrome o safari).

1. elegir un ejemplo (uzu001, uzu002 o la planimetría) o subir una imagen con el botón o arrastrándola sobre la hoja.
2. elegir el tipo de imagen:
   - **foto**: los tonos se convierten en trama.
   - **dibujo / planimetría**: se rellena con trama lo que está encerrado por las líneas, con un degradé de luz.
3. ajustar trama, tamaño del pixel y densidad.
4. opcionalmente agregar texto como textura y etiquetas.
5. `ver 1:1` para revisar a tamaño real y `png a3` para descargar a 3508 × 4961 px.

la vista previa se dibuja al 40 % para que los controles respondan rápido. el png y la vista 1:1 se generan a tamaño completo.

## cómo preparar una imagen

para fotos conviene subir un png con el fondo ya recortado. el editor tiene «quitar fondo» para fondos lisos, pero no funciona bien con fondos con textura (cortinas, piso de madera).

en macos se puede recortar el sujeto desde vista previa o fotos, o con el recorte de sujeto de vision (así se hicieron `uzu001-recorte.png` y `uzu002-recorte.png`).

las imágenes no se suben a este repositorio (ver `.gitignore`).

## cómo funcionan las tramas

- **atkinson**: difusión de error que reparte 6/8 del error a los vecinos. da un punto orgánico, el del macintosh original.
- **floyd–steinberg**: difusión de error clásica, más pareja.
- **bayer 4×4 y 8×8**: trama ordenada, da el patrón de damero.
- **umbral**: blanco o azul, sin trama.

en modo dibujo, el interior se detecta inundando desde los bordes de la imagen: lo que no se alcanza sin cruzar una línea es interior. «cerrar huecos» engrosa las líneas antes de inundar, para que un contorno con un corte no se derrame.

## cómo agregar etiquetas

una por línea en el cuadro de etiquetas: texto, x, y. las posiciones van en % de la imagen (no de la hoja), así se mueven con ella.

```
01 66.71 7.49
02 66.71 19.89
```

## cómo usar los scripts de python

requieren python 3 con pillow y numpy.

```sh
pip install pillow numpy
python3 pixel/uzu001-bitmap.py 10 atk 0.0 0.75 1.8 salida.png 200
```

argumentos: tamaño de celda, trama (`atk`, `bayer4`, `bayer8`), tono mínimo, tono máximo, gamma, archivo de salida y detalle.

## cómo usar los scripts de photoshop

en photoshop: archivo → secuencias de comandos → explorar… y elegir `uzu001-a3-claro.jsx` o `uzu001-a3-oscuro.jsx`. las rutas de la foto y de salida están al inicio de cada script.

## tipografías

- absans
- pp neue bit (pangram pangram)

la carpeta `fuentes/` no se sube (ver `.gitignore`): `uzu001-a3-mezcla.html` la necesita en local.

## bibliografía

- <https://en.wikipedia.org/wiki/Atkinson_dithering>
- <https://en.wikipedia.org/wiki/Floyd%E2%80%93Steinberg_dithering>
- <https://en.wikipedia.org/wiki/Ordered_dithering>
- <https://developer.apple.com/documentation/vision/vngenerateforegroundinstancemaskrequest>
