// Triangle class – renders a filled equilateral triangle centered on position

class Triangle {
  constructor() {
    this.position = [0, 0];
    this.color    = [1.0, 1.0, 1.0, 1.0];
    this.size     = 10;  // half-width in pixels mapped to clip space
  }

  render() {
    var [cx, cy] = this.position;
    // Convert size (points-like) to clip-space half-extent
    var s = this.size / (canvas.width / 2) * 0.5;
    var h = s * 1.732; // equilateral height = s * sqrt(3)

    var verts = new Float32Array([
      cx,       cy + h * 0.667,   // top
      cx - s,   cy - h * 0.333,   // bottom-left
      cx + s,   cy - h * 0.333,   // bottom-right
    ]);

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
    gl.uniform1f(u_Size, this.size);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
}

// Utility: draw a triangle from a flat array of 6 coords [x1,y1,x2,y2,x3,y3]
function drawTriangle(coords) {
  var verts = new Float32Array(coords);
  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, verts, gl.DYNAMIC_DRAW);
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}
