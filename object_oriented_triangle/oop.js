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

class Triangle {
  constructor() {
    this.canvas = document.getElementById("main-canvas");
    this.gl = this.canvas.getContext("webgl");

    if (!this.gl) {
      alert("WebGL not supported");
      return;
    }

    this.gl.clearColor(0.5, 0.5, 0.9, 1.0); // R,G,B, opacity
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.CULL_FACE);

    this.program = this.initShaderProgram(vertexShaderTxt, fragmentShaderTxt);
    this.vertexBuffer = this.initVertexBuffer();
    this.indexBuffer = this.initIndexBuffer();

    this.posAttrLocation = this.gl.getAttribLocation(
      this.program,
      "vertPosition"
    );
    this.colorAttrLocation = this.gl.getAttribLocation(
      this.program,
      "vertColor"
    );

    this.gl.useProgram(this.program);

    this.matWorldUniformLocation = this.gl.getUniformLocation(
      this.program,
      "mWorld"
    );
    this.matViewUniformLocation = this.gl.getUniformLocation(
      this.program,
      "mView"
    );
    this.matProjUniformLocation = this.gl.getUniformLocation(
      this.program,
      "mProj"
    );

    this.worldMatrix = mat4.create();
    this.viewMatrix = mat4.create();
    mat4.lookAt(this.viewMatrix, [0, 0, -10], [0, 0, 0], [0, 1, 0]);
    this.projMatrix = mat4.create();
    mat4.perspective(
      this.projMatrix,
      glMatrix.glMatrix.toRadian(45),
      this.canvas.width / this.canvas.height,
      0.1,
      1000.0
    );

    this.gl.uniformMatrix4fv(
      this.matWorldUniformLocation,
      this.gl.FALSE,
      this.worldMatrix
    );
    this.gl.uniformMatrix4fv(
      this.matViewUniformLocation,
      this.gl.FALSE,
      this.viewMatrix
    );
    this.gl.uniformMatrix4fv(
      this.matProjUniformLocation,
      this.gl.FALSE,
      this.projMatrix
    );

    this.identityMatrix = mat4.create();

    this.loop();
  }

  initShaderProgram(vertexShaderSource, fragmentShaderSource) {
    const vertexShader = this.loadShader(
      this.gl.VERTEX_SHADER,
      vertexShaderSource
    );
    const fragmentShader = this.loadShader(
      this.gl.FRAGMENT_SHADER,
      fragmentShaderSource
    );

    const program = this.gl.createProgram();
    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);

    return program;
  }

  loadShader(type, source) {
    const shader = this.gl.createShader(type);
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error(
        "ERROR compiling shader!",
        this.gl.getShaderInfoLog(shader)
      );
      return null;
    }
    return shader;
  }

  initVertexBuffer() {
    const boxVertices = [
      // X, Y, Z           R, G, B
      // Top
      -1.0, 1.0, -1.0, 0.5, 0.5, 0.5, -1.0, 1.0, 1.0, 0.5, 0.5, 0.5, 1.0, 1.0,
      1.0, 0.5, 0.5, 0.5, 1.0, 1.0, -1.0, 0.5, 0.5, 0.5,

      // Left
      -1.0, 1.0, 1.0, 0.75, 0.25, 0.5, -1.0, -1.0, 1.0, 0.75, 0.25, 0.5, -1.0,
      -1.0, -1.0, 0.75, 0.25, 0.5, -1.0, 1.0, -1.0, 0.75, 0.25, 0.5,

      // ... Remaining vertices
    ];

    const vertexBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(boxVertices),
      this.gl.STATIC_DRAW
    );
    return vertexBuffer;
  }

  initIndexBuffer() {
    const boxIndices = [
      // Top
      0, 1, 2, 0, 2, 3,

      // Left
      5, 4, 6, 6, 4, 7,

      // ... Remaining indices
    ];

    const indexBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    this.gl.bufferData(
      this.gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(boxIndices),
      this.gl.STATIC_DRAW
    );
    return indexBuffer;
  }

  loop() {
    const loop = () => {
      const angle = (performance.now() / 100 / 8) * 2 * Math.PI;

      mat4.rotate(this.worldMatrix, this.identityMatrix, angle, [1, 2, 0]);
      this.gl.uniformMatrix4fv(
        this.matWorldUniformLocation,
        this.gl.FALSE,
        this.worldMatrix
      );

      this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
      this.gl.vertexAttribPointer(
        this.posAttrLocation,
        3,
        this.gl.FLOAT,
        this.gl.FALSE,
        6 * Float32Array.BYTES_PER_ELEMENT,
        0
      );
      this.gl.vertexAttribPointer(
        this.colorAttrLocation,
        3,
        this.gl.FLOAT,
        this.gl.FALSE,
        6 * Float32Array.BYTES_PER_ELEMENT,
        3 * Float32Array.BYTES_PER_ELEMENT
      );
      this.gl.enableVertexAttribArray(this.posAttrLocation);
      this.gl.enableVertexAttribArray(this.colorAttrLocation);
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
      this.gl.drawElements(this.gl.TRIANGLES, 36, this.gl.UNSIGNED_SHORT, 0);

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }
}

new Triangle();
