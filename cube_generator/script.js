/* 

paste it in the console 

generateCube(1,[
        [1.0, 1.0, 0.0], 
        [1.0, 0.45, 0.3], 
        [1.0, 0.2, 0.0], 
        [0.2, 0.4, 0.0], 
        [0.54, 1.0, 0.74], 
        [1.0, 0.56, 0.23], 
      ])
*/
const vertexShaderTxt = `
    precision mediump float;

    attribute vec3 vertPosition;
    attribute vec3 vertColor;

    varying vec3 fragColor;

    uniform mat4 mWorld;
    uniform mat4 mView;
    uniform mat4 mProj;

    void main()
    {
        fragColor = vertColor;
        gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);
    }
`;

const fragmentShaderTxt = `
    precision mediump float;

    varying vec3 fragColor;

    void main()
    {
        gl_FragColor = vec4(fragColor, 1.0); // R,G,B, opacity
    }
`;

const mat4 = glMatrix.mat4;

let generateCube = function (sideLength, vertexColors) {
  let canvas = document.getElementById("main-canvas");
  let gl = canvas.getContext("webgl");

  if (!gl) {
    alert("WebGL not supported");
    return;
  }

  gl.clearColor(1.0, 0.64, 1, 1.0); // R,G,B, opacity
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);
  //gl.enable(gl.CULL_FACE);

  let vertexShader = gl.createShader(gl.VERTEX_SHADER);
  let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

  gl.shaderSource(vertexShader, vertexShaderTxt);
  gl.shaderSource(fragmentShader, fragmentShaderTxt);

  gl.compileShader(vertexShader);
  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    console.error(
      "ERROR compiling vertex shader!",
      gl.getShaderInfoLog(vertexShader)
    );
    return;
  }

  gl.compileShader(fragmentShader);

  let program = gl.createProgram();

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  gl.detachShader(program, vertexShader);
  gl.detachShader(program, fragmentShader);

  gl.validateProgram(program);

  let boxVertices = [
    // X, Y, Z           R, G, B
    // Top
    -sideLength,
    sideLength,
    -sideLength,
    -sideLength,
    sideLength,
    sideLength,
    sideLength,
    sideLength,
    sideLength,
    sideLength,
    sideLength,
    -sideLength,

    // Left
    -sideLength,
    sideLength,
    sideLength,
    -sideLength,
    -sideLength,
    sideLength,
    -sideLength,
    -sideLength,
    -sideLength,
    -sideLength,
    sideLength,
    -sideLength,

    // Right
    sideLength,
    sideLength,
    sideLength,
    sideLength,
    -sideLength,
    sideLength,
    sideLength,
    -sideLength,
    -sideLength,
    sideLength,
    sideLength,
    -sideLength,

    // Front
    sideLength,
    sideLength,
    sideLength,
    sideLength,
    -sideLength,
    sideLength,
    -sideLength,
    -sideLength,
    sideLength,
    -sideLength,
    sideLength,
    sideLength,

    // Back
    sideLength,
    sideLength,
    -sideLength,
    sideLength,
    -sideLength,
    -sideLength,
    -sideLength,
    -sideLength,
    -sideLength,
    -sideLength,
    sideLength,
    -sideLength,

    // Bottom
    -sideLength,
    -sideLength,
    -sideLength,
    -sideLength,
    -sideLength,
    sideLength,
    sideLength,
    -sideLength,
    sideLength,
    sideLength,
    -sideLength,
    -sideLength,
  ];

  let boxIndices = [
    // Top
    0,
    1,
    2,
    0,
    2,
    3,

    // Left
    4,
    5,
    6,
    4,
    6,
    7,

    // Right
    8,
    9,
    10,
    8,
    10,
    11,

    // Front
    12,
    13,
    14,
    12,
    14,
    15,

    // Back
    16,
    17,
    18,
    16,
    18,
    19,

    // Bottom
    20,
    22,
    21,
    20,
    23,
    22, // Change the order of indices for the bottom face
  ];

  let colors = [];
  for (let i = 0; i < 6; i++) {
    colors.push(
      vertexColors[i][0],
      vertexColors[i][1],
      vertexColors[i][2],
      vertexColors[i][0],
      vertexColors[i][1],
      vertexColors[i][2],
      vertexColors[i][0],
      vertexColors[i][1],
      vertexColors[i][2],
      vertexColors[i][0],
      vertexColors[i][1],
      vertexColors[i][2]
    );
  }

  const boxVertexBufferObject = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexBufferObject);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW);

  const cubeIndexBufferObject = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBufferObject);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(boxIndices),
    gl.STATIC_DRAW
  );

  const posAttrLocation = gl.getAttribLocation(program, "vertPosition");
  const colorAttrLocation = gl.getAttribLocation(program, "vertColor");

  gl.vertexAttribPointer(
    posAttrLocation,
    3,
    gl.FLOAT,
    gl.FALSE,
    3 * Float32Array.BYTES_PER_ELEMENT,
    0
  );

  const color_buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  gl.vertexAttribPointer(colorAttrLocation, 3, gl.FLOAT, gl.FALSE, 0, 0);

  gl.enableVertexAttribArray(posAttrLocation);
  gl.enableVertexAttribArray(colorAttrLocation);

  gl.useProgram(program);

  const matWorldUniformLocation = gl.getUniformLocation(program, "mWorld");
  const matViewUniformLocation = gl.getUniformLocation(program, "mView");
  const matProjUniformLocation = gl.getUniformLocation(program, "mProj");

  let worldMatrix = mat4.create();
  let viewMatrix = mat4.create();
  mat4.lookAt(viewMatrix, [0, 0, -10], [0, 0, 0], [0, 1, 0]);
  let projMatrix = mat4.create();
  mat4.perspective(
    projMatrix,
    glMatrix.glMatrix.toRadian(45),
    canvas.width / canvas.height,
    0.1,
    1000.0
  );

  gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
  gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
  gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);

  let identityMatrix = mat4.create();
  let angle = 0;
  const loop = function () {
    angle = (performance.now() / 100 / 8) * 2 * Math.PI;

    mat4.rotate(worldMatrix, identityMatrix, angle, [1, 2, 0]);
    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);

    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
};
