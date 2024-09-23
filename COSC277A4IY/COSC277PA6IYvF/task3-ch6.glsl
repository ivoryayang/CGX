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
    vec3 o = vec3(0.0,0.0,-1.0);
    vec3 o2 = vec3(0.0, -100.5, -1.0);

    Sphere sph = Sphere(o, 0.5);
    Sphere sph2 = Sphere(o2, 100.0);


    float t = hit_sphere(sph, r);
    float t2 = hit_sphere(sph2, r);

    vec3 unit_direction = normalize(r.direction);

    //position = ray's origin + t in direction of ray
    vec3 p = r.origin + unit_direction * t;
    vec3 p2 = r.origin + unit_direction * t2;
    vec3 n = normalize(p - o);
    vec3 n2 = normalize(p2 - o2);

    //if intersection has occured
    if (t > 0.0){
        return 0.5*vec3(n.x+1.0, n.y+1.0, n.z+1.0);
    } else if (t2 > 0.0) {
        return 0.5*vec3(n2.x+1.0, n2.y+1.0, n2.z+1.0);
    }
    float a = 0.5 * (unit_direction.y + 1.0);
    return (1.0 - a) * vec3(1.0, 1.0, 1.0) + a * vec3(0.5, 0.7, 1.0);
}
void main()
{
    // Camera setting function
    float focal_length = 1.0;
    float viewport_height = 2.0;
    float viewport_width = viewport_height * (iResolution.x / iResolution.y);
    vec3 camera_center = vec3(0, 0, 0);
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = gl_FragCoord.xy / iResolution.xy;
    vec2 uvp = vec2(uv.x * viewport_width, uv.y * viewport_height);
    // World coordinates
    uvp += vec2(-viewport_width*0.5, -viewport_height*0.5);
    vec3 world = vec3(uvp.x, uvp.y, -focal_length);
    vec3 raydir = normalize(world-camera_center);
    // Define ray
    Ray r = Ray(camera_center, raydir);
    vec3 col = ray_color(r);
    gl_FragColor = vec4(col, 1.0);
}