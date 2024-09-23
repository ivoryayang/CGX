#include "common.glsl"
// Define ray struct
struct Ray
{
    vec3 origin; // Origin of ray
    vec3 direction; // Direction of ray
};

// Define camera struct
struct Camera
{
    vec3 origin;
    vec3 lower_left_corner;
    vec3 horizontal;
    vec3 vertical;
};

// Define sphere
struct Sphere
{
    vec3 center;
    float radius;
};

struct hit_record{
    vec3 position;
    vec3 normal;
    float t;
};

// hit_sphere function
float hit_sphere(Sphere sph, const Ray r) {
    // Displacement from the sphere's center to the origin of the ray
    vec3 oc = r.origin - sph.center;
    // Squared length of the ray's direction vector
    float a = dot(r.direction, r.direction);
    // Dot product between the vector oc and the ray's direction vector
    float b = 2.0 * dot(oc, r.direction);
    // Squared length of the vector oc and the squared radius of the sphere
    float c = dot(oc, oc) - sph.radius * sph.radius;
    // Number of real solutions (roots) of the equation
    float discriminant = b * b - 4.0 * a * c;
    // If non-negative
    // Real solutions, meaning the ray intersects the sphere
    //calculate distance from discriminant
    if (discriminant < 0.0) {
        return -1.0;
    } else {
        return (-b - sqrt(discriminant) ) / (2.0*a);
    }
    return -1.0;
}

// ray_color function
vec3 ray_color(const Ray r) {
    Ray r_temp = r;
    vec3 color = vec3(1.0, 1.0, 1.0);
    for(int i =0; i < 100; i++){
        // part 1: generating new ray
        vec3 o = vec3(0.0,0.0,-1.0);
        vec3 o2 = vec3(0.0, -100.5, -1.0);
        Sphere sph = Sphere(o, 0.5);
        Sphere sph2 = Sphere(o2, 100.0);
        float t = hit_sphere(sph, r_temp);
        float t2 = hit_sphere(sph2, r_temp);
        vec3 unit_direction = normalize(r_temp.direction);

        vec3 p = r_temp.origin + unit_direction * t;
        vec3 n = normalize(p - o);
        vec3 p2 = r_temp.origin + unit_direction * t2;
        vec3 n2 = normalize(p2 - o2);

        // If ray intersects anything in scene
        if(t > 0.0|| t2 > 0.0){
            vec3 pIntersection;
            if (t < t2 && t > 0.0 || t2 < 0.0){
                //p is intersection point
                pIntersection = p;
            }else{
                //p2 is intersection point
               pIntersection = p2;
            }
            vec3 nIntersection;
            nIntersection = n;
            if (t < t2 && t > 0.0|| t2 < 0.0){
                //n is intersection point
                nIntersection = n;
            }else{
                //n2 is intersection point
                nIntersection = n2;
            }
            vec3 new_dir = nIntersection + random_in_unit_sphere(g_seed);
            Ray new_ray = Ray(pIntersection, normalize(new_dir));
            r_temp = new_ray;
            color = color * 0.5;
        }
        else {
            float a = 0.5 * (unit_direction.y + 1.0);
            return color * ((1.0 - a) * vec3(1.0, 1.0, 1.0) + a * vec3(0.5, 0.7, 1.0));
        }
    }
    return color;
}



void main()
{
    // Camera setting function
    float focal_length = 1.0;
    float viewport_height = 2.0;
    float viewport_width = viewport_height * (iResolution.x / iResolution.y);
    vec3 camera_center = vec3(0, 0, 0);

    // Normalized pixel coordinates (from 0 to 1)
    vec3 col = vec3(0.0, 0.0, 0.0);
    init_rand(gl_FragCoord.xy, iTime);
    for(int i = 0; i < 100; i++){
        vec2 uv = (gl_FragCoord.xy + rand2(g_seed)) / iResolution.xy ;
        vec2 uvp = vec2(uv.x * viewport_width, uv.y * viewport_height);

        // World coordinates
        uvp += vec2(-viewport_width*0.5, -viewport_height*0.5);
        vec3 world = vec3(uvp.x, uvp.y, -focal_length);
        vec3 raydir = normalize(world-camera_center);
        
        // Define ray
        Ray r = Ray(camera_center, raydir);
        col += ray_color(r);
    }
    vec3 colAverage = col/(100.0);
    colAverage = pow(colAverage, vec3(1.0/2.2));
    if(colAverage.r == 1.0){
        gl_FragColor.r = 1.0;
    }
    else{
        gl_FragColor.r  = 0.0;
    }
    if(colAverage.g == 1.0){
        gl_FragColor.g = 1.0;
    }
    else{
        gl_FragColor.g  = 0.0;
    }
    if(colAverage.b == 1.0){
        gl_FragColor.b = 1.0;
    }
    else{
        gl_FragColor.b  = 0.0;
    }
    gl_FragColor = vec4(colAverage, 1.0);
}