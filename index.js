
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
            y: 0.5,
            z: 0,
        },
        center: {
            x: 0,
            y: 0.5,
            z: 1,
        },
        up: {
            x: 0.,
            y: 1.,
            z: 0.,
        },
    },
};





var main = function() {
    state.canvas = document.getElementById("glcanvas");
    state.gl=state.canvas.getContext("webgl");


    initCallbacks();
    setupShaders();
    setupBuffers();
    setupTextures(state.gl);
    initEvents();
    animate();
}


function initCallbacks() {
    document.onkeydown = keydown;
    document.onkeyup = keyup;
    state.canvas.onmousedown = mousedown;
    state.canvas.onmouseup = mouseup;
    state.canvas.onmousemove = mousemove;
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
function setupBuffers() {
    state.gl.useProgram(state.program);
    aPosition = state.gl.getAttribLocation(state.program, 'aPosition');
    uMVPMatrix = state.gl.getUniformLocation(state.program, 'uMVPMatrix');
    mMatrixULoc = state.gl.getUniformLocation(state.program, 'umMatrix');
    state.gl.clearColor(0, 0, 0, 1);
    state.gl.enableVertexAttribArray(aPosition);
    state.gl.enable(state.gl.DEPTH_TEST);

    state.gl.useProgram(state.programBox);
    b_aPosition = state.gl.getUniformLocation(state.programBox, 'aPosition');
    b_uMVPMatrix = state.gl.getUniformLocation(state.programBox, 'uMVPMatrix');
    b_mMatrixULoc = state.gl.getUniformLocation(state.programBox, 'umMatrix');
    skyBox = createBox(state.gl);

    // initVertexBuffers_Strip(state.gl);
}


function animate() {
    state.animation.tick = function() {
        initEvents();
        draw();
        waves.time += Math.random()/5;
        requestAnimationFrame(state.animation.tick);
    };
    state.animation.tick();
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

    var speed = 0.02;
    var viewDelta = 0.02;
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

var mvm = mat4.create(state.eye);
var pm = mat4.create();
var mvp = mat4.create();

// var hMatrix = mat4.create(); // handedness matrix
var pMatrix = mat4.create(); // projection matrix
var vMatrix = mat4.create(); // view matrix
var mMatrix = mat4.create(); // model matrix
var pvMatrix = mat4.create(); // hand * proj * view matrices
var pvmMatrix = mat4.create(); // hand * proj * view * model matrices

var Eye = vec3.fromValues(state.app.eye.x, state.app.eye.y, state.app.eye.z);
var Center = vec3.fromValues(state.app.center.x, state.app.center.y, state.app.center.z);
var Up = vec3.fromValues(state.app.up.x, state.app.up.y, state.app.up.z);

var uMVPMatrix;
var aPosition
var vertexBuffer;
var vertices;

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

function draw(args) {
    state.gl.useProgram(state.program);
    initVertexBuffers_Strip(state.gl);
    mat4.perspective(pMatrix, Math.PI / 3, 0.5, .1, 20);
    mat4.lookAt(vMatrix, Eye, Center, Up);
    mat4.multiply(pvMatrix, pMatrix, vMatrix); // handedness * projection * view

    mMatrix = mat4.create();
    mat4.rotateX(mMatrix,mMatrix,Math.PI/2);
    mat4.rotateY(pvMatrix, pvMatrix, state.app.angle.y);
    mat4.multiply(pvmMatrix, pvMatrix, mMatrix);

    state.gl.clear(state.gl.COLOR_BUFFER_BIT | state.gl.DEPTH_BUFFER_BIT);
    state.gl.uniformMatrix4fv(uMVPMatrix, false, pvmMatrix);

    for (var c = 0; c < (STRIP_COUNT - 1); c++)
        state.gl.drawArrays(state.gl.LINE_LOOP, STRIP_LENGTH * 2 * c, STRIP_LENGTH * 2);
    
    // state.gl.useProgram(state.programBox);
    // state.gl.uniformMatrix4fv(uskyBoxTextureLoc, false, true);
    state.gl.useProgram(state.programBox);
    state.gl.uniformMatrix4fv(b_uMVPMatrix, false, pvMatrix);
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




function initVertexBuffers_Strip(gl) {
    vertices = new Float32Array(getWateStrip());
    // Create a buffer object
    if (!vertexBuffer) {
        vertexBuffer = gl.createBuffer();
        console.log("createBF");

    }
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW);



    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);


}



function keydown(event) {
    state.ui.pressedKeys[event.keyCode] = true;
    console.log(event.keyCode);
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
    console.log("lastX:" + state.ui.mouse.lastX + " lastY:" + state.ui.mouse.lastY);
    console.log("angleX:" + state.app.angle.x + " angleY:" + state.app.angle.y);
}

function mousemove(event) {
    var x = event.clientX;
    var y = event.clientY;
    if (state.ui.dragging) {
        // The rotation speed factor
        // dx and dy here are how for in the x or y direction the mouse moved
        var factor = 10 / state.canvas.height;
        var dx = factor * (x - state.ui.mouse.lastX);
        var dy = factor * (y - state.ui.mouse.lastY);

        // update the latest angle
        // state.app.angle.x = state.app.angle.x + dy;
        state.app.angle.y = state.app.angle.y + dx;
    }
    // update the last mouse position
    state.ui.mouse.lastX = x;
    state.ui.mouse.lastY = y;

}
