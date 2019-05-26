# version 300 es

precision mediump float;

uniform mat4 m_view;
uniform float Power;
uniform vec2 resolution;


out vec4 f_color;   // Final color output produced by fragment shader.

void main() {
	f_color = vec4(0.6, 0.6, 0.6, 1.0);
}




