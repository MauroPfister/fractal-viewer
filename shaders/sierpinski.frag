# version 300 es

precision mediump float;

// define all uniforms in uniforms.glsl file
$uniforms$

out vec4 f_color;   // Final color output produced by fragment shader.

// source for distance estimator:
// http://blog.hvidtfeldts.net/index.php/2011/08/distance-estimated-3d-fractals-iii-folding-space/

// distance estimator for sierpinski pyramid fractal
float dist_estimator(vec3 pos) {

	int iter = int(shape_factor);
	float scale = 2.0;

	vec3 a1 = vec3(1.0, 1, 1);
	vec3 a2 = vec3(-1.0, -1, 1);
	vec3 a3 = vec3(1.0, -1, -1);
	vec3 a4 = vec3(-1.0, 1, -1);
	vec3 c;
	int i = 0;
	float dist, d;

	while (i < iter) {
		c = a1; 
		dist = length(pos - a1);
	    d = length(pos - a2); 
		if (d < dist) {
			c = a2; 
			dist = d; 
		}
		d = length(pos - a3);
		if (d < dist) { 
			c = a3; 
			dist = d; 
		}
		d = length(pos - a4);
		if (d < dist) {
			c = a4;
			dist = d;
		}

		pos = scale * pos - c * (scale - 1.0);
		i++;
	}

	return length(pos) * pow(scale, float(-i));
}


$ray_marching$