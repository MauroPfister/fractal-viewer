# version 300 es

precision mediump float;

uniform mat4 m_view;
uniform vec2 resolution;
uniform float r;

out vec4 f_color;   // Final color output produced by fragment shader.

// distance estimator for mandelbulb fractal
float DE(vec3 pos) {
    return sqrt(dot(pos, pos)) - r*r;
}

vec3 calcNormal( in vec3 pos, float eps)
{
    // Normal of a sphere
    return normalize(pos);
}



void main() {

    vec2 v2f_position = (2.0*gl_FragCoord.xy - resolution) / resolution.y;

    float f = 3.0;
    vec3 eye = mat3(m_view) * vec3(-5, 0, 0);            // eye location
    vec3 r_o = mat3(m_view) * (vec3(-5, 0, 0) + vec3(f, v2f_position));     // ray origin
    vec3 r_dir = normalize(r_o - eye);                    // ray direction
    vec3 p = r_o;                                         // current position on ray
    float dist_tot = 0.0;                                 // total distance from ray origin
    float dist_tot_max = 10.0;                            // maximal distance before color is set to background color

    vec3 light_pos = vec3(0, 3.0, 0.0);
    vec3 light_col_bright = vec3(1.0 , 1.0 , 1.0);
    vec3 light_col_dark = vec3(1.0 , 0.0, 0.0);
    vec3 color_backgroud = vec3(0.0 , 0.4, 0.4);
    int isBackground = 0;

    vec3 m_dif = vec3(1.7);
    vec3 m_spec = vec3(0.4);

    // ray marching parameters (these work well for the moment)
    float eps = 0.001;      // ray marching tolerance
    int max_iter = 100;     // maximal ray marching iterations
    float dist = 0.0;

    vec3 color = vec3(0, 0, 0);     // color of object at intersection
    vec3 n;     // normal vector at intersection point
    vec3 l;     // vector from intersection point to light
    vec3 r;     // light vector reflected on normal
    vec3 v;     // vector from intersection point to eye
    float dot_nl = 0.0;
    float dot_vr = 0.0;
    float shininess = 20.0;


    // ray marching
    for (int i = 0; i < max_iter; i++) {
        //dist = sdTorus( p, vec2(0.5, 0.2) );
        //dist = sdRoundBox( p, vec3(1, 0.5, 0.2), 0.05);

        dist = DE(p); 
        dist_tot += dist;
        p = r_o + dist_tot * r_dir;     // ray marching step

        // stop if distance to object is smaller than tolerance or if we are past the object
        if  (dist < eps * dist_tot) {
            break;
        }
        else if (dist_tot > dist_tot_max){
            isBackground = 1;
            break;
        }

    }

    float dist_tot_p = dist_tot;

    // shadow ---- THIS IS UGLY, PUT IN SEPARATE FUNCTION!
    n = calcNormal(p, eps);
    r_o = p + eps * n;
    r_dir = normalize(light_pos - r_o);
    int shadowed = 0;
    dist_tot = eps;
    for (int i = 0; i < max_iter; i++) {
        dist = DE(r_o + dist_tot * r_dir); 
        dist_tot += dist;

        // stop if distance to object is smaller than tolerance or if we are past the object
        if ( (dist < eps )) {
            shadowed = 1;
            break;
        }
        if (dist_tot > length(light_pos - r_o)) break;    // does this help to speed things up?
    }


    // phong lighting model
    vec3 light_col;
    if (p.x*p.z*p.y > 0.0){
        light_col = light_col_bright ; 
    }
    else{
        light_col = light_col_dark ;
    }

    // ambient component
    color = vec3(0.05 * m_dif * light_col);
    
    
    if ( dist_tot_p < dist_tot_max && shadowed != 1) {
        // simple coloring based on ray marching steps

        // phong lighting model
        l = light_pos - p;
        r = reflect(-l, n);
        v = eye - p;
        dot_nl = dot(n, normalize(l));
        dot_vr = dot(normalize(v), normalize(r));

        // diffuse component
        if (dot_nl > 0.0) {
            color += m_dif * light_col * dot_nl;
        }

        // specular component
        if ((dot_nl > 0.0) && (dot_vr > 0.0)) {
            color += m_spec * light_col * pow(dot_vr, shininess);
        } 
   
    // ambient occlusion fake
    //float AO_step = 5 * eps;
    //float AO_fac = (AO_step - DE(p + AO_step * n)) / AO_step;
    //color *= vec3(1.0 - 0.6 * AO_fac*AO_fac);

    }
    
    //color = pow(color, vec3(0.45));      // gamma correction?
    if(isBackground == 1){
        f_color = vec4(color_backgroud , 1.0);
    }
    else{
        f_color = vec4(color , 1.0);
    }
}




