// CSE160 Assignment 1 - Main WebGL drawing application

// Vertex shader – position and size come from uniforms
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'uniform float u_Size;\n' +
  'void main() {\n' +
  '  gl_Position = a_Position;\n' +
  '  gl_PointSize = u_Size;\n' +
  '}\n';

// Fragment shader – color comes from a uniform
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'uniform vec4 u_FragColor;\n' +
  'void main() {\n' +
  '  gl_FragColor = u_FragColor;\n' +
  '}\n';

// Globals
var gl;
var canvas;
var a_Position;
var u_FragColor;
var u_Size;

// UI state
var g_selectedShape = 'point';
var g_selectedColor = [1.0, 0.0, 0.0, 1.0];
var g_selectedSize  = 10;
var g_selectedSegs  = 12;

// The scene: list of all shape objects
var g_shapesList = [];

// ─── Entry point ───────────────────────────────────────────────────────────────
function main() {
  setupWebGL();
  connectVariablesToGLSL();
  setupUI();

  // Clear to dark background
  gl.clearColor(0.1, 0.1, 0.1, 1.0);
  renderAllShapes();
}

// ─── 1. Setup WebGL ────────────────────────────────────────────────────────────
function setupWebGL() {
  canvas = document.getElementById('webgl');

  gl = canvas.getContext('webgl', { preserveDrawingBuffer: true });
  if (!gl) {
    console.log('Failed to get the WebGL rendering context');
    return;
  }
}

// ─── 2. Connect JS variables to GLSL ──────────────────────────────────────────
function connectVariablesToGLSL() {
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to initialize shaders.');
    return;
  }

  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get storage location of a_Position');
    return;
  }

  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get storage location of u_FragColor');
    return;
  }

  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get storage location of u_Size');
    return;
  }
}

// ─── 3. UI setup ───────────────────────────────────────────────────────────────
function setupUI() {
  canvas.onmousedown = handleClick;
  canvas.onmousemove = function(ev) {
    if (ev.buttons === 1) handleClick(ev);
  };

  updateColor();    // initialize color preview
  updateSize();
  updateSegs();
}

// ─── 4. Handle a click / drag on the canvas ───────────────────────────────────
function handleClick(ev) {
  var coords = eventToGLCoords(ev);
  var x = coords[0];
  var y = coords[1];

  var shape;
  if (g_selectedShape === 'point') {
    shape = new Point();
  } else if (g_selectedShape === 'triangle') {
    shape = new Triangle();
  } else {
    shape = new Circle();
    shape.segments = g_selectedSegs;
  }

  shape.position = [x, y];
  shape.color    = g_selectedColor.slice();
  shape.size     = g_selectedSize;

  g_shapesList.push(shape);
  renderAllShapes();
}

// Convert mouse event pixel coords → WebGL clip-space [-1, 1]
function eventToGLCoords(ev) {
  var rect = ev.target.getBoundingClientRect();
  var x = ((ev.clientX - rect.left) - canvas.width  / 2) / (canvas.width  / 2);
  var y = (canvas.height / 2 - (ev.clientY - rect.top))  / (canvas.height / 2);
  return [x, y];
}

// ─── 5. Render all shapes ──────────────────────────────────────────────────────
function renderAllShapes() {
  gl.clear(gl.COLOR_BUFFER_BIT);

  for (var i = 0; i < g_shapesList.length; i++) {
    g_shapesList[i].render();
  }
}

// ─── UI callbacks ─────────────────────────────────────────────────────────────

function setShape(shape) {
  g_selectedShape = shape;
  ['point', 'triangle', 'circle'].forEach(function(s) {
    document.getElementById('btn-' + s).classList.toggle('active', s === shape);
  });
}

function updateColor() {
  var r = parseInt(document.getElementById('slider-r').value);
  var g = parseInt(document.getElementById('slider-g').value);
  var b = parseInt(document.getElementById('slider-b').value);
  g_selectedColor = [r / 255, g / 255, b / 255, 1.0];
}

function updateSize() {
  g_selectedSize = parseFloat(document.getElementById('slider-size').value);
}

function updateSegs() {
  g_selectedSegs = parseInt(document.getElementById('slider-segs').value);
}

function clearCanvas() {
  g_shapesList = [];
  renderAllShapes();
}
