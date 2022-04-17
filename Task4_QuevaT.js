/*
Timothy Queva
CS3110 Final-Task4
December 14,2020
*/

var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'uniform mat4 u_MvpMatrix;\n' +
  'uniform mat4 u_ScaleMatrix;\n' +
  'uniform mat4 u_mvMatrix;\n' +
  'varying vec4 v_Color;\n' +
  'attribute vec4 a_Normal;\n' +
  'uniform mat4 u_NormalMatrix;\n' +
  'uniform vec3 u_LightDirection;\n' +
  'void main() {\n' +
  '  gl_Position = u_MvpMatrix * u_mvMatrix * u_ScaleMatrix * a_Position;\n' +
  '  vec4 normal = u_NormalMatrix * a_Normal;\n' +
  '  float nDotL = max(dot(u_LightDirection, normalize(normal.xyz)), 0.0);\n' +
  '  v_Color = vec4(a_Color.xyz * nDotL, a_Color.a);\n' + 
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

function main() {
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

  // Set the vertex coordinates and color
  var n = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  // Set clear color and enable hidden surface removal
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  var u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  var u_LightDirection = gl.getUniformLocation(gl.program, 'u_LightDirection');


  // Get the storage location of u_MvpMatrix
  var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
  if (!u_MvpMatrix) { 
    console.log('Failed to get the storage location of u_MvpMatrix');
    return;
  }
  
  // Set the light direction (in the world coordinate)
  var lightDirection = new Vector3([0.0, 0.0, 8.0]);
  lightDirection.normalize();     // Normalize
  gl.uniform3fv(u_LightDirection, lightDirection.elements);

  // Set the eye point and the viewing volume
  var mvpMatrix = new Matrix4();
  mvpMatrix.setPerspective(30, 1, 1, 100);
  mvpMatrix.lookAt(0, 0, 7, 0, 0, 0, 0, 1, 0);

  // Pass the model view projection matrix to u_MvpMatrix
  gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
  
  var ScaleMatrix = new Matrix4();
  ScaleMatrix.scale(0.5,0.5,0.5);
  var u_ScaleMatrix = gl.getUniformLocation(gl.program, 'u_ScaleMatrix');
  gl.uniformMatrix4fv(u_ScaleMatrix, false, ScaleMatrix.elements);
  
	var mvMatrix = new Matrix4();
	mvMatrix.translate(0,0,0);
	var u_mvMatrix = gl.getUniformLocation(gl.program, 'u_mvMatrix');
	gl.uniformMatrix4fv(u_mvMatrix, false, mvMatrix.elements);  
  
	var pos=0;
	var angle=0;
	var scaling=1;
	var pflag=true;
	var sflag=true;
	var normalMatrix = new Matrix4(); // Transformation matrix for normals
  
	var animate = function(){
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		
		if(angle<360)angle+=1;
		else angle=0;
		
		// Pass the matrix to transform the normal based on the model matrix to u_NormalMatrix
		normalMatrix.setInverseOf(mvMatrix);
		normalMatrix.transpose();
		gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
		
		mvMatrix.setTranslate(-1,1,0);
		mvMatrix.rotate(angle,0,1,0);
		gl.uniformMatrix4fv(u_mvMatrix, false, mvMatrix.elements);
		gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
		
		mvMatrix.setTranslate(1,1,0);
		mvMatrix.rotate(-angle,0,1,0);
		gl.uniformMatrix4fv(u_mvMatrix, false, mvMatrix.elements);
		gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
		
		mvMatrix.setTranslate(-1,-1,0);
		mvMatrix.rotate(angle,1,0,0);
		gl.uniformMatrix4fv(u_mvMatrix, false, mvMatrix.elements);
		gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
		
		mvMatrix.setTranslate(1,-1,0);
		mvMatrix.rotate(angle,0,0,1);
		gl.uniformMatrix4fv(u_mvMatrix, false, mvMatrix.elements);
		gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
		
		
		
		requestAnimationFrame(animate, canvas);
	}
	animate();
}

function initVertexBuffers(gl) {
  // Create a cube
  //    v6----- v5
  //   /|      /|
  //  v1------v0|
  //  | |     | |
  //  | |v7---|-|v4
  //  |/      |/
  //  v2------v3
  var vertices = new Float32Array([
    // Vertex coordinates and color
     1.0,  1.0,  1.0,
    -1.0,  1.0,  1.0,
    -1.0, -1.0,  1.0,
     1.0, -1.0,  1.0,
     1.0, -1.0, -1.0,
     1.0,  1.0, -1.0,
    -1.0,  1.0, -1.0,
    -1.0, -1.0, -1.0,
  ]);
  
	var colors = new Float32Array([
		0,0,0,0,
		0,0,0,0,
		0,0,0,0,
		0,0,0,0,
		0,0,0,0,
		0,0,0,0,
		0,0,0,0,
		0,0,0,0,
	]);
	colors.fill(Math.random(),0,colors.length);
	
	for(var i=0;i<colors.length;i+=4){
		colors.fill(Math.random(),i,i+1);
		colors.fill(Math.random(),i+1,i+2);
		colors.fill(Math.random(),i+2,i+3);
		colors.fill(1,i+3,i+4);
	}
	
  // Indices of the vertices
  var indices = new Uint8Array([
    0, 1, 2,   0, 2, 3,    // front
    0, 3, 4,   0, 4, 5,    // right
    0, 5, 6,   0, 6, 1,    // up
    1, 6, 7,   1, 7, 2,    // left
    7, 4, 3,   7, 3, 2,    // down
    4, 7, 6,   4, 6, 5     // back
 ]);

var normals = new Float32Array([
    0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
    1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
    0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
   -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
    0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // v7-v4-v3-v2 down
    0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0   // v4-v7-v6-v5 back
  ]);

  // Create a buffer object
  var vertexBuffer = gl.createBuffer();
  var indexBuffer = gl.createBuffer();
  if (!vertexBuffer || !indexBuffer) {
    return -1;
  }

  // Write the vertex coordinates and color to the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  // Assign the buffer object to a_Position and enable the assignment
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if(a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false,0, 0);
  gl.enableVertexAttribArray(a_Position);
  // Assign the buffer object to a_Color and enable the assignment
  
  var colorsBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER,colorsBuffer);
  gl.bufferData(gl.ARRAY_BUFFER,colors,gl.STATIC_DRAW);
  var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  if(a_Color < 0) {
    console.log('Failed to get the storage location of a_Color');
    return -1;
  }
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Color);
  
  if (!initArrayBuffer(gl, 'a_Normal', normals, 3, gl.FLOAT)) return -1;

  // Write the indices to the buffer object
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  return indices.length;
}

function initArrayBuffer(gl, attribute, data, num, type) {
  // Create a buffer object
  var buffer = gl.createBuffer();
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return false;
  }
  // Write date into the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  // Assign the buffer object to the attribute variable
  var a_attribute = gl.getAttribLocation(gl.program, attribute);
  if (a_attribute < 0) {
    console.log('Failed to get the storage location of ' + attribute);
    return false;
  }
  gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
  // Enable the assignment of the buffer object to the attribute variable
  gl.enableVertexAttribArray(a_attribute);

  return true;
}