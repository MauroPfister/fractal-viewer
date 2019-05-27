# version 300 es

precision mediump float;

// define all uniforms in uniforms.glsl file
$uniforms$

out vec4 f_color;   // Final color output produced by fragment shader.

// source for distance estimator:
// https://github.com/3Dickulus/FragM/blob/master/Fragmentarium-Source/Examples/Historical%203D%20Fractals/QuaternionJulia.frag

const vec4 c0 = vec4(0.18, 0.88, 0.24, 0.1); 
const vec4 c1 = vec4(0.5, 0.1, -0.5, -0.5); 

// distance estimator for juliaset fractal
float dist_estimator(vec3 pos) {

	int iter = 20;
	float Threshold = 10.0;
	vec4 orbitTrap = vec4(1.0, 1.0, 1.0, 1.0);
	vec4 c = mix(c0, c1, shape_factor / 20.0);

	vec4 p = vec4(pos, 0.0);
	vec4 dp = vec4(1.0, 0.0,0.0,0.0);

	for (int i = 0; i < iter; i++) {
		dp = 2.0* vec4(p.x*dp.x-dot(p.yzw, dp.yzw), p.x*dp.yzw+dp.x*p.yzw+cross(p.yzw, dp.yzw));
		p = vec4(p.x*p.x-dot(p.yzw, p.yzw), vec3(2.0*p.x*p.yzw)) + c;
		float p2 = dot(p,p);
		orbitTrap = min(orbitTrap, abs(vec4(p.xyz,p2)));
		if (p2 > Threshold) break;
	}
	float r = length(p);
	return  0.5 * r * log(r) / length(dp);
}

$ray_marching$



