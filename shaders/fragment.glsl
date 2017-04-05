precision mediump float;
uniform samplerCube skybox; 
varying vec3 vCoords; 
void main() {
  gl_FragColor = textureCube(skybox, vCoords); 
}
