// uzu 001 — afiche A3 (297 × 420 mm, 300 ppp) al estilo "monoblock chair"
// lámpara difusa + ventanas nítidas + marcos de selección + tipografía. todo en capas editables.
#target photoshop
app.displayDialogs = DialogModes.NO;
var prevRuler = app.preferences.rulerUnits, prevType = app.preferences.typeUnits;
app.preferences.rulerUnits = Units.PIXELS;
app.preferences.typeUnits  = TypeUnits.POINTS;

var BASE   = "/Users/emiliaguerra/Desktop/duo/";
var FOTO   = BASE + "web duo/contentfoto/uzu001/uzu001.jpg";
var TEMA   = "claro";                    // "oscuro" o "claro"
var SALIDA = BASE + "prints/uzu001-a3-" + TEMA + ".psd";
var PREVIA = BASE + "prints/uzu001-a3-" + TEMA + "-previa.jpg";

var W = 3508, H = 4961;                     // A3 a 300 ppp
function alFrente(l) { try { if (doc.layers[0] !== l) l.move(doc.layers[0], ElementPlacement.PLACEBEFORE); } catch (e) {} }
function color(hex) { var c = new SolidColor(); c.rgb.hexValue = hex; return c; }
var OSCURO = TEMA === "oscuro";
var FONDO  = color(OSCURO ? "131211" : "FFFFFF");
var BRONCE = color(OSCURO ? "B08A55" : "6E4E2C");   // título (dorado de los anillos de la lámpara)
var TEXTO  = color(OSCURO ? "D9CFC0" : "6E4E2C");   // párrafos
var AZUL   = color("8FA9C9");               // marcos de selección
var BLANCO = color("FFFFFF");

/* ---------- 1. documento ---------- */
var doc = app.documents.add(W, H, 300, "uzu 001 — A3", NewDocumentMode.RGB, DocumentFill.WHITE);
doc.activeLayer.name = "fondo";
doc.selection.selectAll(); doc.selection.fill(FONDO); doc.selection.deselect();

/* ---------- 2. título (debajo de la lámpara, como en la referencia) ---------- */
function texto(nombre, contenido, fuente, pt, x, y, just, tracking, col) {
  var l = doc.artLayers.add();
  l.kind = LayerKind.TEXT;
  l.name = nombre;
  var t = l.textItem;
  t.contents = contenido;
  t.font = fuente;
  t.size = pt;
  t.color = col || BRONCE;
  t.justification = just || Justification.LEFT;
  t.tracking = tracking || 0;
  t.position = [x, y];
  return l;
}
texto("título · UZU", "UZU", "HelveticaNeue-Medium", 250, 170, 1020, Justification.LEFT, -30);
texto("título · 001", "001", "HelveticaNeue-Medium", 250, W - 170, 1780, Justification.RIGHT, -30);

/* ---------- 3. recortar la lámpara (Seleccionar sujeto) y traerla al afiche ---------- */
var src = app.open(new File(FOTO));
var d = new ActionDescriptor();
d.putBoolean(stringIDToTypeID("sampleAllLayers"), false);
executeAction(stringIDToTypeID("autoCutout"), d, DialogModes.NO);       // Seleccionar > Sujeto
executeAction(charIDToTypeID("CpTL"), undefined, DialogModes.NO);        // Capa vía copiar
src.activeLayer.duplicate(doc, ElementPlacement.PLACEATBEGINNING);
src.close(SaveOptions.DONOTSAVECHANGES);

app.activeDocument = doc;
var nitida = doc.layers[0];
nitida.name = "uzu 001 · nítida";

// escalar y ubicar: la lámpara ocupa casi todo el alto, algo a la izquierda del centro
function caja(l) { var b = l.bounds; return { x: b[0].as("px"), y: b[1].as("px"), w: b[2].as("px") - b[0].as("px"), h: b[3].as("px") - b[1].as("px") }; }
var b = caja(nitida);
var escala = 4150 / b.h * 100;
nitida.resize(escala, escala, AnchorPosition.TOPLEFT);
b = caja(nitida);
nitida.translate(1580 - (b.x + b.w / 2), 640 - b.y);
b = caja(nitida);                                                        // caja final de la lámpara

/* ---------- 4. versión difusa con grano ---------- */
var difusa = nitida.duplicate(nitida, ElementPlacement.PLACEAFTER);      // queda debajo de la nítida
difusa.name = "uzu 001 · difusa";
doc.activeLayer = difusa;
difusa.applyGaussianBlur(85);
difusa.applyAddNoise(OSCURO ? 9 : 7, NoiseDistribution.GAUSSIAN, true);
difusa.opacity = 92;

/* ---------- 5. ventanas nítidas: máscara con rectángulos ---------- */
// cada ventana en fracciones de la caja de la lámpara: [x0, y0, x1, y1] (pueden salirse de la caja)
var VENTANAS = [
  [-0.35, -0.03, 1.30, 0.09],   // remate superior
  [ 0.30,  0.17, 1.90, 0.26],   // segundo anillo, hacia la derecha
  [-1.10,  0.30, 0.15, 0.39],   // borde izquierdo
  [-0.10,  0.43, 0.70, 0.50],   // centro
  [ 0.55,  0.55, 1.60, 0.67],   // tramo derecho
  [-0.80,  0.72, 0.55, 0.80],   // tramo inferior izquierdo
  [-0.30,  0.87, 1.35, 1.01],   // base
];
function rectPx(v) {
  var x0 = Math.round(b.x + v[0] * b.w), y0 = Math.round(b.y + v[1] * b.h);
  var x1 = Math.round(b.x + v[2] * b.w), y1 = Math.round(b.y + v[3] * b.h);
  return [x0, y0, x1, y1];
}
function seleccionar(r, tipo) {
  doc.selection.select([[r[0], r[1]], [r[2], r[1]], [r[2], r[3]], [r[0], r[3]]], tipo);
}
doc.activeLayer = nitida;
for (var i = 0; i < VENTANAS.length; i++) seleccionar(rectPx(VENTANAS[i]), i ? SelectionType.EXTEND : SelectionType.REPLACE);
var m = new ActionDescriptor();                                          // máscara que revela la selección
m.putClass(charIDToTypeID("Nw  "), charIDToTypeID("Chnl"));
var ref = new ActionReference();
ref.putEnumerated(charIDToTypeID("Chnl"), charIDToTypeID("Chnl"), charIDToTypeID("Msk "));
m.putReference(charIDToTypeID("At  "), ref);
m.putEnumerated(charIDToTypeID("Usng"), charIDToTypeID("UsrM"), charIDToTypeID("RvlS"));
executeAction(charIDToTypeID("Mk  "), m, DialogModes.NO);
doc.selection.deselect();

/* ---------- 6. marcos de selección con puntos en las esquinas ---------- */
var marcos = doc.artLayers.add();
marcos.name = "marcos";
alFrente(marcos);                                                        // arriba de todo
var H2 = 13;                                                             // mitad del punto de esquina
for (var j = 0; j < VENTANAS.length; j++) {
  var r = rectPx(VENTANAS[j]);
  seleccionar(r, SelectionType.REPLACE);
  doc.selection.stroke(AZUL, 4, StrokeLocation.CENTER);
  var esquinas = [[r[0], r[1]], [r[2], r[1]], [r[2], r[3]], [r[0], r[3]]];
  for (var k = 0; k < 4; k++) {
    var c = esquinas[k];
    seleccionar([c[0] - H2, c[1] - H2, c[0] + H2, c[1] + H2], SelectionType.REPLACE);
    doc.selection.fill(BLANCO);
    doc.selection.stroke(AZUL, 3, StrokeLocation.INSIDE);
  }
}
doc.selection.deselect();

/* ---------- 7. textos (arriba de todo) ---------- */
function parrafo(nombre, lineas, x, y, just) {
  var l = texto(nombre, lineas.join("\r"), "HelveticaNeue", 9.5, x, y, just, 0, TEXTO);
  l.textItem.useAutoLeading = false;
  l.textItem.leading = 12.5;
  alFrente(l);
  return l;
}
parrafo("texto · origen", [
  "uzu significa remolino en japonés. uzu 001 toma",
  "ese movimiento y lo convierte en luz: una columna",
  "que gira sobre sí misma, capa por capa, desde la",
  "base hasta el remate."
], 2080, 2080, Justification.LEFT);

parrafo("texto · módulos", [
  "Cada módulo se imprime por separado y se apila",
  "sobre el anterior. La torsión continúa de una pieza",
  "a la otra, como si la lámpara nunca dejara",
  "de girar."
], 1000, 2470, Justification.RIGHT);

parrafo("texto · luz", [
  "La luz atraviesa las capas de impresión y se",
  "difunde a lo largo de la espiral. Blanca o violeta,",
  "cambia de color según el momento y el espacio",
  "que la rodea."
], 2330, 3560, Justification.LEFT);

parrafo("texto · serie", [
  "Una forma, muchas vueltas. uzu 001 es la primera",
  "lámpara de la serie uzu, diseñada y fabricada",
  "por duo, estudio de diseño y fabricación digital."
], 1000, 4540, Justification.RIGHT);

var firma = texto("firma · duo", "duo", "PPNeueBit-Bold", 30, W - 170, H - 170, Justification.RIGHT, 0);
alFrente(firma);

/* ---------- 8. guardar PSD + previa JPG ---------- */
var psd = new PhotoshopSaveOptions();
psd.layers = true; psd.embedColorProfile = true; psd.maximizeCompatibility = true;
doc.saveAs(new File(SALIDA), psd, false);
var jpg = new JPEGSaveOptions(); jpg.quality = 9;
doc.saveAs(new File(PREVIA), jpg, true);

doc.close(SaveOptions.DONOTSAVECHANGES);                               // liberar memoria
app.preferences.rulerUnits = prevRuler;
app.preferences.typeUnits  = prevType;
"ok";
