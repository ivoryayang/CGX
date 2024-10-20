#include "common.glsl"
#define INFINITY 1.0e30
#define DIFFUSE 0
#define METAL 1
#define DIELECTRIC 2

// Color struct
struct color {
    vec3 rgb;
};

// Ray struct
struct ray {
    vec3 origin;
    vec3 direction;
};

// Camera struct
struct camera {
    vec3 origin;
    vec3 lower_left_corner;
    vec3 horizontal;
    vec3 vertical;
};

struct material {
    vec3 color_rgb;
    int material_type;
    float variable;
};

struct hit_record {
    vec3 p;
    vec3 normal;
    float t;
    bool front_face;
};

void set_face_normal(inout hit_record rec, const ray r, const vec3 outward_normal) {
    rec.front_face = dot(r.direction, outward_normal) < 0.0;
    rec.normal = rec.front_face ? outward_normal : outward_normal;
}

struct Sphere {
    vec3 center;
    float radius;
    material mat;
};

bool hit(const Sphere sphere, const ray r, float ray_tmin, float ray_tmax, inout hit_record rec) {
    vec3 oc = r.origin - sphere.center;
    float a = dot(r.direction, r.direction);
    float half_b = dot(oc, r.direction);
    float c = dot(oc, oc) - sphere.radius * sphere.radius;
    float discriminant = half_b * half_b - a * c;
    if (discriminant < 0.0){
        return false;
    }
    float sqrtd = sqrt(discriminant);
    float root = (-half_b - sqrtd) / a;
    if (root <= ray_tmin || ray_tmax <= root) {
        root = (-half_b + sqrtd) / a;
        if (root <= ray_tmin || ray_tmax <= root)
            return false;
    }
    rec.t = root;
    rec.p = r.origin + rec.t * r.direction;
    vec3 outward_normal = (rec.p - sphere.center) / sphere.radius;
    set_face_normal(rec, r, outward_normal);
    return true;
    }
    float hit_sphere(vec3 center, float radius, ray r) {
    vec3 oc = r.origin - center;
    float a = dot(r.direction, r.direction);
    float half_b = dot(oc, r.direction);
    float c = dot(oc, oc) - radius * radius;
    float discriminant = half_b * half_b - a * c;
    if (discriminant < 0.0) {
        return -1.0;
    } else {
        return ( -half_b - sqrt(discriminant) ) / a;
    }
}


float schlick(float cosine, float ior){
    float r0 = (1.0 - ior) / (1.0 + ior);
    r0 = r0 * r0;
    return r0 + (1.0 - r0) * pow((1.0 - cosine), 5.0);
}

vec3 material_scatter(const material mat, const vec3 ray_direction, const vec3 hit_normal, inout vec3 attenuation) {
vec3 scattered_direction;
float cosine;
float ior;
float reflect_probability;
bool refraction_ratio;
vec3 unit_direction = normalize(ray_direction);
float cos_theta = min(dot(-unit_direction, hit_normal), 1.0);
float sin_theta = sqrt(1.0 - cos_theta*cos_theta);
vec3 outgoing_normal;

attenuation *= mat.color_rgb;
if (mat.material_type == DIFFUSE) {
    scattered_direction = hit_normal + random_in_unit_sphere(g_seed);

} else if (mat.material_type == METAL) {
    scattered_direction = reflect(ray_direction, hit_normal) + mat.variable * random_in_unit_sphere(g_seed);
} else if (mat.material_type == DIELECTRIC){
    if(dot(ray_direction, hit_normal) > 0.0){
        outgoing_normal = -hit_normal;

        ior = mat.variable;
        cosine = dot(ray_direction, hit_normal);
    } else{
        outgoing_normal = hit_normal;
        ior = 1.0/mat.variable;
        cosine = -dot(ray_direction, hit_normal);
    }
    // Check refraction probability
    refraction_ratio = dot((ray_direction), hit_normal) < 0.0;
    bool cannot_refract = float(refraction_ratio) * sin_theta > 1.0;
    vec3 refracted_dir = refract(ray_direction, outgoing_normal, ior);
    if( length(refracted_dir) > 0.0 ){
        // Refraction is possible
        reflect_probability = schlick(cosine, ior);
    }else{
        // Refraction is not possible
        reflect_probability = 1.0;
    }
    if(rand1(g_seed) < reflect_probability){
        scattered_direction = reflect(ray_direction, hit_normal);
    }else{
        scattered_direction = refract(ray_direction, outgoing_normal, ior);
    }
    return scattered_direction;
}
return scattered_direction;
}
color ray_color(const ray r, const Sphere spheres[5]) {
ray r_temp = r;
vec3 attenuation = vec3(1.0, 1.0, 1.0);
for(int i = 0; i < MAX_RECURSION; i++) {
    float closest_t = INFINITY;
    vec3 closest_normal;
    vec3 closest_intersection;
    bool hit_anything = false;
    vec3 new_dir;
    int closest_idx = 0;
    for (int j = 0; j < 5; ++j) {
        hit_record rec;
        if (hit(spheres[j], r_temp, 0.00001, closest_t, rec)) {
            hit_anything = true;
            closest_t = rec.t;
            closest_normal = rec.normal;
            closest_intersection = rec.p;
            closest_idx = j;
        }
    }
    if(hit_anything){
        new_dir = material_scatter(spheres[closest_idx].mat, r_temp.direction, closest_normal, attenuation);
        r_temp = ray(closest_intersection, normalize(new_dir));
    }
    if (!hit_anything) {
        vec3 unit_direction = normalize(r_temp.direction);
        float a = 0.5 * (unit_direction.y + 1.0);
        color white = color(vec3(1.0, 1.0, 1.0));
        color blue = color(vec3(0.5, 0.7, 1.0));
        return color(attenuation.rgb * (vec3((1.0 - a) * white.rgb + a * blue.rgb)));
        }
    }
    return color(attenuation);
}
void main() {
    float aspect = iResolution.x / iResolution.y;
    float viewport_height = 2.0;
    float viewport_width = viewport_height * aspect;
    float focal_length = 1.0;

    // Camera
    camera cam;
    cam.origin = vec3(0.0, 0.0, 0.0);
    cam.lower_left_corner = cam.origin - vec3(viewport_width / 2.0, viewport_height / 2.0, 1.0);
    cam.horizontal = vec3(viewport_width, 0.0, 0.0);
    cam.vertical = vec3(0.0, viewport_height, 0.0);

    // Materials
    material s0 = material(vec3(0.8, 0.8, 0.0), 0, 0.0);
    material s1 = material(vec3(0.1, 0.2, 0.5), 0, 0.0);
    material s2 = material(vec3(1.0, 1.0, 1.0), 2, 1.5);
    material s3 = material(vec3(0.8, 0.6, 0.2), 1, 0.2);

    // Spheres
    Sphere spheres[5];
    spheres[0] = Sphere(vec3(0.0, 0.0, -1.0), 0.5, s1); //center sphere
    spheres[1] = Sphere(vec3(-1.0, 0.0, -1.0), 0.5, s2); //left sphere
    spheres[2] = Sphere(vec3(1.0, 0.0, -1.0), 0.5, s3); //right sphere
    spheres[3] = Sphere(vec3(0.0, -100.5, -1.0), 100.0, s0); //ground sphere
    spheres[4] = Sphere(vec3(-1.0, 0.0, -1.0),  -0.4, s2);

    color col = color(vec3(0.0, 0.0, 0.0));
    init_rand(gl_FragCoord.xy, iTime);

    for(int i = 0; i < 100; i++){
        vec2 uv = (gl_FragCoord.xy + rand2(g_seed)) / iResolution.xy ;
        vec2 uvp = vec2(uv.x * viewport_width, uv.y * viewport_height);
        uvp += vec2(-viewport_width * 0.5, -viewport_height * 0.5);
        vec3 world = vec3(uvp.x, uvp.y, -focal_length);
        vec3 ray_direction = normalize(world - cam.origin);
        ray r = ray(cam.origin, ray_direction);
        col.rgb += ray_color(r, spheres).rgb;
    }

    vec3 colAverage = col.rgb/(100.0);
    colAverage = pow(colAverage, vec3(1.0/2.2));

    if(colAverage.r == 1.0){
        gl_FragColor.r = 1.0;
    }
    else{
        gl_FragColor.r = 0.0;
    }
    if(colAverage.g == 1.0){
        gl_FragColor.g = 1.0;
    }
    else{
        gl_FragColor.g = 0.0;
    }
    if(colAverage.b == 1.0){
        gl_FragColor.b = 1.0;
    }
    else{
        gl_FragColor.b = 0.0;
    }
    gl_FragColor = vec4(colAverage, 1.0);
}
