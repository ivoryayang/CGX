#define SPHERE 0
#define BOX 1
#define CYLINDER 3
#define CONE 5
#define NONE 4

////////////////////////////////////////////////////
// TASK 1 - Write up your SDF code here:
////////////////////////////////////////////////////

// returns the signed distance to a sphere from position p
float sdSphere(vec3 p, float r)
{
    return length(p) - r;
}

//
// Task 1.1
//
// Returns the signed distance to a line segment.
//
// p is the position you are evaluating the distance to.
// a and b are the end points of your line.
//
float sdLine(in vec2 p, in vec2 a, in vec2 b)
{

// ################ Edit your code below ################
    vec2 ba = b - a;
    vec2 pa = p - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * h);
}


//
// Task 1.2
//
// Returns the signed distance from position p to an axis-aligned box centered at the origin with half-length,
// half-height, and half-width specified by half_bounds
//
float sdBox(vec3 p, vec3 half_bounds)
{

// ################ Edit your code below ################
    vec3 d = abs(p) - half_bounds;
    float insideDistance = min(max(d.x, max(d.y, d.z)), 0.0);
    float outsideDistance = length(max(d, 0.0));
    return insideDistance + outsideDistance;
}

//
// Task 1.3
//
// Returns the signed distance from position p to a cylinder or radius r with an axis connecting the two points a and b.
//
float sdCylinder(vec3 p, vec3 a, vec3 b, float r)
{

// ################ Edit your code below ################
    vec3 ab = b - a;
    float height = length(ab);
    vec3 pa = p - a;
    float t = dot(pa, ab) / dot(ab, ab);
    vec3 proj = a + t * ab;
    // Distance from point to side of cylinder
    float dist_circ = length(p - proj) - r;
    // Distance from point to top of cylinder
    float y = (abs(t - 0.5) - 0.5) * length(ab);
    // Outside means
    float outside = length(vec2(max(dist_circ, 0.), max(y, 0.)));
    // Inside means
    float inside = min(max(dist_circ, y), 0.);
    return inside + outside;
}


//
// Task 1.4
//
// Returns the signed distance from position p to a cone with axis connecting points a and b and (ra, rb) being the
// radii at a and b respectively.
//
float sdCone(vec3 p, vec3 a, vec3 b, float ra, float rb)
{

// ################ Edit your code below ################
    float rba  = rb-ra;
    float baba = dot(b-a,b-a);
    float papa = dot(p-a,p-a);
    float paba = dot(p-a,b-a)/baba;
    float x = sqrt( papa - paba*paba*baba );
    float cax = max(0.0,x-((paba<0.5)?ra:rb));
    float cay = abs(paba-0.5)-0.5;
    float k = rba*rba + baba;
    float f = clamp( (rba*(x-ra)+paba*baba)/k, 0.0, 1.0 );
    float cbx = x-ra - f*rba;
    float cby = paba - f;
    float s = (cbx<0.0 && cay<0.0) ? -1.0 : 1.0;
    return s*sqrt( min(cax*cax + cay*cay*baba,cbx*cbx + cby*cby*baba) );
}


//
// Task 1.5
float opSmoothUnion(float d1, float d2, float k)
{

// ################ Edit your code below ################
    float h = max(k - abs(d1-d2), 0.);
    return min(d1, d2) - (h * h) / (4. * k);
}

// Task 1.6
float opSmoothSubtraction(float d1, float d2, float k)
{

// ################ Edit your code below ################
    float h = max(k - abs(d1 + d2), 0.);
    return max(-d1, d2) + (h * h) / (4. * k);
}

// Task 1.7
float opSmoothIntersection(float d1, float d2, float k)
{

// ################ Edit your code below ################
    float h = max(k - abs(d1 - d2), 0.);
    return max(d1, d2) + (h * h) / (4. * k);
}

// Task 1.8
float opRound(float d, float iso)
{

// ################ Edit your code below ################
    float edge = d - iso;
    return edge;
}

////////////////////////////////////////////////////
// FOR TASK 3 & 4 & 5
////////////////////////////////////////////////////

#define TASK3 3
#define TASK4 4
#define TASK5 5

//
// Render Settings
//
struct settings
{
    int sdf_func;      // Which primitive is being visualized (e.g. SPHERE, BOX, etc.)
    int shade_mode;    // How the primiive is being visualized (GRID or COST)
    int marching_type; // Should we use RAY_MARCHING or SPHERE_TRACING?
    int task_world;    // Which task is being rendered (TASK3 or TASK4)?
    float anim_speed;  // Specifies the animation speed
};

// returns the signed distance to an infinite plane with a specific y value
float sdPlane(vec3 p, float z)
{
    return p.y - z;
}

float world_sdf(vec3 p, float time, settings setts)
{
    if (setts.task_world == TASK3)
    {
        if ((setts.sdf_func == SPHERE) || (setts.sdf_func == NONE))
        {
            return min(sdSphere(p - vec3(0.f, 0.25 * cos(setts.anim_speed * time), 0.f), 0.4f), sdPlane(p, 0.f));
        }
        if (setts.sdf_func == BOX)
        {
            return min(sdBox(p - vec3(0.f, 0.25 * cos(setts.anim_speed * time), 0.f), vec3(0.4f)), sdPlane(p, 0.f));
        }
        if (setts.sdf_func == CYLINDER)
        {
            return min(sdCylinder(p - vec3(0.f, 0.25 * cos(setts.anim_speed * time), 0.f), vec3(0.0f, -0.4f, 0.f),
                                  vec3(0.f, 0.4f, 0.f), 0.2f),
                       sdPlane(p, 0.f));
        }
        if (setts.sdf_func == CONE)
        {
            return min(sdCone(p - vec3(0.f, 0.25 * cos(setts.anim_speed * time), 0.f), vec3(-0.4f, 0.0f, 0.f),
                              vec3(0.4f, 0.0f, 0.f), 0.1f, 0.6f),
                       sdPlane(p, 0.f));
        }
    }

    if (setts.task_world == TASK4)
    {
        float dist = 100000.0;

        dist = sdPlane(p.xyz, -0.3);
        dist = opSmoothUnion(dist, sdSphere(p - vec3(0.f, 0.25 * cos(setts.anim_speed * time), 0.f), 0.4f), 0.1);
        dist = opSmoothUnion(
            dist, sdSphere(p - vec3(sin(time), 0.25 * cos(setts.anim_speed * time * 2. + 0.2), cos(time)), 0.2f), 0.01);
        dist = opSmoothSubtraction(sdBox(p - vec3(0.f, 0.25, 0.f), 0.1 * vec3(2. + cos(time))), dist, 0.2);
        dist = opSmoothUnion(
            dist, sdSphere(p - vec3(sin(-time), 0.25 * cos(setts.anim_speed * time * 25. + 0.2), cos(-time)), 0.2f),
            0.1);

        return dist;
    }

    // Task 5 Additional
    if (setts.task_world == TASK5) 
    {
        float dist = 100000.0;

        float width = 0.1;
        float height1 = 0.5;
        float height2 = 0.1;
        float dist0 = sdPlane(p.xyz, -0.3);
        vec3 a = vec3(0.0, 0.0, width);
        vec3 b = vec3(0.0, height1, width);
        float dist1 = sdCylinder(p.xyz,a,b, 0.3);
        vec3 c = vec3(0.0, height1+height2, width);
        float dist2 = sdCone(p,b,c,0.3,0.15);
        dist = min(dist0, dist1);
        dist = min(dist, dist2);
        vec3 d = vec3(0.0, height1+height2+height2, width);
        float dist3 = sdCylinder(p.xyz,c,d, 0.15);
        dist = min(dist, dist3);

        // p is location, origin, xyz
        // Last component is radius of sphere

        // Sphere 1
        float sphere = sdSphere(p+vec3(0.8,0.0,0.0), 0.3);
        dist = min(dist, sphere);

        // Sphere 2
        float sphere2 = sdSphere(p+vec3(0.0,0.0,-0.3), 0.07);
        dist = min(dist, sphere2);

        // Sphere 3
        float sphere3 = sdSphere(p+vec3(0.0,0.0,0.4), 0.05);
        dist = min(dist, sphere3);

        // Sphere 4
        float sphere4 = sdSphere(p- vec3(0.5*sin(time), 0.2, 0.5*cos(time)), 0.09);
        dist = min(dist, sphere4);
        
        return dist;
    }

    return 1.f;
}

vec3 world_color(vec3 p, float time, settings setts) {
    if (setts.task_world == TASK5) 
    {
        float dist = 100000.0;

        float width = 0.1;
        float height1 = 0.5;
        float height2 = 0.1;
        float dist0 = sdPlane(p.xyz, -0.3);
        vec3 a = vec3(0.0, 0.0, width);
        vec3 b = vec3(0.0, height1, width);
        float dist1 = sdCylinder(p.xyz,a,b, 0.3);
        vec3 c = vec3(0.0, height1+height2, width);
        float dist2 = sdCone(p,b,c,0.3,0.15);
        dist = min(dist0, dist1);
        dist = min(dist, dist2);
        vec3 d = vec3(0.0, height1+height2+height2, width);
        float dist3 = sdCylinder(p.xyz,c,d, 0.15);
        dist = min(dist, dist3);

        // Sphere 1
        float sphere = sdSphere(p+vec3(0.8,0.0,0.0), 0.3);
        dist = min(dist, sphere);

        // Sphere 2
        float sphere2 = sdSphere(p+vec3(0.9,0.0,-0.2), 0.1);
        dist = min(dist, sphere2);

        // Sphere 3
        float sphere3 = sdSphere(p+vec3(0.0,0.0,0.4), 0.05);
        dist = min(dist, sphere3);

        // Sphere 4
        float sphere4 = sdSphere(p- vec3(0.5*sin(time), 0.2, 0.5*cos(time)), 0.09);
        dist = min(dist, sphere4);
        
        // Pale pink for plane
        if (dist0 == dist) {
            return vec3(1.0,0.8,0.8);
        }
        // Pink shade for first cylinder
        if (dist1 == dist) {
            return vec3(1.0,0.6,1.0);
        }
        // Light pink for cone
        if (dist2 == dist) {
            return vec3(1.0,0.7,0.8);
        }
        // Purple-ish for second cylinder
        if (dist3 == dist) {
            return vec3(0.6,0.0,0.9);
        }
        // Medium pink for sphere 1
        if (sphere == dist) {
            return vec3(1.0,0.3,0.6);
        } 
        // Different shade of pink for sphere 2
        if (sphere2 == dist) {
            return vec3(1.0,0.3,0.6);
        } 
        // Different shade of pink for sphere 3
        if (sphere3 == dist) {
            return vec3(1.0,0.75,0.9);
        }
        // Red for the faster inner sphere
        if (sphere4 == dist) {
            return vec3(1.0,0.0,0.0);
        } 
        return vec3(1.0,0.0,0.0);
    }
}