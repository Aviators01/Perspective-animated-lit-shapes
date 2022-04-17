/*
Timothy Queva
CS3110 Final-Task1
December 14,2020
*/

var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'uniform mat4 u_MvpMatrix;\n' +
  'uniform mat4 u_ScaleMatrix;\n' +
  'uniform mat4 u_mvMatrix;\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_Position = u_MvpMatrix * u_mvMatrix * u_ScaleMatrix * a_Position;\n' +
  '  v_Color = a_Color;\n' +
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

  // Get the storage location of u_MvpMatrix
  var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
  if (!u_MvpMatrix) { 
    console.log('Failed to get the storage location of u_MvpMatrix');
    return;
  }

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
  
	var animate = function(){
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		
		if(pos<0.7 && pflag)pos+=0.02;
		else pflag=false;
		if(pos>0 && !pflag)pos-=0.02;
		else pflag=true;
		
		mvMatrix.setTranslate(-1,1,0);
		mvMatrix.translate(pos,0,0);
		gl.uniformMatrix4fv(u_mvMatrix, false, mvMatrix.elements);
		gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
		
		if(angle<360)angle+=1;
		else angle=0;
		
		mvMatrix.setTranslate(1,1,0);
		mvMatrix.rotate(angle,0,1,0);
		gl.uniformMatrix4fv(u_mvMatrix, false, mvMatrix.elements);
		gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
		
		mvMatrix.setTranslate(-1,-1,0);
		mvMatrix.rotate(angle,1,0,0);
		gl.uniformMatrix4fv(u_mvMatrix, false, mvMatrix.elements);
		gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
		
		if(scaling<1.5 && sflag)scaling+=0.01;
		else sflag=false;
		if(scaling>0.8 && !sflag)scaling-=0.01;
		else sflag=true;
		
		mvMatrix.setTranslate(1,-1,0);
		mvMatrix.scale(scaling,scaling,scaling);
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

  // Write the indices to the buffer object
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  return indices.length;
}