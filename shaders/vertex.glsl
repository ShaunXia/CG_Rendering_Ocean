attribute vec4 aPosition;


uniform mat4 uMVPMatrix;
uniform mat4 umMatrix;
varying vec3 vCoords; 

void main() {
  gl_Position = uMVPMatrix * aPosition;
vCoords=aPosition；
}
