#iChannel0 "task11.glsl"

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    vec4 data = texelFetch(iChannel0, ivec2(fragCoord), 0);

    fragColor = vec4(pow(data.rgb / data.w, vec3(1.0 / 2.2)), 1.0);
}
