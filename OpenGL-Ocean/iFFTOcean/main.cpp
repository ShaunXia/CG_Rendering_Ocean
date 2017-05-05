#define GLEW_STATIC
#define _USE_MATH_DEFINES
#include <math.h>
#include <iostream>

#include <glm/glm.hpp>
#include <glm/gtc/matrix_transform.hpp>
#include <glm/gtc/type_ptr.hpp>
#include <GL/glew.h>
#include <GLFW/glfw3.h>

#include "shader.h"
#include "camera.h"
#include "ocean.h"

using namespace glm;


void key_callback(GLFWwindow* window, int key, int scancode, int action, int mode);
void mouse_callback(GLFWwindow* window, double xpos, double ypos);

void event_check();

int N = 64;
int M = 64;
float L_x = 1000;
float L_z = 1000;
int isWireFrame = 0;
float colorSet = 1.0f;
float A = 3e-7f;
// Wind speed
float V_wind_speed =30;

// Wind direction
vec2 omega_wind_dir(1, 0);

GLuint WIDTH = 1280, HEIGHT = 720;

// Camera
Camera  camera(30.0f, 30.0f, 60.0f, 0, 1, 0, 0, 0, 0);
GLfloat lastX  =  WIDTH  / 2.0;
GLfloat lastY  =  HEIGHT / 2.0;
bool    keys[1024];


vec3 lightPos;
vec3 sundir(normalize(vec3(0, 1, -2)));

vec3* vertexArray;
GLuint surfaceVAO = 0;
GLuint surfaceVBO, EBO;
int indexSize;

float time = 0;
float speed = 0.2;
Ocean *ocean;

float heightMax = 0;
float heightMin = 0;

void initBufferObjects()
{
	indexSize = (N - 1) * (M - 1) * 6;
	GLuint *indices = new GLuint[indexSize];
	int p = 0;
	for (int j = 0; j < N - 1; j++)
		for (int i = 0; i < M - 1; i++)
		{
			indices[p++] = i + j * N;
			indices[p++] = (i + 1) + j * N;
			indices[p++] = i + (j + 1) * N;

			indices[p++] = (i + 1) + j * N;
			indices[p++] = (i + 1) + (j + 1) * N;
			indices[p++] = i + (j + 1) * N;
		}


	glGenVertexArrays(1, &surfaceVAO);
	glBindVertexArray(surfaceVAO);

	glGenBuffers(1, &surfaceVBO);
	glGenBuffers(1, &EBO);
	glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, EBO);
	glBufferData(GL_ELEMENT_ARRAY_BUFFER, indexSize * sizeof(GLuint), indices, GL_STATIC_DRAW);	

	delete[] indices;
}

void deleteBufferObjects()
{
	glDeleteVertexArrays(1, &surfaceVAO);
	glDeleteBuffers(1, &surfaceVBO);
	glDeleteBuffers(1, &EBO);
}


void generateWaveMesh(Ocean* ocean_model)
{	
	int nVertex = N * M;	
	
	ocean_model->generateHeightmap(time);
	vec3* oceanVertices = ocean_model->vertices;
	vec3* oceanNormals = ocean_model->normals;

	int p = 0;

	for (int i = 0; i < N; i++)
		for (int j = 0; j < M; j++)
		{	
			int index = j * N + i;

			if (oceanVertices[index].y > heightMax) 
				heightMax = oceanVertices[index].y;
			else if (oceanVertices[index].y < heightMin) 
				heightMin = oceanVertices[index].y;
		}

	
	glBindVertexArray(surfaceVAO);	
	glBindBuffer(GL_ARRAY_BUFFER, surfaceVBO);

	int verticesArraySize = sizeof(vec3) * nVertex;
	glBufferData(GL_ARRAY_BUFFER, verticesArraySize * 2, NULL, GL_STATIC_DRAW);

	// vertices buffer
	glBufferSubData(GL_ARRAY_BUFFER, 0, verticesArraySize, oceanVertices);
	glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 3 * sizeof(GLfloat), (GLvoid*)0);
	glEnableVertexAttribArray(0);

	// normal buffer
	glBufferSubData(GL_ARRAY_BUFFER, verticesArraySize, verticesArraySize, oceanNormals);	
	glVertexAttribPointer(1, 3, GL_FLOAT, GL_FALSE, 3 * sizeof(GLfloat), (GLvoid*)verticesArraySize);
	glEnableVertexAttribArray(1);
}


int main()
{

    glfwInit();
	
	glfwWindowHint(GLFW_RESIZABLE, GL_FALSE);
	glfwWindowHint(GLFW_SAMPLES, 16);

	GLFWwindow* window;

	window = glfwCreateWindow(WIDTH, HEIGHT, "Simulating Ocean Surface", nullptr, nullptr);

	glfwMakeContextCurrent(window);
	printf("OpenGL Version: %s\n", glGetString(GL_VERSION));

	// setup event listener
	glfwSetKeyCallback(window, key_callback);
    glfwSetCursorPosCallback(window, mouse_callback);

    
    glfwSetInputMode(window, GLFW_CURSOR, GLFW_CURSOR_DISABLED);
    glewExperimental = GL_TRUE;

    glewInit();
	glViewport(0, 0, WIDTH, HEIGHT);

    glEnable(GL_DEPTH_TEST);

	camera.MovementSpeed = 30;

    Shader waveShader("surface.vert", "surface.frag");
	waveShader.Use();

	lightPos = sundir * 50.0f;
	initBufferObjects();

	time = 0;
	float modelScale = 0.1;
	ocean = new Ocean(N, M, L_x, L_z, omega_wind_dir, V_wind_speed, A, 1);

    // app loop
    while (!glfwWindowShouldClose(window))
    {

		time += speed;
		generateWaveMesh(ocean);

        glfwPollEvents();
        event_check();

        glClearColor(0.1f, 0.1f, 0.1f, 1.0f);
        glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

		GLint lightPosLoc = glGetUniformLocation(waveShader.m_program, "lightPos");
		GLint viewPosLoc = glGetUniformLocation(waveShader.m_program, "viewPos");
		glUniform3f(lightPosLoc, lightPos.x, lightPos.y, lightPos.z);
		glUniform3f(viewPosLoc, camera.Position.x, camera.Position.y, camera.Position.z);	
		glUniform1f(glGetUniformLocation(waveShader.m_program, "heightMin"), heightMin * modelScale);
		glUniform1f(glGetUniformLocation(waveShader.m_program, "heightMax"), heightMax * modelScale);		
		glUniform1f(glGetUniformLocation(waveShader.m_program, "colorSet"), colorSet);		

		GLint modelLoc = glGetUniformLocation(waveShader.m_program, "model");
		GLint viewLoc = glGetUniformLocation(waveShader.m_program, "view");
		GLint projLoc = glGetUniformLocation(waveShader.m_program, "projection");

		mat4 model = mat4();
		model = scale(model, vec3(modelScale));
        mat4 view= camera.GetViewMatrix(); //lookAt
        mat4 projection = perspective(camera.Zoom, (GLfloat)WIDTH / (GLfloat)HEIGHT, 0.1f, 1000.0f);


		glUniformMatrix4fv(modelLoc, 1, GL_FALSE, value_ptr(model));
		glUniformMatrix4fv(viewLoc, 1, GL_FALSE, value_ptr(view));
		glUniformMatrix4fv(projLoc, 1, GL_FALSE, value_ptr(projection));
		glDrawElements(GL_TRIANGLES, indexSize, GL_UNSIGNED_INT, 0);

		glfwSwapBuffers(window);

		
    }

	deleteBufferObjects();
    glfwTerminate();
    return 0;
}


void key_callback(GLFWwindow* window, int key, int scancode, int action, int mode)
{
    if (key == GLFW_KEY_ESCAPE && action == GLFW_PRESS)
        glfwSetWindowShouldClose(window, GL_TRUE);
	if (key == GLFW_KEY_Z)
		glfwSetInputMode(window, GLFW_CURSOR, GLFW_CURSOR_NORMAL);
	if (key == GLFW_KEY_UP)
	{
		A *= 1.5;
		ocean = new Ocean(N, M, L_x, L_z, omega_wind_dir, V_wind_speed, A, 1);
	}
	if (key == GLFW_KEY_DOWN)
	{
		A /= 1.5;
		ocean = new Ocean(N, M, L_x, L_z, omega_wind_dir, V_wind_speed, A, 1);
	}
	if (key == GLFW_KEY_RIGHT)
	{
		speed += 0.05;
	}
	if (key == GLFW_KEY_LEFT)
	{
		speed -= 0.05;
	}
	if (key == GLFW_KEY_X && action == GLFW_PRESS)
	{
		if (isWireFrame == 1)
		{
			glPolygonMode(GL_FRONT_AND_BACK, GL_LINE);
			isWireFrame = 0;
		}
		else
		{
			glPolygonMode(GL_FRONT_AND_BACK, GL_FILL);
			isWireFrame = 1;
		}
	}
	if (key == GLFW_KEY_4)
	{
		omega_wind_dir = vec2(1, 0);
		ocean = new Ocean(N, M, L_x, L_z, omega_wind_dir, V_wind_speed, A, 1);
	}
	if (key == GLFW_KEY_6)
	{
		omega_wind_dir = vec2(0, 1);
		ocean = new Ocean(N, M, L_x, L_z, omega_wind_dir, V_wind_speed, A, 1);
	}
	if (key == GLFW_KEY_5)
	{
		omega_wind_dir = vec2(1, 1);
		ocean = new Ocean(N, M, L_x, L_z, omega_wind_dir, V_wind_speed, A, 1);
	}
	if (key == GLFW_KEY_1 )
	{
		colorSet = 1.0;
	}
	if (key == GLFW_KEY_2)
	{
		colorSet = 2.0;
	}
	if (key == GLFW_KEY_3)
	{
		colorSet = 3.0;
	}
	if (key == GLFW_KEY_4)
	{
		colorSet = 4.0;
	}
	if (key == GLFW_KEY_L)
	{
		M = 64;
		N = 64;
		initBufferObjects();
		ocean = new Ocean(N, M, L_x, L_z, omega_wind_dir, V_wind_speed, A, 1);
	}
	if (key == GLFW_KEY_H)
	{
		M = 256;
		N = 256;
		initBufferObjects();
		ocean = new Ocean(N, M, L_x, L_z, omega_wind_dir, V_wind_speed, A, 1);
	}
	if (key == GLFW_KEY_M)
	{
		M = 128;
		N = 128;
		initBufferObjects();
		ocean = new Ocean(N, M, L_x, L_z, omega_wind_dir, V_wind_speed, A, 1);
	}
    if (key >= 0 && key < 1024)
    {
        if (action == GLFW_PRESS)
            keys[key] = true;
        else if (action == GLFW_RELEASE)
            keys[key] = false;
    }



}

void event_check()
{
	if (keys[GLFW_KEY_W])
		camera.ProcessKeyboard(FORWARD, 0.1);
	if (keys[GLFW_KEY_S])
		camera.ProcessKeyboard(BACKWARD, 0.1);
	if (keys[GLFW_KEY_A])
		camera.ProcessKeyboard(LEFT, 0.1);
	if (keys[GLFW_KEY_D])
		camera.ProcessKeyboard(RIGHT, 0.1);
	if (keys[GLFW_KEY_Q])
		camera.ProcessKeyboard(KEY_Q, 0.1);
	if (keys[GLFW_KEY_E])
		camera.ProcessKeyboard(KEY_E, 0.1);
	return;
}

bool firstMouse = true;
void mouse_callback(GLFWwindow* window, double xpos, double ypos)
{

    if (firstMouse)
    {
        lastX = xpos;
        lastY = ypos;
        firstMouse = false;
    }

    GLfloat xoffset = xpos - lastX;
    GLfloat yoffset = lastY - ypos;  

    lastX = xpos;
    lastY = ypos;

    camera.ProcessMouseMovement(xoffset, yoffset);
}
