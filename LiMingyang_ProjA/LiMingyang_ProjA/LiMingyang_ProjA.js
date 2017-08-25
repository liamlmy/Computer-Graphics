// Vertex shader program----------------------------------
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'varying vec4 v_Color;\n' +
  'uniform mat4 u_ModelMatrix;\n' +
  'void main() {\n' +
  ' gl_Position = u_ModelMatrix * a_Position;\n' +
  ' v_Color = a_Color;\n' + 
  '}\n';

// Fragment shader program----------------------------------
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  'gl_FragColor = v_Color;\n' +
  '}\n';

// Global Variable
var ANGLE_STEP = 5.0;
var step = 0.01;
var isDrag = false;
var xMclik = 0.0;
var yMclik = 0.0;
var xMdragTot = 0.0;
var yMdragTot = 0.0;  
var Mx = 0.0;
var My = 0.0;

function main() {
//==============================================================================
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  canvas.onmousedown = function(ev){myMouseDown(ev, gl, canvas)};
  canvas.onmousemove = function(ev){myMouseMove(ev, gl, canvas)};				
  canvas.onmouseup = function(ev){myMouseUp(ev, gl, canvas)};

  gl.depthFunc(gl.LESS);
  gl.enable(gl.DEPTH_TEST); 
  gl.clearColor(0, 0, 0, 1);

  // Get storage location of u_ModelMatrix
  var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) { 
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  // Explain on console:
  console.log('\ndraw() fcn, line 152: NO transforms. \nDraw box.\n');
  // Current rotation angle
  var currentAngle = 0.0;
  var currentp = 0.0;
  // Model matrix
  var modelMatrix = new Matrix4();
  // Start drawing
  var tick = function() {
    currentAngle = animate(currentAngle);
    currentp = animate0(currentp);
    G2 = 0.8 - currentp;
    var n = initVertexBuffers(gl);
    if (n < 0) {
      console.log('Failed to set the positions of the vertices');
      return;
    }
    //currentAngle = animate(currentAngle);  // Update the rotation angle
    draw(gl, n, currentAngle, currentp, modelMatrix, u_ModelMatrix);   // Draw the rooster
    draw00(gl, n, currentAngle, currentp, modelMatrix, u_ModelMatrix);	//Draw the sun
    document.getElementById('CurAngleDisplay').innerHTML= 'CurrentAngle= '+currentAngle;
    document.getElementById('CurpDisplay').innerHTML= 'CurrentColorChange= '+currentp;
    document.getElementById('Mouse').innerHTML= 'Mouse Drag totals:\t'+xMdragTot+', \t'+yMdragTot;
    requestAnimationFrame(tick, canvas);
  };
  tick();
}

var Tx = 0.10;
var Txx = 0.00;
var Ty = 0.00;
var Tyy = 0.40;
var Tz = 0.10;
var Tz0 = -0.10;
var Tzz = 0.00;
var R1 = 1.0;
var G1 = 0.0;
var B1 = 0.0;
var R2 = 1.0;
var G2 = 0.8;
var B2 = 0.2;
var R3 = 1.0;
var G3 = 0.2;
var B3 = 0.5;

function initVertexBuffers(gl) {
  var vertices = new Float32Array ([
     Tx,  Ty,  Tz, 1.00,	R1,  G1,  B1,
     Tx,  Ty, Tz0, 1.00,  R2,  G2,  B2,
     Txx,  Tyy,  Tzz, 1.00,  R3,  G3,  B3,
     
    -Tx,  Ty,  Tz, 1.00,  R1,  G1,  B1,
    -Tx,  Ty, Tz0, 1.00,  R2,  G2,  B2,
     Txx,  Tyy,  Tzz, 1.00,  R3,  G3,  B3,
     
     Tx,  Ty, Tz0, 1.00,	R2,  G2,  B2,
    -Tx,  Ty, Tz0, 1.00,  R2,  G2,  B2,
     Txx,  Tyy,  Tzz, 1.00,  R3,  G3,  B3,
     
     Tx,  Ty,  Tz, 1.00,  R1,  G1,  B1,
    -Tx,  Ty,  Tz, 1.00,  R1,  G1,  B1,
     Txx,  Tyy,  Tzz, 1.00,  R3,  G3,  B3,
     
  ]);
  var n = 12;

  // Create a buffer object
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  var FSIZE = vertices.BYTES_PER_ELEMENT;

  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if(a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  gl.vertexAttribPointer(a_Position, 4, gl.FLOAT, false, FSIZE*7, 0);

  gl.enableVertexAttribArray(a_Position);
  
  var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  if(a_Color < 0) {
    console.log('Failed to get the storage location of a_Color');
    return -1;
  }
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 7, FSIZE * 4);
  gl.enableVertexAttribArray(a_Color); 
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  return n;
}

function draw00(gl, n, currentAngle, currentp, modelMatrix, u_ModelMatrix) {
//=============================================================================
  modelMatrix.setTranslate(0.5-currentAngle/40, 0.6+currentAngle/50, 0.0);
  modelMatrix.scale(1.0+currentp, 1.0+currentp, 1.0);
  
  var dist = Math.sqrt(xMdragTot*xMdragTot + yMdragTot*yMdragTot);
  modelMatrix.rotate(dist*120.0, -yMdragTot+0.0001, xMdragTot+0.0001, 0.0);

  modelMatrix.rotate(3*currentAngle, 0, 1, 0);
  modelMatrix.rotate(-2*currentAngle, 1, 0, 0);
  modelMatrix.rotate(10*currentAngle, 0, 0, 1);
  modelMatrix.scale(0.5, 0.5, 0.5);
  
  pushMatrix(modelMatrix);
  
  modelMatrix.rotate(currentAngle*0.5, 0, 0, 1);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, n);
  
  modelMatrix.translate(0.0, 0.4, 0.0);
  modelMatrix.scale(0.5, 0.5, 0.5);
  modelMatrix.rotate(currentAngle, 0, 0, 1);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, n);
  
  modelMatrix.translate(0.0, 0.2, 0.0);
  modelMatrix.scale(0.5, 0.5, 0.5);
  modelMatrix.rotate(currentAngle*3, 0, 0, 1);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, n);
  
  modelMatrix = popMatrix();
  pushMatrix(modelMatrix);  
  
  modelMatrix.rotate(30+currentAngle*0.5, 0, 0, 1);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, n);
  
  modelMatrix.translate(0.0, 0.4, 0.0);
  modelMatrix.scale(0.5, 0.5, 0.5);
  modelMatrix.rotate(currentAngle, 0, 0, 1);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, n);
  
  modelMatrix.translate(0.0, 0.2, 0.0);
  modelMatrix.scale(0.5, 0.5, 0.5);
  modelMatrix.rotate(currentAngle*3, 0, 0, 1);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, n);
  
  modelMatrix = popMatrix();
  pushMatrix(modelMatrix);
    
  modelMatrix.rotate(60+currentAngle*0.5, 0, 0, 1);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, n);
  
  modelMatrix.translate(0.0, 0.4, 0.0);
  modelMatrix.scale(0.5, 0.5, 0.5);
  modelMatrix.rotate(currentAngle, 0, 0, 1);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, n);
  
  modelMatrix.translate(0.0, 0.2, 0.0);
  modelMatrix.scale(0.5, 0.5, 0.5);
  modelMatrix.rotate(currentAngle*3, 0, 0, 1);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, n);
  
  modelMatrix = popMatrix();
  pushMatrix(modelMatrix);
    
  modelMatrix.rotate(90+currentAngle*0.5, 0, 0, 1);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, n);
  
  modelMatrix.translate(0.0, 0.4, 0.0);
  modelMatrix.scale(0.5, 0.5, 0.5);
  modelMatrix.rotate(currentAngle, 0, 0, 1);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, n);
  
  modelMatrix.translate(0.0, 0.2, 0.0);
  modelMatrix.scale(0.5, 0.5, 0.5);
  modelMatrix.rotate(currentAngle*3, 0, 0, 1);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, n);
  
  modelMatrix = popMatrix();
  pushMatrix(modelMatrix);
    
  modelMatrix.rotate(120+currentAngle*0.5, 0, 0, 1);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, n);
  
  modelMatrix.translate(0.0, 0.4, 0.0);
  modelMatrix.scale(0.5, 0.5, 0.5);
  modelMatrix.rotate(currentAngle, 0, 0, 1);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, n);
  
  modelMatrix.translate(0.0, 0.2, 0.0);
  modelMatrix.scale(0.5, 0.5, 0.5);
  modelMatrix.rotate(currentAngle*3, 0, 0, 1);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, n);
  
  modelMatrix = popMatrix();
  pushMatrix(modelMatrix);
    
  modelMatrix.rotate(150+currentAngle*0.5, 0, 0, 1);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, n);
  
  modelMatrix.translate(0.0, 0.4, 0.0);
  modelMatrix.scale(0.5, 0.5, 0.5);
  modelMatrix.rotate(currentAngle, 0, 0, 1);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, n);
  
  modelMatrix.translate(0.0, 0.2, 0.0);
  modelMatrix.scale(0.5, 0.5, 0.5);
  modelMatrix.rotate(currentAngle*3, 0, 0, 1);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, n);
  
  modelMatrix = popMatrix();
  pushMatrix(modelMatrix);
    
  modelMatrix.rotate(180+currentAngle*0.5, 0, 0, 1);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, n);
  
  modelMatrix.translate(0.0, 0.4, 0.0);
  modelMatrix.scale(0.5, 0.5, 0.5);
  modelMatrix.rotate(currentAngle, 0, 0, 1);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, n);
  
  modelMatrix.translate(0.0, 0.2, 0.0);
  modelMatrix.scale(0.5, 0.5, 0.5);
  modelMatrix.rotate(currentAngle*3, 0, 0, 1);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, n);
  
  modelMatrix = popMatrix();
  pushMatrix(modelMatrix);
    
  modelMatrix.rotate(210+currentAngle*0.5, 0, 0, 1);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, n);
  
  modelMatrix.translate(0.0, 0.4, 0.0);
  modelMatrix.scale(0.5, 0.5, 0.5);
  modelMatrix.rotate(currentAngle, 0, 0, 1);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, n);
  
  modelMatrix.translate(0.0, 0.2, 0.0);
  modelMatrix.scale(0.5, 0.5, 0.5);
  modelMatrix.rotate(currentAngle*3, 0, 0, 1);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, n);
  
  modelMatrix = popMatrix();
  pushMatrix(modelMatrix);
    
  modelMatrix.rotate(240+currentAngle*0.5, 0, 0, 1);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, n);
  
  modelMatrix.translate(0.0, 0.4, 0.0);
  modelMatrix.scale(0.5, 0.5, 0.5);
  modelMatrix.rotate(currentAngle, 0, 0, 1);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, n);
  
  modelMatrix.translate(0.0, 0.2, 0.0);
  modelMatrix.scale(0.5, 0.5, 0.5);
  modelMatrix.rotate(currentAngle*3, 0, 0, 1);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, n);
  
  modelMatrix = popMatrix();
  pushMatrix(modelMatrix);
    
  modelMatrix.rotate(270+currentAngle*0.5, 0, 0, 1);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, n);
  
  modelMatrix.translate(0.0, 0.4, 0.0);
  modelMatrix.scale(0.5, 0.5, 0.5);
  modelMatrix.rotate(currentAngle, 0, 0, 1);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, n);
  
  modelMatrix.translate(0.0, 0.2, 0.0);
  modelMatrix.scale(0.5, 0.5, 0.5);
  modelMatrix.rotate(currentAngle*3, 0, 0, 1);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, n);
  
  modelMatrix = popMatrix();
  pushMatrix(modelMatrix);
    
  modelMatrix.rotate(300+currentAngle*0.5, 0, 0, 1);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, n);
  
  modelMatrix.translate(0.0, 0.4, 0.0);
  modelMatrix.scale(0.5, 0.5, 0.5);
  modelMatrix.rotate(currentAngle, 0, 0, 1);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, n);
  
  modelMatrix.translate(0.0, 0.2, 0.0);
  modelMatrix.scale(0.5, 0.5, 0.5);
  modelMatrix.rotate(currentAngle*3, 0, 0, 1);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, n);
  
  modelMatrix = popMatrix();
  pushMatrix(modelMatrix);
    
  modelMatrix.rotate(330+currentAngle*0.5, 0, 0, 1);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, n);
  
  modelMatrix.translate(0.0, 0.4, 0.0);
  modelMatrix.scale(0.5, 0.5, 0.5);
  modelMatrix.rotate(currentAngle, 0, 0, 1);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, n);
  
  modelMatrix.translate(0.0, 0.2, 0.0);
  modelMatrix.scale(0.5, 0.5, 0.5);
  modelMatrix.rotate(currentAngle*3, 0, 0, 1);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, n);
}

function draw(gl, n, currentAngle, currentp, modelMatrix, u_ModelMatrix) {
//==============================================================================
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
 
  clrColr = new Float32Array(4);
  clrColr = gl.getParameter(gl.COLOR_CLEAR_VALUE);
 
 //---------Draw Neck----------------
  
  modelMatrix.setTranslate(0.4+Mx, 0.1+My ,0);
  
  var dist = Math.sqrt(xMdragTot*xMdragTot + yMdragTot*yMdragTot);
  modelMatrix.rotate(dist*120.0, -yMdragTot+0.0001, xMdragTot+0.0001, 0.0);
  
  modelMatrix.translate(-0.3, -0.2, 0.0);
  modelMatrix.rotate(3*currentAngle, 0, 1, 0);
  modelMatrix.rotate(currentAngle, 0, 0, 1);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, n);
   
  pushMatrix(modelMatrix);
  
 //---------Draw Body----------------- 
  modelMatrix.rotate(90.0+0.5*currentAngle, 0, 0, 1);
  modelMatrix.translate(-0.2, 0.0, 0.0);
  modelMatrix.scale(2.0, 2.0, 2.0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, n);
  
 //---------Draw Leg------------------
  modelMatrix.translate(-0.075, 0.15, 0.0);
  modelMatrix.rotate(90.0+2.0*currentAngle, 0, 0, 1);
  modelMatrix.scale(0.3, 0.3, 0.3);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, n);
  
  modelMatrix.translate(0.02, 0.45, 0.0);
  modelMatrix.rotate(-90.0, 0, 0, 1);
  modelMatrix.scale(0.3, 0.3, 0.3);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, n);
  
  modelMatrix.translate(0.0, -0.2, 0.0);
  modelMatrix.rotate(210.0+2*currentAngle, 0, 0, 1);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, n);
  
  modelMatrix.rotate(-60.0, 0, 0, 1);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, n);
  
 //---------Draw Tails----------------- 
  modelMatrix = popMatrix();
  pushMatrix(modelMatrix);
  modelMatrix.rotate(90.0+0.5*currentAngle, 0, 0, 1);
  modelMatrix.translate(-0.2, 0.7, 0.0);
  modelMatrix.rotate(3*currentAngle, 0, 0, 1);
  modelMatrix.scale(0.4, 1.0, 1.0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, n);
   
  modelMatrix.scale(2.5, 1.0, 1.0);
  modelMatrix.rotate(60.0, 0, 0, 1);
  modelMatrix.scale(0.4, 1.0, 1.0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, n);
  
  modelMatrix.scale(2.5, 1.0, 1.0);
  modelMatrix.rotate(-120.0, 0, 0, 1);
  modelMatrix.scale(0.4, 1.0, 1.0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, n);
  
  modelMatrix.scale(2.5, 1.0, 1.0);
  modelMatrix.rotate(30.0, 0, 0, 1);
  modelMatrix.scale(0.4, 1.0, 1.0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, n);

  modelMatrix.scale(2.5, 1.0, 1.0);
  modelMatrix.rotate(60.0, 0, 0, 1);
  modelMatrix.scale(0.4, 1.0, 1.0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, n);
  
  modelMatrix.scale(2.5, 1.0, 1.0);
  modelMatrix.rotate(60.0, 0, 0, 1);
  modelMatrix.scale(0.4, 1.0, 1.0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, n);
  
  modelMatrix.scale(2.5, 1.0, 1.0);
  modelMatrix.rotate(30.0, 0, 0, 1);
  modelMatrix.scale(0.4, 1.0, 1.0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, n);
  
  modelMatrix.scale(2.5, 1.0, 1.0);
  modelMatrix.rotate(-210.0, 0, 0, 1);
  modelMatrix.scale(0.4, 1.0, 1.0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, n);
  
  modelMatrix.scale(2.5, 1.0, 1.0);
  modelMatrix.rotate(-30.0, 0, 0, 1);
  modelMatrix.scale(0.4, 1.0, 1.0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, n);
  
  modelMatrix.scale(2.5, 1.0, 1.0);
  modelMatrix.rotate(15.0, 0, 0, 1);
  modelMatrix.scale(0.4, 0.8, 1.0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, n);
  
  modelMatrix.scale(2.5, 1.25, 1.0);
  modelMatrix.rotate(30.0, 0, 0, 1);
  modelMatrix.scale(0.4, 0.8, 1.0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, n);
  
  modelMatrix.scale(2.5, 1.25, 1.0);
  modelMatrix.rotate(30.0, 0, 0, 1);
  modelMatrix.scale(0.4, 0.8, 1.0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, n);
  
  modelMatrix.scale(2.5, 1.25, 1.0);
  modelMatrix.rotate(30.0, 0, 0, 1);
  modelMatrix.scale(0.4, 0.8, 1.0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, n);
  
  modelMatrix.scale(2.5, 1.25, 1.0);
  modelMatrix.rotate(30.0, 0, 0, 1);
  modelMatrix.scale(0.4, 0.8, 1.0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, n);
  
  modelMatrix.scale(2.5, 1.25, 1.0);
  modelMatrix.rotate(30.0, 0, 0, 1);
  modelMatrix.scale(0.4, 0.8, 1.0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, n);
  
  modelMatrix.scale(2.5, 1.25, 1.0);
  modelMatrix.rotate(30.0, 0, 0, 1);
  modelMatrix.scale(0.4, 0.8, 1.0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, n);
  
  modelMatrix.scale(2.5, 1.25, 1.0);
  modelMatrix.rotate(30.0, 0, 0, 1);
  modelMatrix.scale(0.4, 0.8, 1.0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, n);
    
  modelMatrix = popMatrix();
  
 //---------Draw Head----------------
  modelMatrix.translate(0.0, 0.4, 0.0);
  modelMatrix.scale(0.5, 0.5, 0.5);
  modelMatrix.rotate(-90.0+1.5*currentAngle, 0, 0, 1);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, n);
  
 //---------Draw Cockscomb-----------
  pushMatrix(modelMatrix);
  modelMatrix.translate(0.08, 0.15, 0.0);
  modelMatrix.scale(0.5, 0.5, 0.5);
  modelMatrix.rotate(-80.0+1.8*currentAngle, 0, 0, 1);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, n);
  modelMatrix = popMatrix();
  
  modelMatrix.translate(-0.1, 0.0, 0.0);
  modelMatrix.scale(0.5, 0.5, 0.5);
  modelMatrix.rotate(90.0+1.2*currentAngle, 0, 0, 1);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, n);
  
  modelMatrix.translate(0.2, 0.05, 0.0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, n);
  
  modelMatrix.translate(-0.4, 0.0, 0.0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, n);
  
}

var g_last = Date.now();

function animate(angle) {
  var now = Date.now();
  var elapsed = now - g_last;
  g_last = now;
  if(angle >  15.0 && ANGLE_STEP > 0) ANGLE_STEP = -ANGLE_STEP;
  if(angle < -15.0 && ANGLE_STEP < 0) ANGLE_STEP = -ANGLE_STEP;
  
  var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
  return newAngle %= 360;
}

var g_last0 = Date.now();
function animate0(p) {
  var now = Date.now();
  var elapsed = now - g_last0;
  g_last0 = now;
  if(p >=  0.4 && step > 0) step = -step;
  if(p <= -0.4 && step < 0) step = -step;
  var newp = p + (step * elapsed) /40;
  return newp;
}

function moreCCW() {
  ANGLE_STEP += 5; 
}

function lessCCW() {
  ANGLE_STEP -= 5; 
}

function pause_restart() {
 if(ANGLE_STEP*ANGLE_STEP > 1) {
    myTmp = ANGLE_STEP;
    ANGLE_STEP = 0;
  }
  else {
  	ANGLE_STEP = myTmp;
  }
}

function speedUP() {
  if(ANGLE_STEP >= 0)
  {
   ANGLE_STEP += 5;
  }
  if(ANGLE_STEP < 0)
  {
   ANGLE_STEP -= 5;
  }
}

function speedDOWN() {
  if(ANGLE_STEP > 0)
  {
   ANGLE_STEP -= 5;
  }
  if(ANGLE_STEP < 0)
  {
   ANGLE_STEP += 5;
  }
}

function keyHelp(event)
        {
	 if(event.keyCode===72)
	 {
	  window.open("Help.html")
	 }
	 if(event.keyCode===69)
	 {
	  if(ANGLE_STEP*ANGLE_STEP > 1) 
	  {
	   myTmp = ANGLE_STEP;
           ANGLE_STEP = 0;
          } 
          else
          {
  	   ANGLE_STEP = myTmp;
          }
	 }
	 if(event.keyCode===81)
	 {
	  ANGLE_STEP -= 5;
	 }
	 if(event.keyCode===87)
	 {
	  ANGLE_STEP += 5;
	 }
	 if(event.keyCode===82)
	 {
	  if(ANGLE_STEP >= 0)
  	  {
	   ANGLE_STEP += 5;
 	  }
	  if(ANGLE_STEP < 0)
 	  {
	   ANGLE_STEP -= 5;
	  }
	 }
	 if(event.keyCode===84)
	 {
	  if(ANGLE_STEP > 0)
  	  {
   	   ANGLE_STEP -= 5;
   	  }
  	  if(ANGLE_STEP < 0)
  	  {
   	   ANGLE_STEP += 5;
  	  }
	 }
	 if(event.keyCode===83)
	 {
	  Ty += 0.1;
	  Tyy += 0.1;
	 } 
	}
	
function clearDrag() {
// Called when user presses 'Clear' button in our webpage
	xMdragTot = 0.0;
	yMdragTot = 0.0;
	ANGLE_STEP = 5.0;
}
        
//===================Mouse event-handling Callbacks
function myMouseDown(ev, gl, canvas) {
  var rect = ev.target.getBoundingClientRect();
  var xp = ev.clientX - rect.left;
  var yp = canvas.height - (ev.clientY - rect.top);
  var x = (xp - canvas.width/2) / (canvas.width/2);
  var y = (yp - canvas.height/2) / (canvas.height/2);
  isDrag = true;
  if(x > 0.7) {
    Mx += 0.1;
  }
  else if(x < -0.7) {
    Mx -= 0.1;
  }
  if(y > 0.7) {
    My += 0.1;
  }
  else if(y < -0.7) {
    My -= 0.1;
  }
  xMclik = x;
  yMclik = y;
};

function myMouseMove(ev, gl, canvas) {
  if(isDrag==false) return;
  var rect = ev.target.getBoundingClientRect();
  var xp = ev.clientX - rect.left;
  var yp = canvas.height - (ev.clientY - rect.top);
  var x = (xp - canvas.width/2) / (canvas.width/2);
  var y = (yp - canvas.height/2) / (canvas.height/2);
  xMdragTot += (x - xMclik);
  yMdragTot += (y - yMclik);
  xMclik = x;
  yMclik = y;
};

function myMouseUp(ev, gl, canvas) {
  var rect = ev.target.getBoundingClientRect();
  var xp = ev.clientX - rect.left;
  var yp = canvas.height - (ev.clientY - rect.top);
  var x = (xp - canvas.width/2) / (canvas.width/2);
  var y = (yp - canvas.height/2) / (canvas.height/2);
  console.log('myMouseUp  (CVV coords  ):  x, y=\t',x,',\t',y);
  isDrag = false;
  xMdragTot += (x - xMclik);
  yMdragTot += (y - yMclik);
  console.log('myMouseUp: xMdragTot,yMdragTot =',xMdragTot,',\t',yMdragTot);
};

function angleSubmit() {
  var UsrTxt=document.getElementById('usrAngle').value;	
  document.getElementById('Result').innerHTML ='You Typed: '+UsrTxt;
};