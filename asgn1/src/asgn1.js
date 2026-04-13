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
var g_selectedShape    = 'point';
var g_selectedColor    = [1.0, 0.0, 0.0, 1.0];
var g_selectedSize     = 10;
var g_selectedSegs     = 12;
var g_symmetryMode     = 'none';  // 'none' | 'horizontal' | 'vertical' | 'four'

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

  // Collect the set of positions to paint based on symmetry mode
  var positions = [[x, y]];
  if (g_symmetryMode === 'horizontal' || g_symmetryMode === 'four') {
    positions.push([-x, y]);
  }
  if (g_symmetryMode === 'vertical' || g_symmetryMode === 'four') {
    positions.push([x, -y]);
  }
  if (g_symmetryMode === 'four') {
    positions.push([-x, -y]);
  }

  for (var i = 0; i < positions.length; i++) {
    g_shapesList.push(makeShape(positions[i][0], positions[i][1]));
  }

  renderAllShapes();
}

// Build a shape object at clip-space position (x, y)
function makeShape(x, y) {
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
  return shape;
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

// ─── Awesomeness: Symmetry Brush ──────────────────────────────────────────────
function setSymmetry(mode) {
  g_symmetryMode = mode;
  ['none', 'h', 'v', '4'].forEach(function(id) {
    document.getElementById('sym-' + id).classList.remove('active');
  });
  var idMap = { none: 'sym-none', horizontal: 'sym-h', vertical: 'sym-v', four: 'sym-4' };
  document.getElementById(idMap[mode]).classList.add('active');
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

// ─── 12. Draw picture ─────────────────────────────────────────────────────────
// Base butterfly shape defined in clip space, then scaled × 0.5 and translated:
//   Top-left  butterfly → translate(-0.5,  0.5), blue
//   Bottom-right butterfly → translate( 0.5, -0.5), green
function drawPicture() {
  g_shapesList = [];

  var WHITE = [1.0, 1.0, 1.0];
  var BLUE  = [0.20, 0.30, 0.80];
  var GREEN = [0.10, 0.55, 0.20];

  function addRawTri(x1,y1, x2,y2, x3,y3, color) {
    var t = new Triangle();
    t._verts = new Float32Array([x1,y1, x2,y2, x3,y3]);
    t.color  = [color[0], color[1], color[2], 1.0];
    t.render = function() {
      var buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, this._verts, gl.DYNAMIC_DRAW);
      gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(a_Position);
      gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
      gl.uniform1f(u_Size, 1.0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    g_shapesList.push(t);
  }

  // Draw one butterfly.
  // isW=false → M shape (inner edge tall, outer edge short)
  // isW=true  → W shape (outer edge tall, inner edge short)
  // Render order: outer wings first, inner white wings on top, antennae last.
  function drawButterfly(tx, ty, s, accent, isW) {
    function v(x, y) { return [x * s + tx, y * s + ty]; }
    function tri(p1, p2, p3, col) {
      addRawTri(p1[0],p1[1], p2[0],p2[1], p3[0],p3[1], col);
    }

    // 1. Outer wings (behind everything)
    tri(v(-0.25,  0.2), v(-0.75, 0.4), v(-0.45, -0.1), accent);
    tri(v( 0.25,  0.2), v( 0.75, 0.4), v( 0.45, -0.1), accent);

    // 2. Tail extensions
    tri(v(-0.05, -0.2), v(-0.15, -0.9), v(-0.02, -0.7), accent);
    tri(v( 0.05, -0.2), v( 0.15, -0.9), v( 0.02, -0.7), accent);

    // 3. Inner wings (white, on top of outer wings)
    //
    // M shape — each half is a wide quad:
    //   outer edge is a full-height vertical leg of the M
    //   inner edge slopes DOWN to a shared center-V bottom point
    //   combined top outline:  peak(L) ╲ valley ╱ peak(R)  →  reads as M
    //
    // W shape — same quad with y-values negated:
    //   combined bottom outline: peak(L) ╱ valley ╲ peak(R) → reads as W
    //
    if (!isW) {
      // M left:  P0 bot-outer, P1 top-outer (left peak), P2 inner-shoulder, P3 center-V
      tri(v(-0.40, -0.40), v(-0.40,  0.55), v(-0.08,  0.20), WHITE);
      tri(v(-0.40, -0.40), v(-0.08,  0.20), v( 0.00,  0.05), WHITE);
      // M right (x-mirror)
      tri(v( 0.40, -0.40), v( 0.40,  0.55), v( 0.08,  0.20), WHITE);
      tri(v( 0.40, -0.40), v( 0.08,  0.20), v( 0.00,  0.05), WHITE);
    } else {
      // W left:  y-negated M  (top-outer is the flat top of W, bot-outer is W's peak)
      tri(v(-0.40,  0.40), v(-0.40, -0.55), v(-0.08, -0.20), WHITE);
      tri(v(-0.40,  0.40), v(-0.08, -0.20), v( 0.00, -0.05), WHITE);
      // W right (x-mirror)
      tri(v( 0.40,  0.40), v( 0.40, -0.55), v( 0.08, -0.20), WHITE);
      tri(v( 0.40,  0.40), v( 0.08, -0.20), v( 0.00, -0.05), WHITE);
    }

    // 4. Antennae (on top of inner wings)
    tri(v(-0.05, 0.6), v(-0.10, 0.9), v(-0.02, 0.85), accent);
    tri(v( 0.05, 0.6), v( 0.10, 0.9), v( 0.02, 0.85), accent);
  }

  // Blue M butterfly — top-left:    translate(-0.5,  0.5), scale 0.5
  drawButterfly(-0.5,  0.5, 0.5, BLUE,  false);
  // Green W butterfly — bottom-right: translate( 0.5, -0.5), scale 0.5
  drawButterfly( 0.5, -0.5, 0.5, GREEN, true);

  renderAllShapes();
}
