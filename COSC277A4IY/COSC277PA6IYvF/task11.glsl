#include "common.glsl"
#iChannel0 "self"

#define INFINITY 1.0e30 
#define DIFFUSE 0
#define METAL 1
#define DIELECTRIC 2
#define NUMSPHERES 20

// Color struct
struct Col {
    vec3 rgb;
};

// Ray struct
struct Ray {
    vec3 origin;
    vec3 dir;
};

// Camera struct
struct Camera {
    vec3 origin;
    vec3 lower_left_corner;
    vec3 horizontal;
    vec3 vertical;
};

// Material
struct Material {
    vec3 col;
    int type;
    float fuzz;
    float ir;
};

struct hit_record {
    vec3 p;
    vec3 norm;
    float t;
    bool front_face;
};

float schlick(float cos, float idx){
    float r0 = (1.0- idx)/(1.0 + idx);
    r0 = r0*r0;
    return r0 + (1.0 - r0) * pow(1.0- cos, 5.0);
}

// Function to set the normal direction based on the hit point and ray direction
void setFaceNormal(inout hit_record rec, const Ray r, const vec3 outward) {
    // Check ray direction and hit point
    rec.front_face = dot(r.dir, outward) < 0.0;
    // Set normal direction
    rec.norm = rec.front_face ? outward : -outward;
}

// Sphere struct
struct Sphere {
    vec3 center;
    float rad;
    Material mat;
};

// Check if ray hits sphere
bool hit(const Sphere sph, const Ray r, float tmin, float tmax, inout hit_record rec) {
    vec3 oc = r.origin - sph.center;
    float a = dot(r.dir, r.dir);
    float hb = dot(oc, r.dir);
    float c = dot(oc, oc) - sph.rad * sph.rad;
    float discriminant = hb * hb - a * c;
    if (discriminant < 0.0)
        return false;
    float sd = sqrt(discriminant);
    float root = (-hb - sd) / a;
    if (root <= tmin || tmax <= root) {
        root = (-hb + sd) / a;
        if (root <= tmin || tmax <= root)
            return false;
    }
    rec.t = root;
    rec.p = r.origin + rec.t * r.dir;
    vec3 outward = (rec.p - sph.center) / sph.rad;
    setFaceNormal(rec, r, outward);
    return true;
}

// Computed scattered ray direction
vec3 scatter(const Material mat, const vec3 dir, const vec3 norm, inout vec3 att, bool front_face) {
    vec3 scattDir;
    if (mat.type == DIFFUSE) {
        att *= mat.col; // Update attenuation with material color
        scattDir = norm + random_in_unit_sphere(g_seed); // Diffuse scattering
    } else if (mat.type == METAL) {
        att *= mat.col; // Update attenuation with material color
        scattDir = reflect(dir, norm) + mat.fuzz * random_in_unit_sphere(g_seed); // Metal reflection
    }
    else if (mat.type == DIELECTRIC){
        float ratio;
        float costheta;
        vec3 outnorm;
        if (front_face){
            ratio = 1.0/mat.ir;
        }
        else{
            ratio = mat.ir;
        }
        costheta = dot(-dir, norm);
        float sintheta = sqrt(1.0 - costheta * costheta);
        bool cantrefract = ratio * sintheta > 1.0;
        if (cantrefract || schlick(costheta, mat.ir)>rand1(g_seed)){
            scattDir = reflect(dir, norm);
        }
       else{ scattDir = refract(dir, norm, ratio);
}
    }
    return scattDir;
}
// Function to compute color contribution of a ray
Col rayColor(const Ray r, const Sphere sphs[NUMSPHERES]) {
    Ray rt = r;
    vec3 att = vec3(1.0, 1.0, 1.0); // Attenuation initialized to full intensity
    for(int i = 0; i < MAX_RECURSION; i++) { // Maximum recursion depth loop
        float closeT = INFINITY;
        vec3 closeN;
        vec3 closeP;
        bool hitAny = false;
        vec3 newDir;
        int closeIdx = 0;
        bool hitFront;
        // Check for intersection with each sphere
        for (int j = 0; j < NUMSPHERES; ++j) {
            hit_record rec;
            if (hit(sphs[j], rt, 0.00001, closeT, rec)) { // Check for intersection
                hitAny = true;
                closeT = rec.t;
                closeN = rec.norm;
                closeP = rec.p;
                hitFront = rec.front_face;
                closeIdx = j;
            }
        }
        if(hitAny){
            newDir = scatter(sphs[closeIdx].mat, rt.dir, closeN, att, hitFront); // Compute new ray direction
            rt = Ray(closeP, normalize(newDir)); // Update ray with new direction
        }
        if (!hitAny ) {
            vec3 unitDir = normalize(rt.dir);
            float a = 0.5 * (unitDir.y + 1.0);
            Col white = Col(vec3(1.0, 1.0, 1.0));
            Col blue = Col(vec3(0.5, 0.7, 1.0));
            return Col(att.rgb * (vec3((1.0 - a) * white.rgb + a * blue.rgb))); // Background color
        }
    }
    return Col(att); // Return accumulated color
}
void main() {
    vec3 lookfrom = vec3(3.0, 3.0, 2.0);
    vec3 lookat = vec3(0.0, 0.0, -1.0);
    vec3 vup = vec3(0.0, 1.0, 0.0);
    float focusdist = sqrt(27.0);
    float defocus_angle =10.0;
    float aspectRatio = iResolution.x / iResolution.y;
    // FOV to radians
    float vfovRadians = radians(90.0);
    float h = tan(vfovRadians / 2.0);
    float viewportHeight = 2.0 * h * focusdist;
    float viewportWidth = aspectRatio * viewportHeight;
    vec3 w = normalize(lookfrom - lookat);
    vec3 u = normalize(cross(vup, w));
    vec3 v = cross(w, u);
    vec3 horizontal = viewportWidth * u;
    vec3 vertical = viewportHeight * v;
    vec3 lowerLeftCorner = lookfrom - horizontal / 2.0 - vertical / 2.0 - w * focusdist;
    float defocus_radius = focusdist * tan(radians(defocus_angle)/2.0);
    vec3 defocus_disk_u = u * defocus_radius;
    vec3 defocus_disk_v = v * defocus_radius;
    vec3 center = lookfrom;
    Camera cam = Camera(lookfrom, lowerLeftCorner, horizontal, vertical);

    // Define materials
    Material s0 = Material(vec3(0.8, 0.8, 0.0), 0, 0.0, 0.0); // Yellow (Diffuse)
    Material s1 = Material(vec3(0.1, 0.2, 0.5), 0, 0.0, 0.0 ); // Blue (Diffuse)
    Material s2 = Material(vec3(0.8, 0.8, 0.8), 2, 0.0, 1.5); // Glass (Dielectric)
    Material s3 = Material(vec3(0.8, 0.6, 0.2), 1, 0.2, 0.0); // Gold (Metal)

    // Define spheres
    Sphere spheres[NUMSPHERES];
    spheres[0] = Sphere(vec3(0.0, 0.0, -1.0), 0.5, s1); // Center
    spheres[1] = Sphere(vec3(-1.0, 0.0, -1.0), 0.5, s2); // Left
    spheres[2] = Sphere(vec3(1.0, 0.0, -1.0), 0.5, s3); // Right
    spheres[3] = Sphere(vec3(0.0, -100.5, -1.0), 100.0, s0); // Ground
    spheres[4] = Sphere(vec3(-1.0, 0.0, -1.0), -0.45, s2); // Left

    // Task 11: Add more spheres
    // Starting index from 5 because of previous 4 spheres
    int index = 5;
    // Create 9 spheres: 3x3 = 9
    for (int a = -3; a < 3; a++) {
        for (int b = -3; b < 3; b++) {
            if(index >= NUMSPHERES) break;

            float choose_mat = rand1(g_seed);
            vec3 center = vec3(float(a) *1.3 + 0.9*rand1(g_seed), 0.2, float(b) * 1.3 + 0.9*rand1(g_seed));

                Material rand_mat;
                if (choose_mat < 0.3) {
                    // Diffuse effect
                    Col albedo;
                    albedo.rgb = vec3(rand1(g_seed), rand1(g_seed), rand1(g_seed));
                    Material sphere_material = Material(albedo.rgb, DIFFUSE, 0.0, 0.0);
                    float rad = rand1(g_seed);
                    spheres[index] = Sphere(center, 0.05, sphere_material);
                    spheres[index].rad = rad;
                }
                else if (choose_mat < 0.5) {
                // Metal effect
                    Col albedo;
                    float fuzz = rand1(g_seed);
                    albedo.rgb = vec3(rand1(g_seed), rand1(g_seed), rand1(g_seed));
                    Material sphere_material = Material(albedo.rgb, METAL, 0.2, 0.0);
                    sphere_material.fuzz = fuzz;
                    float rad = rand1(g_seed);
                    spheres[index] = Sphere(center, 0.2, sphere_material);
                    spheres[index].rad = rad;

                } else {
                // Glass effect
                    Col albedo;
                    float ir = rand1(g_seed);
                    albedo.rgb = vec3(rand1(g_seed), rand1(g_seed), rand1(g_seed));
                    Material sphere_material = Material(albedo.rgb, DIELECTRIC, 0.0, 1.5);
                    float rad = rand1(g_seed);
                    spheres[index] = Sphere(center, 0.3, sphere_material);
                    spheres[index].rad = rad;
                }
                index++;
            }
    }

    // Init color to black
    Col col = Col(vec3(0.0));
    // Init random number generator
    init_rand(gl_FragCoord.xy, iTime);

    // Task 10: Remove the 100 iteration for loop
    // Calculate normalized screen coordinates (uv) for current fragment
    vec2 uv = (gl_FragCoord.xy) / iResolution.xy;
    // Generate a random point in the unit disk
    vec2 p = random_in_unit_disk(g_seed);
    // Calculate the origin of the ray, introducing defocus for depth of field
    vec3 org = center + (p.x * defocus_disk_u) + (p.y * defocus_disk_v);

    // Direction of ray
    vec3 rayDir = normalize(cam.lower_left_corner + uv.x * cam.horizontal + uv.y * cam.vertical - org);
    Ray r = Ray(org, rayDir);
    col.rgb = rayColor(r, spheres).rgb;

    // Accumulate color from the texture at the current fragment's UV coordinates
    vec3 colAv = col.rgb;
    colAv += texture ( iChannel0, uv ).xyz;

    // Set the frame number (alpha channel) based on the texture at the current fragment's UV coordinates
    float frameNumber = 1.0;
    frameNumber += texture ( iChannel0, uv ).a;
    gl_FragColor = vec4(colAv, frameNumber);
}