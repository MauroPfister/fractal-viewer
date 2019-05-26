# version 300 es

precision mediump float;

uniform mat4 m_view;
uniform float Power;
uniform vec2 resolution;
uniform float light_red;
uniform float light_green;
uniform float light_blue;

out vec4 f_color;   // Final color output produced by fragment shader.

float sdRoundBox( vec3 p, vec3 b, float r )
{
    float test = Power;
  vec3 d = abs(p) - b;
  return length(max(d,0.0)) - r
         + min(max(d.x,max(d.y,d.z)),0.0); // remove this line for an only partially signed sdf 
}

float sdTorus( vec3 p, vec2 t )
{
  vec2 q = vec2(length(p.xz)-t.x,p.y);
  return length(q)-t.y;
}

float sdBox( vec3 p, vec3 b )
{
  vec3 d = abs(p) - b;
  return length(max(d,0.0))
         + min(max(d.x,max(d.y,d.z)),0.0); // remove this line for an only partially signed sdf 
}

float opSmoothUnion( float d1, float d2, float k ) {
    float h = clamp( 0.5 + 0.5*(d2-d1)/k, 0.0, 1.0 );
    return mix( d2, d1, h ) - k*h*(1.0-h); 
}

float pMod1(inout float p, float size) {
	float halfsize = size*0.5;
	float c = floor((p + halfsize)/size);
	p = mod(p + halfsize, size) - halfsize;
	return c;
}



// distance function of object to be drawn
float dist_estimator(in vec3 pos) {
    
    // repeat in x and y direction
    //pMod1(pos.x, 1.0);
    //pMod1(pos.y, 1.0);

    return 0.05*sin(20.0*pos.x)*sin(20.0*pos.y)*sin(20.0*pos.z) + 
            opSmoothUnion(sdTorus(pos, vec2(0.1, 0.1) ), sdRoundBox(pos, vec3(0.1, 0.05, 0.02), 0.01), 0.01);
}



$ray_marching$