# version 300 es

precision mediump float;

// define all uniforms in uniforms.glsl file
$uniforms$

out vec4 f_color;   // Final color output produced by fragment shader.


const float foldingLimit = 1.0;
const float fixedRadius2 = 1.5; 
const float minRadius2 = 0.1;
const float Scale = -2.0;

void boxFold(inout vec3 z, inout float dz) {
	z = clamp(z, -foldingLimit, foldingLimit) * 2.0 - z;
}

void sphereFold(inout vec3 z, inout float dz) {
	float r2 = dot(z,z);
	if (r2 < minRadius2) { 
		// linear inner scaling
		float temp = (fixedRadius2/minRadius2);
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

	int iter = 4;
	vec3 w = pos;
	float dr = 1.0;			// escape time length

	for (int n=0; n < iter; n++){
		boxFold(pos, dr);
		sphereFold(pos, dr);

		pos = Scale * pos + w;
		dr = dr * abs(Scale) + 1.0;
	}

	float r = length(pos);
	return r/abs(dr);

}




$ray_marching$
//http://blog.hvidtfeldts.net/index.php/2011/08/distance-estimated-3d-fractals-iii-folding-space/




