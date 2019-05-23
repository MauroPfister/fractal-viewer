
// calculate surface normal at point p
vec3 calc_normal( in vec3 p, float eps)
{
    // first order finite difference normals
    vec2 e = vec2(1.0, -1.0) * 0.57 * eps;
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
        dist = dist_estimator(p); 
        dist_tot += dist;
        p += dist * r_dir;     // ray marching step

        // stop if distance to object is smaller than tolerance or if we are past the object
        if ( (dist < eps * dist_tot) || (dist_tot > dist_tot_max)) {
            return dist_tot;
        }
    }
}

// determine if point p is shadowed
float shadow( vec3 p, vec3 n, vec3 light_pos, int max_iter, float dist_tot_max, float eps ) 
{
    p += 3.0 * eps * n;   // move the ray origin a bit away from surface
    vec3 r_dir = normalize(light_pos - p);
    float dist_tot = eps;
    float dist;

    for (int i = 0; i < max_iter; i++) {
        dist = dist_estimator(p);
        p += dist * r_dir; 
        dist_tot += dist;

        // stop if distance to object is smaller than tolerance or if we are past the object
        if ( (dist < eps )) {
            return 0.0;
        }
    }

    return 1.0;
}

// calculate ambient occlusion at point p
float ambient_occlusion() {
    // ambient occlusion fake
    //float AO_step = 5 * eps;
    //float AO_fac = (AO_step - dist_estimator(p + AO_step * n)) / AO_step;
    //color *= vec3(1.0 - 0.6 * AO_fac*AO_fac);
    return 1.0;
}


void main() {

    vec2 v2f_position = (2.0*gl_FragCoord.xy - resolution) / resolution.y;

    float f = 3.0;
    vec3 eye = mat3(m_view) * vec3(-10, 0, 0);            // eye location
    vec3 r_o = mat3(m_view) * (vec3(-10, 0, 0) + vec3(f, v2f_position));     // ray origin
    vec3 r_dir = normalize(r_o - eye);                    // ray direction


    // light properties
    vec3 light_pos = vec3(0, 3.0, 0.0);
    vec3 light_col = vec3(1.0 , 1.0, 1.0);

    // material of object
    vec3 m_dif = vec3(0.7);
    vec3 m_spec = vec3(0.4);
    float shininess = 20.0;         // specular coefficient

    // ray marching parameters (these work well for the moment)
    float eps = 2.0 / resolution.y; // ray marching tolerance
    int max_iter = 100;             // maximal ray marching iterations
    float dist_tot_max = 10.0;      // maximal distance before color is set to background color

    vec3 color = vec3(0, 0, 0);     // color of object at intersection


    // ray marching
    vec3 p = r_o;
    float dist_tot = intersect(p, r_dir, max_iter, dist_tot_max, eps);

    // normal at intersection point
    vec3 n = calc_normal(p, eps);

    // determine if point is shadowed
    float shadow = shadow( p, n, light_pos, max_iter, dist_tot_max, eps );
     
    // phong lighting model
    if ( dist_tot < dist_tot_max ) {        
        // ambient component
        color = vec3(0.05 * m_dif * light_col);

        vec3 l = light_pos - p;
        vec3 r = reflect(-l, n);
        vec3 v = eye - p;
        float dot_nl = dot(n, normalize(l));
        float dot_vr = dot(normalize(v), normalize(r));

        // diffuse component
        if (dot_nl > 0.0) {
            color += m_dif * light_col * dot_nl;
        }

        // specular component
        if ((dot_nl > 0.0) && (dot_vr > 0.0)) {
            color += m_spec * light_col * pow(dot_vr, shininess);
        } 
    }

    // apply shadow
    color = color * shadow;
    
    f_color = vec4(color , 1.0);
}