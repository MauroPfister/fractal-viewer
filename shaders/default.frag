# version 300 es

precision mediump float;

// define all uniforms in uniforms.glsl file
$uniforms$

out vec4 f_color;   // Final color output produced by fragment shader.

void main() {
	f_color = vec4(0.6, 0.6, 0.6, 1.0);
}




