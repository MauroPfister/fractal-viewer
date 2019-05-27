
// calculate surface normal at point p
vec3 calc_normal( in vec3 p, float eps)
{
    // first order finite difference normals
    vec2 e = vec2(1.0, -1.0) * 0.57 * eps * 2.0;
    return normalize( e.xyy*dist_estimator( p + e.xyy ) + 
					  e.yyx*dist_estimator( p + e.yyx ) + 
					  e.yxy*dist_estimator( p + e.yxy ) + 
					  e.xxx*dist_estimator( p + e.xxx ) );
    
}

// raymarch ray with origin p = r_o and direction r_dir and return total distance as well as intersection point p
float intersect( inout vec3 p, vec3 r_dir, int max_iter, float dist_tot_max, float eps ) 
{
    float dist_tot = 0.0;
    float dist;

    for (int i = 0; i < max_iter; i++) {
        // 0.5 * dist_estimator(p) to avoid entering the fractal when camera is far away
        dist = 0.5 * dist_estimator(p); 
        dist_tot += dist;
        p += dist * r_dir;     // ray marching step

        // stop if distance to object is smaller than tolerance or if we are past the object
        if ( (dist < eps) || (dist_tot > dist_tot_max)) {
            return dist_tot;
        }
    }
}

// determine if point p is shadowed
int shadow( vec3 p, vec3 n, vec3 light_pos, int max_iter, float dist_tot_max, float eps ) 
{
    p += 3.0 * eps * n;   // move the ray origin a bit away from surface
    vec3 r_dir = normalize(light_pos - p);
    float dist_tot = eps;
    float dist;
    float dist_light = length(light_pos - p);

    for (int i = 0; i < max_iter; i++) {
        dist = dist_estimator(p);
        p += dist * r_dir; 
        dist_tot += dist;

        // stop if distance to object is smaller than tolerance or if we are past the object
        if ( (dist < eps )) {
            return 1;
        }

        if (dist_tot > dist_light){
            return 0;
        }
    }

    return 0;
}

// calculate ambient occlusion at point p
float ambient_occlusion(float eps, vec3 n, vec3 p) {
    // ambient occlusion fake
    float samples = 10.0;
    float occlusion;
    eps = 1.0*eps;
    for( occlusion = 1.0; samples > 0.2; samples--){
        occlusion -=  30.0 * ( samples*eps - dist_estimator( p + samples*eps*n ) ) / (samples);   
    }
    // if (occlusion < 0.){
    //     return 0.0;
    // }
    return clamp(occlusion, 0., 1.);
}


void main() {

    vec2 v2f_position = (2.0*gl_FragCoord.xy - resolution) / resolution.y;

    float f = 3.0;
    vec3 eye = mat3(m_view) * vec3(-5, 0, 0);            // eye location
    vec3 r_o = mat3(m_view) * (vec3(-5, 0, 0) + vec3(f, v2f_position));     // ray origin
    vec3 r_dir = normalize(r_o - eye);                    // ray direction

    // light properties
    int number_of_lights = 2;
    vec3 light_pos[2] = vec3[]( 5.0 * vec3(-3.0, 3.0, 1.0), 5.0 * vec3(-4.0, -3.0, -1.0));
    vec3 light_col[2] = vec3[]( light1_color, light2_color );
    
    // sky colour
    vec3 sky_col = vec3(0.8, 0.9, 1.0);

    // material of object
    vec3 m_dif = vec3(0.7);
    vec3 m_spec = vec3(0.4);
    float shininess = 20.0;         // specular coefficient

    // ray marching parameters (these work well for the moment)
    float eps = eps_multiplicator / resolution.y; // ray marching tolerance
    //int max_iter = 200;             // maximal ray marching iterations

    // maximal marched distance after which sky/background is shown
    float dist_tot_max = length(eye) + 3.0;

    vec3 color = vec3(0, 0, 0);     // color of object at intersection

    // ------------- ray marching -----------------------------------
    vec3 p = eye;
    float dist_tot = intersect(p, r_dir, max_iter, dist_tot_max, eps);

    // normal at intersection point
    vec3 n = calc_normal(p, eps);

    // make shadows less dark
    color = 0.1 * sky_col;

    if ( dist_tot < dist_tot_max ) {
        // ray hits fractal

        if ( lighting_on == 1 ) {
            // calculate contribution of each light
            for(int light = 0; light < number_of_lights; light++){

                // determine if point is shadowed
                int shadow = shadow( p, n, light_pos[light], max_iter, dist_tot_max, eps ) * shadow_on;

                // phong lighting model
                if ( shadow == 0 ) {        
                    // ambient component
                    color += vec3(0.05 * m_dif * light_col[light]);

                    vec3 l = light_pos[light] - p;
                    vec3 r = reflect(-l, n);
                    vec3 v = eye - p;
                    float dot_nl = dot(n, normalize(l));
                    float dot_vr = dot(normalize(v), normalize(r));

                    // diffuse component
                    if (dot_nl > 0.0) {
                        color += m_dif * light_col[light] * dot_nl;
                    }

                    // specular component
                    if ((dot_nl > 0.0) && (dot_vr > 0.0)) {
                        color += m_spec * light_col[light] * pow(dot_vr, shininess);
                    } 
                }            
            }
        } else {
            color = vec3(m_dif);
        } 

        // false ambient occlusion
        if ( AO_on == 1) {
            color *= ambient_occlusion(eps, n, p);
        }   
    } else {
        // ray hits sky
        color = sky_col * (0.7 + 0.3 * (0.5 * dot( normalize(r_dir), normalize(light_pos[0]) ) 
                                      + 0.5 * dot( normalize(r_dir), normalize(light_pos[1]) ) ) );
    }
    
    // gamma correction
    color = 1.1 * pow(color, vec3(1.3));

    f_color = vec4(color , 1.0);
}