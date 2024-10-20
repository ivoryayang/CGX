void main()
{
    // Normalized pixel coordinates (from 0 to 1)
    // vec2 uv = gl_FragCoord.xy/iResolution.xy;
    
    // float r = uv.x;
    // float g = uv.y;
    // float b = 0.2;
    
    // vec3 col = vec3(r, g, b);
    // gl_FragColor = vec4(col, 1.0);
    
    float coord_x = gl_FragCoord.x - iResolution.x * 0.5;
    float coord_y = gl_FragCoord.y - iResolution.y * 0.5;
    float radius = 60.0;

    if (coord_x * coord_x + coord_y * coord_y < radius * radius) {
        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    }
    else {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    }
}