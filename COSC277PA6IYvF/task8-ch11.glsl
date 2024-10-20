#include "common.glsl"

#define INFINITY 1.0e30
#define DIFFUSE 0
#define METAL 1
#define DIELECTRIC 2


struct Col {
    vec3 rgb; // Color struct
};

struct Ray {
    vec3 orig; // Origin of the ray
    vec3 dir;  // Direction of the ray
};

struct Cam {
    vec3 orig; // Camera origin
    vec3 llc;  // Lower left corner of the viewport
    vec3 hor;  // Horizontal vector of the viewport
    vec3 vert; // Vertical vector of the viewport
};

struct Mat {
    vec3 col;  // Material color
    int type;  // Material type
    float fuzz; // Fuzziness of material (for metal)
    float ir; // Index of refraction
};

struct HitRec {
    vec3 p;    // Point of intersection
    vec3 norm; // Surface normal at intersection
    float t;   // Parameter along the ray
    bool front; // Indicates if the ray hit the front face of an object
};


// Combined reflectance
float schlick(float cos, float idx){
    float r0 = (1.0- idx)/(1.0 + idx); 
    r0 = r0*r0; 
    return r0 + (1.0 - r0) * pow(1.0- cos, 5.0); 
}

// Function to set the normal direction based on the hit point and ray direction
void setFaceNormal(inout HitRec rec, const Ray r, const vec3 outward) {
    rec.front = dot(r.dir, outward) < 0.0; // Determine if the ray hit the front face
    rec.norm = rec.front ? outward : -outward; // Set the normal direction accordingly
}

struct Sphere {
    vec3 center; // Sphere center
    float rad;   // Sphere radius
    Mat mat;     // Material of the sphere
};

// Function to check for ray-sphere intersection
bool hit(const Sphere sph, const Ray r, float tmin, float tmax, inout HitRec rec) {
    vec3 oc = r.orig - sph.center;
    float a = dot(r.dir, r.dir);
    float hb = dot(oc, r.dir);
    float c = dot(oc, oc) - sph.rad * sph.rad;
    float disc = hb * hb - a * c;
    if (disc < 0.0)
        return false;
    float sd = sqrt(disc);
    float root = (-hb - sd) / a;
    if (root <= tmin || tmax <= root) {
        root = (-hb + sd) / a;
        if (root <= tmin || tmax <= root)
            return false;
    }
    rec.t = root;
    rec.p = r.orig + rec.t * r.dir;
    vec3 outward = (rec.p - sph.center) / sph.rad;
    setFaceNormal(rec, r, outward);
    return true;
}

// Function to compute scattered ray direction based on material properties
vec3 scatter(const Mat mat, const vec3 dir, const vec3 norm, inout vec3 att, bool front) {
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
        if (front){
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
Col rayColor(const Ray r, const Sphere sphs[5]) {
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
        for (int j = 0; j < 5; ++j) {
            HitRec rec;
            if (hit(sphs[j], rt, 0.00001, closeT, rec)) { // Check for intersection
                hitAny = true;
                closeT = rec.t;
                closeN = rec.norm;
                closeP = rec.p;
                hitFront = rec.front;
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
    vec3 lookfrom = vec3(-2.0, 2.0, 1.0);
    vec3 lookat = vec3(0.0, 0.0, -1.0);
    vec3 vup = vec3(0.0, 1.0, 0.0);

    float focallen = length(lookfrom - lookat);

    float aspectRatio = iResolution.x / iResolution.y;
    float vfovRadians = radians(30.0); // Convert FOV to radians
    float h = tan(vfovRadians / 2.0);
    float viewportHeight = 2.0 * h * focallen;
    float viewportWidth = aspectRatio * viewportHeight;

    vec3 w = normalize(lookfrom - lookat);
    vec3 u = normalize(cross(vup, w));
    vec3 v = cross(w, u);

    vec3 horizontal = viewportWidth * u;
    vec3 vertical = viewportHeight * v;
    vec3 lowerLeftCorner = lookfrom - horizontal / 2.0 - vertical / 2.0 - w * focallen;

    Cam cam = Cam(lookfrom, lowerLeftCorner, horizontal, vertical);


    // Define materials
    Mat s0 = Mat(vec3(0.8, 0.8, 0.0), 0, 0.0, 0.0); // Yellow, diffuse
    Mat s1 = Mat(vec3(0.1, 0.2, 0.5), 0, 0.0, 0.0 ); // Blue, diffuse
    Mat s2 = Mat(vec3(0.8, 0.8, 0.8), 2, 0.0, 1.5); // Glass dielectric
    Mat s3 = Mat(vec3(0.8, 0.6, 0.2), 1, 0.2, 0.0); // Gold metal
    
    Sphere spheres[5];
    // Define spheres
    spheres[0] = Sphere(vec3(0.0, 0.0, -1.0), 0.5, s1); // Center sphere
    spheres[1] = Sphere(vec3(-1.0, 0.0, -1.0), 0.5, s2); // Left sphere
    spheres[2] = Sphere(vec3(1.0, 0.0, -1.0), 0.5, s3); // Right sphere
    spheres[3] = Sphere(vec3(0.0, -100.5, -1.0), 100.0, s0); // Ground sphere
    spheres[4] = Sphere(vec3(-1.0, 0.0, -1.0), -0.45, s2); // Left sphere

    Col col = Col(vec3(0.0)); // Initialize accumulated color to black
    init_rand(gl_FragCoord.xy, iTime); // Initialize random number generator

    for (int i = 0; i < 100; i++) {
        vec2 uv = (gl_FragCoord.xy + rand2(g_seed)) / iResolution.xy;
        vec3 rayDir = normalize(cam.llc + uv.x * cam.hor + uv.y * cam.vert - cam.orig);
        Ray r = Ray(cam.orig, rayDir);
        col.rgb += rayColor(r, spheres).rgb;
    }

    vec3 colAv = col.rgb / 100.0;
    colAv = pow(colAv, vec3(1.0 / 2.2)); // Apply gamma correction

    gl_FragColor = vec4(colAv, 1.0); // Set final output color

}
