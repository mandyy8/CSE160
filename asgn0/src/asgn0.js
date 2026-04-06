function areaTriangle(v1, v2) {
    return Vector3.cross(v1, v2).magnitude() / 2;
  }

  function angleBetween(v1, v2) {
    var dot = Vector3.dot(v1, v2);
    var angle = Math.acos(dot / (v1.magnitude() * v2.magnitude()));
    return angle * (180 / Math.PI);
  }

  function drawVector(v, color) {
    var canvas = document.getElementById('example');
    var ctx = canvas.getContext('2d');
  
    var centerX = canvas.width / 2;   // 200
    var centerY = canvas.height / 2;  // 200
  
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + v.elements[0] * 20, centerY - v.elements[1] * 20);
    ctx.stroke();
  }
  
  function handleDrawEvent() {
    var canvas = document.getElementById('example');
    var ctx = canvas.getContext('2d');

    // Clear the canvas
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Read input values
    var x = parseFloat(document.getElementById('v1x').value);
    var y = parseFloat(document.getElementById('v1y').value);
    var v1 = new Vector3([x, y, 0]);

    drawVector(v1, "red");

    var x2 = parseFloat(document.getElementById('v2x').value);
    var y2 = parseFloat(document.getElementById('v2y').value);
    var v2 = new Vector3([x2, y2, 0]);

    drawVector(v2, "blue");
  }

  function handleDrawOperationEvent() {
    var canvas = document.getElementById('example');
    var ctx = canvas.getContext('2d');

    // Clear the canvas
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Read v1 and v2
    var v1 = new Vector3([parseFloat(document.getElementById('v1x').value),
                          parseFloat(document.getElementById('v1y').value), 0]);
    var v2 = new Vector3([parseFloat(document.getElementById('v2x').value),
                          parseFloat(document.getElementById('v2y').value), 0]);

    drawVector(v1, "red");
    drawVector(v2, "blue");

    var op = document.getElementById('operation').value;
    var s  = parseFloat(document.getElementById('scalar').value);

    if (op === 'add') {
      var v3 = new Vector3(v1.elements).add(v2);
      drawVector(v3, "green");
    } else if (op === 'sub') {
      var v3 = new Vector3(v1.elements).sub(v2);
      drawVector(v3, "green");
    } else if (op === 'mul') {
      var v3 = new Vector3(v1.elements).mul(s);
      var v4 = new Vector3(v2.elements).mul(s);
      drawVector(v3, "green");
      drawVector(v4, "green");
    } else if (op === 'div') {
      var v3 = new Vector3(v1.elements).div(s);
      var v4 = new Vector3(v2.elements).div(s);
      drawVector(v3, "green");
      drawVector(v4, "green");
    } else if (op === 'magnitude') {
      console.log("Magnitude of v1: " + v1.magnitude());
      console.log("Magnitude of v2: " + v2.magnitude());
    } else if (op === 'area') {
      console.log("Area of triangle formed by v1 and v2: " + areaTriangle(v1, v2));
    } else if (op === 'angleBetween') {
      console.log("Angle between v1 and v2: " + angleBetween(v1, v2) + " degrees");
    } else if (op === 'normalize') {
      console.log("Magnitude of v1: " + v1.magnitude());
      console.log("Magnitude of v2: " + v2.magnitude());
      var v3 = new Vector3(v1.elements).normalize();
      var v4 = new Vector3(v2.elements).normalize();
      drawVector(v3, "green");
      drawVector(v4, "green");
    }
  }

  function main() {
    var canvas = document.getElementById('example');
    if (!canvas) {
      console.log('Failed to retrieve the <canvas> element');
      return false;
    }
  
    var ctx = canvas.getContext('2d');
  
    // Black background
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  
    // Instantiate v1
    var v1 = new Vector3([2.25, 2.25, 0]);
  
    // Draw it
    drawVector(v1, "red");
  }