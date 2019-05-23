# version 300 es

precision mediump float;

uniform mat4 m_view;
uniform float Power;
uniform vec2 resolution;

out vec4 f_color;   // Final color output produced by fragment shader.

// distance estimator for mandelbulb fractal
float DE(vec3 pos) {
    float bailout = 16.0;
    int iter = 4;
    float n = Power;
	vec3 w = pos;
	float dr = 1.0;     // escape time length
	float r = 0.0;        // length of the running derivative

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

vec3 calcNormal( in vec3 pos, float eps)
{
    // first order finite difference normals
    vec2 e = vec2(1.0,-1.0) * 0.57 * eps;
    return normalize( e.xyy*DE( pos + e.xyy ) + 
					  e.yyx*DE( pos + e.yyx ) + 
					  e.yxy*DE( pos + e.yxy ) + 
					  e.xxx*DE( pos + e.xxx ) );
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
    vec3 light_col = vec3(1.0 , 1.0, 1.0);

    vec3 m_dif = vec3(0.7);
    vec3 m_spec = vec3(0.4);

    // ray marching parameters (these work well for the moment)
    float eps = 0.001;      // ray marching tolerance
    eps = 2.0 / resolution.y;
    int max_iter = 20;     // maximal ray marching iterations
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
        if ( (dist < eps * dist_tot) || (dist_tot > dist_tot_max)) {
            break;
        }
    }

    float dist_tot_p = dist_tot;

    // shadow ---- THIS IS UGLY, PUT IN SEPARATE FUNCTION!
    int shadowed = 0;
    n = calcNormal(p, eps);
    /*
    r_o = p + eps * n;
    r_dir = normalize(light_pos - r_o);
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
    */


    // phong lighting model
    if ( dist_tot_p < dist_tot_max && shadowed != 1) {
        // simple coloring based on ray marching steps
        
        // ambient component
        color = vec3(0.05 * m_dif * light_col);

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
    f_color = vec4(color , 1.0);
    //f_color = vec4(0.5, 1.0, 1.0, 1.0);
}




