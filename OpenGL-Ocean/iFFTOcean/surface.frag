#version 330 core

in vec3 vNormal;  
in vec3 vWorldPos;  

uniform vec3 viewPos;
uniform vec3 lightPos;

uniform float heightMax = 0;
uniform float heightMin = 0;
uniform float colorSet=0;

out vec4 gl_FragColor;

float Ward(vec3 light_vector1, vec3 eye_vector1, vec3 normal, float exponent)
{
    vec3 H = normalize(light_vector1 + eye_vector1);
    float delta = acos(dot(H,normal));
    float alpha2 = exponent * exponent;
    float temp = exp(-pow(tan(delta), 2.) / (alpha2)) / (4. * 3.1415 * alpha2);
    float temp2 = sqrt(dot(eye_vector1,normal) * dot(light_vector1,normal));
    float K = temp2 * temp;
    return K;
}

void main()
{
	vec3 normal_vector1 = normalize(vNormal);
	vec3 light_vector1 = normalize(lightPos - vWorldPos); 
	vec3 eye_vector1 = normalize(viewPos - vWorldPos);
	// if not normailze
	vec3 reflect_vector1 = normalize(reflect(-light_vector1, normal_vector1)); 

	vec3 ambientFactor = vec3(0.02);
	vec3 diffuseFactor = vec3(0.2);
	vec3 lightSpecular = vec3(1.0,1.0,1.0);
	vec3 lightDiffuse = vec3(1.0,1.0,1.0);
	vec3 lightAmbient = vec3(1.0,1.0,1.0);

	vec3 skyColor,shallowColor,deepColor,specularColor;
	//Define color
	if(colorSet==1.0)
	{
		skyColor = vec3(0.65, 0.80, 0.95);
		shallowColor = vec3(0.0 / 255.0, 232.0 / 255.0, 159.0 / 255.0);
		deepColor = vec3(0.0/255, 0.0/255.0, 0.0/255.0);
		specularColor = vec3(1.0,1.0,1.0);
	}
	if(colorSet==2.0)
	{
		skyColor = vec3(0.65, 0.80, 0.95);
		shallowColor = vec3(0.275, 0.510, 0.706);
		deepColor = vec3(0.0/255, 0.0/255.0, 0.0/255.0);
		specularColor = vec3(0.957, 0.643, 0.376);
	}
	if(colorSet==3.0)
	{
		skyColor = vec3(0.65, 0.80, 0.95);
		shallowColor = vec3(0.275, 0.510, 0.706);
		deepColor = vec3(30.0/255, 30.0/255.0, 30.0/255.0);
		specularColor = vec3(0.502, 0.000, 0.00);
	}

	if (dot(normal_vector1, eye_vector1) < 0) normal_vector1 = -normal_vector1;
	
	float NdotL, NdotR,EdotR;
	NdotL = max(dot(normal_vector1, light_vector1), 0.0);
    NdotR = max(dot(normal_vector1, eye_vector1), 0.0);
    EdotR = max(dot(eye_vector1, reflect_vector1), 0.0);
	
    // ambient
    vec3 ambient = lightAmbient * ambientFactor;

	//for water
    float waterHeight;
    waterHeight = (vWorldPos.y - heightMin) / (heightMax - heightMin);
    vec3 heightColor = (1.0 - waterHeight) * deepColor + waterHeight * shallowColor ;

    // diffuse
	vec3 diffuse = diffuseFactor * lightDiffuse * NdotL *skyColor;
	
	// reflect sky
	float refCoeff = pow(NdotR, 0.3);
	vec3 reflectColor = (1 - refCoeff) * skyColor;

	vec3 waterColor = ambient + diffuse + heightColor + reflectColor ;    

	// ward
	float wd = max(Ward(light_vector1,eye_vector1,normal_vector1,0.1),0.0);
	
	waterColor = 0.7*waterColor+0.5*specularColor*wd;

	gl_FragColor = vec4(waterColor, 1.0f); 
} 