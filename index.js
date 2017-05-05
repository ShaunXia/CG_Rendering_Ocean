
var state = {
    gl: null,
    program: null,
    programBox: null,
    ui: {
        dragging: false,
        mouse: {
            lastX: -1,
            lastY: -1,
        },
        pressedKeys: {},
    },
    animation: {},
    app: {
        angle: {
            x: 0,
            y: 0,
        },
        eye: {
            x: 0,
            y: 0,
            z: 3,
        },
        center: {
            x: 0,
            y: -1.0,
            z: 2.5,
        },
        up: {
            x: 0.,
            y: 0.,
            z: 1.,
        },
    },
};


var FizzyText = function() {
  this.message = 'dat.gui';
  this.speed = 0.05;
  this.wireframe = false;
  this.cubeBox = true;
  this.Shader=2.0;
  this.Wave=1.0;
  this.MeshResolution=1.0;
  this.RandomWave = function(){
    keep=1;
  };
  // this.explode = function() { ... };
  // Define render logic ...
};

// window.onload = function() {

//   // gui.add(text, 'explode');
// };


var text;

var main = function() {
    text = new FizzyText();
      var gui = new dat.GUI();
      gui.add(text, 'message');
      gui.add(text, 'speed', -3.0, 3.0);
      gui.add(text, 'wireframe');
      gui.add(text, 'cubeBox');
      gui.add(text, 'Shader', { shader1: 2.0, shader2:1.0} );
      gui.add(text, 'Wave', { wave1: 1.0, wave2:2.0,wave3:3.0} );
      gui.add(text, 'MeshResolution', { High: 1.0, Low:2.0} );
      gui.add(text, 'RandomWave');

    state.canvas = document.getElementById("glcanvas");
    state.gl=state.canvas.getContext("webgl");

    initCallbacks();
    setupShaders();
    setupBuffers();
    initEvents();
    animate();
}



function setupShaders() {
    // var vertexShader = glUtils.getShader(state.gl, state.gl.VERTEX_SHADER, glUtils.SL.Shaders.v1.vertex),
    // fragmentShader = glUtils.getShader(state.gl, state.gl.FRAGMENT_SHADER, glUtils.SL.Shaders.v1.fragment);
    state.program = CreateShaderProgram(state.gl, vShaderCode, fShaderCode);
    state.programBox = CreateShaderProgram(state.gl, vShaderCode, fboxShaderCode);
    
}

var skyBox;
var uSkyBoxTextureLoc;
var b_aPosition;
var b_mMatrixULoc;
var b_uMVPMatrix;
var b_uSkyBoxTextureLoc;
var u_TextureI;
var u_TextureN;

var mvm = mat4.create(state.eye);
var pm = mat4.create();
var mvp = mat4.create();

// var hMatrix = mat4.create(); // handedness matrix
var pMatrix = mat4.create(); // projection matrix
var vMatrix = mat4.create(); // view matrix
var mMatrix = mat4.create(); // model matrix
var vmMatrix = mat4.create();
var pvMatrix = mat4.create(); // hand * proj * view matrices
var pvmMatrix = mat4.create(); // hand * proj * view * model matrices
var nMatrix = mat4.create(); // normal mat

var Eye = vec3.fromValues(state.app.eye.x, state.app.eye.y, state.app.eye.z);
var Center = vec3.fromValues(state.app.center.x, state.app.center.y, state.app.center.z);
var Up = vec3.fromValues(state.app.up.x, state.app.up.y, state.app.up.z);
var lightPosition = vec3.fromValues(-5.0,-5.0,10); // default light position
var lightAmbient = vec4.fromValues(1, 1, 1,1); // default light ambient emission
var lightDiffuse = vec4.fromValues(1, 1, 1,1); // default light diffuse emission
var lightSpecular =  vec4.fromValues(1.0, 1.0, 1.0, 1.0); // default light specular emission

/* shader parameter locations */
var vPosAttribLoc; // where to put position for vertex shader
var vNormAttribLoc; // where to put normal for vertex shader
var vUVAttribLoc; // where to put UV for vertex shader
var mMatrixULoc; // where to put model matrix for vertex shader
var pvmMatrixULoc; // where to put project model view matrix for vertex shader
var ambientULoc; // where to put ambient reflecivity for fragment shader
var diffuseULoc; // where to put diffuse reflecivity for fragment shader
var specularULoc; // where to put specular reflecivity for fragment shader
var shininessULoc; // where to put specular exponent for fragment shader
var usingTextureULoc; // where to put using texture boolean for fragment shader
var textureULoc; // where to put texture for fragment shader

var vertexBuffer;
var normalBuffer;
var vertex;
var normal;

var uNormalMatrixLoc;
var uMVPMatrix;
var uMMatrixLoc;
var aPosition;
var aNormal;

var uEyePositionLoc;
var uLightPositionLoc;
var uLightAmbientLoc;
var uLightDiffuseLoc;
var uLightSpecularLoc;
var uMaxHeightLoc;
var uMinHeightLoc;

var iTexture,nTexture;
var maxHeight,minHeight=0;
var shaderSet=1.0;
function setupBuffers() {

    state.gl.useProgram(state.program);
    aPosition = state.gl.getAttribLocation(state.program, 'aPosition');
    aNormal = state.gl.getAttribLocation(state.program, 'aNormal');

    uMVPMatrix = state.gl.getUniformLocation(state.program, 'uMVPMatrix');
    uMMatrixLoc = state.gl.getUniformLocation(state.program, 'umMatrix');
    uNormalMatrixLoc = state.gl.getUniformLocation(state.program, 'uNormalMatrix');

    uEyePositionLoc = state.gl.getUniformLocation(state.program, 'uEyePosition');
    uLightPositionLoc = state.gl.getUniformLocation(state.program, 'uLightPosition');
    uLightAmbientLoc = state.gl.getUniformLocation(state.program, 'uLightAmbient');
    uLightDiffuseLoc = state.gl.getUniformLocation(state.program, 'uLightDiffuse');
    uLightSpecularLoc = state.gl.getUniformLocation(state.program, 'uLightSpecular');
    uMaxHeightLoc = state.gl.getUniformLocation(state.program, 'heightMax');
    uMinHeightLoc = state.gl.getUniformLocation(state.program, 'heightMin');

    u_TextureI = state.gl.getUniformLocation(state.program, 'u_TextureI');
    u_TextureN = state.gl.getUniformLocation(state.program, 'u_TextureN');

    state.gl.uniform3fv(uEyePositionLoc, Eye);
    state.gl.uniform3fv(uLightPositionLoc, lightPosition);
    state.gl.uniform4fv(uLightAmbientLoc, lightAmbient);
    state.gl.uniform4fv(uLightDiffuseLoc, lightDiffuse);
    state.gl.uniform4fv(uLightSpecularLoc, lightSpecular);

    setupWaveTextures(state.gl);


    state.gl.useProgram(state.programBox);
    setupTextures(state.gl);
    b_aPosition = state.gl.getUniformLocation(state.programBox, 'aPosition');
    b_uMVPMatrix = state.gl.getUniformLocation(state.programBox, 'uMVPMatrix');
    b_mMatrixULoc = state.gl.getUniformLocation(state.programBox, 'umMatrix');
    skyBox = createBox(state.gl);
    
    state.gl.clearColor(0, 0, 0, 1);
    state.gl.enable(state.gl.DEPTH_TEST);

    // initVertexBuffers_Strip(state.gl);
}

// text.spped=0.05;
function animate() {
    state.animation.tick = function() {
        initEvents();
        draw();
        waves.time +=text.speed;
        requestAnimationFrame(state.animation.tick);
    };
    state.animation.tick();
}

var mBoxMatrix = mat4.create();
var mvpBoxMatrix = mat4.create();
function draw(args) {
    shaderSet=text.Shader;
    waveType=text.Wave;
    meshResolution=text.MeshResolution;
    state.gl.useProgram(state.program);
    
    //state.gl.uniform1i(u_TextureN, 1);

    state.gl.activeTexture(state.gl.TEXTURE0);
    state.gl.bindTexture(state.gl.TEXTURE_2D, iTexture);
    state.gl.uniform1i(state.gl.getUniformLocation(state.program, 'u_TextureI'), 0);
    state.gl.uniform1f(state.gl.getUniformLocation(state.program, 'shaderSet'), shaderSet);
    //state.gl.activeTexture(state.gl.TEXTURE1);
    //state.gl.bindTexture(state.gl.TEXTURE_2D, nTexture);

    initVertexBuffers_Strip(state.gl);

    mat4.perspective(pMatrix, Math.PI / 3, 0.5, .1, 100);
    mat4.lookAt(vMatrix, Eye, Center, Up);
    mat4.multiply(pvMatrix, pMatrix, vMatrix); // handedness * projection * view

    mMatrix = mat4.create();

    

    mat4.rotateZ(pvMatrix, pvMatrix, state.app.angle.y); // only left and right
   // mat4.rotateY(pvMatrix, pvMatrix, state.app.angle.x);
    // Both direction 
    // mat4.rotateZ(pvMatrix, pvMatrix, state.app.angle.y);
    // mat4.rotateY(pvMatrix, pvMatrix, state.app.angle.x);

    mat4.multiply(pvmMatrix, pvMatrix, mMatrix);
    mat4.multiply(vmMatrix, vMatrix, mMatrix);

    
    mat4.multiply(mvpBoxMatrix,pvMatrix,mBoxMatrix);
    mat4.rotateX(mvpBoxMatrix,mvpBoxMatrix,Math.PI/2);


    mat4.invert(nMatrix,mat4.transpose(nMatrix,vmMatrix));
    
    state.gl.clear(state.gl.COLOR_BUFFER_BIT | state.gl.DEPTH_BUFFER_BIT);
    
    state.gl.uniform3fv(uEyePositionLoc, Eye);
    state.gl.uniformMatrix4fv(uMVPMatrix, false, pvmMatrix);
    state.gl.uniformMatrix4fv(uNormalMatrixLoc, false, nMatrix);
    state.gl.uniformMatrix4fv(uMMatrixLoc, false, mMatrix);

    state.gl.uniform1f(state.gl.getUniformLocation(state.program, 'time'),waves.time);
    state.gl.uniform1f(uMaxHeightLoc,maxHeight);
    state.gl.uniform1f(uMinHeightLoc,minHeight);

    if (text.wireframe!=true) {

    for (var c = 0; c < (STRIP_COUNT - 1); c++)
        state.gl.drawArrays(state.gl.TRIANGLE_STRIP, STRIP_LENGTH * 2 * c, STRIP_LENGTH * 2);
    }else{
        for (var c = 0; c < (STRIP_COUNT - 1); c++)
        state.gl.drawArrays(state.gl.LINE_LOOP, STRIP_LENGTH * 2 * c, STRIP_LENGTH * 2);
    }
    // state.gl.useProgram(state.programBox);
    // state.gl.uniformMatrix4fv(uskyBoxTextureLoc, false, true);
    state.gl.useProgram(state.programBox);
    state.gl.uniformMatrix4fv(b_uMVPMatrix, false, mvpBoxMatrix);
    if(text.cubeBox==true)
        skyBox.render(state.gl);

}

function initVertexBuffers(v, i) {
    var vertices = new Float32Array(v);
    vertices.stride = 3;
    vertices.attributes = [
        { name: 'aPosition', size: 3, offset: 0 },
        // {name:'aColor',    size:3, offset:4},
    ];
    vertices.n = vertices.length / vertices.stride;
    vertices.indices = i;
    state.program.renderBuffers(vertices, i);
    return vertices;
}



var print=0;
function initVertexBuffers_Strip(gl) {
    var WateStrip = getWateStrip();
    vertices = new Float32Array(WateStrip["vertex"]);
    normal =  new Float32Array(WateStrip["normal"]);
    maxHeight = WateStrip["maxHeight"];
    minHeight= WateStrip["minHeight"];
    // console.log(maxHeight);
    // console.log(minHeight);
    // if (print==0) {
    //     console.log(normal);
    //     console.log(vertices)
    //     print=1;
    // }
    
    // Create a buffer object
    if (!vertexBuffer) {
        vertexBuffer = gl.createBuffer();
        console.log("createBF");
        normalBuffer = gl.createBuffer();

    }
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW);
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPosition);
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, normal, gl.STREAM_DRAW);
    gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aNormal);


}
