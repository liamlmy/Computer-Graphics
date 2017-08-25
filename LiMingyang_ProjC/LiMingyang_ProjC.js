
var VSHADER_SOURCE =
	'precision mediump float;\n' +
	'precision highp int;\n' +
	'uniform int u_shading;\n' +
//==================light0==================
	'uniform	vec3 u_lightpos0;\n' +
	'uniform 	vec3 u_lightambi0;\n' +
	'uniform 	vec3 u_lightdiff0;\n' +
	'uniform	vec3 u_lightspec0;\n' +
//==================light0==================
	'uniform	vec3 u_lightpos1;\n' +
	'uniform 	vec3 u_lightambi1;\n' +
	'uniform 	vec3 u_lightdiff1;\n' +
	'uniform	vec3 u_lightspec1;\n' +	
//==================material==================
	'uniform	vec3 u_matemit;\n' +
	'uniform	vec3 u_matambi;\n' +
	'uniform	vec3 u_matdiff;\n' +
	'uniform	vec3 u_matspec;\n' +
	'uniform	int u_matshiny;\n' +	

	'attribute vec4 a_Position; \n' +
	'attribute vec4 a_Normal; \n' +
	'uniform mat4 u_MvpMatrix; \n' +
	'uniform mat4 u_ModelMatrix; \n' +
	'uniform mat4 u_NormalMatrix; \n' +
	'uniform vec4 u_Color;\n' +
	'varying vec3 v_reflect; \n' +
	'varying vec4 v_Position; \n' +
	'varying vec3 v_Normal; \n' +
	'varying vec4 v_Color;\n' +
	'uniform vec4 u_eyePosition; \n' +
	'void main() { \n' +
	'  gl_Position = u_MvpMatrix * a_Position;\n' +
	'  v_Position = u_ModelMatrix * a_Position; \n' +
	'  v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +

	'  if (u_shading==3){\n' +
	'    v_Color = u_Color;\n'+
	'		 return;\n'+
	'  }\n' +
	'  if (u_shading==2){\n' +
	'    float nDotL = max(dot(normalize(u_lightpos0 - v_Position.xyz), v_Normal), 0.0); \n' +
	'    float nDotLU = max(dot(normalize(u_lightpos1 - v_Position.xyz), v_Normal), 0.0); \n' +
	'    vec3 H = normalize(normalize(u_lightpos0 - v_Position.xyz) + normalize(u_eyePosition.xyz - v_Position.xyz)); \n' +
	'    vec3 HU = normalize(normalize(u_lightpos1 - v_Position.xyz) + normalize(u_eyePosition.xyz - v_Position.xyz)); \n' +
	'    float nDotH = max(dot(H, v_Normal), 0.0); \n' +
	'    float nDotHU = max(dot(HU, v_Normal), 0.0); \n' +
	'    float e64 = pow(nDotH, float(u_matshiny));\n' +
	'    float e64U = pow(nDotHU, float(u_matshiny));\n' +
	'	   vec3 emissive = u_matemit;' +
	'    vec3 ambient = u_lightambi0 * u_matambi + u_lightambi1 * u_matambi;\n' +
	'    vec3 diffuse = u_lightdiff0 * u_matdiff * nDotL + u_lightdiff1 * u_matdiff * nDotLU;\n' +
	'	   vec3 speculr = u_lightspec0 * u_matspec * e64 + u_lightspec1 * u_matspec * e64U;\n' +
	'    v_Color = vec4(emissive + ambient +diffuse + speculr , 1.0);\n' +
	'		 return;\n'+
	'  }\n' +
	'  if (u_shading==1){\n' +
	'    float nDotL = max(dot(normalize(u_lightpos0 - v_Position.xyz), v_Normal), 0.0); \n' +
	'    float nDotLU = max(dot(normalize(u_lightpos1 - v_Position.xyz), v_Normal), 0.0); \n' +
	'    vec3 diffuse = u_lightdiff0 * u_Color.rgb * nDotL + u_lightdiff1 * u_Color.rgb * nDotLU;\n' +
	'    vec3 ambient = u_lightambi0 * u_Color.rgb + u_lightambi1 * u_Color.rgb;\n' +
	'    v_Color = vec4(diffuse + ambient, u_Color.a);\n' +
	'		 return;\n'+
	'  }\n' +
	'  v_reflect = u_matdiff; \n' +
	'}\n';

var FSHADER_SOURCE =
  	'precision mediump float;\n' +
	'precision highp int;\n' +
//==================light0==================
	'uniform	vec3 u_lightpos0;\n' +
	'uniform 	vec3 u_lightambi0;\n' +
	'uniform 	vec3 u_lightdiff0;\n' +
	'uniform	vec3 u_lightspec0;\n' +
//==================light1==================
	'uniform	vec3 u_lightpos1;\n' +
	'uniform 	vec3 u_lightambi1;\n' +
	'uniform 	vec3 u_lightdiff1;\n' +
	'uniform	vec3 u_lightspec1;\n' +	
//==================material==================
	'uniform	vec3 u_matemit;\n' +
	'uniform	vec3 u_matambi;\n' +
	'uniform	vec3 u_matdiff;\n' +
	'uniform	vec3 u_matspec;\n' +
	'uniform	int u_matshiny;\n' +	

	'uniform int u_shading;\n' +
  	'uniform vec4 u_eyePosition; \n' +
  	'varying vec3 v_Normal;\n' +
  	'varying vec4 v_Position;\n' +
  	'varying vec3 v_reflect;	\n' +
	'varying vec4 v_Color;\n' +

  	'void main() { \n' +
	'	 if (u_shading==0){\n'+
	'    	 gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);\n'+
	'		 return;\n'+
	'  }\n'+
	'	 if (u_shading==2 || u_shading == 1){\n'+
	'    gl_FragColor = v_Color;\n'+
	'		 return;\n'+
	'  }\n'+
	'  vec3 normal = normalize(v_Normal); \n' +
	'  float nDotL = max(dot(normalize(u_lightpos0 - v_Position.xyz), normal), 0.0); \n' +
	'  float nDotLU = max(dot(normalize(u_lightpos1 - v_Position.xyz), normal), 0.0); \n' +
	'  if (u_shading==3){\n' +
	'    vec3 diffuse = u_lightdiff0 * v_Color.rgb * nDotL + u_lightdiff1 * v_Color.rgb * nDotLU;\n' +
	'    vec3 ambient = u_lightambi0 * v_Color.rgb + u_lightambi1 * v_Color.rgb;\n' +
	'	 ambient = clamp(ambient, 0.0, 1.0);\n' +
	'	 diffuse = clamp(diffuse, 0.0, 1.0);\n' +
	'    gl_FragColor = vec4(diffuse + ambient, v_Color.a);\n' +
	'	 return;\n'+
	'	 }\n' +
	'  vec3 H = normalize(normalize(u_lightpos0 - v_Position.xyz) + normalize(u_eyePosition.xyz - v_Position.xyz)); \n' +
	'  vec3 HU = normalize(normalize(u_lightpos1 - v_Position.xyz) + normalize(u_eyePosition.xyz - v_Position.xyz)); \n' +
	'  float nDotH = max(dot(H, normal), 0.0); \n' +
	'  float nDotHU = max(dot(HU, normal), 0.0); \n' +
	// calculate the material
	'  float e64 = pow(nDotH, float(u_matshiny));\n' +
	'  float e64U = pow(nDotHU, float(u_matshiny));\n' +
  	'	 vec3 emissive = u_matemit;' +
  	'  vec3 ambient = u_lightambi0 * u_matambi + u_lightambi1 * u_matambi;\n' +
  	'  vec3 diffuse = u_lightdiff0 * v_reflect * nDotL + u_lightdiff1 * v_reflect * nDotLU;\n' +
  	'	 vec3 speculr = u_lightspec0 * u_matspec * e64 + u_lightspec1 * u_matspec * e64U;\n' +
	'	 ambient = clamp(ambient, 0.0, 1.0);\n' +
	'	 diffuse = clamp(diffuse, 0.0, 1.0);\n' +
	'	 speculr = clamp(speculr, 0.0, 1.0);\n' +
  	'  gl_FragColor = vec4(emissive + ambient +diffuse + speculr , 1.0);\n' +
  	'}\n';
//=============================================================================

var canvas;
var gl;

var u_eyePosition;
var u_ModelMatrix;
var u_MvpMatrix;
var u_NormalMatrix;

var u_shading;
var shadingMode;
var darkD = [0.0, 0.0, 0.0];

var blue = new Material(MATL_BLU_PLASTIC);
var jade = new Material(MATL_JADE);	
var copperShiny = new Material(MATL_COPPER_SHINY);	
var silverDull = new Material(MATL_SILVER_DULL);
var green = new Material(MATL_GRN_PLASTIC);
var ruby = new Material(MATL_RUBY);
var gold = new Material(MATL_GOLD_DULL);

var u_emissive = false;
var u_ambient = false;
var u_diffuse = false;
var u_specular = false;
var u_shiny = false;
var u_Color = false;

var userLight = new LightsT();
var headLight = new LightsT();

//------------------------------------------
var isDrag = false;
var xMclik = 0.0;
var yMclik = 0.0;
var xMdragTot = 0.0;
var yMdragTot = 0.0;
//-------------------------------------------

var ular = 1.0;
var ulag = 1.0;
var ulab = 1.0;
var uldr = 1.0;
var uldg = 1.0;
var uldb = 1.0;
var ulsr = 1.0;
var ulsg = 1.0;
var ulsb = 1.0;
var ulx = 1.0;
var uly = 1.0;
var ulz = 1.0;

var hlar = 1.0;
var hlag = 1.0;
var hlab = 1.0;
var hldr = 1.0;
var hldg = 1.0;
var hldb = 1.0;
var hlsr = 1.0;
var hlsg = 1.0;
var hlsb = 1.0;

var g_EyeX = 0.0;
var g_EyeY = 50.0;
var g_EyeZ = 10.0;
var g_LookX = 0.0;
var g_LookY = 0.0;
var g_LookZ = 0.0;
var g_UpX = 0;
var g_UpY = 0;
var g_UpZ = 1;

var angleSpeed = 45.0;
var currentAngle = 0;
var angleSpeed0 = 45.0;
var currentAngle0 = 0;
var angleSpeed1 = 45.0;
var currentAngle1 = 0;

function main() {

	var userLightInput = document.getElementsByName('set');

		userLightInput[0].value = ular;
		userLightInput[1].value = ulag;
		userLightInput[2].value = ulab;
		userLightInput[3].value = uldr;
		userLightInput[4].value = uldg;
		userLightInput[5].value = uldb;
		userLightInput[6].value = ulsr;
		userLightInput[7].value = ulsg;
		userLightInput[8].value = ulsb;
		userLightInput[9].value = ulx;
		userLightInput[10].value = uly;
		userLightInput[11].value = ulz;

  canvas = document.getElementById('webgl');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight*3/4;
  gl = getWebGLContext(canvas);

  canvas.onmousedown = function(ev) {myMouseDown(ev, gl, canvas)};
  canvas.onmousemove = function(ev) {myMouseMove(ev, gl, canvas)};
  canvas.onmouseup = function(ev) {myMouseUp(ev, gl, canvas)};

  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  var n = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

	u_shading = gl.getUniformLocation(gl.program, 'u_shading');
	if (!u_shading){
		console.log('Failed to get u_shading location');
	}

	u_eyePosition = gl.getUniformLocation(gl.program, 'u_eyePosition');
	u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
	u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
	u_NormalMatrix = gl.getUniformLocation(gl.program,'u_NormalMatrix');
	if (!u_ModelMatrix	|| !u_MvpMatrix || !u_NormalMatrix) {
		console.log('Failed to get matrix storage locations');
		return;
	}

	userLight.u_pos  = gl.getUniformLocation(gl.program, 'u_lightpos0');
	userLight.u_ambi = gl.getUniformLocation(gl.program, 'u_lightambi0');
	userLight.u_diff = gl.getUniformLocation(gl.program, 'u_lightdiff0');
	userLight.u_spec = gl.getUniformLocation(gl.program, 'u_lightspec0');
	if( !userLight.u_pos || !userLight.u_ambi	|| !userLight.u_diff || !userLight.u_spec) {
		console.log('Failed to get GPUs userLight storage locations');
		return;
	}

	headLight.u_pos  = gl.getUniformLocation(gl.program, 'u_lightpos1');
	headLight.u_ambi = gl.getUniformLocation(gl.program, 'u_lightambi1');
	headLight.u_diff = gl.getUniformLocation(gl.program, 'u_lightdiff1');
	headLight.u_spec = gl.getUniformLocation(gl.program, 'u_lightspec1');
	if( !userLight.u_pos || !userLight.u_ambi	|| !userLight.u_diff || !userLight.u_spec) {
		console.log('Failed to get GPUs userLight storage locations');
		return;
	}
  	headLight.I_ambi.elements.set([0.4, 0.4, 0.4]);
  	headLight.I_diff.elements.set([0.5, 0.5, 0.5]);
  	headLight.I_spec.elements.set([0.5, 0.5, 0.5]);

	gl.uniform3fv(headLight.u_ambi, headLight.I_ambi.elements);	
	gl.uniform3fv(headLight.u_diff, headLight.I_diff.elements);	
	gl.uniform3fv(headLight.u_spec, headLight.I_spec.elements);	

	u_emissive = gl.getUniformLocation(gl.program, 'u_matemit');
	u_ambient = gl.getUniformLocation(gl.program, 'u_matambi');
	u_diffuse = gl.getUniformLocation(gl.program, 'u_matdiff');
	u_specular = gl.getUniformLocation(gl.program, 'u_matspec');
	u_shiny = gl.getUniformLocation(gl.program, 'u_matshiny');

	if(!u_emissive || !u_ambient || !u_diffuse || !u_specular || !u_shiny) {
		console.log('Failed to get the Phong Reflectance storage locations');
		return;
	}

	u_Color = gl.getUniformLocation(gl.program, 'u_Color');
	if (!u_Color){
		console.log('Failed to get the storage of u_Color');
		return;
	}

	shadingMode = 4;

    var modelMatrix = new Matrix4();
    var mvpMatrix = new Matrix4();
    var normalMatrix = new Matrix4();

	window.addEventListener('resize', resizeCanvas, false);

	window.addEventListener('keydown', myKeyDown, false);

	var tick = function(){
		draw(modelMatrix, mvpMatrix, normalMatrix, n);
		requestAnimationFrame(tick, canvas);
		animate();
		animate0();
	}
	tick();
}

function resizeCanvas(){
	canvas = document.getElementById('webgl');
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight*3/4;
	gl = getWebGLContext(canvas);
}

var FSIZE = 2;
var Svertex = 20;
var ATTR_LENGTH = 3;
var rs = 1;
var flag = 1;
var flag0 = 1;
var change = 0.5;
function myKeyDown(ev){

    if(ev.keyCode == 68) {
      g_EyeX -= change;
      g_LookX -= change;
    } 
    else if(ev.keyCode == 65) {
      g_EyeX += change;
      g_LookX += change;
    }
    else if(ev.keyCode == 87) {
      g_EyeZ += change;
      g_LookZ += change;
    }
    else if(ev.keyCode == 83) {
      g_EyeZ -= change;
      g_LookZ -= change;
    }
    else if(ev.keyCode == 188) {
      g_EyeY -= change;
      g_LookY -= change;
    }
    else if(ev.keyCode == 190) {
      g_EyeY += change;
      g_LookY += change;
    }

    else if(ev.keyCode == 219) {
      g_UpX += 0.02;
    }
    else if(ev.keyCode == 221) {
      g_UpX -= 0.02;
    }

    else if(ev.keyCode == 38) {
      g_LookZ += 0.5;
    }
    else if(ev.keyCode == 40) {
      g_LookZ -= 0.5;
    }

    else if(ev.keyCode == 37) {
      if(g_LookY < g_EyeY && g_LookX < g_EyeX) {
        g_LookX += 0.5;
        g_LookY -= 0.5;
      }
      if(g_LookY > g_EyeY && g_LookX < g_EyeX) {
        g_LookX -= 0.5;
        g_LookY -= 0.5;
      }
      if(g_LookY > g_EyeY && g_LookX > g_EyeX) {
        g_LookX -= 0.5;
        g_LookY += 0.5;
      }
      if(g_LookY < g_EyeY && g_LookX > g_EyeX) {
        g_LookX += 0.5;
        g_LookY += 0.5;
      }
      if(g_LookY < g_EyeY && g_LookX == g_EyeX) {
        g_LookX += 0.5;
        g_LookY -= 0.5;
      }
      if(g_LookY > g_EyeY && g_LookX == g_EyeX) {
        g_LookX -= 0.5;
        g_LookY -= 0.5;
      }
      if(g_LookY == g_EyeY && g_LookX < g_EyeX) {
        g_LookX -= 0.5;
        g_LookY += 0.5;
      }
      if(g_LookY == g_EyeY && g_LookX > g_EyeX) {
        g_LookX += 0.5;
        g_LookY += 0.5;
      }
    }
    else if(ev.keyCode == 39) {
      if(g_LookY < g_EyeY && g_LookX < g_EyeX) {
        g_LookX -= 0.5;
        g_LookY += 0.5;
      }
      if(g_LookY > g_EyeY && g_LookX < g_EyeX) {
        g_LookX += 0.5;
        g_LookY += 0.5;
      }
      if(g_LookY > g_EyeY && g_LookX > g_EyeX) {
        g_LookX += 0.5;
        g_LookY -= 0.5;
      }
      if(g_LookY < g_EyeY && g_LookX > g_EyeX) {
        g_LookX -= 0.5;
        g_LookY -= 0.5;
      }
      if(g_LookY < g_EyeY && g_LookX == g_EyeX) {
        g_LookX -= 0.5;
        g_LookY += 0.5;
      }
      if(g_LookY > g_EyeY && g_LookX == g_EyeX) {
        g_LookX += 0.5;
        g_LookY += 0.5;
      }
      if(g_LookY == g_EyeY && g_LookX < g_EyeX) {
        g_LookX += 0.5;
        g_LookY -= 0.5;
      }
      if(g_LookY == g_EyeY && g_LookX > g_EyeX) {
        g_LookX -= 0.5;
        g_LookY -= 0.5;
      }
    }
    else if(ev.keyCode == 72) {
      window.open("Help.html");
    }
    else if(ev.keyCode == 85) {
    	n1();
    }
    else if(ev.keyCode == 73) {
    	n2();
    }
    else if(ev.keyCode == 79) {
    	n3();
    }
    else if(ev.keyCode == 80) {
    	n4();
    }
    else {
      return;
    }
}

function s_headLight(){
	userLight.I_ambi.elements.set([hlar, hlag, hlab]);
	userLight.I_diff.elements.set([hldr, hldg, hldb]);
	userLight.I_spec.elements.set([hlsr, hlsg, hlsb]);

	if (!document.getElementById('headAmbient').checked){
		userLight.I_ambi.elements.set([0.0, 0.0, 0.0]);
	}
	if (!document.getElementById('headdiffuse').checked){
		userLight.I_diff.elements.set([0.0, 0.0, 0.0]);
	}
	if (!document.getElementById('headspecular').checked){
		userLight.I_spec.elements.set([0.0, 0.0, 0.0]);
	}
	gl.uniform3fv(userLight.u_ambi, userLight.I_ambi.elements);		// ambient
	gl.uniform3fv(userLight.u_diff, userLight.I_diff.elements);		// diffuse
	gl.uniform3fv(userLight.u_spec, userLight.I_spec.elements);		// Specular

	userLight.I_pos.elements.set([g_EyeX, g_EyeY, g_EyeZ]);
	gl.uniform3fv(userLight.u_pos,  userLight.I_pos.elements.slice(0,3));
}

function turnONHeadLight(){
	flag = 1;
}

function turnOFFHeadLight(){
	flag = 0;
}

function turnONUserLight(){
	flag0 = 1;
}

function turnOFFUserLight(){
	flag0 = 0;
}

var flag_amb = 1;
var flag_dif = 1;
var flag_spe = 1;

function headAmbOn(){
	flag_amb = 1;
}

function headAmbOff(){
	flag_amb = 0;
}

function headDifOn(){
	flag_dif = 1;
}

function headDifOff(){
	flag_dif = 0;
}

function headSpeOn(){
	flag_spe = 1;
}

function headSpeOff(){
	flag_spe = 0;
}

var flag_amb0 = 1;
var flag_dif0 = 1;
var flag_spe0 = 1;

function userAmbOn(){
	flag_amb0 = 1;
}

function userAmbOff(){
	flag_amb0 = 0;
}

function userDifOn(){
	flag_dif0 = 1;
}

function userDifOff(){
	flag_dif0 = 0;
}

function userSpeOn(){
	flag_spe0 = 1;
}

function userSpeOff(){
	flag_spe0 = 0;
}

function user_light(modelMatrix, mvpMatrix, normalMatrix, n){
	userLight.I_ambi.elements.set([hlar, hlag, hlab]);
	userLight.I_diff.elements.set([hldr, hldg, hldb]);
	userLight.I_spec.elements.set([hlsr, hlsg, hlsb]);

	if (flag_amb < 1) {
		userLight.I_ambi.elements.set(darkD);
	}

	if (flag_dif < 1){
		userLight.I_diff.elements.set(darkD);
	}

	if (flag_spe < 1){
		userLight.I_spec.elements.set(darkD);
	}

	if(flag < 1){
		userLight.I_ambi.elements.set(darkD);

		userLight.I_diff.elements.set(darkD);

		userLight.I_spec.elements.set(darkD);
	}
	gl.uniform3fv(userLight.u_ambi, userLight.I_ambi.elements);
	gl.uniform3fv(userLight.u_diff, userLight.I_diff.elements);
	gl.uniform3fv(userLight.u_spec, userLight.I_spec.elements);

	userLight.I_pos.elements.set([g_EyeX, g_EyeY, g_EyeZ]);
	gl.uniform3fv(userLight.u_pos,  userLight.I_pos.elements.slice(0,3));	
}

function head_light(modelMatrix, mvpMatrix, normalMatrix, n){

	headLight.I_ambi.elements.set([ular, ulag, ulab]);
	headLight.I_diff.elements.set([uldr, uldg, uldb]);
	headLight.I_spec.elements.set([ulsr, ulsg, ulsb]);

	if (flag_amb0 < 1){
		headLight.I_ambi.elements.set(darkD);
	}
	if (flag_dif0 < 1){
		headLight.I_diff.elements.set(darkD);
	}
	if (flag_spe0 < 1){
		headLight.I_spec.elements.set(darkD);
	}

	if(flag0 < 1){
			headLight.I_ambi.elements.set(darkD);

			headLight.I_diff.elements.set(darkD);

			headLight.I_spec.elements.set(darkD);
	}

	gl.uniform3fv(headLight.u_ambi, headLight.I_ambi.elements);
	gl.uniform3fv(headLight.u_diff, headLight.I_diff.elements);
	gl.uniform3fv(headLight.u_spec, headLight.I_spec.elements);

	headLight.I_pos.elements.set([ulx, uly,ulz]);
	gl.uniform3fv(headLight.u_pos,  headLight.I_pos.elements.slice(0,3));
}

function draw(modelMatrix, mvpMatrix, normalMatrix, n){

	user_light();
	head_light();		

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

	modelMatrix.setIdentity();
	normalMatrix.setIdentity();
	mvpMatrix.setPerspective(35, canvas.width/canvas.height, 1, 100);
	mvpMatrix.lookAt(g_EyeX, g_EyeY, g_EyeZ, g_LookX, g_LookY, g_LookZ, g_UpX, g_UpY, g_UpZ);


	drawStarModel(gl, n[0], 0, gl.UNSIGNED_SHORT, mvpMatrix, modelMatrix, normalMatrix);
	drawGround_x(gl, n[1], FSIZE*n[0], gl.UNSIGNED_SHORT, mvpMatrix, modelMatrix, normalMatrix);
	drawGround_y(gl, n[1], FSIZE*n[0], gl.UNSIGNED_SHORT, mvpMatrix, modelMatrix, normalMatrix);
	drawRobot(gl, n[0], 0, n[2], FSIZE*(n[0]+n[1]), gl.UNSIGNED_SHORT, mvpMatrix, modelMatrix, normalMatrix);
	drawDetector(gl, n[0], 0, n[2], FSIZE*(n[0]+n[1]), gl.UNSIGNED_SHORT, mvpMatrix, modelMatrix, normalMatrix);
	drawBird(gl, n[3], FSIZE*(n[0]+n[1]+n[2]), gl.UNSIGNED_SHORT, mvpMatrix, modelMatrix, normalMatrix);
	drawSun(gl, n[3], FSIZE*(n[0]+n[1]+n[2]), gl.UNSIGNED_SHORT, mvpMatrix, modelMatrix, normalMatrix);
}

function setMaterial(materialChosen){

	gl.uniform3fv(u_emissive, materialChosen.K_emit.slice(0,3));
	gl.uniform3fv(u_ambient, materialChosen.K_ambi.slice(0,3));
	gl.uniform3fv(u_diffuse, materialChosen.K_diff.slice(0,3));
	gl.uniform3fv(u_specular, materialChosen.K_spec.slice(0,3));
	gl.uniform1i(u_shiny, parseInt(materialChosen.K_shiny, 10)); 
}

var ruby0 = [0.95, 0.15, 0.15, 1.0];
var copperShiny0 = [0.9, 0.5, 0.0, 1.0];
var silverDull0 = [0.78, 0.78, 0.78, 1.0];
var green0 = [0, 0.85, 0, 1.0];
var blue0 = [0, 0, 0.85, 1.0];
var jade0 = [0.3, 0.9, 0.3, 1.0];
var gold0 = [0.98, 0.98, 0.22, 1.0];

function phongLighting(color){
	if (shadingMode == 3 || shadingMode == 1){
		gl.uniform4f(u_Color, color[0], color[1], color[2], 1.0);
	}
}

function drawSun(gl, birdcount, birdoffset, type, mvpMatrix, modelMatrix, normalMatrix){
	phongLighting(ruby0);
	setMaterial(ruby);

	var newMvpMatrix = new Matrix4();
	var newModelMatrix = new Matrix4();
	var newNormalMatrix = new Matrix4();

	newMvpMatrix.set(mvpMatrix);
	newModelMatrix.set(modelMatrix);
	newModelMatrix.translate(8.0, 8.0, 12.0);
	newModelMatrix.rotate(3*currentAngle, 0, 1, 0);
	newModelMatrix.rotate(-2 * currentAngle, 1, 0, 0);
	newModelMatrix.rotate(10 * currentAngle, 0, 0, 1);
	newModelMatrix.scale(3.0, 3.0, 3.0);
	newMvpMatrix.multiply(newModelMatrix);
	newNormalMatrix.setInverseOf(newModelMatrix);
	newNormalMatrix.transpose();
	gl.uniform1i(u_shading, shadingMode);
	gl.uniform4f(u_eyePosition, g_EyeX, g_EyeY, g_EyeZ, 1);
	gl.uniformMatrix4fv(u_ModelMatrix, false, newModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, newMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, newNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, birdcount, type, birdoffset);

	pushMatrix(newModelMatrix);
  
  	newMvpMatrix.set(mvpMatrix);
  	newModelMatrix.rotate(currentAngle*0.5, 0, 0, 1);
  	newMvpMatrix.multiply(newModelMatrix);
	newNormalMatrix.setInverseOf(newModelMatrix);
	newNormalMatrix.transpose();
	gl.uniform1i(u_shading, shadingMode);
	gl.uniform4f(u_eyePosition, g_EyeX, g_EyeY, g_EyeZ, 1);
	gl.uniformMatrix4fv(u_ModelMatrix, false, newModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, newMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, newNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, birdcount, type, birdoffset);

	newMvpMatrix.set(mvpMatrix);
	newModelMatrix.translate(0.0, 0.4, 0.0);
  	newModelMatrix.scale(0.5, 0.5, 0.5);
  	newModelMatrix.rotate(currentAngle, 0, 0, 1);
  	newMvpMatrix.multiply(newModelMatrix);
	newNormalMatrix.setInverseOf(newModelMatrix);
	newNormalMatrix.transpose();
	gl.uniform1i(u_shading, shadingMode);
	gl.uniform4f(u_eyePosition, g_EyeX, g_EyeY, g_EyeZ, 1);
	gl.uniformMatrix4fv(u_ModelMatrix, false, newModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, newMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, newNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, birdcount, type, birdoffset);

	newMvpMatrix.set(mvpMatrix); 
  	newModelMatrix.translate(0.0, 0.2, 0.0);
  	newModelMatrix.scale(0.5, 0.5, 0.5);
  	newModelMatrix.rotate(currentAngle*3, 0, 0, 1);
  	newMvpMatrix.multiply(newModelMatrix);
	newNormalMatrix.setInverseOf(newModelMatrix);
	newNormalMatrix.transpose();
	gl.uniform1i(u_shading, shadingMode);
	gl.uniform4f(u_eyePosition, g_EyeX, g_EyeY, g_EyeZ, 1);
	gl.uniformMatrix4fv(u_ModelMatrix, false, newModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, newMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, newNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, birdcount, type, birdoffset);
  
  	newModelMatrix = popMatrix();
  	pushMatrix(newModelMatrix);  
 
	newMvpMatrix.set(mvpMatrix);  
  	newModelMatrix.rotate(30+currentAngle*0.5, 0, 0, 1);
  	newMvpMatrix.multiply(newModelMatrix);
	newNormalMatrix.setInverseOf(newModelMatrix);
	newNormalMatrix.transpose();
	gl.uniform1i(u_shading, shadingMode);
	gl.uniform4f(u_eyePosition, g_EyeX, g_EyeY, g_EyeZ, 1);
	gl.uniformMatrix4fv(u_ModelMatrix, false, newModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, newMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, newNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, birdcount, type, birdoffset);
 
 	newMvpMatrix.set(mvpMatrix);  
  	newModelMatrix.translate(0.0, 0.4, 0.0);
  	newModelMatrix.scale(0.5, 0.5, 0.5);
  	newModelMatrix.rotate(currentAngle, 0, 0, 1);
  	newMvpMatrix.multiply(newModelMatrix);
	newNormalMatrix.setInverseOf(newModelMatrix);
	newNormalMatrix.transpose();
	gl.uniform1i(u_shading, shadingMode);
	gl.uniform4f(u_eyePosition, g_EyeX, g_EyeY, g_EyeZ, 1);
	gl.uniformMatrix4fv(u_ModelMatrix, false, newModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, newMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, newNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, birdcount, type, birdoffset);
 
 	newMvpMatrix.set(mvpMatrix);  
  	newModelMatrix.translate(0.0, 0.2, 0.0);
  	newModelMatrix.scale(0.5, 0.5, 0.5);
  	newModelMatrix.rotate(currentAngle*3, 0, 0, 1);
  	newMvpMatrix.multiply(newModelMatrix);
	newNormalMatrix.setInverseOf(newModelMatrix);
	newNormalMatrix.transpose();
	gl.uniform1i(u_shading, shadingMode);
	gl.uniform4f(u_eyePosition, g_EyeX, g_EyeY, g_EyeZ, 1);
	gl.uniformMatrix4fv(u_ModelMatrix, false, newModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, newMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, newNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, birdcount, type, birdoffset);
  
  	newModelMatrix = popMatrix();
  	pushMatrix(newModelMatrix);
    
    newMvpMatrix.set(mvpMatrix);  
  	newModelMatrix.rotate(60+currentAngle*0.5, 0, 0, 1);
  	newMvpMatrix.multiply(newModelMatrix);
	newNormalMatrix.setInverseOf(newModelMatrix);
	newNormalMatrix.transpose();
	gl.uniform1i(u_shading, shadingMode);
	gl.uniform4f(u_eyePosition, g_EyeX, g_EyeY, g_EyeZ, 1);
	gl.uniformMatrix4fv(u_ModelMatrix, false, newModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, newMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, newNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, birdcount, type, birdoffset);
  
 	newMvpMatrix.set(mvpMatrix);  
  	newModelMatrix.translate(0.0, 0.4, 0.0);
  	newModelMatrix.scale(0.5, 0.5, 0.5);
  	newModelMatrix.rotate(currentAngle, 0, 0, 1);
  	newMvpMatrix.multiply(newModelMatrix);
	newNormalMatrix.setInverseOf(newModelMatrix);
	newNormalMatrix.transpose();
	gl.uniform1i(u_shading, shadingMode);
	gl.uniform4f(u_eyePosition, g_EyeX, g_EyeY, g_EyeZ, 1);
	gl.uniformMatrix4fv(u_ModelMatrix, false, newModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, newMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, newNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, birdcount, type, birdoffset);
 
	newMvpMatrix.set(mvpMatrix); 
  	newModelMatrix.translate(0.0, 0.2, 0.0);
  	newModelMatrix.scale(0.5, 0.5, 0.5);
  	newModelMatrix.rotate(currentAngle*3, 0, 0, 1);
  	newMvpMatrix.multiply(newModelMatrix);
	newNormalMatrix.setInverseOf(newModelMatrix);
	newNormalMatrix.transpose();
	gl.uniform1i(u_shading, shadingMode);
	gl.uniform4f(u_eyePosition, g_EyeX, g_EyeY, g_EyeZ, 1);
	gl.uniformMatrix4fv(u_ModelMatrix, false, newModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, newMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, newNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, birdcount, type, birdoffset);
  
  	newModelMatrix = popMatrix();
  	pushMatrix(newModelMatrix);
  	
  	newMvpMatrix.set(mvpMatrix); 
  	newModelMatrix.rotate(90+currentAngle*0.5, 0, 0, 1);
  	newMvpMatrix.multiply(newModelMatrix);
	newNormalMatrix.setInverseOf(newModelMatrix);
	newNormalMatrix.transpose();
	gl.uniform1i(u_shading, shadingMode);
	gl.uniform4f(u_eyePosition, g_EyeX, g_EyeY, g_EyeZ, 1);
	gl.uniformMatrix4fv(u_ModelMatrix, false, newModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, newMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, newNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, birdcount, type, birdoffset);
 	
 	newMvpMatrix.set(mvpMatrix); 
  	newModelMatrix.translate(0.0, 0.4, 0.0);
  	newModelMatrix.scale(0.5, 0.5, 0.5);
  	newModelMatrix.rotate(currentAngle, 0, 0, 1);
  	newMvpMatrix.multiply(newModelMatrix);
	newNormalMatrix.setInverseOf(newModelMatrix);
	newNormalMatrix.transpose();
	gl.uniform1i(u_shading, shadingMode);
	gl.uniform4f(u_eyePosition, g_EyeX, g_EyeY, g_EyeZ, 1);
	gl.uniformMatrix4fv(u_ModelMatrix, false, newModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, newMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, newNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, birdcount, type, birdoffset);

	newMvpMatrix.set(mvpMatrix);
  	newModelMatrix.translate(0.0, 0.2, 0.0);
  	newModelMatrix.scale(0.5, 0.5, 0.5);
  	newModelMatrix.rotate(currentAngle*3, 0, 0, 1);
  	newMvpMatrix.multiply(newModelMatrix);
	newNormalMatrix.setInverseOf(newModelMatrix);
	newNormalMatrix.transpose();
	gl.uniform1i(u_shading, shadingMode);
	gl.uniform4f(u_eyePosition, g_EyeX, g_EyeY, g_EyeZ, 1);
	gl.uniformMatrix4fv(u_ModelMatrix, false, newModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, newMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, newNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, birdcount, type, birdoffset);
  
  	newModelMatrix = popMatrix();
  	pushMatrix(newModelMatrix);
  
  	newMvpMatrix.set(mvpMatrix);  
  	newModelMatrix.rotate(120+currentAngle*0.5, 0, 0, 1);
  	newMvpMatrix.multiply(newModelMatrix);
	newNormalMatrix.setInverseOf(newModelMatrix);
	newNormalMatrix.transpose();
	gl.uniform1i(u_shading, shadingMode);
	gl.uniform4f(u_eyePosition, g_EyeX, g_EyeY, g_EyeZ, 1);
	gl.uniformMatrix4fv(u_ModelMatrix, false, newModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, newMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, newNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, birdcount, type, birdoffset);
 
 	newMvpMatrix.set(mvpMatrix); 
  	newModelMatrix.translate(0.0, 0.4, 0.0);
  	newModelMatrix.scale(0.5, 0.5, 0.5);
  	newModelMatrix.rotate(currentAngle, 0, 0, 1);
  	newMvpMatrix.multiply(newModelMatrix);
	newNormalMatrix.setInverseOf(newModelMatrix);
	newNormalMatrix.transpose();
	gl.uniform1i(u_shading, shadingMode);
	gl.uniform4f(u_eyePosition, g_EyeX, g_EyeY, g_EyeZ, 1);
	gl.uniformMatrix4fv(u_ModelMatrix, false, newModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, newMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, newNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, birdcount, type, birdoffset);
 
 	newMvpMatrix.set(mvpMatrix); 
  	newModelMatrix.translate(0.0, 0.2, 0.0);
  	newModelMatrix.scale(0.5, 0.5, 0.5);
  	newModelMatrix.rotate(currentAngle*3, 0, 0, 1);
  	newMvpMatrix.multiply(newModelMatrix);
	newNormalMatrix.setInverseOf(newModelMatrix);
	newNormalMatrix.transpose();
	gl.uniform1i(u_shading, shadingMode);
	gl.uniform4f(u_eyePosition, g_EyeX, g_EyeY, g_EyeZ, 1);
	gl.uniformMatrix4fv(u_ModelMatrix, false, newModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, newMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, newNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, birdcount, type, birdoffset);
  
  	newModelMatrix = popMatrix();
  	pushMatrix(newModelMatrix);
 
 	newMvpMatrix.set(mvpMatrix);   
  	newModelMatrix.rotate(150+currentAngle*0.5, 0, 0, 1);
  	newMvpMatrix.multiply(newModelMatrix);
	newNormalMatrix.setInverseOf(newModelMatrix);
	newNormalMatrix.transpose();
	gl.uniform1i(u_shading, shadingMode);
	gl.uniform4f(u_eyePosition, g_EyeX, g_EyeY, g_EyeZ, 1);
	gl.uniformMatrix4fv(u_ModelMatrix, false, newModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, newMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, newNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, birdcount, type, birdoffset);
 
 	newMvpMatrix.set(mvpMatrix); 
  	newModelMatrix.translate(0.0, 0.4, 0.0);
  	newModelMatrix.scale(0.5, 0.5, 0.5);
  	newModelMatrix.rotate(currentAngle, 0, 0, 1);
  	newMvpMatrix.multiply(newModelMatrix);
	newNormalMatrix.setInverseOf(newModelMatrix);
	newNormalMatrix.transpose();
	gl.uniform1i(u_shading, shadingMode);
	gl.uniform4f(u_eyePosition, g_EyeX, g_EyeY, g_EyeZ, 1);
	gl.uniformMatrix4fv(u_ModelMatrix, false, newModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, newMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, newNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, birdcount, type, birdoffset);
 
 	newMvpMatrix.set(mvpMatrix); 
  	newModelMatrix.translate(0.0, 0.2, 0.0);
  	newModelMatrix.scale(0.5, 0.5, 0.5);
  	newModelMatrix.rotate(currentAngle*3, 0, 0, 1);
  	newMvpMatrix.multiply(newModelMatrix);
	newNormalMatrix.setInverseOf(newModelMatrix);
	newNormalMatrix.transpose();
	gl.uniform1i(u_shading, shadingMode);
	gl.uniform4f(u_eyePosition, g_EyeX, g_EyeY, g_EyeZ, 1);
	gl.uniformMatrix4fv(u_ModelMatrix, false, newModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, newMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, newNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, birdcount, type, birdoffset);
  
  	newModelMatrix = popMatrix();
  	pushMatrix(newModelMatrix);
 
 	newMvpMatrix.set(mvpMatrix);   
  	newModelMatrix.rotate(180+currentAngle*0.5, 0, 0, 1);
  	newMvpMatrix.multiply(newModelMatrix);
	newNormalMatrix.setInverseOf(newModelMatrix);
	newNormalMatrix.transpose();
	gl.uniform1i(u_shading, shadingMode);
	gl.uniform4f(u_eyePosition, g_EyeX, g_EyeY, g_EyeZ, 1);
	gl.uniformMatrix4fv(u_ModelMatrix, false, newModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, newMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, newNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, birdcount, type, birdoffset);
 
 	newMvpMatrix.set(mvpMatrix); 
  	newModelMatrix.translate(0.0, 0.4, 0.0);
  	newModelMatrix.scale(0.5, 0.5, 0.5);
  	newModelMatrix.rotate(currentAngle, 0, 0, 1);
  	newMvpMatrix.multiply(newModelMatrix);
	newNormalMatrix.setInverseOf(newModelMatrix);
	newNormalMatrix.transpose();
	gl.uniform1i(u_shading, shadingMode);
	gl.uniform4f(u_eyePosition, g_EyeX, g_EyeY, g_EyeZ, 1);
	gl.uniformMatrix4fv(u_ModelMatrix, false, newModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, newMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, newNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, birdcount, type, birdoffset);
 
 	newMvpMatrix.set(mvpMatrix); 
  	newModelMatrix.translate(0.0, 0.2, 0.0);
  	newModelMatrix.scale(0.5, 0.5, 0.5);
  	newModelMatrix.rotate(currentAngle*3, 0, 0, 1);
  	newMvpMatrix.multiply(newModelMatrix);
	newNormalMatrix.setInverseOf(newModelMatrix);
	newNormalMatrix.transpose();
	gl.uniform1i(u_shading, shadingMode);
	gl.uniform4f(u_eyePosition, g_EyeX, g_EyeY, g_EyeZ, 1);
	gl.uniformMatrix4fv(u_ModelMatrix, false, newModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, newMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, newNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, birdcount, type, birdoffset);
  
  	newModelMatrix = popMatrix();
  	pushMatrix(newModelMatrix);

	newMvpMatrix.set(mvpMatrix);    
  	newModelMatrix.rotate(210+currentAngle*0.5, 0, 0, 1);
  	newMvpMatrix.multiply(newModelMatrix);
	newNormalMatrix.setInverseOf(newModelMatrix);
	newNormalMatrix.transpose();
	gl.uniform1i(u_shading, shadingMode);
	gl.uniform4f(u_eyePosition, g_EyeX, g_EyeY, g_EyeZ, 1);
	gl.uniformMatrix4fv(u_ModelMatrix, false, newModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, newMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, newNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, birdcount, type, birdoffset);
 
 	newMvpMatrix.set(mvpMatrix);
  	newModelMatrix.translate(0.0, 0.4, 0.0);
  	newModelMatrix.scale(0.5, 0.5, 0.5);
  	newModelMatrix.rotate(currentAngle, 0, 0, 1);
  	newMvpMatrix.multiply(newModelMatrix);
	newNormalMatrix.setInverseOf(newModelMatrix);
	newNormalMatrix.transpose();
	gl.uniform1i(u_shading, shadingMode);
	gl.uniform4f(u_eyePosition, g_EyeX, g_EyeY, g_EyeZ, 1);
	gl.uniformMatrix4fv(u_ModelMatrix, false, newModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, newMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, newNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, birdcount, type, birdoffset);
 
 	newMvpMatrix.set(mvpMatrix); 
  	newModelMatrix.translate(0.0, 0.2, 0.0);
  	newModelMatrix.scale(0.5, 0.5, 0.5);
  	newModelMatrix.rotate(currentAngle*3, 0, 0, 1);
  	newMvpMatrix.multiply(newModelMatrix);
	newNormalMatrix.setInverseOf(newModelMatrix);
	newNormalMatrix.transpose();
	gl.uniform1i(u_shading, shadingMode);
	gl.uniform4f(u_eyePosition, g_EyeX, g_EyeY, g_EyeZ, 1);
	gl.uniformMatrix4fv(u_ModelMatrix, false, newModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, newMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, newNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, birdcount, type, birdoffset);
  
  	newModelMatrix = popMatrix();
  	pushMatrix(newModelMatrix);
 
 	newMvpMatrix.set(mvpMatrix);   
  	newModelMatrix.rotate(240+currentAngle*0.5, 0, 0, 1);
  	newMvpMatrix.multiply(newModelMatrix);
	newNormalMatrix.setInverseOf(newModelMatrix);
	newNormalMatrix.transpose();
	gl.uniform1i(u_shading, shadingMode);
	gl.uniform4f(u_eyePosition, g_EyeX, g_EyeY, g_EyeZ, 1);
	gl.uniformMatrix4fv(u_ModelMatrix, false, newModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, newMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, newNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, birdcount, type, birdoffset);
  
  	newMvpMatrix.set(mvpMatrix);
  	newModelMatrix.translate(0.0, 0.4, 0.0);
  	newModelMatrix.scale(0.5, 0.5, 0.5);
  	newModelMatrix.rotate(currentAngle, 0, 0, 1);
  	newMvpMatrix.multiply(newModelMatrix);
	newNormalMatrix.setInverseOf(newModelMatrix);
	newNormalMatrix.transpose();
	gl.uniform1i(u_shading, shadingMode);
	gl.uniform4f(u_eyePosition, g_EyeX, g_EyeY, g_EyeZ, 1);
	gl.uniformMatrix4fv(u_ModelMatrix, false, newModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, newMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, newNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, birdcount, type, birdoffset);
 
 	newMvpMatrix.set(mvpMatrix); 
  	newModelMatrix.translate(0.0, 0.2, 0.0);
  	newModelMatrix.scale(0.5, 0.5, 0.5);
  	newModelMatrix.rotate(currentAngle*3, 0, 0, 1);
  	newMvpMatrix.multiply(newModelMatrix);
	newNormalMatrix.setInverseOf(newModelMatrix);
	newNormalMatrix.transpose();
	gl.uniform1i(u_shading, shadingMode);
	gl.uniform4f(u_eyePosition, g_EyeX, g_EyeY, g_EyeZ, 1);
	gl.uniformMatrix4fv(u_ModelMatrix, false, newModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, newMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, newNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, birdcount, type, birdoffset);
  
  	newModelMatrix = popMatrix();
  	pushMatrix(newModelMatrix);
  	
  	newMvpMatrix.set(mvpMatrix);  
  	newModelMatrix.rotate(270+currentAngle*0.5, 0, 0, 1);
  	newMvpMatrix.multiply(newModelMatrix);
	newNormalMatrix.setInverseOf(newModelMatrix);
	newNormalMatrix.transpose();
	gl.uniform1i(u_shading, shadingMode);
	gl.uniform4f(u_eyePosition, g_EyeX, g_EyeY, g_EyeZ, 1);
	gl.uniformMatrix4fv(u_ModelMatrix, false, newModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, newMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, newNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, birdcount, type, birdoffset);

	newMvpMatrix.set(mvpMatrix);  
  	newModelMatrix.translate(0.0, 0.4, 0.0);
  	newModelMatrix.scale(0.5, 0.5, 0.5);
  	newModelMatrix.rotate(currentAngle, 0, 0, 1);
  	newMvpMatrix.multiply(newModelMatrix);
	newNormalMatrix.setInverseOf(newModelMatrix);
	newNormalMatrix.transpose();
	gl.uniform1i(u_shading, shadingMode);
	gl.uniform4f(u_eyePosition, g_EyeX, g_EyeY, g_EyeZ, 1);
	gl.uniformMatrix4fv(u_ModelMatrix, false, newModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, newMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, newNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, birdcount, type, birdoffset);
 	
 	newMvpMatrix.set(mvpMatrix); 
  	newModelMatrix.translate(0.0, 0.2, 0.0);
  	newModelMatrix.scale(0.5, 0.5, 0.5);
  	newModelMatrix.rotate(currentAngle*3, 0, 0, 1);
  	newMvpMatrix.multiply(newModelMatrix);
	newNormalMatrix.setInverseOf(newModelMatrix);
	newNormalMatrix.transpose();
	gl.uniform1i(u_shading, shadingMode);
	gl.uniform4f(u_eyePosition, g_EyeX, g_EyeY, g_EyeZ, 1);
	gl.uniformMatrix4fv(u_ModelMatrix, false, newModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, newMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, newNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, birdcount, type, birdoffset);
  
  	newModelMatrix = popMatrix();
  	pushMatrix(newModelMatrix);
 
 	newMvpMatrix.set(mvpMatrix);   
  	newModelMatrix.rotate(300+currentAngle*0.5, 0, 0, 1);
  	newMvpMatrix.multiply(newModelMatrix);
	newNormalMatrix.setInverseOf(newModelMatrix);
	newNormalMatrix.transpose();
	gl.uniform1i(u_shading, shadingMode);
	gl.uniform4f(u_eyePosition, g_EyeX, g_EyeY, g_EyeZ, 1);
	gl.uniformMatrix4fv(u_ModelMatrix, false, newModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, newMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, newNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, birdcount, type, birdoffset);
 
 	newMvpMatrix.set(mvpMatrix); 
  	newModelMatrix.translate(0.0, 0.4, 0.0);
  	newModelMatrix.scale(0.5, 0.5, 0.5);
  	newModelMatrix.rotate(currentAngle, 0, 0, 1);
  	newMvpMatrix.multiply(newModelMatrix);
	newNormalMatrix.setInverseOf(newModelMatrix);
	newNormalMatrix.transpose();
	gl.uniform1i(u_shading, shadingMode);
	gl.uniform4f(u_eyePosition, g_EyeX, g_EyeY, g_EyeZ, 1);
	gl.uniformMatrix4fv(u_ModelMatrix, false, newModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, newMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, newNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, birdcount, type, birdoffset);
 
 	newMvpMatrix.set(mvpMatrix); 
  	newModelMatrix.translate(0.0, 0.2, 0.0);
  	newModelMatrix.scale(0.5, 0.5, 0.5);
  	newModelMatrix.rotate(currentAngle*3, 0, 0, 1);
  	newMvpMatrix.multiply(newModelMatrix);
	newNormalMatrix.setInverseOf(newModelMatrix);
	newNormalMatrix.transpose();
	gl.uniform1i(u_shading, shadingMode);
	gl.uniform4f(u_eyePosition, g_EyeX, g_EyeY, g_EyeZ, 1);
	gl.uniformMatrix4fv(u_ModelMatrix, false, newModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, newMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, newNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, birdcount, type, birdoffset);
  
  	newModelMatrix = popMatrix();
  	pushMatrix(newModelMatrix);
 
 	newMvpMatrix.set(mvpMatrix);   
  	newModelMatrix.rotate(330+currentAngle*0.5, 0, 0, 1);
  	newMvpMatrix.multiply(newModelMatrix);
	newNormalMatrix.setInverseOf(newModelMatrix);
	newNormalMatrix.transpose();
	gl.uniform1i(u_shading, shadingMode);
	gl.uniform4f(u_eyePosition, g_EyeX, g_EyeY, g_EyeZ, 1);
	gl.uniformMatrix4fv(u_ModelMatrix, false, newModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, newMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, newNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, birdcount, type, birdoffset);
 
 	newMvpMatrix.set(mvpMatrix); 
  	newModelMatrix.translate(0.0, 0.4, 0.0);
  	newModelMatrix.scale(0.5, 0.5, 0.5);
  	newModelMatrix.rotate(currentAngle, 0, 0, 1);
  	newMvpMatrix.multiply(newModelMatrix);
	newNormalMatrix.setInverseOf(newModelMatrix);
	newNormalMatrix.transpose();
	gl.uniform1i(u_shading, shadingMode);
	gl.uniform4f(u_eyePosition, g_EyeX, g_EyeY, g_EyeZ, 1);
	gl.uniformMatrix4fv(u_ModelMatrix, false, newModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, newMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, newNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, birdcount, type, birdoffset);
 
 	newMvpMatrix.set(mvpMatrix); 
  	newModelMatrix.translate(0.0, 0.2, 0.0);
  	newModelMatrix.scale(0.5, 0.5, 0.5);
  	newModelMatrix.rotate(currentAngle*3, 0, 0, 1);
  	newMvpMatrix.multiply(newModelMatrix);
	newNormalMatrix.setInverseOf(newModelMatrix);
	newNormalMatrix.transpose();
	gl.uniform1i(u_shading, shadingMode);
	gl.uniform4f(u_eyePosition, g_EyeX, g_EyeY, g_EyeZ, 1);
	gl.uniformMatrix4fv(u_ModelMatrix, false, newModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, newMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, newNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, birdcount, type, birdoffset);
}

function drawBird(gl, birdcount, birdoffset, type, mvpMatrix, modelMatrix, normalMatrix){
	phongLighting(gold0);
	setMaterial(gold);

	var newMvpMatrix = new Matrix4();
	var newModelMatrix = new Matrix4();
	var newNormalMatrix = new Matrix4();

	//the neck
	newMvpMatrix.set(mvpMatrix);
	newModelMatrix.set(modelMatrix);
	newModelMatrix.rotate(90.0, 1, 0, 0);
	newModelMatrix.translate(25, 8.0, 0.0);
	newModelMatrix.translate(-0.3, -0.2, 0.0);
	newModelMatrix.scale(10.0, 10.0, 10.0);
	newModelMatrix.rotate(currentAngle*3/3, 0, 1, 0);
	newModelMatrix.rotate(currentAngle/3, 0, 0, 1);
	newMvpMatrix.multiply(newModelMatrix);
	newNormalMatrix.setInverseOf(newModelMatrix);
	newNormalMatrix.transpose();
	gl.uniform1i(u_shading, shadingMode);
	gl.uniform4f(u_eyePosition, g_EyeX, g_EyeY, g_EyeZ, 1);
	gl.uniformMatrix4fv(u_ModelMatrix, false, newModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, newMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, newNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, birdcount, type, birdoffset);

	pushMatrix(newModelMatrix);
	//the body
	newMvpMatrix.set(mvpMatrix);
	newModelMatrix.rotate(90.0+0.5*currentAngle/3, 0, 0, 1);
	newModelMatrix.translate(-0.2, 0.0, 0.0);
	newModelMatrix.scale(2.0, 2.0, 2.0);
	newMvpMatrix.multiply(newModelMatrix);
	newNormalMatrix.setInverseOf(newModelMatrix);
	newNormalMatrix.transpose();
	gl.uniformMatrix4fv(u_ModelMatrix, false, newModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, newMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, newNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, birdcount, type, birdoffset);
	// the legs
	newMvpMatrix.set(mvpMatrix);
	newModelMatrix.translate(-0.075, 0.15, 0.0);
  	newModelMatrix.rotate(120.0-2.0*currentAngle/3, 0, 0, 1);
  	newModelMatrix.scale(0.3, 0.3, 0.3);
  	newMvpMatrix.multiply(newModelMatrix);
	newNormalMatrix.setInverseOf(newModelMatrix);
	newNormalMatrix.transpose();
	gl.uniformMatrix4fv(u_ModelMatrix, false, newModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, newMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, newNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, birdcount, type, birdoffset);

	newMvpMatrix.set(mvpMatrix);
	newModelMatrix.translate(0.02, 0.45, 0.0);
	newModelMatrix.rotate(-90.0, 0, 0, 1);
  	newModelMatrix.scale(0.3, 0.3, 0.3);
  	newMvpMatrix.multiply(newModelMatrix);
	newNormalMatrix.setInverseOf(newModelMatrix);
	newNormalMatrix.transpose();
	gl.uniformMatrix4fv(u_ModelMatrix, false, newModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, newMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, newNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, birdcount, type, birdoffset);

	newMvpMatrix.set(mvpMatrix);
	newModelMatrix.rotate(160.0, 0, 0, 1);
	newModelMatrix.translate(0.0, 0.1, 0.0);
	newMvpMatrix.multiply(newModelMatrix);
	newNormalMatrix.setInverseOf(newModelMatrix);
	newNormalMatrix.transpose();
	gl.uniformMatrix4fv(u_ModelMatrix, false, newModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, newMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, newNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, birdcount, type, birdoffset);

	//the tail
	newModelMatrix = popMatrix();
  	pushMatrix(newModelMatrix);

  	newModelMatrix.scale(0.8, 0.8, 0.8);
  	newModelMatrix.rotate(90.0+0.5*currentAngle/3, 0, 0, 1);
 	newModelMatrix.translate(-0.23, 0.875, 0.0);
  	newModelMatrix.rotate(-30.0+currentAngle/1.5, 0, 0, 1);
  	newMvpMatrix.multiply(newModelMatrix);
	newNormalMatrix.setInverseOf(newModelMatrix);
	newNormalMatrix.transpose();
	gl.uniformMatrix4fv(u_ModelMatrix, false, newModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, newMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, newNormalMatrix.elements);
	//gl.drawElements(gl.TRIANGLES, birdcount, type, birdoffset);

	newMvpMatrix.set(mvpMatrix);
  	newModelMatrix.rotate(60.0, 0, 0, 1);
  	newModelMatrix.scale(0.4, 1.0, 1.0);
  	newMvpMatrix.multiply(newModelMatrix);
	newNormalMatrix.setInverseOf(newModelMatrix);
	newNormalMatrix.transpose();
	gl.uniformMatrix4fv(u_ModelMatrix, false, newModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, newMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, newNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, birdcount, type, birdoffset);

	newMvpMatrix.set(mvpMatrix);
	newModelMatrix.scale(2.5, 1.0, 1.0);
  	newModelMatrix.rotate(-120.0, 0, 0, 1);
  	newModelMatrix.scale(0.4, 1.0, 1.0);
  	newMvpMatrix.multiply(newModelMatrix);
	newNormalMatrix.setInverseOf(newModelMatrix);
	newNormalMatrix.transpose();
	gl.uniformMatrix4fv(u_ModelMatrix, false, newModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, newMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, newNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, birdcount, type, birdoffset);
	
	newMvpMatrix.set(mvpMatrix);
	newModelMatrix.scale(2.5, 1.0, 1.0);
  	newModelMatrix.rotate(30.0, 0, 0, 1);
  	newModelMatrix.scale(0.4, 1.0, 1.0);
  	newMvpMatrix.multiply(newModelMatrix);
	newNormalMatrix.setInverseOf(newModelMatrix);
	newNormalMatrix.transpose();
	gl.uniformMatrix4fv(u_ModelMatrix, false, newModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, newMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, newNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, birdcount, type, birdoffset);

	newMvpMatrix.set(mvpMatrix);
	newModelMatrix.scale(2.5, 1.0, 1.0);
  	newModelMatrix.rotate(60.0, 0, 0, 1);
  	newModelMatrix.scale(0.4, 1.0, 1.0);
  	newMvpMatrix.multiply(newModelMatrix);
	newNormalMatrix.setInverseOf(newModelMatrix);
	newNormalMatrix.transpose();
	gl.uniformMatrix4fv(u_ModelMatrix, false, newModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, newMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, newNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, birdcount, type, birdoffset);

	newMvpMatrix.set(mvpMatrix);
	newModelMatrix.scale(2.5, 1.0, 1.0);
  	newModelMatrix.rotate(60.0, 0, 0, 1);
  	newModelMatrix.scale(0.4, 1.0, 1.0);
	newMvpMatrix.multiply(newModelMatrix);
	newNormalMatrix.setInverseOf(newModelMatrix);
	newNormalMatrix.transpose();
	gl.uniformMatrix4fv(u_ModelMatrix, false, newModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, newMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, newNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, birdcount, type, birdoffset);

	newMvpMatrix.set(mvpMatrix);
	newModelMatrix.scale(2.5, 1.0, 1.0);
  	newModelMatrix.rotate(30.0, 0, 0, 1);
  	newModelMatrix.scale(0.4, 1.0, 1.0);
	newMvpMatrix.multiply(newModelMatrix);
	newNormalMatrix.setInverseOf(newModelMatrix);
	newNormalMatrix.transpose();
	gl.uniformMatrix4fv(u_ModelMatrix, false, newModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, newMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, newNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, birdcount, type, birdoffset);

	newMvpMatrix.set(mvpMatrix);
	newModelMatrix.scale(2.5, 1.0, 1.0);
  	newModelMatrix.rotate(-210.0, 0, 0, 1);
  	newModelMatrix.scale(0.4, 1.0, 1.0);
	newMvpMatrix.multiply(newModelMatrix);
	newNormalMatrix.setInverseOf(newModelMatrix);
	newNormalMatrix.transpose();
	gl.uniformMatrix4fv(u_ModelMatrix, false, newModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, newMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, newNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, birdcount, type, birdoffset);

	newMvpMatrix.set(mvpMatrix);
	newModelMatrix.scale(2.5, 1.0, 1.0);
  	newModelMatrix.rotate(-30.0, 0, 0, 1);
  	newModelMatrix.scale(0.4, 1.0, 1.0);
	newMvpMatrix.multiply(newModelMatrix);
	newNormalMatrix.setInverseOf(newModelMatrix);
	newNormalMatrix.transpose();
	gl.uniformMatrix4fv(u_ModelMatrix, false, newModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, newMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, newNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, birdcount, type, birdoffset);

	newMvpMatrix.set(mvpMatrix);
	newModelMatrix.scale(2.5, 1.0, 1.0);
  	newModelMatrix.rotate(15.0, 0, 0, 1);
  	newModelMatrix.scale(0.4, 0.8, 1.0);
	newMvpMatrix.multiply(newModelMatrix);
	newNormalMatrix.setInverseOf(newModelMatrix);
	newNormalMatrix.transpose();
	gl.uniformMatrix4fv(u_ModelMatrix, false, newModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, newMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, newNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, birdcount, type, birdoffset);

	newMvpMatrix.set(mvpMatrix);
	newModelMatrix.scale(2.5, 1.25, 1.0);
  	newModelMatrix.rotate(30.0, 0, 0, 1);
  	newModelMatrix.scale(0.4, 0.8, 1.0);
	newMvpMatrix.multiply(newModelMatrix);
	newNormalMatrix.setInverseOf(newModelMatrix);
	newNormalMatrix.transpose();
	gl.uniformMatrix4fv(u_ModelMatrix, false, newModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, newMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, newNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, birdcount, type, birdoffset);

	newMvpMatrix.set(mvpMatrix);
	newModelMatrix.scale(2.5, 1.25, 1.0);
 	newModelMatrix.rotate(30.0, 0, 0, 1);
 	newModelMatrix.scale(0.4, 0.8, 1.0);
	newMvpMatrix.multiply(newModelMatrix);
	newNormalMatrix.setInverseOf(newModelMatrix);
	newNormalMatrix.transpose();
	gl.uniformMatrix4fv(u_ModelMatrix, false, newModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, newMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, newNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, birdcount, type, birdoffset);

	newMvpMatrix.set(mvpMatrix);
	newModelMatrix.scale(2.5, 1.25, 1.0);
  	newModelMatrix.rotate(30.0, 0, 0, 1);
  	newModelMatrix.scale(0.4, 0.8, 1.0);
	newMvpMatrix.multiply(newModelMatrix);
	newNormalMatrix.setInverseOf(newModelMatrix);
	newNormalMatrix.transpose();
	gl.uniformMatrix4fv(u_ModelMatrix, false, newModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, newMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, newNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, birdcount, type, birdoffset);

	newMvpMatrix.set(mvpMatrix);
	newModelMatrix.scale(2.5, 1.25, 1.0);
  	newModelMatrix.rotate(30.0, 0, 0, 1);
  	newModelMatrix.scale(0.4, 0.8, 1.0);
	newMvpMatrix.multiply(newModelMatrix);
	newNormalMatrix.setInverseOf(newModelMatrix);
	newNormalMatrix.transpose();
	gl.uniformMatrix4fv(u_ModelMatrix, false, newModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, newMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, newNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, birdcount, type, birdoffset);

	newMvpMatrix.set(mvpMatrix);
	newModelMatrix.scale(2.5, 1.25, 1.0);
  	newModelMatrix.rotate(30.0, 0, 0, 1);
  	newModelMatrix.scale(0.4, 0.8, 1.0);
	newMvpMatrix.multiply(newModelMatrix);
	newNormalMatrix.setInverseOf(newModelMatrix);
	newNormalMatrix.transpose();
	gl.uniformMatrix4fv(u_ModelMatrix, false, newModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, newMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, newNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, birdcount, type, birdoffset);

	newMvpMatrix.set(mvpMatrix);
	newModelMatrix.scale(2.5, 1.25, 1.0);
  	newModelMatrix.rotate(30.0, 0, 0, 1);
  	newModelMatrix.scale(0.4, 0.8, 1.0);
	newMvpMatrix.multiply(newModelMatrix);
	newNormalMatrix.setInverseOf(newModelMatrix);
	newNormalMatrix.transpose();
	gl.uniformMatrix4fv(u_ModelMatrix, false, newModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, newMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, newNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, birdcount, type, birdoffset);

	newMvpMatrix.set(mvpMatrix);
	newModelMatrix.scale(2.5, 1.25, 1.0);
 	newModelMatrix.rotate(30.0, 0, 0, 1);
  	newModelMatrix.scale(0.4, 0.8, 1.0);
	newMvpMatrix.multiply(newModelMatrix);
	newNormalMatrix.setInverseOf(newModelMatrix);
	newNormalMatrix.transpose();
	gl.uniformMatrix4fv(u_ModelMatrix, false, newModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, newMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, newNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, birdcount, type, birdoffset);

	newModelMatrix = popMatrix();

	//the head
	newMvpMatrix.set(mvpMatrix);
	newModelMatrix.translate(0.0, 0.4, 0.0);
  	newModelMatrix.scale(0.5, 0.5, 0.5);
  	newModelMatrix.rotate(-90.0+1.5*currentAngle/3, 0, 0, 1);
  	newMvpMatrix.multiply(newModelMatrix);
	newNormalMatrix.setInverseOf(newModelMatrix);
	newNormalMatrix.transpose();
	gl.uniformMatrix4fv(u_ModelMatrix, false, newModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, newMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, newNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, birdcount, type, birdoffset);

	//the cockscomb
	pushMatrix(newModelMatrix);

	newMvpMatrix.set(mvpMatrix);
	newModelMatrix.translate(0.08, 0.15, 0.0);
  	newModelMatrix.scale(0.5, 0.5, 0.5);
  	newModelMatrix.rotate(-100.0+1.8*currentAngle/3, 0, 0, 1);
  	newMvpMatrix.multiply(newModelMatrix);
	newNormalMatrix.setInverseOf(newModelMatrix);
	newNormalMatrix.transpose();
	gl.uniformMatrix4fv(u_ModelMatrix, false, newModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, newMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, newNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, birdcount, type, birdoffset);

	newMvpMatrix.set(mvpMatrix);
	newModelMatrix.translate(-0.0, -0.5, 0.0);
  	newModelMatrix.scale(0.5, 0.5, 0.5);
  	newModelMatrix.rotate(150.0+1.2*currentAngle/3, 0, 0, 1);
  	newMvpMatrix.multiply(newModelMatrix);
	newNormalMatrix.setInverseOf(newModelMatrix);
	newNormalMatrix.transpose();
	gl.uniformMatrix4fv(u_ModelMatrix, false, newModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, newMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, newNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, birdcount, type, birdoffset);

	newMvpMatrix.set(mvpMatrix);
	newModelMatrix.translate(0.2, 0.05, 0.0);
	newMvpMatrix.multiply(newModelMatrix);
	newNormalMatrix.setInverseOf(newModelMatrix);
	newNormalMatrix.transpose();
	gl.uniformMatrix4fv(u_ModelMatrix, false, newModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, newMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, newNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, birdcount, type, birdoffset);

	newMvpMatrix.set(mvpMatrix);
	newModelMatrix.translate(-0.4, 0.0, 0.0);
	newMvpMatrix.multiply(newModelMatrix);
	newNormalMatrix.setInverseOf(newModelMatrix);
	newNormalMatrix.transpose();
	gl.uniformMatrix4fv(u_ModelMatrix, false, newModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, newMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, newNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, birdcount, type, birdoffset);
}

function drawDetector(gl, scount, soffset, ccount, coffset, type, mvpMatrix, modelMatrix, normalMatrix){
	phongLighting(copperShiny0);
	setMaterial(copperShiny);

	var tempMvpMatrix = new Matrix4();
	var tempModelMatrix = new Matrix4();
	var tempNormalMatrix = new Matrix4();
	tempMvpMatrix.set(mvpMatrix);
	tempModelMatrix.set(modelMatrix);
	tempModelMatrix.translate(-28, 4, 8);
	tempModelMatrix.rotate(currentAngle0, 0, 0, 1);
	tempMvpMatrix.multiply(tempModelMatrix);
	tempNormalMatrix.setInverseOf(tempModelMatrix);
	tempNormalMatrix.transpose();

	gl.uniform1i(u_shading, shadingMode);
	gl.uniform4f(u_eyePosition, g_EyeX, g_EyeY, g_EyeZ, 1);
	gl.uniformMatrix4fv(u_ModelMatrix, false, tempModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, tempMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, tempNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, ccount, type, coffset);
	//1
	pushMatrix(tempModelMatrix);
	tempMvpMatrix.set(mvpMatrix);
	tempModelMatrix.scale(0.5, 0.5, 0.5);
	tempModelMatrix.translate(2.0, 2.0, -2.0);
	tempModelMatrix.rotate(currentAngle0, 0, 0, 1);
	tempMvpMatrix.multiply(tempModelMatrix);
	tempNormalMatrix.setInverseOf(tempModelMatrix);
	tempNormalMatrix.transpose();
	gl.uniformMatrix4fv(u_ModelMatrix, false, tempModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, tempMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, tempNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, ccount, type, coffset);

	tempMvpMatrix.set(mvpMatrix);
	tempModelMatrix.scale(0.5, 0.5, 0.5);
	tempModelMatrix.translate(2.0, 2.0, -2.0);
	tempModelMatrix.rotate(currentAngle0, 0, 0, 1);
	tempMvpMatrix.multiply(tempModelMatrix);
	tempNormalMatrix.setInverseOf(tempModelMatrix);
	tempNormalMatrix.transpose();
	gl.uniformMatrix4fv(u_ModelMatrix, false, tempModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, tempMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, tempNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, ccount, type, coffset);

	//2
	tempModelMatrix = popMatrix();
	pushMatrix(tempModelMatrix);
	tempMvpMatrix.set(mvpMatrix);
	tempModelMatrix.scale(0.5, 0.5, 0.5);
	tempModelMatrix.translate(2.0, -2.0, -2.0);
	tempModelMatrix.rotate(currentAngle0, 0, 0, 1);
	tempMvpMatrix.multiply(tempModelMatrix);
	tempNormalMatrix.setInverseOf(tempModelMatrix);
	tempNormalMatrix.transpose();
	gl.uniformMatrix4fv(u_ModelMatrix, false, tempModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, tempMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, tempNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, ccount, type, coffset);

	tempMvpMatrix.set(mvpMatrix);
	tempModelMatrix.scale(0.5, 0.5, 0.5);
	tempModelMatrix.translate(2.0, -2.0, -2.0);
	tempModelMatrix.rotate(currentAngle0, 0, 0, 1);
	tempMvpMatrix.multiply(tempModelMatrix);
	tempNormalMatrix.setInverseOf(tempModelMatrix);
	tempNormalMatrix.transpose();
	gl.uniformMatrix4fv(u_ModelMatrix, false, tempModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, tempMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, tempNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, ccount, type, coffset);

	//3
	tempModelMatrix = popMatrix();
	pushMatrix(tempModelMatrix);
	tempMvpMatrix.set(mvpMatrix);
	tempModelMatrix.scale(0.5, 0.5, 0.5);
	tempModelMatrix.translate(-2.0, -2.0, -2.0);
	tempModelMatrix.rotate(currentAngle0, 0, 0, 1);
	tempMvpMatrix.multiply(tempModelMatrix);
	tempNormalMatrix.setInverseOf(tempModelMatrix);
	tempNormalMatrix.transpose();
	gl.uniformMatrix4fv(u_ModelMatrix, false, tempModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, tempMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, tempNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, ccount, type, coffset);

	tempMvpMatrix.set(mvpMatrix);
	tempModelMatrix.scale(0.5, 0.5, 0.5);
	tempModelMatrix.translate(-2.0, -2.0, -2.0);
	tempModelMatrix.rotate(currentAngle0, 0, 0, 1);
	tempMvpMatrix.multiply(tempModelMatrix);
	tempNormalMatrix.setInverseOf(tempModelMatrix);
	tempNormalMatrix.transpose();
	gl.uniformMatrix4fv(u_ModelMatrix, false, tempModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, tempMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, tempNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, ccount, type, coffset);

	//4
	tempModelMatrix = popMatrix();
	pushMatrix(tempModelMatrix);
	tempMvpMatrix.set(mvpMatrix);
	tempModelMatrix.scale(0.5, 0.5, 0.5);
	tempModelMatrix.translate(-2.0, 2.0, -2.0);
	tempModelMatrix.rotate(currentAngle0, 0, 0, 1);
	tempMvpMatrix.multiply(tempModelMatrix);
	tempNormalMatrix.setInverseOf(tempModelMatrix);
	tempNormalMatrix.transpose();
	gl.uniformMatrix4fv(u_ModelMatrix, false, tempModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, tempMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, tempNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, ccount, type, coffset);

	tempMvpMatrix.set(mvpMatrix);
	tempModelMatrix.scale(0.5, 0.5, 0.5);
	tempModelMatrix.translate(-2.0, 2.0, -2.0);
	tempModelMatrix.rotate(currentAngle0, 0, 0, 1);
	tempMvpMatrix.multiply(tempModelMatrix);
	tempNormalMatrix.setInverseOf(tempModelMatrix);
	tempNormalMatrix.transpose();
	gl.uniformMatrix4fv(u_ModelMatrix, false, tempModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, tempMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, tempNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, ccount, type, coffset);
}



function drawRobot(gl, scount, soffset, ccount, coffset, type, mvpMatrix, modelMatrix, normalMatrix){
	phongLighting(silverDull0);
	setMaterial(silverDull);

	var tempMvpMatrix = new Matrix4();
	var tempModelMatrix = new Matrix4();
	var tempNormalMatrix = new Matrix4();
	tempMvpMatrix.set(mvpMatrix);
	tempModelMatrix.set(modelMatrix);
	tempModelMatrix.translate(-10, 20, 7);
	tempMvpMatrix.multiply(tempModelMatrix);
	tempNormalMatrix.setInverseOf(tempModelMatrix);
	tempNormalMatrix.transpose();

	//head
	gl.uniform1i(u_shading, shadingMode);
	gl.uniform4f(u_eyePosition, g_EyeX, g_EyeY, g_EyeZ, 1);
	gl.uniformMatrix4fv(u_ModelMatrix, false, tempModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, tempMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, tempNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, scount, type, soffset);
	//body
	tempMvpMatrix.set(mvpMatrix);
	tempModelMatrix.scale(1.2, 1.2, 1.2);
	tempModelMatrix.rotate(-20.0+currentAngle/2, 0, 0, 1);
	tempModelMatrix.translate(0.0, 0.0, -2.0);
	tempMvpMatrix.multiply(tempModelMatrix);
	tempNormalMatrix.setInverseOf(tempModelMatrix);
	tempNormalMatrix.transpose();
	gl.uniformMatrix4fv(u_ModelMatrix, false, tempModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, tempMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, tempNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, ccount, type, coffset);
	//right-up arm
	pushMatrix(tempModelMatrix);

	tempMvpMatrix.set(mvpMatrix);
	tempModelMatrix.rotate(-currentAngle/5, 0, 0, 1);
	tempModelMatrix.translate(-1.25, 0.0, 0.0);
	tempModelMatrix.scale(0.5, 0.5, 0.5);
	tempMvpMatrix.multiply(tempModelMatrix);
	tempNormalMatrix.setInverseOf(tempModelMatrix);
	tempNormalMatrix.transpose();
	gl.uniformMatrix4fv(u_ModelMatrix, false, tempModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, tempMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, tempNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, ccount, type, coffset);
	//right-down arm
	tempMvpMatrix.set(mvpMatrix);
	tempModelMatrix.rotate(-currentAngle/3, 0, 0, 1);
	tempModelMatrix.translate(-2.5, 0.0, 0.0);
	tempMvpMatrix.multiply(tempModelMatrix);
	tempNormalMatrix.setInverseOf(tempModelMatrix);
	tempNormalMatrix.transpose();
	gl.uniformMatrix4fv(u_ModelMatrix, false, tempModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, tempMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, tempNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, ccount, type, coffset);
	//left-up arm
	tempModelMatrix = popMatrix();
	pushMatrix(tempModelMatrix);

	tempMvpMatrix.set(mvpMatrix);
	tempModelMatrix.rotate(18.0-currentAngle/5, 0, 0, 1);
	tempModelMatrix.translate(1.25, 0.0, 0.0);
	tempModelMatrix.scale(0.5, 0.5, 0.5);
	tempMvpMatrix.multiply(tempModelMatrix);
	tempNormalMatrix.setInverseOf(tempModelMatrix);
	tempNormalMatrix.transpose();
	gl.uniformMatrix4fv(u_ModelMatrix, false, tempModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, tempMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, tempNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, ccount, type, coffset);
	//left-down arm
	tempMvpMatrix.set(mvpMatrix);
	tempModelMatrix.rotate(30.0-currentAngle/3, 0, 0, 1);
	tempModelMatrix.translate(2.5, 0.0, 0.0);
	tempMvpMatrix.multiply(tempModelMatrix);
	tempNormalMatrix.setInverseOf(tempModelMatrix);
	tempNormalMatrix.transpose();
	gl.uniformMatrix4fv(u_ModelMatrix, false, tempModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, tempMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, tempNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, ccount, type, coffset);
	//right-up leg
	tempModelMatrix = popMatrix();
	pushMatrix(tempModelMatrix);

	tempMvpMatrix.set(mvpMatrix);
	tempModelMatrix.rotate(40.0-currentAngle/2, 1, 0, 0);
	tempModelMatrix.translate(-0.65, 0.0, -2.0);
	tempModelMatrix.scale(0.5, 0.5, 0.5);
	tempMvpMatrix.multiply(tempModelMatrix);
	tempNormalMatrix.setInverseOf(tempModelMatrix);
	tempNormalMatrix.transpose();
	gl.uniformMatrix4fv(u_ModelMatrix, false, tempModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, tempMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, tempNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, ccount, type, coffset);
	//right-down leg
	tempMvpMatrix.set(mvpMatrix);
	tempModelMatrix.rotate(-currentAngle/2, 1, 0, 0);
	tempModelMatrix.translate(0.0, 0.0, -2.5);
	tempMvpMatrix.multiply(tempModelMatrix);
	tempNormalMatrix.setInverseOf(tempModelMatrix);
	tempNormalMatrix.transpose();
	gl.uniformMatrix4fv(u_ModelMatrix, false, tempModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, tempMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, tempNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, ccount, type, coffset);
	//left-up leg
	tempModelMatrix = popMatrix();
	pushMatrix(tempModelMatrix);

	tempMvpMatrix.set(mvpMatrix);
	tempModelMatrix.rotate(-5.0+currentAngle/2, 1, 0, 0);
	tempModelMatrix.translate(0.65, 0.0, -2.0);
	tempModelMatrix.scale(0.5, 0.5, 0.5);
	tempMvpMatrix.multiply(tempModelMatrix);
	tempNormalMatrix.setInverseOf(tempModelMatrix);
	tempNormalMatrix.transpose();
	gl.uniformMatrix4fv(u_ModelMatrix, false, tempModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, tempMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, tempNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, ccount, type, coffset);
	//left-down leg
	tempMvpMatrix.set(mvpMatrix);
	tempModelMatrix.rotate(-45.0+currentAngle/2, 1, 0, 0);
	tempModelMatrix.translate(0.0, 0.0, -2.5);
	tempMvpMatrix.multiply(tempModelMatrix);
	tempNormalMatrix.setInverseOf(tempModelMatrix);
	tempNormalMatrix.transpose();
	gl.uniformMatrix4fv(u_ModelMatrix, false, tempModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, tempMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, tempNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, ccount, type, coffset);

}

function drawGround_x(gl, count, offset, type, mvpMatrix, modelMatrix, normalMatrix){
	setMaterial(green);
	phongLighting(green0);

	var gxMvpMatrix = new Matrix4();
	var gxModelMatrix = new Matrix4();
	var gxNormalMatrix = new Matrix4();
	gxModelMatrix.set(modelMatrix);

	for(var i=0; i<80; i++){
		gl.uniform1i(u_shading, shadingMode);
		gxMvpMatrix.set(mvpMatrix);
		gxModelMatrix.setIdentity();
		gxModelMatrix.translate(2*i-80,0.0,-5.0);
		gxMvpMatrix.multiply(gxModelMatrix);
		gxNormalMatrix.setInverseOf(gxModelMatrix);
		gxNormalMatrix.transpose();
		gl.uniformMatrix4fv(u_ModelMatrix, false, gxModelMatrix.elements);
		gl.uniformMatrix4fv(u_MvpMatrix, false, gxMvpMatrix.elements);
		gl.uniformMatrix4fv(u_NormalMatrix, false, gxNormalMatrix.elements);
		gl.drawElements(gl.LINES, count, type, offset);
	}
}

function drawGround_y(gl, count, offset, type, mvpMatrix, modelMatrix, normalMatrix){
	setMaterial(blue);
	phongLighting(blue0);

	var gyMvpMatrix = new Matrix4();
	var gyModelMatrix = new Matrix4();
	var gyNormalMatrix = new Matrix4();
	gyModelMatrix.set(modelMatrix);

	for(var i=0; i<80; i++){
		gl.uniform1i(u_shading, shadingMode);
		gyMvpMatrix.set(mvpMatrix);
		gyModelMatrix.setIdentity();
		gyModelMatrix.rotate(90.0, 0, 0, 1);
		gyModelMatrix.translate(2*i-80,0.0,-5.0);
		gyMvpMatrix.multiply(gyModelMatrix);
		gyNormalMatrix.setInverseOf(gyModelMatrix);
		gyNormalMatrix.transpose();
		gl.uniformMatrix4fv(u_ModelMatrix, false, gyModelMatrix.elements);
		gl.uniformMatrix4fv(u_MvpMatrix, false, gyMvpMatrix.elements);
		gl.uniformMatrix4fv(u_NormalMatrix, false, gyNormalMatrix.elements);
		gl.drawElements(gl.LINES, count, type, offset);
	}
}

function drawStarModel(gl, spherecount, sphereoffset, type, mvpMatrix, modelMatrix, normalMatrix){
	phongLighting(jade0);
    setMaterial(jade);

	var newMvpMatrix = new Matrix4();
	var newModelMatrix = new Matrix4();
	var newNormalMatrix = new Matrix4();
	newMvpMatrix.set(mvpMatrix);
	newModelMatrix.set(modelMatrix);

	newModelMatrix.translate(0.0, 0.0, rs);
	newModelMatrix.scale(1.6, 1.6, 1.6);
	newMvpMatrix.multiply(newModelMatrix);
	newNormalMatrix.setInverseOf(newModelMatrix);
	newNormalMatrix.transpose();
	pushMatrix(newModelMatrix);

	gl.uniform1i(u_shading, shadingMode);
	gl.uniform4f(u_eyePosition, g_EyeX, g_EyeY, g_EyeZ, 1);
	gl.uniformMatrix4fv(u_ModelMatrix, false, newModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, newMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, newNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, spherecount, type, sphereoffset);

	newMvpMatrix.set(mvpMatrix);
	newModelMatrix.rotate(currentAngle0, 0, 0, 1);
	newModelMatrix.translate(rs*20, 0.0, 0.0);
	newMvpMatrix.scale(0.3, 0.3, 0.3);
	newMvpMatrix.multiply(newModelMatrix);
	newNormalMatrix.setInverseOf(newModelMatrix);
	newNormalMatrix.transpose();
	gl.uniformMatrix4fv(u_ModelMatrix, false, newModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, newMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, newNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, spherecount, type, sphereoffset);

	newMvpMatrix.translate(0.1, 0.0, 0.0);
	newMvpMatrix.scale(0.3, 0.3, 0.3);
	newMvpMatrix.multiply(newModelMatrix);
	newNormalMatrix.setInverseOf(newModelMatrix);
	newNormalMatrix.transpose();
	gl.uniformMatrix4fv(u_ModelMatrix, false, newModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, newMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, newNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, spherecount, type, sphereoffset);

	newModelMatrix = popMatrix();

	gl.uniform1i(u_shading, shadingMode);
	gl.uniform4f(u_eyePosition, g_EyeX, g_EyeY, g_EyeZ, 1);
	gl.uniformMatrix4fv(u_ModelMatrix, false, newModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, newMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, newNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, spherecount, type, sphereoffset);

	newMvpMatrix.set(mvpMatrix);
	newModelMatrix.rotate(120.0+currentAngle0*2, 0, 0, 1);
	newModelMatrix.translate(rs*5, 0.0, 0.0);
	newMvpMatrix.scale(0.5, 0.5, 0.5);
	newMvpMatrix.multiply(newModelMatrix);
	newNormalMatrix.setInverseOf(newModelMatrix);
	newNormalMatrix.transpose();
	gl.uniformMatrix4fv(u_ModelMatrix, false, newModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, newMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, newNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, spherecount, type, sphereoffset);

	newMvpMatrix.translate(0.1, 0.0, 0.0);
	newMvpMatrix.scale(0.2, 0.2, 0.2);
	newMvpMatrix.multiply(newModelMatrix);
	newNormalMatrix.setInverseOf(newModelMatrix);
	newNormalMatrix.transpose();
	gl.uniformMatrix4fv(u_ModelMatrix, false, newModelMatrix.elements);
	gl.uniformMatrix4fv(u_MvpMatrix, false, newMvpMatrix.elements);
	gl.uniformMatrix4fv(u_NormalMatrix, false, newNormalMatrix.elements);
	gl.drawElements(gl.TRIANGLES, spherecount, type, sphereoffset);
}


function initVertexBuffers(gl) {
  var i, ai, si, ci;
  var j, aj, sj, cj;
  var p1, p2;
  var offset = [];
  var count = 0;

  var positions = [];
  var norm_Vertex = []
  var indices = [];
  var drawCount = [];

  gl.clearColor(0.1, 0.1, 0.1, 1.0);
  gl.depthFunc(gl.LEQUAL);
  gl.enable(gl.DEPTH_TEST);

  for (j = 0; j <= Svertex; j++) {
    aj = j * Math.PI / Svertex * rs;
    sj = Math.sin(aj);
    cj = Math.cos(aj);
    for (i = 0; i <= Svertex; i++) {
      ai = i * 2 * Math.PI / Svertex* rs;
      si = Math.sin(ai);
      ci = Math.cos(ai);

      positions.push(si * sj);  // x
      positions.push(cj);       // y
      positions.push(ci * sj);  // z
			count++;
    }
  }
  offset.push(count);

  var sphere_normal = [];
  for (j = 0; j <= Svertex; j++) {
  	aj = j * Math.PI / Svertex * rs;
    sj = Math.sin(aj);
    cj = Math.cos(aj);
    for (i = 0; i <= Svertex; i++) {
      ai = i * 2 * Math.PI / Svertex* rs;
      si = Math.sin(ai);
      ci = Math.cos(ai);

      sphere_normal.push(si * sj);
      sphere_normal.push(cj);
      sphere_normal.push(ci * sj);
			count++;
    }
  }
  norm_Vertex = norm_Vertex.concat(sphere_normal);

  var ground = [
  	0.0, 80.0, 0.0,
  	0.0, -80.0, 0.0,
  ]

  positions = positions.concat(ground);
  for (i=0; i<ground.length/3; i++){
		norm_Vertex.push(0.0);
		norm_Vertex.push(0.0);
		norm_Vertex.push(1.0);
  }
  offset.push(2);

  var cube = [
	 1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0,
     1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0,
     1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0,
    -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0,
    -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0,
     1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0
  ]
  positions = positions.concat(cube);
  var cube_normal = [
	0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,
    1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,
    0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,
   -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,
    0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,
    0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0
  ]
  norm_Vertex = norm_Vertex.concat(cube_normal);
  offset.push(24);

// The bird
  var bird = [
	 0.10, 0.00,  0.10,
     0.10, 0.00, -0.10,
     0.00, 0.40,  0.00,

  	-0.10, 0.00,  0.10,
    -0.10, 0.00, -0.10,
     0.00, 0.40,  0.00,

     0.10, 0.00, -0.10,
    -0.10, 0.00, -0.10,
     0.00, 0.40,  0.00,

     0.10, 0.00,  0.10,
    -0.10, 0.00,  0.10,
     0.00, 0.40,  0.00,
  ]
  positions = positions.concat(bird);

  var bird_normal = [
	 0.08, 0.02, 0.0,
     0.08, 0.02, 0.0,
     0.08, 0.02, 0.0,

    -0.08, 0.02, 0.0,
    -0.08, 0.02, 0.0,
    -0.08, 0.02, 0.0,

     0.0, 0.02, -0.08,
   	 0.0, 0.02, -0.08,
     0.0, 0.02, -0.08,

     0.0, 0.02, 0.08,
     0.0, 0.02, 0.08,
     0.0, 0.02, 0.08,
  ]
  norm_Vertex = norm_Vertex.concat(bird_normal);
  offset.push(12);

  for (j = 0; j < Svertex; j++) {
    for (i = 0; i < Svertex; i++) {
      p1 = j * (Svertex+1) + i;
      p2 = p1 + (Svertex+1);

      indices.push(p1);
      indices.push(p2);
      indices.push(p1 + 1);

      indices.push(p1 + 1);
      indices.push(p2);
      indices.push(p2 + 1);
    }
  }
	drawCount.push(indices.length);


	ground = [0, 1];
	for (i=0; i<ground.length; i++){
		ground[i]+=offset[0];
	}
	drawCount.push(ground.length);
	indices = indices.concat(ground);

	cube = [
		8, 9, 10,  8, 10, 11,
		12, 13, 14,  12, 14, 15,
		16, 17, 18,  16, 18, 19,
		20, 21, 22,  20, 22, 23,
		24, 25, 26,  24, 26, 27,
		28, 29, 30,  28, 30, 31
	]

	for (i=0; i<cube.length; i++){
		cube[i]=cube[i]-8+offset[0]+offset[1];
	}
	drawCount.push(cube.length);
	indices = indices.concat(cube);

	bird = [
		32, 33, 34,
		35, 36, 37,		
		38, 39, 40,		
		41, 42, 43,		
	]

	for (i=0; i<bird.length; i++) {
		bird[i] = bird[i]-32+offset[0]+offset[1]+offset[2];
	}
	drawCount.push(bird.length);
	indices = indices.concat(bird);

  if (!initArrayBuffer(gl, 'a_Position', new Float32Array(positions), gl.FLOAT, 3)) return -1;
  if (!initArrayBuffer(gl, 'a_Normal', new Float32Array(norm_Vertex), gl.FLOAT, 3))  return -1;

  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  var indexBuffer = gl.createBuffer();
  if (!indexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

  return drawCount;
}

function initArrayBuffer(gl, attribute, data, type, num) {
  var buffer = gl.createBuffer();
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return false;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

  var a_attribute = gl.getAttribLocation(gl.program, attribute);
  if (a_attribute < 0) {
    console.log('Failed to get the storage location of ' + attribute);
    return false;
  }
  gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
  gl.enableVertexAttribArray(a_attribute);

  return true;
}

var t_last = Date.now();
function animate(){
	var t_now = Date.now();
	var elapse = t_now - t_last;
	t_last = t_now;
	currentAngle = currentAngle + angleSpeed * elapse / 2000.0;
	if (currentAngle>90 || currentAngle<0){
		angleSpeed = -angleSpeed;
		currentAngle = currentAngle + 2 * angleSpeed * elapse / 2000.0;
	}
}

var t_last0 = Date.now();
function animate0(){
	var t_now = Date.now();
	var elapse0 = t_now - t_last0;
	t_last = t_now;
	currentAngle0 = angleSpeed0 * elapse0 / 2500.0;
}

function upDateRGB(){
	var UserLightElements = document.getElementsByName('set');

		ular = UserLightElements[0].value;
		ulag = UserLightElements[1].value;
		ulab = UserLightElements[2].value;
		uldr = UserLightElements[3].value;
		uldg = UserLightElements[4].value;
		uldb = UserLightElements[5].value;
		ulsr = UserLightElements[6].value;
		ulsg = UserLightElements[7].value;
		ulsb = UserLightElements[8].value;
		ulx = UserLightElements[9].value;
		uly = UserLightElements[10].value;
		ulz = UserLightElements[11].value;
}

function n1(){
	shadingMode = 1;
}

function n2(){
	shadingMode = 2;
}

function n3(){
	shadingMode = 3;
}

function n4(){
	shadingMode = 4;
}

function clearDrag() {

	xMdragTot = 0.0;
	yMdragTot = 0.0;
}

function clearDrag() {
	xMdragTot = 0.0;
	yMdragTot = 0.0;

  	draw(modelMatrix, mvpMatrix, normalMatrix, n);
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
};


function myMouseMove(ev, gl, canvas) {
	if(isDrag==false) return;

  	var rect = ev.target.getBoundingClientRect();
  	var xp = ev.clientX - rect.left;
  	var yp = canvas.height - (ev.clientY - rect.top);
 
  	var x = (xp - canvas.width/2) / (canvas.width/2);	
  	var y = (yp - canvas.height/2) / (canvas.height/2);

	userLight.I_pos.elements.set([g_EyeX, g_EyeY + 4.0 * (x - xMclik), g_EyeZ + 4.0 * (y - yMclik)]);

	ulx = ulx + 4.0 * (x - xMclik);
	ulz = ulz + 4.0 * (y - yMclik);

	draw(modelMatrix, mvpMatrix, normalMatrix, n);

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