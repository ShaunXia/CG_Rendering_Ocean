#include "ocean.h"
#include <time.h> 

/* Ocean Setup Notes: by Victoria
* gridX, gridZ -> N, M
* patchLength -> L
* N, M must both be a power of 2 (usually values in the range 128 to 512 are sufficient)
*      The grid facet sizes dx and dz are determined by L/N and L/M
*      dx and dz should never go below 2 cm
*      For more interesting waves, dx and dz should be smaller than (WindSpeed^2 / g) by a substantial amount (10 - 1000)
* lambda - A value that scales the importance of the displacement vector when computing horizontal displacements
* Under the Tessendorf model, the ocean grid coordinates are at points (n * L / N) and (m * L / M)
*      where the bounds on n and m are: (-N/2) <= n < N
*                                       (-M/2) <= m < M
*      For convenience when iterating through grid, nAdjust and mAdjust are calculated as N/2 and M/2
*      With this, can iterate from 0 <= i < N and 0 <= j < M, where grid coordinates are now (i - nAdjust) * (L / N) and
*          (j - mAdjust) * (L / N)
*
*	
*/

#define K_VEC(n,m) (vec2(2 * M_PI * (n - N / 2) / L_x, 2 * M_PI * (m  - M / 2) / L_z))

Ocean::Ocean(int N, int M, float L_x, float L_z, vec2 omega_wind_dir, float V_wind_speed, float A, float lambda) :
	N(N), M(M),
	omega_wind_dir(normalize(omega_wind_dir)),
	V_wind_speed(V_wind_speed), L_x(L_x), L_z(L_z),
	A(A),
	lambda(lambda)
{
	generator.seed(time(NULL));
	oceanSize = N * M;

	vertices = new glm::vec3[oceanSize];
	normals = new glm::vec3[oceanSize];

	h_twiddle_0 = new complex<float>[oceanSize];
	h_twiddle_0_conj = new complex<float>[oceanSize];
	input_amplitudes = new complex<float>[oceanSize];

	for (int n = 0; n < N; ++n)
		for (int m = 0; m < M; ++m)
		{
			int index = m * N + n;
			vec2 k = getKVec(n, m);
			h_twiddle_0[index] = get_h_twiddle_0(k);
			h_twiddle_0_conj[index] = conj(get_h_twiddle_0(k));
		}
}

Ocean::~Ocean()
{
	delete[] vertices;
	delete[] normals;
	delete[] h_twiddle_0;
	delete[] input_amplitudes;
	delete[] h_twiddle_0_conj;
}

vec2 Ocean::getKVec(int n, int m)
{
	return vec2(2 * M_PI * (n - N / 2) / L_x, 2 * M_PI * (m - M / 2) / L_z);
}

// Eq23 Phillips spectrum 
float Ocean::getPhK(vec2 vec_k)
{
	if (vec_k == vec2(0.0f, 0.0f))
		return 0.0f;

	// L=v^2/g
	float L = V_wind_speed*V_wind_speed / g;

	float k = length(vec_k);
	vec2 k_hat = normalize(vec_k);

	float k_hat_dot_omega = dot(k_hat, omega_wind_dir);
	float Ph_k = A * exp(-1 / (k*L*k*L)) / pow(k, 4) * pow(k_hat_dot_omega, 6);
	Ph_k *= exp(-k*k*l*l);  // Eq24 To suppress waves smaller that a small length l<<L.

	return Ph_k;
}

// Eq25  Get height field without Time from Phillips Spectrum
complex<float> Ocean::get_h_twiddle_0(vec2 vec_k)
{
	float xi_r = normal_dist(generator);
	float xi_i = normal_dist(generator);
	return sqrt(0.5f) * complex<float>(xi_r, xi_i) * sqrt(getPhK(vec_k));
}

// Eq26	Get height field with input Time based on h_0
complex<float> Ocean::get_h_twiddle(int kn, int km, float t) 
{
	int index = km * N + kn;

	float k = length(getKVec(kn,km));
	complex<float> term1 = h_twiddle_0[index] * exp(complex<float>(0.0f, sqrt(g*k)*t));
	complex<float> term2 = h_twiddle_0_conj[index] * exp(complex<float>(0.0f, -sqrt(g*k)*t));
	return term1 + term2;
}

void Ocean::computeIFFT(void* input, fftwf_complex *output)
{
	fftwf_plan comp_plan;
	comp_plan=fftwf_plan_dft_2d(N, M, (fftwf_complex*)input, output, FFTW_BACKWARD, FFTW_ESTIMATE);
	fftwf_execute(comp_plan);
	fftwf_destroy_plan(comp_plan);
}

//Eq19
void Ocean::generateHeightmap(float time)
{
	fftwf_complex *out_amplitudes = (fftwf_complex*)fftwf_malloc(sizeof(fftwf_complex) * oceanSize);
	fftwf_complex *out_slopeX = (fftwf_complex*)fftwf_malloc(sizeof(fftwf_complex) * oceanSize);
	fftwf_complex *out_slopeZ = (fftwf_complex*)fftwf_malloc(sizeof(fftwf_complex) * oceanSize);
	fftwf_complex *out_dispX = (fftwf_complex*)fftwf_malloc(sizeof(fftwf_complex) * oceanSize);
	fftwf_complex *out_dispZ = (fftwf_complex*)fftwf_malloc(sizeof(fftwf_complex) * oceanSize);

	// Eq20
	// normals
	complex<float>* input_slopeX = new complex<float>[oceanSize];
	complex<float>* input_slopeZ = new complex<float>[oceanSize];

	// Eq29 
	complex<float>* input_dispX = new complex<float>[oceanSize];
	complex<float>* input_dispZ = new complex<float>[oceanSize];

	for (int n = 0; n < N; n++)
		for (int m = 0; m < M; m++)
		{
			int index = m * N + n;			

			input_amplitudes[index] = get_h_twiddle(n, m, time);

			vec2 k_vec = getKVec(n,m);
			vec2 k_vector1 = length(k_vec) == 0 ? k_vec : normalize(k_vec);

			input_slopeX[index] = complex<float>(0, k_vec.x) * input_amplitudes[index];
			input_slopeZ[index] = complex<float>(0, k_vec.y) * input_amplitudes[index];
			input_dispX[index] = complex<float>(0, -k_vector1.x) * input_amplitudes[index];
			input_dispZ[index] = complex<float>(0, -k_vector1.y) * input_amplitudes[index];
		}

	computeIFFT(input_amplitudes, out_amplitudes);
	computeIFFT(input_slopeX, out_slopeX);
	computeIFFT(input_slopeZ, out_slopeZ);
	computeIFFT(input_dispX, out_dispX);
	computeIFFT(input_dispZ, out_dispZ);

	const float signs[2] = { 1.0, -1.0 };
	for (int n = 0; n < N; n++)
		for (int m = 0; m < M; m++)
		{
			int index = m * N + n;

			//Sign adjustments - needed for compatibility with fftw
			float sign = signs[(n + m) & 1];

			out_slopeX[index][0] *=sign;
			out_slopeZ[index][0] *= sign;
			out_amplitudes[index][0] *= sign;
			out_dispX[index][0] *= sign;
			out_dispZ[index][0] *= sign;

			normals[index] = normalize(vec3(
				 out_slopeX[index][0], 
				-1,
				 out_slopeZ[index][0]));

			vertices[index] = vec3(
				(n - N / 2) * L_x / N -  lambda * out_dispX[index][0],
				out_amplitudes[index][0],
				(m - M / 2) * L_z / M -  lambda * out_dispZ[index][0]);
		}

	delete[] input_slopeX;
	delete[] input_slopeZ;
	delete[] input_dispX;
	delete[] input_dispZ;
	fftwf_free(out_amplitudes);
	fftwf_free(out_slopeX);
	fftwf_free(out_slopeZ);
	fftwf_free(out_dispX);
	fftwf_free(out_dispZ);
}
