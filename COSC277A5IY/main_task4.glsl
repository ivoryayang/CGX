#include "common.glsl"
#include "ray.glsl"

#iChannel0 "file://environment_maps/Uffizi_{}.jpg"
#iChannel0::Type "CubeMap"

// shade mode
#define GRID 0
#define COST 1
#define NORMAL 2
#define DIFFUSE_POINT 3
#define ENVIRONMENT_MAP 4

// settings struct found on line 152 in sdf.glsl
// variable order = settings(sdf_func, shade_mode, marching_type, task_world, animation_speed)
settings render_settings = settings(NONE, NORMAL, NONE, TASK4, 0.35);

#define PROJECTION_ORTHOGRAPHIC 0
#define PROJECTION_PERSPECTIVE 1

int projection_func = PROJECTION_PERSPECTIVE;

int cost_norm = 200;

vec3 shade(ray r, int iters, settings setts)
{
    vec3 p = r.origin;
    vec3 d = r.direction;

    if (setts.shade_mode == GRID)
    {
        float res = 0.2;
        float one = abs(mod(p.x, res) - res / 2.0);
        float two = abs(mod(p.y, res) - res / 2.0);
        float three = abs(mod(p.z, res) - res / 2.0);
        float interp = min(one, min(two, three)) / res;

        return mix(vec3(0.2, 0.5, 1.0), vec3(0.1, 0.1, 0.1), smoothstep(0.0, 0.05, abs(interp)));
    }
    else if (setts.shade_mode == COST)
    {
        return vec3(float(iters) / float(cost_norm));
    }
    else if (setts.shade_mode == NORMAL)
    {

// ################ Edit your code below ################

        // TASK 4.1

        return (computeNormal(p, setts) + vec3(1.0))*0.5;
    }
    else if (setts.shade_mode == DIFFUSE_POINT)
    {
        vec3 light_pos = vec3(0.0, 5.0, 0.0);
        vec3 light_intensity = vec3(5.0);
        vec3 surface_color = vec3(0.5);


// ################ Edit your code below ################

        //// TASK 4.2

        // product between the surface color, light intensity,
        // inverse squared distance to the light source,
        // And the cosine between your surface normal and the direction to the light source.
        vec3 result = vec3(1.0);
        result *= surface_color;
        result *= light_intensity;

        // Distance to the light source
        float distLS = length(p-light_pos);
        // Inverse squared distance
        float invdistLS = 1.0 / (distLS * distLS);
        result *= invdistLS;

        // Surface normal
        vec3 normal = computeNormal(p, setts);

        // Dir to light source
        vec3 dirLS = normalize(light_pos-p);

        // dot product of the vectors
        float cos = dot(dirLS, normal);

        result *= cos;
        return result;

    }
    else if (setts.shade_mode == ENVIRONMENT_MAP)
    {

// ################ Edit your code below ################
        //// TASK 4.3
        vec3 norm = normalize(computeNormal(p, setts));
        vec3 ref = reflect(d, norm);
        vec3 col = texture(iChannel0, ref).xyz;
        return col;
    }
    else
    {
        return vec3(0.0);
    }
    return vec3(0.0);
}

//////////////////////////////////////////////////////////////////////////////////
// we will be replacing all of the code below with our own method(s). All of    //
// the changes you make will be disgarded. But feel free to change the main     //
// method to help debug your code.                                              //
//////////////////////////////////////////////////////////////////////////////////

vec3 render(settings setts)
{
    vec2 p = (2.0 * gl_FragCoord.xy - iResolution.xy) / iResolution.y;

    if (p.y < -0.95)
    {
        float val = cos(iTime * setts.anim_speed);
        return shade_progress_bar(p, iResolution.xy, val);
    }

    float aspect = iResolution.x / iResolution.y;
    vec2 uv = gl_FragCoord.xy / iResolution.xy - 0.5;
    uv.x *= aspect;

    // Rotate the camera
    vec3 eye = vec3(-3.0 * cos(iTime * 0.2), 2.0 + 0.5 * sin(iTime * 0.1), -3.0 * sin(iTime * 0.2));
    vec3 dir = vec3(0.0, 0.0, 0.0) - eye;
    vec3 up = vec3(0, 1, 0);

    float focal_length = 2.;

    vec3 u, v, w;
    compute_camera_frame(dir, up, u, v, w);

    ray r;
    switch (projection_func)
    {
    case PROJECTION_ORTHOGRAPHIC:
        r = generate_ray_orthographic(uv, eye, u, v, w);
        break;

    case PROJECTION_PERSPECTIVE:
        r = generate_ray_perspective(uv, eye, u, v, w, focal_length);
        break;
    }

    int max_iter = 1000;

    vec3 col = vec3(0.0);

    vec3 hit_loc;
    int iters;
    bool hit;

    if (sphere_tracing(r, max_iter, setts, hit_loc, iters))
    {
        r.origin = hit_loc;
        col = shade(r, iters, setts);
    }

    return pow(col, vec3(1.0 / 2.2));
}

void main()
{
    gl_FragColor = vec4(render(render_settings), 1.0);
}