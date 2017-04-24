    var skyboxImg = [
        // './img/right.jpg',
        // './img/left.jpg',
        // './img/top.jpg',
        // './img/down.jpg',
        // './img/back.jpg',
        // './img/front.jpg'
        './img/skyboxsun5deg/skyrender0004.bmp',
        './img/skyboxsun5deg/skyrender0001.bmp',
        './img/skyboxsun5deg/skyrender0003.bmp',
        './img/skyboxsun5deg/dn.bmp',
        './img/skyboxsun5deg/skyrender0002.bmp',
        './img/skyboxsun5deg/skyrender0005.bmp'
    ];

function createBox(gl) {
    // Create a cube
    //    v6----- v5
    //   /|      /|
    //  v1------v0|
    //  | |     | |
    //  | v7----|-v4
    //  |/      |/
    //  v2------v3
    var modelData = {};
    // 顶点坐标
    modelData.vertexPositions = new Float32Array([ // Vertex coordinates
        5.0, 5.0, 5.0, -5.0, 5.0, 5.0, -5.0, -5.0, 5.0, 5.0, -5.0, 5.0, // v0-v1-v2-v3 front
        5.0, 5.0, 5.0, 5.0, -5.0, 5.0, 5.0, -5.0, -5.0, 5.0, 5.0, -5.0, // v0-v3-v4-v5 right
        5.0, 5.0, 5.0, 5.0, 5.0, -5.0, -5.0, 5.0, -5.0, -5.0, 5.0, 5.0, // v0-v5-v6-v1 up
        -5.0, 5.0, 5.0, -5.0, 5.0, -5.0, -5.0, -5.0, -5.0, -5.0, -5.0, 5.0, // v1-v6-v7-v2 left
        -5.0, -5.0, -5.0, 5.0, -5.0, -5.0, 5.0, -5.0, 5.0, -5.0, -5.0, 5.0, // v7-v4-v3-v2 down
        5.0, -5.0, -5.0, -5.0, -5.0, -5.0, -5.0, 5.0, -5.0, 5.0, 5.0, -5.0 // v4-v7-v6-v5 back
    ]);
    // 顶点索引
    modelData.indices = new Uint16Array([ // Indices of the vertices
        0, 1, 2, 0, 2, 3, // front
        4, 5, 6, 4, 6, 7, // right
        8, 9, 10, 8, 10, 11, // up
        12, 13, 14, 12, 14, 15, // left
        16, 17, 18, 16, 18, 19, // down
        20, 21, 22, 20, 22, 23 // back
    ]);

    var model = {};

    model.coordsBuffer = gl.createBuffer();
    model.indexBuffer = gl.createBuffer();
    model.count = modelData.indices.length;

    gl.bindBuffer(gl.ARRAY_BUFFER, model.coordsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, modelData.vertexPositions, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, modelData.indices, gl.STATIC_DRAW);

    model.render = function() {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.coordsBuffer);
        gl.vertexAttribPointer(state.aPosition, 3, gl.FLOAT, false, 0, 0);
        gl.uniformMatrix4fv(mMatrixULoc, false, mMatrix);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        state.gl.uniform1f(uSkyBoxTextureLoc,1.0);
        gl.drawElements(gl.TRIANGLES, this.count, gl.UNSIGNED_SHORT, 0);
    }
    return model;
}


function setupTextures(gl) {
    var count = 0;
    var img = new Array(6);
    for (var i = 0; i < 6; i++) {
        img[i] = new Image();
        img[i].onload = function() {
            count++;
            if (count === 6) {
                var texture = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

                var targets = [
                    gl.TEXTURE_CUBE_MAP_POSITIVE_X, gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
                    gl.TEXTURE_CUBE_MAP_POSITIVE_Y, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
                    gl.TEXTURE_CUBE_MAP_POSITIVE_Z, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
                ];

                for (var j = 0; j < 6; j++) {
                    gl.texImage2D(targets[j], 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img[j]);
                    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                }

                gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
            }
        }
        img[i].src = skyboxImg[i];
    }
}


var vShaderCode = `
attribute vec4 aPosition;
uniform mat4 uMVPMatrix;
varying vec4 vCoords;

void main() {
  gl_Position = uMVPMatrix * aPosition;
  vCoords=aPosition;

}
`;
// gl_FragColor = textureCube(skybox, vCoords);
var fShaderCode_old= `
precision mediump float;
void main() {
        gl_FragColor = vec4(0.118, 0.565, 1.000,1);

}
`;
var fShaderCode = `
precision mediump float; 
uniform samplerCube skybox;
varying vec4 vCoords;


void main() {
 vec3 vc = vCoords.xyz;
    gl_FragColor = textureCube(skybox, vc);
}
`;
var fboxShaderCode = `
precision mediump float; 
uniform samplerCube skybox;
varying vec4 vCoords;


void main() {
 vec3 vc = vCoords.xyz;
    gl_FragColor = textureCube(skybox, vc);
}
`;

var CreateShaderProgram = function(gl, vsText, fsText) {
    var vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, vsText);
    gl.compileShader(vs);
    if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
        return {
            error: 'Error compiling vertex shader: ' + gl.getShaderInfoLog(vs)
        };
    }

    var fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, fsText);
    gl.compileShader(fs);
    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
        return {
            error: 'Error compiling fragment shader: ' + gl.getShaderInfoLog(fs)
        };
    }

    var program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        return {
            error: 'Error linking program: ' + gl.getProgramInfoLog(program)
        };
    }

    gl.validateProgram(program);
    if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
        return {
            error: 'Error validating program: ' + gl.getProgramInfoLog(program)
        };
    }

    return program;

    // Check: if (result.error)
    // otherwise, program is GL program.
};


function fullscreen(){
           var el = document.getElementById("glcanvas");
             
           if(el.webkitRequestFullScreen) {
               el.webkitRequestFullScreen();
           }
          else {
             el.mozRequestFullScreen();
          }            
}
 
// document.getElementById("glcanvas").addEventListener("click",fullscreen)
