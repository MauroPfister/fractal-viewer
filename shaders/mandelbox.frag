# version 300 es

precision mediump float;

// define all uniforms in uniforms.glsl file
$uniforms$

out vec4 f_color;   // Final color output produced by fragment shader.

// source for distance estimator:
// http://blog.hvidtfeldts.net/index.php/2011/08/distance-estimated-3d-fractals-iii-folding-space/

const float foldingLimit = 1.0;
const float fixedRadius2 = 1.5; 
const float minRadius2 = 0.1;
const float scale = -2.0;

void boxFold(inout vec3 z, inout float dz) {
	z = clamp(z, -foldingLimit, foldingLimit) * 2.0 - z;
}

void sphereFold(inout vec3 z, inout float dz) {
	float r2 = dot(z,z);
	if (r2 < minRadius2) { 
		// linear inner scaling
		float temp = (fixedRadius2 / minRadius2);
		z *= temp;
		dz *= temp;
	} else if (r2 < fixedRadius2) { 
		// this is the actual sphere inversion
		float temp =(fixedRadius2 / r2);
		z *= temp;
		dz *= temp;
	}
}

// distance estimator for mandelbox fractal
float dist_estimator(vec3 pos) {
	// scale fractal to be within same dimensions of mandelbulb
	pos = pos * 2.0;
	
	int iter = int(shape_factor);
	vec3 w = pos;
	float dr = 1.0;			// escape time length

	for (int i = 0; i < iter; i++){
		boxFold(pos, dr);
		sphereFold(pos, dr);

		pos = scale * pos + w;
		dr = dr * abs(scale) + 1.0;
	}

	float r = length(pos);
	return r/abs(dr);
}

$ray_marching$



