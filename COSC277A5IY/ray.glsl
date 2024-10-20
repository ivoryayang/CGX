#include "sdf.glsl"

////////////////////////////////////////////////////
// TASK 2 - Write up your ray generation code here:
////////////////////////////////////////////////////
//
// Ray
//
struct ray
{
    vec3 origin;    // This is the origin of the ray
    vec3 direction; // This is the direction the ray is pointing in
};

// TASK 2.1
void compute_camera_frame(vec3 dir, vec3 up, out vec3 u, out vec3 v, out vec3 w)
{

// ################ Edit your code below ################

// TODO
    w = -normalize(dir);
    u = normalize(cross(normalize(up), w));
    v = cross(w, u);
}

// TASK 2.2
ray generate_ray_orthographic(vec2 uv, vec3 e, vec3 u, vec3 v, vec3 w)
{

// ################ Edit your code below ################
    vec3 origin = e + uv.x * u + uv.y * v;
    vec3 direction = -w;

    // return ray(origin, direction);
    return ray(origin, normalize(direction));
}

// TASK 2.3
ray generate_ray_perspective(vec2 uv, vec3 eye, vec3 u, vec3 v, vec3 w, float focal_length)
{

// ################ Edit your code below ################
    vec3 origin = eye;
    vec3 direction = normalize(uv.x * u + uv.y * v - focal_length * w);

    return ray(origin, direction);
}

////////////////////////////////////////////////////
// TASK 3 - Write up your code here:
////////////////////////////////////////////////////

// TASK 3.1
bool ray_march(ray r, float step_size, int max_iter, settings setts, out vec3 hit_loc, out int iters)
{

// ################ Edit your code below ################

    // hit_loc = r.origin + r.direction * (-r.origin.y / r.direction.y);
    // iters = 1;
    // return true;

    // TODO: implement ray marching

    // it should work as follows:
    //
    // while (hit has not occured && iteration < max_iters)
    //     march a distance of step_size forwards
    //     evaluate the sdf
    //     if a collision occurs (SDF < EPSILON)
    //         return hit location and iteration count
    // return false

    float epsilon = 1.e-6;
    float t = 0.;
    vec3 p;

    // Implement ray marching
    for (int i = 0; i < max_iter; ++i)
    {
        // March a distance of step_size forward
        p = r.origin + r.direction * t;
        float dist = world_sdf(p, iTime, setts);

        // Check for collision (SDF < EPSILON)
        if (dist < epsilon)
        {
            hit_loc = p;  // Set hit location
            return true;
        }
        iters = i + 1;          // Set iteration count
        t += step_size;
    }

    // If no hit occurred after max_iter iterations, return false
    return false;

}

// TASK 3.2
bool sphere_tracing(ray r, int max_iter, settings setts, out vec3 hit_loc, out int iters)
{

// ################ Edit your code below ################

    // hit_loc = r.origin + r.direction * (-r.origin.y / r.direction.y);
    // iters = 1;
    // return true;

    // TODO: implement sphere

    // it should work as follows:
    //
    // while (hit has not occured && iteration < max_iters)
    //     set the step size to be the SDF
    //     march step size forwards
    //     if a collision occurs (SDF < EPSILON)
    //         return hit location and iteration count
    // return false

    float epsilon = 1.e-6;
    float t = 0.;
    vec3 p;

    // Implement sphere tracing
    for (int i = 0; i < max_iter; ++i)
    {
        // March a distance of step_size forward
        p = r.origin + r.direction * t;
        float dist = world_sdf(p, iTime, setts);

        // Check for collision (SDF < EPSILON)
        if (dist < epsilon)
        {
            hit_loc = p;  // Set hit location
            return true;
        }
        iters = i + 1;          // Set iteration count
        t += dist;
    }

    // If no hit occurred after max_iter iterations, return false
    return false;

}

////////////////////////////////////////////////////
// TASK 4 - Write up your code here:
////////////////////////////////////////////////////

float map(vec3 p, settings setts)
{
    return world_sdf(p, iTime, setts);
}

// TASK 4.1
vec3 computeNormal(vec3 p, settings setts)
{

// ################ Edit your code below ################
    const float h = 1e-5;
    float sdp = map(p, setts);
    float sdpx = map(p + vec3(h, 0, 0), setts);
    float sdpy = map(p + vec3(0, h, 0), setts);
    float sdpz = map(p + vec3(0, 0, h), setts);

    // Calculate diff along x-axis
    float dx = sdpx - sdp;
    float dy = sdpy - sdp;
    float dz = sdpz - sdp;
    
    return normalize(vec3(dx, dy, dz));
}
