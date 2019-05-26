# version 300 es

precision mediump float;

uniform mat4 m_view;
uniform float Power;
uniform vec2 resolution;
uniform float light_red;
uniform float light_green;
uniform float light_blue;

out vec4 f_color;   // Final color output produced by fragment shader.


float dist_estimator( vec3 p )
{
    vec3 b = vec3(0.8, 0.3, 0.2);
    float r = 0.2;

    vec3 d = abs(p) - b;
    return length(max(d,0.0)) - r
            + min(max(d.x,max(d.y,d.z)),0.0); // remove this line for an only partially signed sdf 
}

$ray_marching$