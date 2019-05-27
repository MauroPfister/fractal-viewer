# version 300 es

precision mediump float;

// define all uniforms in uniforms.glsl file
$uniforms$

out vec4 f_color;   // Final color output produced by fragment shader.

// source for distance estimator:
// http://blog.hvidtfeldts.net/index.php/2011/09/distance-estimated-3d-fractals-v-the-mandelbulb-different-de-approximations/

// distance estimator for mandelbulb fractal
float dist_estimator(vec3 pos) {
    float bailout = 16.0;
    int iter = 4;
	float n = shape_factor;		// n is power of iteration f(z) = z^n + c
	vec3 w = pos;
	float dr = 1.0;     		// escape time length
	float r = length(w);        // length of the running derivative

	for (int i = 0; i < iter; i++) {
		
		// convert to polar coordinates
		float theta = acos(w.z/r);
		float phi = atan(w.y,w.x);
		dr =  pow( r, n - 1.0) * n * dr + 1.0;
		
		// scale and rotate the point
		theta = theta * n;
		phi = phi * n;
		
		// calculate w_k+1 = (w_k)^n + c where c = pos
		w = pow(r, n) * vec3( sin(theta) * cos(phi), sin(phi) * sin(theta), cos(theta) ) + pos;

        r = length(w);
		if (r > bailout) break;
	}
	return 0.5 * log(r) * r/dr;
}

$ray_marching$




