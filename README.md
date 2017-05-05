## Description
This is the final project for CSC562. This project include two programs.

1.Simulating Ocean Water with Gerstner-wave in WebGL.

2.Simulating Ocean Water with iFFT in OpenGL.

Since I am not very familar with javascript and there are some performance problem when I implement the first program, also the GLSL version in WebGL is quite old. So I write the iFFT version in C++ with OpenGL.

Third party libraries that I used:
- **GLEW**  Provide OpenGL API in C++
- **GLFW**  Provide UI window
- **GLM**     Matrix calculation for OpenGL
- **FFTW**  Computing the Discrete Fourier Transform (DFT)


## Directions:
- For the WebGL program: 

  I have uploaded my code to github, and the github page link for the Gerstner Ocean is:
  https://shaunxia.github.io/CG_Rendering_Ocean/

  __Conrtol:__
  * __A W S D Q E__: Move Camera
  * __H__: hide/show control panel
  * Others can be set through control panel
  
- For the OpenGL program:

  I created the project with Visual Studio 2015 in Windows 10 and the project included all thirh party libraries.
  Also I've compiled a execuatable file "OceanSurface.exe" you can find it in "OpenGL-Ocean/Release" folder.
  https://github.com/ShaunXia/CG_Rendering_Ocean/tree/master/OpenGL-Ocean
  
  __Control:__
  * __A W S D Q E__: Move Camera
  * __X__: Show wireframe
  * __1,2,3__: Different color sets for ocean and light.
  * __4,5,6__: Different Wind directions
  * __UP/Down__:Hegher/Lower Wave
  * __Left/Right__:+/- Speed
  * __H/M/L__: High/Midium/Low Resolution
  
## Claims:
- (5%)proper turn in
- (25%)create experimental environment 
- (35%)implement 3D water surface mesh based on the height-map generated from Gerstner function.
- (20%)Add materials, lights, reflection, Fresnel term and animation, with some minor adjustment, removed fresnel term and added ward model as specular term.
- (15%)For more realistic ocean surface, add Bump Mapping to gain more details and high frequent waves.Also setup input parameters like wind direction,  length of waves, speed and amplitude. When implement the project I realized that bump mapping not vary useful in my project, so I added texture insead. Also added Skybox, and tried environment mapping, but with bad result, I just removed environment mapping.
- (25%)More efficient and more realistic way to generate height-map -  inverse Fast Fourier Transformation(iFFT)
- Also in the Extra part, I have implemented all the above points.
## Screencast:
- Gerstner-wave in WebGL:
  https://youtu.be/tPR6p5JHe1s
  
- iFFT version in OpenGL:
  https://youtu.be/gzeTRfo80PQ
  
### Reference: ###
- WebGL Fundamentals - https://webglfundamentals.org/webgl/lessons/
- Learn OpenGL - https://learnopengl.com/#!Introduction
- Fastest Fourier Transform in the West(FFTW) - http://www.fftw.org/fftw3_doc/
- Simulating Ocean Water - Jerry Tessendorf
- Effective Water Simulation from Physical Models - GPU Gems CH01
- USING THE DISCRETE FOURIER TRANSFORM - http://www.keithlantz.net/2011/10/ocean-simulation-part-one-using-the-discrete-fourier-transform/
- Rendering Waterwith WebGL - https://29a.ch/slides/2012/webglwater/
