# version 300 es

precision mediump float;

uniform mat4 m_view;
uniform float Power;
uniform vec2 resolution;
uniform vec3 light1_color;
uniform vec3 light2_color;
uniform float eps_multiplicator;
uniform int max_iter;


out vec4 f_color;   // Final color output produced by fragment shader.

// distance estimator for mandelbulb fractal
float dist_estimator(vec3 pos) {

	int iter = 10;
	float Scale = 2.0;

	vec3 a1 = vec3(1.0, 1, 1);
	vec3 a2 = vec3(-1.0, -1, 1);
	vec3 a3 = vec3(1.0, -1, -1);
	vec3 a4 = vec3(-1.0, 1, -1);
	vec3 c;
	int n = 0;
	float dist, d;

	while (n < iter) {
		c = a1; dist = length(pos-a1);
	    d = length(pos-a2); 
		if (d < dist) {
			c = a2; 
			dist=d; 
		}
		d = length(pos-a3);
		if (d < dist) { 
			c = a3; 
			dist=d; 
		}
		d = length(pos-a4);
		if (d < dist) {
			c = a4;
			dist=d;
		}

		pos = Scale*pos-c*(Scale-1.0);
		n++;
	}

	return length(pos) * pow(Scale, float(-n));
}


$ray_marching$