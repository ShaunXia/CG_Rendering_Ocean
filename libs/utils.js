var skyboxImg = [
    './img/right.jpg',
    './img/left.jpg',
    './img/top.jpg',
    './img/down.jpg',
    './img/back.jpg',
    './img/front.jpg'

    // './img/skyboxsun5deg2/skyrender0001.bmp',
    // './img/skyboxsun5deg2/skyrender0004.bmp',
    // './img/skyboxsun5deg2/skyrender0003.bmp', //top
    // './img/skyboxsun5deg2/dn.bmp',
    // './img/skyboxsun5deg2/skyrender0005.bmp',
    // './img/skyboxsun5deg2/skyrender0002.bmp'

    // './img/beach_rt.jpg',
    // './img/beach_lf.jpg',
    // './img/beach_up.jpg',
    // './img/beach_dn.jpg',
    // './img/beach_bk.jpg',
    // './img/beach_ft.jpg'
   
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
        // state.gl.uniform1f(uSkyBoxTextureLoc,0.0);
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

function handleLoadedTexture(gl,texture) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.bindTexture(gl.TEXTURE_2D, null);
}

var iTexture ,nTexture;
function setupWaveTextures(gl) {
    iTexture = gl.createTexture();
    nTexture  = gl.createTexture();
    iTexture.image = new Image();

    iTexture.image.onload = function() {
        handleLoadedTexture(gl,iTexture);
    };
    iTexture.image.src = "./img/water-texture-2_.jpg";

    nTexture.image = new Image();
    nTexture.image.onload = function() {
        handleLoadedTexture(gl,nTexture);
    };

    nTexture.image.src = "./img/water-texture-2-normal.jpg";

}


var vShaderCode = `

attribute vec3 aPosition;
attribute vec3 aNormal;

uniform mat4 uNormalMatrix;
uniform mat4 uMVPMatrix;
uniform mat4 umMatrix;
uniform float time;


varying vec4 vCoords;
varying vec2 vTexture_coords;
varying vec3 normal_vector;
varying vec3 vWorldPos;

void main() {
    vec4 vWorldPos4 = umMatrix * vec4(aPosition,1.0);
    vWorldPos = vec3(vWorldPos4.x,vWorldPos4.y,vWorldPos4.z);

    gl_Position = uMVPMatrix * vec4(aPosition,1.0);
    vCoords=vec4(aPosition,1.0);
    float tex_x = (aPosition.x + time/20.0) / 8.0 + 0.5;
    float tex_y = 0.5 - (aPosition.y + time/25.0) / 5.0;

    vec3 normal1 = normalize(aNormal);
    normal_vector=(uNormalMatrix*vec4(normal1, 1.0)).xyz;
    vTexture_coords = vec2(tex_x, tex_y);
}
`;

// gl_FragColor = textureCube(skybox, vCoords);
var fShaderCode = `
precision mediump float;

// light properties
uniform vec4 uLightAmbient; // the light's ambient color
uniform vec4 uLightDiffuse; // the light's diffuse color
uniform vec4 uLightSpecular; // the light's specular color
uniform vec3 uLightPosition; // the light's position

// eye location
uniform vec3 uEyePosition; // the eye's position in world

uniform samplerCube skybox;
uniform sampler2D u_TextureI;
uniform sampler2D u_TextureN;

varying vec4 vCoords;
varying vec2 vTexture_coords;
varying vec3 normal_vector;
varying vec3 vWorldPos;

uniform float heightMax ;
uniform float heightMin ;
uniform float shaderSet ;

float Ward(vec3 lightDir, vec3 viewDir, vec3 normal, float exponent)
{
    vec3 H = normalize(lightDir + viewDir);
    float delta = acos(dot(H,normal));
    float alpha2 = exponent * exponent;
    float temp = exp(-pow(tan(delta), 2.) / (alpha2)) / (4. * 3.1415 * alpha2);
    float temp2 = sqrt(dot(viewDir,normal) * dot(lightDir,normal));
    float K = temp2 * temp;
    return K;
}

void main() {

if(shaderSet==1.0)
{
    vec3 vc = vCoords.xyz;
    vec3 normal_vector1=normalize(normal_vector);
    vec3 light_vector1 = normalize(uLightPosition - vWorldPos);
    vec3 eye_vector1 = normalize(uEyePosition - vWorldPos);
    vec3 halfway_vector1 = normalize(light_vector1+eye_vector1);
    vec3 relfect_vector1 = normalize(reflect(-light_vector1,normal_vector1));

    vec3 relfection = reflect(-light_vector1,normal_vector1);
    if (dot(normal_vector1, eye_vector1) < 0.0) normal_vector1 = -normal_vector1;

    vec3 shallowColor = vec3(0.275, 0.510, 0.706);
    vec3 deepColor = vec3(30.0/255.0, 30.0/255.0, 30.0/255.0);

    float ambientFactor = 0.02;


    vec4 c = texture2D(u_TextureI, vTexture_coords);
    // vec3 tx_normal = normalize(2.0 * (texture2D(u_TextureN, vTexture_coords).rgb - 0.5));

    // float nt_lambertTerm = max(dot(tx_normal,light_vector1),0.20);
    // vec3  nt_reflectDir = reflect(-light_vector1, tx_normal);

    // vec4 nt_color = uMaterialDiffuse * texture2D(uSampler, vTextureCoord) * lambertTerm;
   // vec4 c = textureCube(skybox, relfection);
    // vec4 c = vec4(1.0,1.0,1.0,1.0);
    // vec4 sk = textureCube(skybox,vc);

    vec4 skyColor = vec4(0.65, 0.80, 0.95,1.0);

    float fresnel = pow( 1.0 - dot( normal_vector1, eye_vector1 ), 2.0 );
    vec3 u_color = vec3(36.0 / 255.0, 68.0 / 255.0, 99.0 / 255.0);
    vec4 waterColor = ( 1.0 - fresnel ) * vec4(u_color,1.0);

    float NdotL, NdotH, NdotR, S, temp, delta;


    NdotL = max(dot(normal_vector1, light_vector1), 0.0);
    NdotH = max(dot(normal_vector1, halfway_vector1), 0.0);
    NdotR = max(dot(normal_vector1, relfect_vector1), 0.0);

    vec4 diffuse, ambient, globalAmt,specular;

    //Ambient
    globalAmt = ambientFactor * uLightAmbient*NdotL;

    float relativeHeight;   // from 0 to 1
    relativeHeight = (vWorldPos.z - heightMin) / (heightMax - heightMin);
    vec3 heightColor = relativeHeight * shallowColor + (1.0 - relativeHeight) * deepColor;


    //Disfuse
    diffuse = uLightDiffuse*0.2*NdotL*c;


    //relfect
    float refCoeff = pow(max(dot(normal_vector1, eye_vector1), 0.0), 0.4);  
    vec4 reflectColor = (1.0 - refCoeff) * c;

    vec4 fragcolor = diffuse + globalAmt +reflectColor + vec4(heightColor,1.0);

    //Specular
    float wd = max(Ward(light_vector1,eye_vector1,normal_vector1,0.5),0.1);

    fragcolor = fragcolor+fragcolor*wd;
    fragcolor.a=1.0;
    gl_FragColor = fragcolor;
}else
{
    vec3 vc = vCoords.xyz;

    vec3 normal_vector1=normalize(normal_vector);
    vec3 light_vector1 = normalize(uLightPosition - vWorldPos);
    vec3 eye_vector1 = normalize(uEyePosition - vWorldPos);
    vec3 halfway_vector1 = normalize(light_vector1+eye_vector1);
    vec3 relfect_vector1 = normalize(reflect(-light_vector1,normal_vector1));

    vec3 relfection = reflect(-light_vector1,normal_vector1);
    if (dot(normal_vector1, eye_vector1) < 0.0) normal_vector1 = -normal_vector1;

    vec4 ambient_color  = vec4(0.1, 0.1, 0.3, 1.0);
    vec4 diffuse_color  = vec4(0.5, 0.65, 0.75, 1.0);
    vec4 specular_color = vec4(0.8, 0.8, 0.9, 1.0);

    vec4 materAmbient = vec4(0.1, 0.1, 0.3, 1.0);
    vec4 materSpecular = vec4(0.8, 0.8, 0.9, 1.0);
    vec4 envirAmbient = vec4(0.3, 0.3, 0.3, 1.0);

    vec4 c = texture2D(u_TextureI, vTexture_coords);
    //vec4 c = textureCube(skybox, relfection);
    // vec4 c = vec4(1.0,1.0,1.0,1.0);
    // vec4 sk = textureCube(skybox,vc);

    float fresnel = pow( 1.0 - dot( normal_vector1, eye_vector1 ), 2.0 );
    vec3 u_color = vec3(36.0 / 255.0, 68.0 / 255.0, 99.0 / 255.0);
    vec4 waterColor = ( 1.0 - fresnel ) * vec4(u_color,1.0);

    float NdotL, NdotH, NdotR, S, temp, delta;


    NdotL = max(dot(normal_vector1, light_vector1), 0.4);
    NdotH = max(dot(normal_vector1, halfway_vector1), 0.0);
    NdotR = max(dot(normal_vector1, relfect_vector1), 0.0);

    vec4 diffuse, ambient, globalAmt,specular;

    diffuse = c  * uLightDiffuse*0.5;
    globalAmt = envirAmbient * materAmbient* uLightAmbient;


    vec4 skyColor = vec4(0.65, 0.80, 0.95,1.0);

    float directionalLightWeighting = max(dot(normal_vector1, light_vector1), 0.0);

    float refCoeff = pow(max(dot(normal_vector1, eye_vector1), 0.0), 0.8);    // Smaller power will have more concentrated reflect.
    vec4 reflectColor = (1.0 - refCoeff) * skyColor;

    //Specular
    float wd = max(Ward(light_vector1,eye_vector1,normal_vector1,0.3),0.1);

    vec4 fragcolor = diffuse + globalAmt +c*0.6;


    fragcolor = fragcolor+fragcolor*wd;
    fragcolor.a=1.0;
    gl_FragColor = fragcolor;
}
}
`;

var vboxShaderCode = `


attribute vec4 aPosition;
attribute vec3 aNormal;

uniform mat4 uNormalMatrix;
uniform mat4 uMVPMatrix;
uniform mat4 umMatrix;



varying vec4 vCoords;
varying vec2 vTexture_coords;
varying vec3 normal_vector;
void main() {
gl_Position = uMVPMatrix * aPosition;
vCoords=aPosition;
    // float tex_x = (aPosition.x + 1.0/20.0) / 8.0 + 0.5;
    // float tex_y = 0.5 - (aPosition.y + 1.0/25.0) / 5.0;
    // normal_vector=uNormalMatrix*vec4(aNormal, 0.0)).xyz;
    // vTexture_coords = vec2(tex_x, tex_y);
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


function fullscreen() {
    var el = document.getElementById("glcanvas");

    if (el.webkitRequestFullScreen) {
        el.webkitRequestFullScreen();
    } else {
        el.mozRequestFullScreen();
    }
}

// document.getElementById("glcanvas").addEventListener("click",fullscreen)



/*
Control Event

*/

function initCallbacks() {
    document.onkeydown = keydown;
    document.onkeyup = keyup;
    state.canvas.onmousedown = mousedown;
    state.canvas.onmouseup = mouseup;
    state.canvas.onmousemove = mousemove;
}

function initEvents() {

    //A 65
    //W 87
    //S 83
    //D 68
    //Q 81
    //E 69
    var lookAt = vec3.create(),
        viewRight = vec3.create(),
        temp = vec3.create(); // lookat, right & temp vectors
    lookAt = vec3.normalize(lookAt, vec3.subtract(temp, Center, Eye)); // get lookat vector
    viewRight = vec3.normalize(viewRight, vec3.cross(temp, lookAt, Up)); // get view right vector

    var speed = 0.1;
    var viewDelta = 0.1;
    if (state.ui.pressedKeys[68]) {
        // left
        Center = vec3.add(Center, Center, vec3.scale(temp, viewRight, viewDelta));
        if (!state.ui.pressedKeys[16])
            Eye = vec3.add(Eye, Eye, vec3.scale(temp, viewRight, viewDelta));
        console.log("Eye:" + Eye);
        console.log("Center:" + Center);
        console.log("Up:" + Up);
    } else if (state.ui.pressedKeys[65]) {
        // right
        Center = vec3.add(Center, Center, vec3.scale(temp, viewRight, -viewDelta));
        if (!state.ui.pressedKeys[16])
            Eye = vec3.add(Eye, Eye, vec3.scale(temp, viewRight, -viewDelta));
        console.log("Eye:" + Eye);
        console.log("Center:" + Center);
        console.log("Up:" + Up);
    } else if (state.ui.pressedKeys[87]) {
        // forward
        Eye = vec3.add(Eye, Eye, vec3.scale(temp, lookAt, viewDelta));
        Center = vec3.add(Center, Center, vec3.scale(temp, lookAt, viewDelta));
    } else if (state.ui.pressedKeys[83]) {
        // back
        Eye = vec3.add(Eye, Eye, vec3.scale(temp, lookAt, -viewDelta));
        Center = vec3.add(Center, Center, vec3.scale(temp, lookAt, -viewDelta));
    } else if (state.ui.pressedKeys[81]) {
        //up
        Eye = vec3.add(Eye, Eye, vec3.scale(temp, Up, viewDelta));
        Center = vec3.add(Center, Center, vec3.scale(temp, Up, viewDelta));

    } else if (state.ui.pressedKeys[69]) {
        //down
        Eye = vec3.add(Eye, Eye, vec3.scale(temp, Up, -viewDelta));
        Center = vec3.add(Center, Center, vec3.scale(temp, Up, -viewDelta));
    }

}

function keydown(event) {
    state.ui.pressedKeys[event.keyCode] = true;
    console.log(event.keyCode);
}

 function keydown(event) {
    state.ui.pressedKeys[event.keyCode] = true;
  }

  function keyup(event) {
    state.ui.pressedKeys[event.keyCode] = false;
  }

  function mousedown(event) {
    var x = event.clientX;
    var y = event.clientY;
    var rect = event.target.getBoundingClientRect();
    // If we're within the rectangle, mouse is down within canvas.
    if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
      state.ui.mouse.lastX = x;
      state.ui.mouse.lastY = y;
      state.ui.dragging = true;
    }
  }

  function mouseup(event) {
    state.ui.dragging = false;
  }

  function mousemove(event) {
    var x = event.clientX;
    var y = event.clientY;
    if (state.ui.dragging) {
      // The rotation speed factor
      // dx and dy here are how for in the x or y direction the mouse moved
      var factor = 10/state.canvas.height;
      var dx = factor * (x - state.ui.mouse.lastX);
      var dy = factor * (y - state.ui.mouse.lastY);

      // update the latest angle
      state.app.angle.x = state.app.angle.x + dy;
      state.app.angle.y = state.app.angle.y + dx;
    }
    // update the last mouse position
    state.ui.mouse.lastX = x;
    state.ui.mouse.lastY = y;

  }



