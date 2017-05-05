#pragma once

#define _USE_MATH_DEFINES

#include <cmath>
#include <iostream>
#include <random>
#include <complex>

#include <glm/glm.hpp>
#include <fftw/fftw3.h>

using namespace std;
using namespace glm;

const float pi = float(M_PI);
const float g = 9.8f;
const float l = 0.001;

class Ocean
{
public:
	Ocean(int N, int M, float L_x, float L_z, vec2 omega_wind_dir, float V_wind_speed, float A, float lambda);
	~Ocean();
	void generateHeightmap(float time);

	vec3 *vertices,*normals;

private:
	complex<float> *h_twiddle_0 = NULL;
	complex<float> *h_twiddle_0_conj = NULL;
	complex<float> *input_amplitudes = NULL;

	default_random_engine generator;
	normal_distribution<float> normal_dist;
	
	float A, L_x, L_z,V_wind_speed, lambda;
	int N, M, oceanSize;
	vec2 omega_wind_dir; 

	vec2 getKVec(int n,int m);
	float getPhK(vec2 vec_k);
	complex<float> get_h_twiddle_0(vec2 vec_k) ;
	complex<float> get_h_twiddle(int kn, int km, float t) ;
	void computeIFFT(void* input, fftwf_complex *output);
};
