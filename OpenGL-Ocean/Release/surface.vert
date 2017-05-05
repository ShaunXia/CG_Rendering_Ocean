#version 330 core

in vec3 position;
in vec3 normal;


out vec3 vNormal;
out vec3 vWorldPos;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

uniform float time;

void main()
{	
    vWorldPos = vec3(model * vec4(position, 1.0f));
	gl_Position = projection * view *  model * vec4(position, 1.0f);
    vNormal = mat3(transpose(inverse(model))) * normal;  
} 