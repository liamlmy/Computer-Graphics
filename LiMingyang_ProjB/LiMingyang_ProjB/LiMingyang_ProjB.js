var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'uniform mat4 u_ViewMatrix;\n' +
  'attribute vec4 a_Normal;\n' +
  'uniform mat4 u_NormalMatrix;\n' +
  'uniform vec3 u_LightDirection;\n' +
  'uniform vec3 u_AmbientLight;\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_Position = u_ViewMatrix * a_Position;\n' +
  '  vec4 normal = u_NormalMatrix * a_Normal;\n' +
  '  float nDotL = max(dot(u_LightDirection, normalize(a_Normal.xyz)), 0.0);\n' +
  '  vec3 ambient = u_AmbientLight * a_Color.rgb;\n' +
  '  v_Color = vec4(a_Color.xyz * nDotL + ambient, a_Color.a);\n' + 
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Color;\n' +
  '}\n';
  
var floatsPerVertex = 9;
var ANGLE_STEP = 45.0;
var step = 0.01;
var velocity = 0.05;
var isDrag = false;
var xMclick = 0.0;
var yMclick = 0.0;
var xMdragTot = 0.0;
var yMdragTot = 0.0;

var qNew = new Quaternion(0,0,0,1);
var qTot = new Quaternion(0,0,0,1);
var quatMatrix = new Matrix4();

var canvas;
var viewMatrix = new Matrix4();
var u_AmbientLight;
var u_ViewMatrix;
var u_LightDirection;
var u_NormalMatrix;
var n;
var currentv = 0.0;
var view = 0.0;

var aa = 0.0;
var bb = 0.0;
var cc = 0.0;
var dd = 0.0;
var ee = 0.0;

function main() {
  canvas = document.getElementById('webgl');  //canvas be a globale variable
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  canvas.onmousedown = function(ev) {myMouseDown(ev, gl, canvas)};
  canvas.onmousemove = function(ev) {myMouseMove(ev, gl, canvas)};
  canvas.onmouseup = function(ev) {myMouseUp(ev, gl, canvas)};

  gl.depthFunc(gl.LESS);  //default value--just so you know it's there
  gl.enable(gl.DEPTH_TEST); 
  gl.clearColor(0.1, 0.1, 0.15, 1.0);
  n = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to specify the vertex information');
    return;
  }
  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  u_LightDirection = gl.getUniformLocation(gl.program, 'u_LightDirection');
  u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight');

  if (!u_ViewMatrix || !u_LightDirection || !u_NormalMatrix || !u_AmbientLight) { 
    console.log('Failed to get the storage location');
    return;
  }

  var lightDirection = new Vector3([1.0, 0.0, 0.0]);
  lightDirection.normalize();
  gl.uniform3fv(u_LightDirection, lightDirection.elements);
  gl.uniform3f(u_AmbientLight, 0.5, 0.5, 0.5);
  
  var currentAngle = 0.0;
  var currentp = 0.0;
  //var currentv = 0.0;

  //======================================================
  testQuaternions();
  //======================================================

  document.onkeydown= function(ev){keydown(ev, gl, u_ViewMatrix, viewMatrix); };  //arrow button to control the eye-point

  var tick = function() {
    currentAngle = animate(currentAngle);
    currentp = animate0(currentp);
    currentv = animate1(currentv);
    drawResize(currentAngle, currentp, currentv);
    requestAnimationFrame(tick, canvas);
  }
  tick();
}

function makeGroundGrid() {
  var xcount = 280;     // # of lines to draw in x,y to make the grid.
  var ycount = 280;   
  var xymax = 100.0;      // grid size; extends to cover +/-xymax in x and y.
  var xColr = new Float32Array([0.5, 0.5, 1.0]);  // bright yellow
  var yColr = new Float32Array([0.1, 0.9, 1.0]);

  gndVerts = new Float32Array(floatsPerVertex*2*(xcount+ycount));

  var xgap = xymax/(xcount-1);    // HALF-spacing between lines in x,y;
  var ygap = xymax/(ycount-1);

  // First, step thru x values as we make vertical lines of constant-x:
  for(v=0, j=0; v<2*xcount; v++, j+= floatsPerVertex) {
    if(v%2==0) {  // put even-numbered vertices at (xnow, -xymax, 0)
      gndVerts[j  ] = -xymax + (v  )*xgap;  // x
      gndVerts[j+1] = -xymax;               // y
      gndVerts[j+2] = -5.0;                // z
    }
    else {        // put odd-numbered vertices at (xnow, +xymax, 0).
      gndVerts[j  ] = -xymax + (v-1)*xgap;  // x
      gndVerts[j+1] = xymax;                // y
      gndVerts[j+2] = -5.0;                // z
    }
    gndVerts[j+3] = xColr[0];     // red
    gndVerts[j+4] = xColr[1];     // grn
    gndVerts[j+5] = xColr[2];     // blu
    gndVerts[j+6] = 1.0;
    gndVerts[j+7] = 1.0;
    gndVerts[j+8] = 1.0;
  }
  // Second, step thru y values as wqe make horizontal lines of constant-y:
  // (don't re-initialize j--we're adding more vertices to the array)
  for(v=0; v<2*ycount; v++, j+= floatsPerVertex) {
    if(v%2==0) {    // put even-numbered vertices at (-xymax, ynow, 0)
      gndVerts[j  ] = -xymax;               // x
      gndVerts[j+1] = -xymax + (v  )*ygap;  // y
      gndVerts[j+2] = -5.0;                // z
    }
    else {          // put odd-numbered vertices at (+xymax, ynow, 0).
      gndVerts[j  ] = xymax;                // x
      gndVerts[j+1] = -xymax + (v-1)*ygap;  // y
      gndVerts[j+2] = -5.0;                // z
    }
    gndVerts[j+3] = yColr[0];     // red
    gndVerts[j+4] = yColr[1];     // grn
    gndVerts[j+5] = yColr[2];     // blu
    gndVerts[j+6] = 1.0;
    gndVerts[j+7] = 1.0;
    gndVerts[j+8] = 1.0;
  }
}

function initVertexBuffers(gl) {
//==============================================================================

  // make our 'tree crown' of triangular-shaped trees:
  treeCrownVerts = new Float32Array([
    // 3 Vertex coordinates (x,y,z) and 3 colors (r,g,b) -------> trainglefan
      0.0,     0.0,   -2.0, 0.9, 0.8, 0.1,   0.0,   2.032, -0.297,
     -0.508,  -0.292, -4.0, 0.0, 1.0, 0.5,   0.0,   2.032, -0.297,
      0.508,  -0.292, -4.0, 0.0, 1.0, 1.0,   0.0,   2.032, -0.297,
      0.0,     0.0,   -2.0, 0.9, 0.8, 0.1,  -1.6, 1.016,  0.258,
      0.0,     0.508, -4.0, 0.5, 1.0, 0.0,  -1.6, 1.016,  0.258,
     -0.508,  -0.292, -4.0, 0.0, 1.0, 0.5,  -1.6, 1.016,  0.258,
      0.0,     0.0,   -2.0, 0.9, 0.8, 0.1,  -1.6, 1.016,  0.258,
      0.0,     0.508, -4.0, 0.5, 1.0, 0.0,  -1.6, 1.016,  0.258,
      0.508,  -0.292, -4.0, 0.0, 1.0, 0.5,  -1.6, 1.016,  0.258,
  ]);

  treeTrunkVerts = new Float32Array([
       0.1,  0.1,  -4.0, 0.65, 0.16, 0.16,  1.0, 0.0, 0.0,//right ------> trianglefan
       0.1,  0.1,  -5.0, 0.5,  0.0,  0.0,   1.0, 0.0, 0.0,
       0.1, -0.1,  -4.0, 0.65, 0.16, 0.16,  1.0, 0.0, 0.0,
       0.1, -0.1,  -5.0, 0.5,  0.0,  0.0,   1.0, 0.0, 0.0,
       0.1, -0.1,  -4.0, 0.65, 0.16, 0.16,  1.0, 0.0, 0.0,
       0.1,  0.1,  -5.0, 0.5,  0.0,  0.0,   1.0, 0.0, 0.0,

      -0.1,  0.1,  -4.0, 0.65, 0.16, 0.16,  -1.0, 0.0, 0.0,//left -------> trianglefan
      -0.1,  0.1,  -5.0, 0.5,  0.0,  0.0,   -1.0, 0.0, 0.0,
      -0.1, -0.1,  -4.0, 0.65, 0.16, 0.16,  -1.0, 0.0, 0.0,
      -0.1, -0.1,  -5.0, 0.5,  0.0,  0.0,   -1.0, 0.0, 0.0,
      -0.1,  0.1,  -5.0, 0.5,  0.0,  0.0,   -1.0, 0.0, 0.0,
      -0.1, -0.1,  -4.0, 0.65, 0.16, 0.16,  -1.0, 0.0, 0.0,

       0.1,  0.1,  -4.0, 0.65, 0.16, 0.16,  0.0, 1.0, 0.0,//up -------> trianglefan
       0.1,  0.1,  -5.0, 0.5,  0.0,  0.0,   0.0, 1.0, 0.0,
      -0.1,  0.1,  -4.0, 0.65, 0.16, 0.16,  0.0, 1.0, 0.0,
      -0.1,  0.1,  -5.0, 0.5,  0.0,  0.0,   0.0, 1.0, 0.0,
       0.1,  0.1,  -5.0, 0.5,  0.0,  0.0,   0.0, 1.0, 0.0,
      -0.1,  0.1,  -4.0, 0.65, 0.16, 0.16,  0.0, 1.0, 0.0,

       0.1, -0.1,  -4.0, 0.65, 0.16, 0.16,  0.0, -1.0, 0.0, //down -------> trianglefan
       0.1, -0.1,  -5.0, 0.5,  0.0,  0.0,   0.0, -1.0, 0.0,
      -0.1, -0.1,  -4.0, 0.65, 0.16, 0.16,  0.0, -1.0, 0.0,
      -0.1, -0.1,  -5.0, 0.5,  0.0,  0.0,   0.0, -1.0, 0.0,
      -0.1, -0.1,  -4.0, 0.65, 0.16, 0.16,  0.0, -1.0, 0.0,
       0.1, -0.1,  -5.0, 0.5,  0.0,  0.0,   0.0, -1.0, 0.0,

      -0.1,  0.1,  -4.0, 0.65, 0.16, 0.16, 0.0, 0.0, 1.0,
      -0.1, -0.1,  -4.0, 0.65, 0.16, 0.16, 0.0, 0.0, 1.0,
       0.1, -0.1,  -4.0, 0.65, 0.16, 0.16, 0.0, 0.0, 1.0,
       0.1, -0.1,  -4.0, 0.65, 0.16, 0.16, 0.0, 0.0, 1.0,
      -0.1,  0.1,  -4.0, 0.65, 0.16, 0.16, 0.0, 0.0, 1.0,
       0.1,  0.1,  -4.0, 0.65, 0.16, 0.16, 0.0, 0.0, 1.0,

      -0.1,  0.1,  -5.0, 0.65, 0.16, 0.16, 0.0, 0.0, -1.0,
      -0.1, -0.1,  -5.0, 0.65, 0.16, 0.16, 0.0, 0.0, -1.0,
       0.1, -0.1,  -5.0, 0.65, 0.16, 0.16, 0.0, 0.0, -1.0,
       0.1, -0.1,  -5.0, 0.65, 0.16, 0.16, 0.0, 0.0, -1.0,
      -0.1,  0.1,  -5.0, 0.65, 0.16, 0.16, 0.0, 0.0, -1.0,
       0.1,  0.1,  -5.0, 0.65, 0.16, 0.16, 0.0, 0.0, -1.0,

    ])

  birdVerts = new Float32Array([
      0.10, 0.00,  0.10,   0.0, 0.8, 0.3,   0.08, 0.02, 0.0,
      0.10, 0.00, -0.10,   0.8, 0.8, 0.2,   0.08, 0.02, 0.0,
      0.00, 0.40,  0.00,   0.9, 0.9, 0.6,   0.08, 0.02, 0.0,

     -0.10, 0.00,  0.10,   0.0, 0.8, 0.3,  -0.08, 0.02, 0.0,
     -0.10, 0.00, -0.10,   0.8, 0.8, 0.3,  -0.08, 0.02, 0.0,
      0.00, 0.40,  0.00,   0.9, 0.9, 0.6,  -0.08, 0.02, 0.0,

      0.10, 0.00, -0.10,   0.0, 0.8, 0.3,   0.0, 0.02, -0.08,
     -0.10, 0.00, -0.10,   0.8, 0.8, 0.3,   0.0, 0.02, -0.08,
      0.00, 0.40,  0.00,   0.9, 0.9, 0.6,   0.0, 0.02, -0.08,

      0.10, 0.00,  0.10,   0.0, 0.8, 0.3,   0.0, 0.02, 0.08,
     -0.10, 0.00,  0.10,   0.8, 0.8, 0.3,   0.0, 0.02, 0.08,
      0.00, 0.40,  0.00,   0.9, 0.9, 0.6,   0.0, 0.02, 0.08,
    ])

  sunVerts = new Float32Array([
      0.10, 0.00,  0.10, 1.0, 0.0, 0.0,   0.08, 0.02, 0.0,
      0.10, 0.00, -0.10, 1.0, 0.8, 0.2,   0.08, 0.02, 0.0,
      0.00, 0.40,  0.00, 1.0, 0.2, 0.5,   0.08, 0.02, 0.0,

     -0.10, 0.00,  0.10, 1.0, 0.0, 0.0,  -0.08, 0.02, 0.0,
     -0.10, 0.00, -0.10, 1.0, 0.8, 0.2,  -0.08, 0.02, 0.0,
      0.00, 0.40,  0.00, 1.0, 0.2, 0.5,  -0.08, 0.02, 0.0,

      0.10, 0.00, -0.10, 1.0, 0.0, 0.0,   0.0, 0.02, -0.08,
     -0.10, 0.00, -0.10, 1.0, 0.8, 0.2,   0.0, 0.02, -0.08,
      0.00, 0.40,  0.00, 1.0, 0.2, 0.5,   0.0, 0.02, -0.08,

      0.10, 0.00,  0.10, 1.0, 0.0, 0.0,   0.0, 0.02, 0.08,
     -0.10, 0.00,  0.10, 1.0, 0.8, 0.2,   0.0, 0.02, 0.08,
      0.00, 0.40,  0.00, 1.0, 0.2, 0.5,   0.0, 0.02, 0.08,
    ])

  fishVerts = new Float32Array([
      0.00,  0.00,  0.00, 1.0, 1.0, 0.8,   0.08, 0.08, 0.0,
     -0.20,  0.20,  0.20, 1.0, 1.0, 0.8,   0.08, 0.08, 0.0,
     -0.20,  0.20, -0.20, 1.0, 1.0, 0.8,   0.08, 0.08, 0.0,

      0.00,  0.00,  0.00, 0.3, 1.0, 0.8,   0.08, 0.0, 0.08,
     -0.20,  0.20,  0.20, 0.3, 1.0, 0.8,   0.08, 0.0, 0.08,
     -0.20, -0.20,  0.20, 0.3, 1.0, 0.8,   0.08, 0.0, 0.08,

      0.00,  0.00,  0.00, 1.0, 0.2, 0.8,  -0.08, 0.08, 0.0,
     -0.20, -0.20,  0.20, 1.0, 0.2, 0.8,  -0.08, 0.08, 0.0,
     -0.20, -0.20, -0.20, 1.0, 0.2, 0.8,  -0.08, 0.08, 0.0,

      0.00,  0.00,  0.00, 1.0, 1.0, 0.8,   0.08, 0.0, -0.08,
     -0.20, -0.20, -0.20, 1.0, 1.0, 0.8,   0.08, 0.0, -0.08,
     -0.20,  0.20, -0.20, 1.0, 1.0, 0.8,   0.08, 0.0, -0.08,
    ])

  axisVerts = new Float32Array([
     0.0,  0.0,  0.0,    0.3,  0.3,  0.3,  1.0, 1.0, 1.0, // X axis line (origin: gray)
     1.3,  0.0,  0.0,    1.0,  0.3,  0.3,  1.0, 1.0, 1.0,//             (endpoint: red)
     
     0.0,  0.0,  0.0,    0.3,  0.3,  0.3,  1.0, 1.0, 1.0,  // Y axis line (origin: white)
     0.0,  1.3,  0.0,    0.3,  1.0,  0.3,  1.0, 1.0, 1.0,  //             (endpoint: green)

     0.0,  0.0,  0.0,    0.3,  0.3,  0.3,  1.0, 1.0, 1.0,  // Z axis line (origin:white)
     0.0,  0.0,  1.3,    0.3,  0.3,  1.0,  1.0, 1.0, 1.0,  //             (endpoint: blue)
    ])
  
  makeGroundGrid();

  // How much space to store all the shapes in one array?
  // (no 'var' means this is a global variable)
  mySiz = treeCrownVerts.length + treeTrunkVerts.length + birdVerts.length + sunVerts.length + fishVerts.length + axisVerts.length+ gndVerts.length;

  // How many vertices total?
  var nn = mySiz / floatsPerVertex;
  console.log('nn is', nn, 'mySiz is', mySiz, 'floatsPerVertex is', floatsPerVertex);

  // Copy all shapes into one big Float32 array:
  var verticesColors = new Float32Array(mySiz);
  // Copy them:  remember where to start for each shape:
  treeCrownStart = 0;              // we store the treecrown first
  for(i=0,j=0; j< treeCrownVerts.length; i++,j++) {
    verticesColors[i] = treeCrownVerts[j];
  }
  
  treeTrunkStart = i;              // we store the treetrunk then
  for(j=0; j< treeTrunkVerts.length; i++,j++) {
    verticesColors[i] = treeTrunkVerts[j];
  }
  
  birdStart = i;
  for(j=0; j< birdVerts.length; i++,j++) {
    verticesColors[i] = birdVerts[j];
  }

  sunStart = i;
  for(j=0; j< birdVerts.length; i++,j++) {
    verticesColors[i] = sunVerts[j];
  }

  fishStart = i;
  for(j=0; j< fishVerts.length; i++,j++) {
    verticesColors[i] = fishVerts[j];
  }

  axisStart = i;
  for(j=0; j< axisVerts.length; i++,j++) {
    verticesColors[i] = axisVerts[j];
  }

  gndStart = i;           // next we'll store the ground-plane;
  for(j=0; j< gndVerts.length; i++, j++) {
    verticesColors[i] = gndVerts[j];
  }

  
  // Create a vertex buffer object (VBO)
  var vertexColorbuffer = gl.createBuffer();  
  if (!vertexColorbuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Write vertex information to buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorbuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

  var FSIZE = verticesColors.BYTES_PER_ELEMENT;
  // Assign the buffer object to a_Position and enable the assignment
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if(a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 9, 0);
  gl.enableVertexAttribArray(a_Position);
  // Assign the buffer object to a_Color and enable the assignment
  var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  if(a_Color < 0) {
    console.log('Failed to get the storage location of a_Color');
    return -1;
  }
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 9, FSIZE * 3);
  gl.enableVertexAttribArray(a_Color);

  var a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  if(a_Normal < 0) {
    console.log('Failed to get the storage location of a_Normal');
    return -1;
  }
  gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, FSIZE * 9, FSIZE * 6);
  gl.enableVertexAttribArray(a_Normal);

  return mySiz/floatsPerVertex; // return # of vertices
}

var g_EyeX = 0.0, g_EyeY = 0.0, g_EyeZ = 0.0;
var g_LookX = 0.0, g_LookY = 0.0, g_LookZ = -10.0;
var g_upX = 0.0, g_upY = 0.0;
var currentvv = 0.0;

var change = 0.05;

var left = -2.0;
var right = 2.0;
var bottom = -2.0;
var top = 2.0;
var near = 2.0;
var far = 100.0;

var flag = 0;

function keydown(ev, gl, u_ViewMatrix, viewMatrix) {
//------------------------------------------------------
//HTML calls this'Event handler' or 'callback function' when we press a key:

    if(ev.keyCode == 68) {
      g_EyeX += change;
      g_LookX += change;
    } 
    else if(ev.keyCode == 65) {
      g_EyeX -= change;
      g_LookX -= change;
    }
    else if(ev.keyCode == 87) {
      g_EyeY += change;
      g_LookY += change;
    }
    else if(ev.keyCode == 83) {
      g_EyeY -= change;
      g_LookY -= change;
    }
    else if(ev.keyCode == 188) {
      g_EyeZ -= change;
      g_LookZ -= change;
    }
    else if(ev.keyCode == 190) {
      g_EyeZ += 0.05;
      g_LookZ += 0.05;
    }
    else if(ev.keyCode == 219) {
      g_upX -= 0.02;
    }
    else if(ev.keyCode == 221) {
      g_upX += 0.02;
    }
    else if(ev.keyCode == 38) {
      g_LookY += 0.1;
    }
    else if(ev.keyCode == 40) {
      g_LookY -= 0.1;
    }
    else if(ev.keyCode == 37) {
      if(g_LookZ < g_EyeZ && g_LookX < g_EyeX) {
        g_LookX -= 0.2;
        g_LookZ += 0.2;
      }
      if(g_LookZ > g_EyeZ && g_LookX < g_EyeX) {
        g_LookX += 0.2;
        g_LookZ += 0.2;
      }
      if(g_LookZ > g_EyeZ && g_LookX > g_EyeX) {
        g_LookX += 0.2;
        g_LookZ -= 0.2;
      }
      if(g_LookZ < g_EyeZ && g_LookX > g_EyeX) {
        g_LookX -= 0.2;
        g_LookZ -= 0.2;
      }
      if(g_LookZ < g_EyeZ && g_LookX == g_EyeX) {
        g_LookX -= 0.2;
        g_LookZ += 0.2;
      }
      if(g_LookZ > g_EyeZ && g_LookX == g_EyeX) {
        g_LookX += 0.2;
        g_LookZ -= 0.2;
      }
      if(g_LookZ == g_EyeZ && g_LookX < g_EyeX) {
        g_LookX += 0.2;
        g_LookZ += 0.2;
      }
      if(g_LookZ == g_EyeZ && g_LookX > g_EyeX) {
        g_LookX -= 0.2;
        g_LookZ -= 0.2;
      }
    }
    else if(ev.keyCode == 39) {
      if(g_LookZ < g_EyeZ && g_LookX < g_EyeX) {
        g_LookX += 0.2;
        g_LookZ -= 0.2;
      }
      if(g_LookZ > g_EyeZ && g_LookX < g_EyeX) {
        g_LookX -= 0.2;
        g_LookZ -= 0.2;
      }
      if(g_LookZ > g_EyeZ && g_LookX > g_EyeX) {
        g_LookX -= 0.2;
        g_LookZ += 0.2;
      }
      if(g_LookZ < g_EyeZ && g_LookX > g_EyeX) {
        g_LookX += 0.2;
        g_LookZ += 0.2;
      }
      if(g_LookZ < g_EyeZ && g_LookX == g_EyeX) {
        g_LookX += 0.2;
        g_LookZ -= 0.2;
      }
      if(g_LookZ > g_EyeZ && g_LookX == g_EyeX) {
        g_LookX -= 0.2;
        g_LookZ += 0.2;
      }
      if(g_LookZ == g_EyeZ && g_LookX < g_EyeX) {
        g_LookX -= 0.2;
        g_LookZ -= 0.2;
      }
      if(g_LookZ == g_EyeZ && g_LookX > g_EyeX) {
        g_LookX += 0.2;
        g_LookZ += 0.2;
      }
    }
    else if(ev.keyCode == 191) {
      change *= 2;
    }
    else if(ev.keyCode == 84) {
      cc += 0.1;
    }
    else if(ev.keyCode == 71) {
      cc -= 0.1;
    }
    else if(ev.keyCode == 70) {
      bb -= 0.1;
    }
    else if(ev.keyCode == 72) {
      bb += 0.1;
    }
    else if(ev.keyCode == 82) {
      aa += 0.1;
    }
    else if(ev.keyCode == 89) {
      aa -= 0.1;
    }
    else if(ev.keyCode == 85) {
      ee += 0.5;
    }
    else if(ev.keyCode == 74) {
      ee -= 0.5;
    }
    else if(ev.keyCode == 32) {
      //currentv = animate1(currentv);
      if (flag == 0) {
        flag = 1;
      } else {
        flag = 0;
      }
    }
    else if(ev.keyCode == 57) {
      velocity += 0.02;
    }
    else if(ev.keyCode == 48) {
      velocity -= 0.02;
    }
    else if(ev.keyCode == 187) {
      view -= 0.2;
    }
    else if(ev.keyCode == 189) {
      view += 0.2;
    }
    else if(ev.keyCode == 66) {
      window.open("Help.html");
    }
    else {
      return;
    }
    draw(gl, currentAngle, currentp, currentv, u_ViewMatrix, viewMatrix);    
}



function draw(gl, currentAngle, currentp, currentv) {
  gl.enable(gl.DEPTH_TEST); 
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  var vv = (g_LookX - g_EyeX) * (g_LookX - g_EyeX) + (g_LookY - g_EyeY) * (g_LookY - g_EyeY) + (g_LookZ - g_EyeZ) * (g_LookZ - g_EyeZ);
  var vx = (g_LookX - g_EyeX) * (g_LookX - g_EyeX) / vv;
  var vy = (g_LookY - g_EyeY) * (g_LookY - g_EyeY) / vv;
  var vz = (g_LookZ - g_EyeZ) * (g_LookZ - g_EyeZ) / vv;

  //-----------------------------------------
  gl.viewport(0, 0, gl.drawingBufferWidth/2, gl.drawingBufferHeight);
  var vpAspect = gl.drawingBufferWidth/2 /      // On-screen aspect ratio for
                (gl.drawingBufferHeight);   // this camera: width/height.
  viewMatrix.setPerspective(40, vpAspect + view / 10, 1, 100);
  if(flag == 0) {
    viewMatrix.lookAt(g_EyeX, g_EyeY, g_EyeZ, g_LookX, g_LookY, g_LookZ, 0+g_upX, 1, 0);
  } else {
    if (g_LookY >= g_EyeY) {
      vy = vy * currentv;
    } else {
      vy = -vy * currentv;
    }
    if (g_LookX >= g_EyeX) {
      vx = vx * currentv;
    } else {
      vx = -vx * currentv;
    }
    if (g_LookZ >= g_EyeZ) {
      vz = vz * currentv;
    } else {
      vz = -vz * currentv;
    }

    viewMatrix.lookAt(g_EyeX + vx, g_EyeY + vy, g_EyeZ + vz, g_LookX + vx, g_LookY + vy, g_LookZ + vz, 0+g_upX, 1, 0);
  }       
  

  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);

  drawMyScene(gl, currentAngle, currentp, u_ViewMatrix, viewMatrix);
 
  //------------------------------------------
  gl.viewport(gl.drawingBufferWidth/2, 0, gl.drawingBufferWidth/2, gl.drawingBufferHeight);
  var vpAspect = gl.drawingBufferWidth/2 /          // On-screen aspect ratio for
            (gl.drawingBufferHeight);       // this camera: width/height.

  viewMatrix.setOrtho(-2.0 - view / 5, 2.0 + view / 5, -2.0, 2.0, 2.0, 200.0);
  if(flag == 0) {
    viewMatrix.lookAt(g_EyeX, g_EyeY, g_EyeZ, g_LookX, g_LookY, g_LookZ, 0+g_upX, 1, 0);
  } else {

    viewMatrix.lookAt(g_EyeX + vx, g_EyeY + vy, g_EyeZ + vz, g_LookX + vx, g_LookY + vy, g_LookZ + vz, 0+g_upX, 1, 0);
  }  

  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);

  drawMyScene(gl, currentAngle, currentp, u_ViewMatrix, viewMatrix);
}

function drawMyScene(myGL, currentAngle, currentp, myu_ViewMatrix, myViewMatrix) {

  myViewMatrix.rotate(-90.0, 1, 0, 0);
  
  pushMatrix(myViewMatrix);
  myViewMatrix.translate(0.0, 10.0, 3.0);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  drawBirdcontrol(myGL, currentAngle, currentp, myu_ViewMatrix, myViewMatrix);
  myViewMatrix = popMatrix();

  myViewMatrix.translate(2.2, -2.2, 0.0);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, treeTrunkStart/floatsPerVertex, treeTrunkVerts.length/floatsPerVertex);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, treeCrownStart/floatsPerVertex, treeCrownVerts.length/floatsPerVertex);
  myViewMatrix.translate(-2.2, 2.2, 0.0);

  myViewMatrix.translate(-1.2, 2.0, 0.0);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, treeTrunkStart/floatsPerVertex, treeTrunkVerts.length/floatsPerVertex);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, treeCrownStart/floatsPerVertex, treeCrownVerts.length/floatsPerVertex);
  myViewMatrix.translate(1.2, -2.0, 0.0);

  myViewMatrix.translate(8.5, 8.5, 0.0);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, treeTrunkStart/floatsPerVertex, treeTrunkVerts.length/floatsPerVertex);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, treeCrownStart/floatsPerVertex, treeCrownVerts.length/floatsPerVertex);
  myViewMatrix.translate(-8.5, -8.5, 0.0);

  myViewMatrix.translate(-1.2, 17.0, 0.0);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, treeTrunkStart/floatsPerVertex, treeTrunkVerts.length/floatsPerVertex);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, treeCrownStart/floatsPerVertex, treeCrownVerts.length/floatsPerVertex);
  myViewMatrix.translate(1.2, -17.0, 0.0);

  myGL.drawArrays(myGL.LINES, gndStart/floatsPerVertex, gndVerts.length/floatsPerVertex); //draw the ground

  pushMatrix(myViewMatrix);
  myViewMatrix.translate(0.0, 6.0, 0.0);
  myViewMatrix.translate(1.5, 0.0, 2.0);
  myViewMatrix.scale(0.2, 0.2, 0.2);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.LINES, axisStart/floatsPerVertex, axisVerts.length/floatsPerVertex); //draw the fixed world coordinate

  myViewMatrix = popMatrix();
  pushMatrix(myViewMatrix);
  
  pushMatrix(myViewMatrix);
  //quatMatrix.setFromQuat(qTot.x, qTot.y, qTot.z, qTot.w);
  //myViewMatrix.concat(quatMatrix);
  drawBird(myGL, currentAngle, currentp, myu_ViewMatrix, myViewMatrix); //draw the first bird
  
  myViewMatrix = popMatrix();
  pushMatrix(myViewMatrix);
  myViewMatrix.translate(-2.5, 10.8, 1.5);
  myViewMatrix.translate(0.0, currentp/5, 0.0);
  drawBird(myGL, currentAngle, currentp, myu_ViewMatrix, myViewMatrix) //draw the second bird

  myViewMatrix = popMatrix();
  pushMatrix(myViewMatrix);
  //quatMatrix.setFromQuat(qTot.x, qTot.y, qTot.z, qTot.w);
  //myViewMatrix.concat(quatMatrix);
  myViewMatrix.rotate(currentp/3, 1, 0, 0);
  myViewMatrix.translate(1.0, 5.5, 3.5);
  drawBird(myGL, currentAngle, currentp, myu_ViewMatrix, myViewMatrix); //draw the third bird

  myViewMatrix = popMatrix();
  pushMatrix(myViewMatrix);
  myViewMatrix.translate(0.3, 15.5, 4.5);
  drawBird(myGL, currentAngle, currentp, myu_ViewMatrix, myViewMatrix); //draw the forth bird

  myViewMatrix = popMatrix();
  pushMatrix(myViewMatrix);
  myViewMatrix.translate(2.3, -17.5, 5.5);
  myViewMatrix.rotate(currentp/5, 0, 1, 0);
  myViewMatrix.translate(0.0, currentp*2, 0.0);
  drawBird(myGL, currentAngle, currentp, myu_ViewMatrix, myViewMatrix); //draw the fifth bird

  myViewMatrix = popMatrix();
  pushMatrix(myViewMatrix);
  myViewMatrix.translate(22.3, -1.5, 5.5);
  myViewMatrix.rotate(currentp/15, 0, 1, 0);
  myViewMatrix.translate(0.0, currentp*2, 0.0);
  drawBird(myGL, currentAngle, currentp, myu_ViewMatrix, myViewMatrix); //draw the fifth bird

  myViewMatrix = popMatrix();
  pushMatrix(myViewMatrix);
  myViewMatrix.translate(0.0, 16.0, -5.0);
  myViewMatrix.translate(currentp/10+currentAngle/5, 0.0, 0.0);
  myViewMatrix.rotate(currentAngle*2, 0, 0, 1);
  drawFish(myGL, currentAngle, currentp, myu_ViewMatrix, myViewMatrix); //draw the fist fish

  myViewMatrix = popMatrix();
  pushMatrix(myViewMatrix);
  myViewMatrix.translate(-15.0, 40.0, -5.0);
  myViewMatrix.translate(currentp/8, 0.0, 0.0);
  myViewMatrix.rotate(currentAngle*2, 0, 0, 1);
  drawFish(myGL, currentAngle, currentp, myu_ViewMatrix, myViewMatrix); //draw the second fish

  myViewMatrix = popMatrix();
  pushMatrix(myViewMatrix);
  myViewMatrix.translate(-35.0, 12.0, -5.0);
  myViewMatrix.translate(currentp/8, 0.0, 0.0);
  myViewMatrix.rotate(currentAngle*2, 0, 0, 1);
  drawFish(myGL, currentAngle, currentp, myu_ViewMatrix, myViewMatrix); //draw the third fish

  myViewMatrix = popMatrix();
  pushMatrix(myViewMatrix);
  myViewMatrix.translate(15.0, -2.0, -5.0);
  myViewMatrix.translate(currentp/3, 0.0, 0.0);
  myViewMatrix.rotate(currentAngle*2, 0, 0, 1);
  drawFish(myGL, currentAngle, currentp, myu_ViewMatrix, myViewMatrix); //draw the fourth fish

  myViewMatrix = popMatrix();
  pushMatrix(myViewMatrix);
  myViewMatrix.translate(5.0, -35.0, -5.0);
  myViewMatrix.translate(currentp/3, 0.0, 0.0);
  myViewMatrix.rotate(currentAngle*2, 0, 0, 1);
  drawFish(myGL, currentAngle, currentp, myu_ViewMatrix, myViewMatrix); //draw the fourth fish

  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.LINES, axisStart/floatsPerVertex, axisVerts.length/floatsPerVertex);

  myViewMatrix = popMatrix();
  pushMatrix(myViewMatrix);
  myViewMatrix.translate(-5.0, 15.0, 7.0);
  myViewMatrix.scale(5.0, 5.0, 5.0);
  drawSun(myGL, currentAngle, currentp, myu_ViewMatrix, myViewMatrix);  //draw the sun

  //myViewMatrix.setTranslate(0.0, 0.0, 0.0);
  myViewMatrix = popMatrix();
  pushMatrix(myViewMatrix);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.LINES, axisStart/floatsPerVertex, axisVerts.length/floatsPerVertex); //draw the sun's coordinates
}

function drawFish(myGL, currentAngle, currentp, myu_ViewMatrix, myViewMatrix) {
  myViewMatrix.scale(1.8, 1.8, 1.8);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, fishStart/floatsPerVertex, fishVerts.length/floatsPerVertex);

  myViewMatrix.rotate(180.0, 0, 0, 1);
  myViewMatrix.scale(1.2, 0.8, 0.8);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, fishStart/floatsPerVertex, fishVerts.length/floatsPerVertex);

  myViewMatrix.rotate(180.0, 0, 0, 1);
  myViewMatrix.translate(0.7, 0.0, 0.0);
  myViewMatrix.scale(2.5, 1.5, 1.5);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, fishStart/floatsPerVertex, fishVerts.length/floatsPerVertex);
}

function drawSun(myGL, currentAngle, currentp, myu_ViewMatrix, myViewMatrix) {
  myViewMatrix.translate(-2.0, 5.0, 0.0);
  myViewMatrix.rotate(90.0, 1, 0, 0);
  myViewMatrix.translate(0.5-currentp/40, 0.6, 0.0);

  myViewMatrix.rotate(10*currentp, 0, 0, 1);
  myViewMatrix.scale(0.5, 0.5, 0.5);
  
  pushMatrix(myViewMatrix);
  
  myViewMatrix.rotate(currentp*0.5, 0, 0, 1);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, sunStart/floatsPerVertex, sunVerts.length/floatsPerVertex);
  
  myViewMatrix.translate(0.0, 0.4, 0.0);
  myViewMatrix.scale(0.5, 0.5, 0.5);
  myViewMatrix.rotate(currentp, 0, 0, 1);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, sunStart/floatsPerVertex, sunVerts.length/floatsPerVertex);
  
  myViewMatrix.translate(0.0, 0.2, 0.0);
  myViewMatrix.scale(0.5, 0.5, 0.5);
  myViewMatrix.rotate(currentp*3, 0, 0, 1);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, sunStart/floatsPerVertex, sunVerts.length/floatsPerVertex);
  
  myViewMatrix = popMatrix();
  pushMatrix(myViewMatrix);  
  
  myViewMatrix.rotate(30+currentp*0.5, 0, 0, 1);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, sunStart/floatsPerVertex, sunVerts.length/floatsPerVertex);
  
  myViewMatrix.translate(0.0, 0.4, 0.0);
  myViewMatrix.scale(0.5, 0.5, 0.5);
  myViewMatrix.rotate(currentp, 0, 0, 1);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, sunStart/floatsPerVertex, sunVerts.length/floatsPerVertex);
  
  myViewMatrix.translate(0.0, 0.2, 0.0);
  myViewMatrix.scale(0.5, 0.5, 0.5);
  myViewMatrix.rotate(currentp*3, 0, 0, 1);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, sunStart/floatsPerVertex, sunVerts.length/floatsPerVertex);
  
  myViewMatrix = popMatrix();
  pushMatrix(myViewMatrix);
    
  myViewMatrix.rotate(60+currentp*0.5, 0, 0, 1);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, sunStart/floatsPerVertex, sunVerts.length/floatsPerVertex);
  
  myViewMatrix.translate(0.0, 0.4, 0.0);
  myViewMatrix.scale(0.5, 0.5, 0.5);
  myViewMatrix.rotate(currentp, 0, 0, 1);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, sunStart/floatsPerVertex, sunVerts.length/floatsPerVertex);
  
  myViewMatrix.translate(0.0, 0.2, 0.0);
  myViewMatrix.scale(0.5, 0.5, 0.5);
  myViewMatrix.rotate(currentp*3, 0, 0, 1);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, sunStart/floatsPerVertex, sunVerts.length/floatsPerVertex);
  
  myViewMatrix = popMatrix();
  pushMatrix(myViewMatrix);
    
  myViewMatrix.rotate(90+currentp*0.5, 0, 0, 1);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, sunStart/floatsPerVertex, sunVerts.length/floatsPerVertex);
  
  myViewMatrix.translate(0.0, 0.4, 0.0);
  myViewMatrix.scale(0.5, 0.5, 0.5);
  myViewMatrix.rotate(currentp, 0, 0, 1);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, sunStart/floatsPerVertex, sunVerts.length/floatsPerVertex);
  
  myViewMatrix.translate(0.0, 0.2, 0.0);
  myViewMatrix.scale(0.5, 0.5, 0.5);
  myViewMatrix.rotate(currentp*3, 0, 0, 1);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, sunStart/floatsPerVertex, sunVerts.length/floatsPerVertex);
  
  myViewMatrix = popMatrix();
  pushMatrix(myViewMatrix);
    
  myViewMatrix.rotate(120+currentp*0.5, 0, 0, 1);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, sunStart/floatsPerVertex, sunVerts.length/floatsPerVertex);
  
  myViewMatrix.translate(0.0, 0.4, 0.0);
  myViewMatrix.scale(0.5, 0.5, 0.5);
  myViewMatrix.rotate(currentp, 0, 0, 1);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, sunStart/floatsPerVertex, sunVerts.length/floatsPerVertex);
  
  myViewMatrix.translate(0.0, 0.2, 0.0);
  myViewMatrix.scale(0.5, 0.5, 0.5);
  myViewMatrix.rotate(currentp*3, 0, 0, 1);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, sunStart/floatsPerVertex, sunVerts.length/floatsPerVertex);
  
  myViewMatrix = popMatrix();
  pushMatrix(myViewMatrix);
    
  myViewMatrix.rotate(150+currentp*0.5, 0, 0, 1);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, sunStart/floatsPerVertex, sunVerts.length/floatsPerVertex);
  
  myViewMatrix.translate(0.0, 0.4, 0.0);
  myViewMatrix.scale(0.5, 0.5, 0.5);
  myViewMatrix.rotate(currentp, 0, 0, 1);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, sunStart/floatsPerVertex, sunVerts.length/floatsPerVertex);
  
  myViewMatrix.translate(0.0, 0.2, 0.0);
  myViewMatrix.scale(0.5, 0.5, 0.5);
  myViewMatrix.rotate(currentp*3, 0, 0, 1);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, sunStart/floatsPerVertex, sunVerts.length/floatsPerVertex);
  
  myViewMatrix = popMatrix();
  pushMatrix(myViewMatrix);
    
  myViewMatrix.rotate(180+currentp*0.5, 0, 0, 1);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, sunStart/floatsPerVertex, sunVerts.length/floatsPerVertex);
  
  myViewMatrix.translate(0.0, 0.4, 0.0);
  myViewMatrix.scale(0.5, 0.5, 0.5);
  myViewMatrix.rotate(currentp, 0, 0, 1);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, sunStart/floatsPerVertex, sunVerts.length/floatsPerVertex);
  
  myViewMatrix.translate(0.0, 0.2, 0.0);
  myViewMatrix.scale(0.5, 0.5, 0.5);
  myViewMatrix.rotate(currentp*3, 0, 0, 1);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, sunStart/floatsPerVertex, sunVerts.length/floatsPerVertex);
  
  myViewMatrix = popMatrix();
  pushMatrix(myViewMatrix);
    
  myViewMatrix.rotate(210+currentp*0.5, 0, 0, 1);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, sunStart/floatsPerVertex, sunVerts.length/floatsPerVertex);
  
  myViewMatrix.translate(0.0, 0.4, 0.0);
  myViewMatrix.scale(0.5, 0.5, 0.5);
  myViewMatrix.rotate(currentp, 0, 0, 1);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, sunStart/floatsPerVertex, sunVerts.length/floatsPerVertex);
  
  myViewMatrix.translate(0.0, 0.2, 0.0);
  myViewMatrix.scale(0.5, 0.5, 0.5);
  myViewMatrix.rotate(currentp*3, 0, 0, 1);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, sunStart/floatsPerVertex, sunVerts.length/floatsPerVertex);
  
  myViewMatrix = popMatrix();
  pushMatrix(myViewMatrix);
    
  myViewMatrix.rotate(240+currentp*0.5, 0, 0, 1);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, sunStart/floatsPerVertex, sunVerts.length/floatsPerVertex);
  
  myViewMatrix.translate(0.0, 0.4, 0.0);
  myViewMatrix.scale(0.5, 0.5, 0.5);
  myViewMatrix.rotate(currentp, 0, 0, 1);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, sunStart/floatsPerVertex, sunVerts.length/floatsPerVertex);
  
  myViewMatrix.translate(0.0, 0.2, 0.0);
  myViewMatrix.scale(0.5, 0.5, 0.5);
  myViewMatrix.rotate(currentp*3, 0, 0, 1);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, sunStart/floatsPerVertex, sunVerts.length/floatsPerVertex);
  
  myViewMatrix = popMatrix();
  pushMatrix(myViewMatrix);
    
  myViewMatrix.rotate(270+currentp*0.5, 0, 0, 1);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, sunStart/floatsPerVertex, sunVerts.length/floatsPerVertex);
  
  myViewMatrix.translate(0.0, 0.4, 0.0);
  myViewMatrix.scale(0.5, 0.5, 0.5);
  myViewMatrix.rotate(currentp, 0, 0, 1);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, sunStart/floatsPerVertex, sunVerts.length/floatsPerVertex);

  myViewMatrix.translate(0.0, 0.2, 0.0);
  myViewMatrix.scale(0.5, 0.5, 0.5);
  myViewMatrix.rotate(currentp*3, 0, 0, 1);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, sunStart/floatsPerVertex, sunVerts.length/floatsPerVertex);
  
  myViewMatrix = popMatrix();
  pushMatrix(myViewMatrix);
    
  myViewMatrix.rotate(300+currentp*0.5, 0, 0, 1);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, sunStart/floatsPerVertex, sunVerts.length/floatsPerVertex);
  
  myViewMatrix.translate(0.0, 0.4, 0.0);
  myViewMatrix.scale(0.5, 0.5, 0.5);
  myViewMatrix.rotate(currentp, 0, 0, 1);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, sunStart/floatsPerVertex, sunVerts.length/floatsPerVertex);
  
  myViewMatrix.translate(0.0, 0.2, 0.0);
  myViewMatrix.scale(0.5, 0.5, 0.5);
  myViewMatrix.rotate(currentp*3, 0, 0, 1);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, sunStart/floatsPerVertex, sunVerts.length/floatsPerVertex);
  
  myViewMatrix = popMatrix();
  pushMatrix(myViewMatrix);
    
  myViewMatrix.rotate(330+currentp*0.5, 0, 0, 1);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, sunStart/floatsPerVertex, sunVerts.length/floatsPerVertex);
  
  myViewMatrix.translate(0.0, 0.4, 0.0);
  myViewMatrix.scale(0.5, 0.5, 0.5);
  myViewMatrix.rotate(currentp, 0, 0, 1);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, sunStart/floatsPerVertex, sunVerts.length/floatsPerVertex);
  
  myViewMatrix.translate(0.0, 0.2, 0.0);
  myViewMatrix.scale(0.5, 0.5, 0.5);
  myViewMatrix.rotate(currentp*3, 0, 0, 1);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, sunStart/floatsPerVertex, sunVerts.length/floatsPerVertex);
}

function drawBird(myGL, currentAngle, currentp, myu_ViewMatrix, myViewMatrix) {
  
  //---------Draw Neck----------------
  myViewMatrix.translate(3.0+bb, 0.0+aa, -3.0+cc);
  myViewMatrix.rotate(90.0+dd, 0, 0, 1);
  myViewMatrix.rotate(90.0+ee, 1, 0, 0);

  myViewMatrix.translate(-0.3, -0.2, -3.0);
  myViewMatrix.rotate(3*currentAngle, 0, 1, 0);
  myViewMatrix.rotate(currentAngle, 0, 0, 1);

  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, birdStart/floatsPerVertex, birdVerts.length/floatsPerVertex);
   
  pushMatrix(myViewMatrix);
  
 //---------Draw Body----------------- 
  myViewMatrix.rotate(90.0+0.5*currentAngle, 0, 0, 1);
  myViewMatrix.translate(-0.2, 0.0, 0.0);
  myViewMatrix.scale(2.0, 2.0, 2.0);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, birdStart/floatsPerVertex, birdVerts.length/floatsPerVertex);
  
 //---------Draw Leg------------------
  myViewMatrix.translate(-0.075, 0.15, 0.0);
  myViewMatrix.rotate(90.0+2.0*currentAngle, 0, 0, 1);
  myViewMatrix.scale(0.3, 0.3, 0.3);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, birdStart/floatsPerVertex, birdVerts.length/floatsPerVertex);
  
  myViewMatrix.translate(0.02, 0.45, 0.0);
  myViewMatrix.rotate(-90.0, 0, 0, 1);
  myViewMatrix.scale(0.3, 0.3, 0.3);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, birdStart/floatsPerVertex, birdVerts.length/floatsPerVertex);
  
  myViewMatrix.translate(0.0, -0.2, 0.0);
  myViewMatrix.rotate(210.0+2*currentAngle, 0, 0, 1);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, birdStart/floatsPerVertex, birdVerts.length/floatsPerVertex);
  
  myViewMatrix.rotate(-60.0, 0, 0, 1);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, birdStart/floatsPerVertex, birdVerts.length/floatsPerVertex);
  
 //---------Draw Tails----------------- 
  myViewMatrix = popMatrix();
  pushMatrix(myViewMatrix);
  myViewMatrix.rotate(90.0+0.5*currentAngle, 0, 0, 1);
  myViewMatrix.translate(-0.2, 0.7, 0.0);
  myViewMatrix.rotate(3*currentAngle, 0, 0, 1);
  myViewMatrix.scale(0.4, 1.0, 1.0);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, birdStart/floatsPerVertex, birdVerts.length/floatsPerVertex);
  
  myViewMatrix.scale(2.5, 1.0, 1.0);
  myViewMatrix.rotate(60.0, 0, 0, 1);
  myViewMatrix.scale(0.4, 1.0, 1.0);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, birdStart/floatsPerVertex, birdVerts.length/floatsPerVertex);
  
  myViewMatrix.scale(2.5, 1.0, 1.0);
  myViewMatrix.rotate(-120.0, 0, 0, 1);
  myViewMatrix.scale(0.4, 1.0, 1.0);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, birdStart/floatsPerVertex, birdVerts.length/floatsPerVertex);
  
  myViewMatrix.scale(2.5, 1.0, 1.0);
  myViewMatrix.rotate(30.0, 0, 0, 1);
  myViewMatrix.scale(0.4, 1.0, 1.0);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, birdStart/floatsPerVertex, birdVerts.length/floatsPerVertex);

  myViewMatrix.scale(2.5, 1.0, 1.0);
  myViewMatrix.rotate(60.0, 0, 0, 1);
  myViewMatrix.scale(0.4, 1.0, 1.0);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, birdStart/floatsPerVertex, birdVerts.length/floatsPerVertex);
  
  myViewMatrix.scale(2.5, 1.0, 1.0);
  myViewMatrix.rotate(60.0, 0, 0, 1);
  myViewMatrix.scale(0.4, 1.0, 1.0);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, birdStart/floatsPerVertex, birdVerts.length/floatsPerVertex);
  
  myViewMatrix.scale(2.5, 1.0, 1.0);
  myViewMatrix.rotate(30.0, 0, 0, 1);
  myViewMatrix.scale(0.4, 1.0, 1.0);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, birdStart/floatsPerVertex, birdVerts.length/floatsPerVertex);
  
  myViewMatrix.scale(2.5, 1.0, 1.0);
  myViewMatrix.rotate(-210.0, 0, 0, 1);
  myViewMatrix.scale(0.4, 1.0, 1.0);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, birdStart/floatsPerVertex, birdVerts.length/floatsPerVertex);
 
  myViewMatrix.scale(2.5, 1.0, 1.0);
  myViewMatrix.rotate(-30.0, 0, 0, 1);
  myViewMatrix.scale(0.4, 1.0, 1.0);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, birdStart/floatsPerVertex, birdVerts.length/floatsPerVertex);
  
  myViewMatrix.scale(2.5, 1.0, 1.0);
  myViewMatrix.rotate(15.0, 0, 0, 1);
  myViewMatrix.scale(0.4, 0.8, 1.0);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, birdStart/floatsPerVertex, birdVerts.length/floatsPerVertex);
  
  myViewMatrix.scale(2.5, 1.25, 1.0);
  myViewMatrix.rotate(30.0, 0, 0, 1);
  myViewMatrix.scale(0.4, 0.8, 1.0);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, birdStart/floatsPerVertex, birdVerts.length/floatsPerVertex);
  
  myViewMatrix.scale(2.5, 1.25, 1.0);
  myViewMatrix.rotate(30.0, 0, 0, 1);
  myViewMatrix.scale(0.4, 0.8, 1.0);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, birdStart/floatsPerVertex, birdVerts.length/floatsPerVertex);
  
  myViewMatrix.scale(2.5, 1.25, 1.0);
  myViewMatrix.rotate(30.0, 0, 0, 1);
  myViewMatrix.scale(0.4, 0.8, 1.0);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, birdStart/floatsPerVertex, birdVerts.length/floatsPerVertex);
  
  myViewMatrix.scale(2.5, 1.25, 1.0);
  myViewMatrix.rotate(30.0, 0, 0, 1);
  myViewMatrix.scale(0.4, 0.8, 1.0);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, birdStart/floatsPerVertex, birdVerts.length/floatsPerVertex);
  
  myViewMatrix.scale(2.5, 1.25, 1.0);
  myViewMatrix.rotate(30.0, 0, 0, 1);
  myViewMatrix.scale(0.4, 0.8, 1.0);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, birdStart/floatsPerVertex, birdVerts.length/floatsPerVertex);
  
  myViewMatrix.scale(2.5, 1.25, 1.0);
  myViewMatrix.rotate(30.0, 0, 0, 1);
  myViewMatrix.scale(0.4, 0.8, 1.0);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, birdStart/floatsPerVertex, birdVerts.length/floatsPerVertex);
  
  myViewMatrix.scale(2.5, 1.25, 1.0);
  myViewMatrix.rotate(30.0, 0, 0, 1);
  myViewMatrix.scale(0.4, 0.8, 1.0);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, birdStart/floatsPerVertex, birdVerts.length/floatsPerVertex);
    
  myViewMatrix = popMatrix();
  
 //---------Draw Head----------------
  myViewMatrix.translate(0.0, 0.4, 0.0);
  myViewMatrix.scale(0.5, 0.5, 0.5);
  myViewMatrix.rotate(-90.0+1.5*currentAngle, 0, 0, 1);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, birdStart/floatsPerVertex, birdVerts.length/floatsPerVertex);

  myViewMatrix.rotate(-90.0, 0, 1, 0);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.LINES, axisStart/floatsPerVertex, axisVerts.length/floatsPerVertex);
  myViewMatrix.rotate(90.0, 0, 1, 0);
  
 //---------Draw Cockscomb-----------
  pushMatrix(myViewMatrix);
  myViewMatrix.translate(0.08, 0.15, 0.0);
  myViewMatrix.scale(0.5, 0.5, 0.5);
  myViewMatrix.rotate(-80.0+1.8*currentAngle, 0, 0, 1);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, birdStart/floatsPerVertex, birdVerts.length/floatsPerVertex);
  myViewMatrix = popMatrix();
  
  myViewMatrix.translate(-0.1, 0.0, 0.0);
  myViewMatrix.scale(0.5, 0.5, 0.5);
  myViewMatrix.rotate(90.0+1.2*currentAngle, 0, 0, 1);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, birdStart/floatsPerVertex, birdVerts.length/floatsPerVertex);
  
  myViewMatrix.translate(0.2, 0.05, 0.0);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, birdStart/floatsPerVertex, birdVerts.length/floatsPerVertex);
  
  myViewMatrix.translate(-0.4, 0.0, 0.0);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, birdStart/floatsPerVertex, birdVerts.length/floatsPerVertex);
}

function drawBirdcontrol(myGL, currentAngle, currentp, myu_ViewMatrix, myViewMatrix) {
  quatMatrix.setFromQuat(qTot.x, qTot.y, qTot.z, qTot.w);
  myViewMatrix.concat(quatMatrix);
  //---------Draw Neck----------------

  myViewMatrix.translate(3.0+bb, 0.0+aa, -3.0+cc);
  myViewMatrix.rotate(90.0+dd, 0, 0, 1);
  myViewMatrix.rotate(90.0+ee, 1, 0, 0);

  myViewMatrix.translate(-0.3, -0.2, -3.0);
  myViewMatrix.rotate(3*currentAngle, 0, 1, 0);
  myViewMatrix.rotate(currentAngle, 0, 0, 1);

  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, birdStart/floatsPerVertex, birdVerts.length/floatsPerVertex);
   
  pushMatrix(myViewMatrix);
  
 //---------Draw Body----------------- 
  myViewMatrix.rotate(90.0+0.5*currentAngle, 0, 0, 1);
  myViewMatrix.translate(-0.2, 0.0, 0.0);
  myViewMatrix.scale(2.0, 2.0, 2.0);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, birdStart/floatsPerVertex, birdVerts.length/floatsPerVertex);
  
 //---------Draw Leg------------------
  myViewMatrix.translate(-0.075, 0.15, 0.0);
  myViewMatrix.rotate(90.0+2.0*currentAngle, 0, 0, 1);
  myViewMatrix.scale(0.3, 0.3, 0.3);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, birdStart/floatsPerVertex, birdVerts.length/floatsPerVertex);
  
  myViewMatrix.translate(0.02, 0.45, 0.0);
  myViewMatrix.rotate(-90.0, 0, 0, 1);
  myViewMatrix.scale(0.3, 0.3, 0.3);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, birdStart/floatsPerVertex, birdVerts.length/floatsPerVertex);
  
  myViewMatrix.translate(0.0, -0.2, 0.0);
  myViewMatrix.rotate(210.0+2*currentAngle, 0, 0, 1);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, birdStart/floatsPerVertex, birdVerts.length/floatsPerVertex);
  
  myViewMatrix.rotate(-60.0, 0, 0, 1);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, birdStart/floatsPerVertex, birdVerts.length/floatsPerVertex);
  
 //---------Draw Tails----------------- 
  myViewMatrix = popMatrix();
  pushMatrix(myViewMatrix);
  myViewMatrix.rotate(90.0+0.5*currentAngle, 0, 0, 1);
  myViewMatrix.translate(-0.2, 0.7, 0.0);
  myViewMatrix.rotate(3*currentAngle, 0, 0, 1);
  myViewMatrix.scale(0.4, 1.0, 1.0);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, birdStart/floatsPerVertex, birdVerts.length/floatsPerVertex);
  
  myViewMatrix.scale(2.5, 1.0, 1.0);
  myViewMatrix.rotate(60.0, 0, 0, 1);
  myViewMatrix.scale(0.4, 1.0, 1.0);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, birdStart/floatsPerVertex, birdVerts.length/floatsPerVertex);
  
  myViewMatrix.scale(2.5, 1.0, 1.0);
  myViewMatrix.rotate(-120.0, 0, 0, 1);
  myViewMatrix.scale(0.4, 1.0, 1.0);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, birdStart/floatsPerVertex, birdVerts.length/floatsPerVertex);
  
  myViewMatrix.scale(2.5, 1.0, 1.0);
  myViewMatrix.rotate(30.0, 0, 0, 1);
  myViewMatrix.scale(0.4, 1.0, 1.0);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, birdStart/floatsPerVertex, birdVerts.length/floatsPerVertex);

  myViewMatrix.scale(2.5, 1.0, 1.0);
  myViewMatrix.rotate(60.0, 0, 0, 1);
  myViewMatrix.scale(0.4, 1.0, 1.0);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, birdStart/floatsPerVertex, birdVerts.length/floatsPerVertex);
  
  myViewMatrix.scale(2.5, 1.0, 1.0);
  myViewMatrix.rotate(60.0, 0, 0, 1);
  myViewMatrix.scale(0.4, 1.0, 1.0);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, birdStart/floatsPerVertex, birdVerts.length/floatsPerVertex);
  
  myViewMatrix.scale(2.5, 1.0, 1.0);
  myViewMatrix.rotate(30.0, 0, 0, 1);
  myViewMatrix.scale(0.4, 1.0, 1.0);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, birdStart/floatsPerVertex, birdVerts.length/floatsPerVertex);
  
  myViewMatrix.scale(2.5, 1.0, 1.0);
  myViewMatrix.rotate(-210.0, 0, 0, 1);
  myViewMatrix.scale(0.4, 1.0, 1.0);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, birdStart/floatsPerVertex, birdVerts.length/floatsPerVertex);
 
  myViewMatrix.scale(2.5, 1.0, 1.0);
  myViewMatrix.rotate(-30.0, 0, 0, 1);
  myViewMatrix.scale(0.4, 1.0, 1.0);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, birdStart/floatsPerVertex, birdVerts.length/floatsPerVertex);
  
  myViewMatrix.scale(2.5, 1.0, 1.0);
  myViewMatrix.rotate(15.0, 0, 0, 1);
  myViewMatrix.scale(0.4, 0.8, 1.0);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, birdStart/floatsPerVertex, birdVerts.length/floatsPerVertex);
  
  myViewMatrix.scale(2.5, 1.25, 1.0);
  myViewMatrix.rotate(30.0, 0, 0, 1);
  myViewMatrix.scale(0.4, 0.8, 1.0);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, birdStart/floatsPerVertex, birdVerts.length/floatsPerVertex);
  
  myViewMatrix.scale(2.5, 1.25, 1.0);
  myViewMatrix.rotate(30.0, 0, 0, 1);
  myViewMatrix.scale(0.4, 0.8, 1.0);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, birdStart/floatsPerVertex, birdVerts.length/floatsPerVertex);
  
  myViewMatrix.scale(2.5, 1.25, 1.0);
  myViewMatrix.rotate(30.0, 0, 0, 1);
  myViewMatrix.scale(0.4, 0.8, 1.0);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, birdStart/floatsPerVertex, birdVerts.length/floatsPerVertex);
  
  myViewMatrix.scale(2.5, 1.25, 1.0);
  myViewMatrix.rotate(30.0, 0, 0, 1);
  myViewMatrix.scale(0.4, 0.8, 1.0);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, birdStart/floatsPerVertex, birdVerts.length/floatsPerVertex);
  
  myViewMatrix.scale(2.5, 1.25, 1.0);
  myViewMatrix.rotate(30.0, 0, 0, 1);
  myViewMatrix.scale(0.4, 0.8, 1.0);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, birdStart/floatsPerVertex, birdVerts.length/floatsPerVertex);
  
  myViewMatrix.scale(2.5, 1.25, 1.0);
  myViewMatrix.rotate(30.0, 0, 0, 1);
  myViewMatrix.scale(0.4, 0.8, 1.0);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, birdStart/floatsPerVertex, birdVerts.length/floatsPerVertex);
  
  myViewMatrix.scale(2.5, 1.25, 1.0);
  myViewMatrix.rotate(30.0, 0, 0, 1);
  myViewMatrix.scale(0.4, 0.8, 1.0);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, birdStart/floatsPerVertex, birdVerts.length/floatsPerVertex);
    
  myViewMatrix = popMatrix();
  
 //---------Draw Head----------------
  myViewMatrix.translate(0.0, 0.4, 0.0);
  myViewMatrix.scale(0.5, 0.5, 0.5);
  myViewMatrix.rotate(-90.0+1.5*currentAngle, 0, 0, 1);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, birdStart/floatsPerVertex, birdVerts.length/floatsPerVertex);

  myViewMatrix.rotate(-90.0, 0, 1, 0);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.LINES, axisStart/floatsPerVertex, axisVerts.length/floatsPerVertex);
  myViewMatrix.rotate(90.0, 0, 1, 0);
  
 //---------Draw Cockscomb-----------
  pushMatrix(myViewMatrix);
  myViewMatrix.translate(0.08, 0.15, 0.0);
  myViewMatrix.scale(0.5, 0.5, 0.5);
  myViewMatrix.rotate(-80.0+1.8*currentAngle, 0, 0, 1);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, birdStart/floatsPerVertex, birdVerts.length/floatsPerVertex);
  myViewMatrix = popMatrix();
  
  myViewMatrix.translate(-0.1, 0.0, 0.0);
  myViewMatrix.scale(0.5, 0.5, 0.5);
  myViewMatrix.rotate(90.0+1.2*currentAngle, 0, 0, 1);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, birdStart/floatsPerVertex, birdVerts.length/floatsPerVertex);
  
  myViewMatrix.translate(0.2, 0.05, 0.0);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, birdStart/floatsPerVertex, birdVerts.length/floatsPerVertex);
  
  myViewMatrix.translate(-0.4, 0.0, 0.0);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES, birdStart/floatsPerVertex, birdVerts.length/floatsPerVertex);
}

var g_last = Date.now();
function animate(angle) {
  var now = Date.now();
  var elapsed = now - g_last;
  g_last = now;
  if(angle >  10.0 && ANGLE_STEP > 0) ANGLE_STEP = -ANGLE_STEP;
  if(angle < -10.0 && ANGLE_STEP < 0) ANGLE_STEP = -ANGLE_STEP;
  var newAngle = angle + (ANGLE_STEP * elapsed) / 5000.0;
  return newAngle %= 360;
}

var g_last0 = Date.now();
function animate0(p) {
  var now = Date.now();
  var elapsed = now - g_last0;
  g_last0 = now;
  if(p >=  20.0 && step > 0) step = -step;
  if(p <= -20.0 && step < 0) step = -step;
  var newp = p + (step * elapsed) / 3;
  return newp;
}
//======================================================================================================================
var g_last1 = Date.now();
function animate1(v) {
  var now = Date.now();
  var elapsed = now - g_last1;
  g_last0 = now;
  var newv = (velocity * elapsed) / 50;
  return newv;
}
//======================================================================================================================
function clearDrag() {
  xMdragTot = 0.0;
  yMdragTot = 0.0;
}

function resetQuat() {
  var res = 5;
  qTot.clear();
  document.getElementById('QuatValue').innerHTML = '\t X=' +qTot.x.toFixed(res)+'i\t Y=' +qTot.y.toFixed(res)+'j\t Z=' +qTot.z.toFixed(res)+'k\t W=' +qTot.w.toFixed(res)+'<br>length='+qTot.length().toFixed(res);
}

function myMouseDown(ev, gl, canvas) {
  var rect = ev.target.getBoundingClientRect();
  var xp = ev.clientX - rect.left;
  var yp = canvas.height - (ev.clientY - rect.top);
  var x = (xp - canvas.width/2) / (canvas.width/2);
  var y = (yp - canvas.height/2) / (canvas.height/2);

  isDrag = true;
  xMclik = x;
  yMclik = y;
}

function myMouseMove(ev, gl, canvas) {
  if(isDrag==false) return;
  var rect = ev.target.getBoundingClientRect();
  var xp = ev.clientX - rect.left;
  var yp = canvas.height - (ev.clientY - rect.top);
  var x = (xp - canvas.width/2) / (canvas.width/2);
  var y = (yp - canvas.height/2) / (canvas.height/2);

  xMdragTot += (x - xMclik);
  yMdragTot += (y - yMclik);
  dragQuat((x - xMclik)/20, (y - yMclik)/20);
  
  xMclik = x;
  yMclik = y;
  
  document.getElementById('MouseText').innerHTML=
      'Mouse Drag totals (CVV x,y coords):\t'+
       xMdragTot.toFixed(5)+', \t'+
       yMdragTot.toFixed(5);  
};

function myMouseUp(ev, gl, canvas) {
  var rect = ev.target.getBoundingClientRect();
  var xp = ev.clientX - rect.left;
  var yp = canvas.height - (ev.clientY - rect.top);
  var x = (xp - canvas.width/2) / (canvas.width/2);
  var y = (yp - canvas.height/2) / (canvas.height/2);
  
  isDrag = false;
  xMdragTot += (x - xMclik);
  yMdragTot += (y - yMclik);

  dragQuat((x - xMclik)/20, (y - yMclik)/20);

  document.getElementById('MouseText').innerHTML=
      'Mouse Drag totals (CVV x,y coords):\t'+
       xMdragTot.toFixed(5)+', \t'+
       yMdragTot.toFixed(5);  
};

function dragQuat(xdrag, ydrag) {
  var res = 5;
  var qTmp = new Quaternion(0,0,0,1);
  
  var dist = Math.sqrt(xdrag*xdrag + ydrag*ydrag);
  qNew.setFromAxisAngle(-ydrag + 0.0001, xdrag + 0.0001, 0.0, dist*150.0);
              
  qTmp.multiply(qNew,qTot);
  qTot.copy(qTmp);
  document.getElementById('QuatValue').innerHTML= 
                             '\t X=' +qTot.x.toFixed(res)+
                            'i\t Y=' +qTot.y.toFixed(res)+
                            'j\t Z=' +qTot.z.toFixed(res)+
                            'k\t W=' +qTot.w.toFixed(res)+
                            '<br>length='+qTot.length().toFixed(res);
};

function testQuaternions() {
  var res = 5;
  var myQuat = new Quaternion(1,2,3,4);   
    console.log('constructor: myQuat(x,y,z,w)=', 
    myQuat.x, myQuat.y, myQuat.z, myQuat.w);
  myQuat.clear();
    console.log('myQuat.clear()=', 
    myQuat.x.toFixed(res), myQuat.y.toFixed(res), 
    myQuat.z.toFixed(res), myQuat.w.toFixed(res));
  myQuat.set(1,2, 3,4);
    console.log('myQuat.set(1,2,3,4)=', 
    myQuat.x.toFixed(res), myQuat.y.toFixed(res), 
    myQuat.z.toFixed(res), myQuat.w.toFixed(res));
    console.log('myQuat.length()=', myQuat.length().toFixed(res));
  myQuat.normalize();
    console.log('myQuat.normalize()=', 
    myQuat.x.toFixed(res), myQuat.y.toFixed(res), myQuat.z.toFixed(res), myQuat.w.toFixed(res));
    // Simplest possible quaternions:
  myQuat.setFromAxisAngle(1,0,0,0);
    console.log('Set myQuat to 0-deg. rot. on x axis=',
    myQuat.x.toFixed(res), myQuat.y.toFixed(res), myQuat.z.toFixed(res), myQuat.w.toFixed(res));
  myQuat.setFromAxisAngle(0,1,0,0);
    console.log('set myQuat to 0-deg. rot. on y axis=',
    myQuat.x.toFixed(res), myQuat.y.toFixed(res), myQuat.z.toFixed(res), myQuat.w.toFixed(res));
  myQuat.setFromAxisAngle(0,0,1,0);
    console.log('set myQuat to 0-deg. rot. on z axis=',
    myQuat.x.toFixed(res), myQuat.y.toFixed(res), myQuat.z.toFixed(res), myQuat.w.toFixed(res), '\n');
    
  myQmat = new Matrix4();
  myQuat.setFromAxisAngle(1,0,0, 90.0); 
    console.log('set myQuat to +90-deg rot. on x axis =',
    myQuat.x.toFixed(res), myQuat.y.toFixed(res), myQuat.z.toFixed(res), myQuat.w.toFixed(res));
  myQmat.setFromQuat(myQuat.x, myQuat.y, myQuat.z, myQuat.w);
    console.log('myQuat as matrix: (+y axis <== -z axis)(+z axis <== +y axis)');
    myQmat.printMe();
  
  myQuat.setFromAxisAngle(0,1,0, 90.0); 
    console.log('set myQuat to +90-deg rot. on y axis =',
    myQuat.x.toFixed(res), myQuat.y.toFixed(res), myQuat.z.toFixed(res), myQuat.w.toFixed(res));
  myQmat.setFromQuat(myQuat.x, myQuat.y, myQuat.z, myQuat.w);
    console.log('myQuat as matrix: (+x axis <== +z axis)(+z axis <== -x axis)');
    myQmat.printMe();

  myQuat.setFromAxisAngle(0,0,1, 90.0); 
    console.log('set myQuat to +90-deg rot. on z axis =',
    myQuat.x.toFixed(res), myQuat.y.toFixed(res), myQuat.z.toFixed(res), myQuat.w.toFixed(res));
  myQmat.setFromQuat(myQuat.x, myQuat.y, myQuat.z, myQuat.w);
    console.log('myQuat as matrix: (+x axis <== -y axis)(+y axis <== +x axis)');
    myQmat.printMe();

  var qx90 = new Quaternion;
  var qy90 = new Quaternion;
  qx90.setFromAxisAngle(1,0,0,90.0);
  qy90.setFromAxisAngle(0,1,0,90.0);
  myQuat.multiply(qx90,qy90);
    console.log('set myQuat to (90deg x axis) * (90deg y axis) = ',
    myQuat.x.toFixed(res), myQuat.y.toFixed(res), myQuat.z.toFixed(res), myQuat.w.toFixed(res));
  myQmat.setFromQuat(myQuat.x, myQuat.y, myQuat.z, myQuat.w);
  console.log('myQuat as matrix: (+x <== +z)(+y <== +x )(+z <== +y');
  myQmat.printMe();
}

function drawResize(currentAngle, currentp, currentv) {

  var nuCanvas = document.getElementById('webgl');
  var nuGL = getWebGLContext(nuCanvas);

  console.log('nuCanvas width,height=', nuCanvas.width, nuCanvas.height);   
  console.log('Browser window: innerWidth,innerHeight=', innerWidth, innerHeight);
  nuCanvas.width = innerWidth;
  nuCanvas.height = innerHeight*3/4;
  draw(nuGL, currentAngle, currentp, currentv);
}
