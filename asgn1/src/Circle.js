// Circle class – renders a filled circle approximated by triangles (fan)

class Circle {
  constructor() {
    this.position = [0, 0];
    this.color    = [1.0, 1.0, 1.0, 1.0];
    this.size     = 10;
    this.segments = 12;
  }

  render() {
    var [cx, cy] = this.position;
    // Convert size to clip-space radius
    var r = this.size / (canvas.width / 2) * 0.5;

    // Build triangle fan: center + one pair of edge points per segment
    var verts = [];
    var n = this.segments;
    for (var i = 0; i < n; i++) {
      var angle1 = (2 * Math.PI * i)       / n;
      var angle2 = (2 * Math.PI * (i + 1)) / n;

      verts.push(cx, cy);                                   // center
      verts.push(cx + r * Math.cos(angle1), cy + r * Math.sin(angle1));
      verts.push(cx + r * Math.cos(angle2), cy + r * Math.sin(angle2));
    }

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
    gl.uniform1f(u_Size, this.size);

    gl.drawArrays(gl.TRIANGLES, 0, n * 3);
  }
}
