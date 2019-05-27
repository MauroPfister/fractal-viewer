# version 300 es

precision mediump float;

// define all uniforms in uniforms.glsl file
$uniforms$

out vec4 f_color;   // Final color output produced by fragment shader.

// source for distance estimator:
// https://www.iquilezles.org/www/articles/distfunctions/distfunctions.htm

float dist_estimator( vec3 p )
{
    vec3 b = vec3(0.8, 0.3, 0.2);
    float r = shape_factor / 20.0;

    vec3 d = abs(p) - b;
    return length(max(d,0.0)) - r
            + min(max(d.x,max(d.y,d.z)),0.0); // remove this line for an only partially signed sdf 
}

$ray_marching$