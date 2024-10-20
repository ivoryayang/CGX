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

// ray_color function
vec3 ray_color(const Ray r) {
    vec3 unit_direction = normalize(r.direction);
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
