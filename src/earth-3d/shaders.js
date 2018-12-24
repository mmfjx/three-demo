/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Full-screen textured quad shader
 */

const CopyShader = {

    uniforms: {

        'tDiffuse': { value: null },
        'opacity': { value: 1.0 }

    },

    vertexShader: [

        'varying vec2 vUv;',

        'void main() {',

        'vUv = uv;',
        'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

        '}'

    ].join('\n'),

    fragmentShader: [

        'uniform float opacity;',

        'uniform sampler2D tDiffuse;',

        'varying vec2 vUv;',

        'void main() {',

        'vec4 texel = texture2D( tDiffuse, vUv );',
        'gl_FragColor = opacity * texel;',

        '}'

    ].join('\n')

};

/**
 * @author felixturner / http://airtight.cc/
 *
 * RGB Shift Shader
 * Shifts red and blue channels from center in opposite directions
 * Ported from http://kriss.cx/tom/2009/05/rgb-shift/
 * by Tom Butterworth / http://kriss.cx/tom/
 *
 * amount: shift distance (1 is width of input)
 * angle: shift angle in radians
 */

const RGBShiftShader = {

    uniforms: {

        'tDiffuse': { value: null },
        'amount': { value: 0.005 },
        'angle': { value: 0.0 }

    },

    vertexShader: [

        'varying vec2 vUv;',

        'void main() {',

        'vUv = uv;',
        'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

        '}'

    ].join('\n'),

    fragmentShader: [

        'uniform sampler2D tDiffuse;',
        'uniform float amount;',
        'uniform float angle;',

        'varying vec2 vUv;',

        'void main() {',

        // 'vec2 offset = amount * vec2( cos(angle), sin(angle));',
        'vec2 offset = amount * vec2( vUv.x - .5, vUv.y - .5 );',
        'vec4 cr = texture2D(tDiffuse, vUv + offset);',
        'vec4 cga = texture2D(tDiffuse, vUv);',
        'vec4 cb = texture2D(tDiffuse, vUv - offset);',
        'gl_FragColor = vec4(cr.r, cga.g, cb.b, cga.a);',

        '}'

    ].join('\n')

};

const AlphaColorShader = {

    uniforms: {

        color: { value: new THREE.Color(0xffffff) },
        fogType: { value: 1 },
        fogNear: { value: 10.0 },
        fogFar: { value: 30.0 }
    },

    vertexShader: [
        'attribute float alpha;',
        'varying float vAlpha;',
        'void main() {',
        'vAlpha = alpha;',
        'vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );',
        'gl_PointSize = 4.0;',
        'gl_Position = projectionMatrix * mvPosition;',
        '}',

    ].join('\n'),

    fragmentShader: [
        // 'uniform vec3 color;',
        //      'varying float vAlpha;',
        //      'void main() {',

        //          'gl_FragColor = vec4( color, vAlpha * ( gl_FragCoord.z ) );',


        //      '}'

        'uniform vec3 color;',
        'uniform int fogType;',
        'uniform float fogNear;',
        'uniform float fogFar;',

        'varying float vAlpha;',

        'void main() {',
        // vec4 texture = texture2D( map, vUV );
        // if ( texture.a < alphaTest ) discard;
        // gl_FragColor = vec4( color * texture.xyz, texture.a * opacity );

        'vec3 fogColor = vec3(0,0,0);',

        'gl_FragColor = vec4( color, vAlpha * ( gl_FragCoord.z ) );',
        'if ( fogType > 0 ) {',
        'float depth = gl_FragCoord.z / gl_FragCoord.w;',
        'float fogFactor = 0.0;',
        'if ( fogType == 1 ) {',
        'fogFactor = smoothstep( fogNear, fogFar, depth );',
        '} else {',
        // 'const float LOG2 = 1.442695;',
        // 'float fogFactor = exp2( - fogDensity * fogDensity * depth * depth * LOG2 );',
        // 'fogFactor = 1.0 - clamp( fogFactor, 0.0, 1.0 );',
        '}',
        'gl_FragColor = mix( gl_FragColor, vec4( fogColor, gl_FragColor.w ), fogFactor );',
        '}',
        '}'

    ].join('\n'),

    transparent: true

};

/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Simple fake tilt-shift effect, modulating two pass Gaussian blur (see above) by vertical position
 *
 * - 9 samples per pass
 * - standard deviation 2.7
 * - 'h' and 'v' parameters should be set to '1 / width' and '1 / height'
 * - 'r' parameter control where 'focused' horizontal line lies
 */

const VerticalTiltShiftShader = {

    uniforms: {

        'tDiffuse': { value: null },
        'v': { value: 1.0 / 512.0 },
        'r': { value: 0.35 }

    },

    vertexShader: [

        '\
        varying vec2 vUv;\
        \
        void main() {\
            \
            vUv = uv;\
            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\
            \
        }'

    ].join('\n'),

    fragmentShader: [

        'uniform sampler2D tDiffuse;\
        uniform float v;\
        uniform float r;\
        \
        varying vec2 vUv;\
        \
        void main() {\
            \
            vec4 sum = vec4( 0.0 );\
            \
            float vv = v * abs( vUv.y - 0.5 ) * 1.5;\
            \
            sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 4.0 * vv ) ) * 0.051;\
            sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 3.0 * vv ) ) * 0.0918;\
            sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 2.0 * vv ) ) * 0.12245;\
            sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 1.0 * vv ) ) * 0.1531;\
            sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y ) ) * 0.1633;\
            sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 1.0 * vv ) ) * 0.1531;\
            sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 2.0 * vv ) ) * 0.12245;\
            sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 3.0 * vv ) ) * 0.0918;\
            sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 4.0 * vv ) ) * 0.051;\
            \
            gl_FragColor = sum;\
            \
        }'

    ].join('\n')

};

/**
 * @author alteredq / http://alteredqualia.com/
 * @author davidedc / http://www.sketchpatch.net/
 *
 * NVIDIA FXAA by Timothy Lottes
 * http://timothylottes.blogspot.com/2011/06/fxaa3-source-released.html
 * - WebGL port by @supereggbert
 * http://www.glge.org/demos/fxaa/
 */

const FXAAShader = {

    uniforms: {

        'tDiffuse': { value: null },
        'resolution': { value: new THREE.Vector2(1 / 1024, 1 / 512) }

    },

    vertexShader: [

        'void main() {',

        'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

        '}'

    ].join('\n'),

    fragmentShader: [

        'uniform sampler2D tDiffuse;',
        'uniform vec2 resolution;',

        '#define FXAA_REDUCE_MIN   (1.0/128.0)',
        '#define FXAA_REDUCE_MUL   (1.0/8.0)',
        '#define FXAA_SPAN_MAX     8.0',

        'void main() {',

        'vec3 rgbNW = texture2D( tDiffuse, ( gl_FragCoord.xy + vec2( -1.0, -1.0 ) ) * resolution ).xyz;',
        'vec3 rgbNE = texture2D( tDiffuse, ( gl_FragCoord.xy + vec2( 1.0, -1.0 ) ) * resolution ).xyz;',
        'vec3 rgbSW = texture2D( tDiffuse, ( gl_FragCoord.xy + vec2( -1.0, 1.0 ) ) * resolution ).xyz;',
        'vec3 rgbSE = texture2D( tDiffuse, ( gl_FragCoord.xy + vec2( 1.0, 1.0 ) ) * resolution ).xyz;',
        'vec4 rgbaM  = texture2D( tDiffuse,  gl_FragCoord.xy  * resolution );',
        'vec3 rgbM  = rgbaM.xyz;',
        'vec3 luma = vec3( 0.299, 0.587, 0.114 );',

        'float lumaNW = dot( rgbNW, luma );',
        'float lumaNE = dot( rgbNE, luma );',
        'float lumaSW = dot( rgbSW, luma );',
        'float lumaSE = dot( rgbSE, luma );',
        'float lumaM  = dot( rgbM,  luma );',
        'float lumaMin = min( lumaM, min( min( lumaNW, lumaNE ), min( lumaSW, lumaSE ) ) );',
        'float lumaMax = max( lumaM, max( max( lumaNW, lumaNE) , max( lumaSW, lumaSE ) ) );',

        'vec2 dir;',
        'dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));',
        'dir.y =  ((lumaNW + lumaSW) - (lumaNE + lumaSE));',

        'float dirReduce = max( ( lumaNW + lumaNE + lumaSW + lumaSE ) * ( 0.25 * FXAA_REDUCE_MUL ), FXAA_REDUCE_MIN );',

        'float rcpDirMin = 1.0 / ( min( abs( dir.x ), abs( dir.y ) ) + dirReduce );',
        'dir = min( vec2( FXAA_SPAN_MAX,  FXAA_SPAN_MAX),',
        'max( vec2(-FXAA_SPAN_MAX, -FXAA_SPAN_MAX),',
        'dir * rcpDirMin)) * resolution;',
        'vec4 rgbA = (1.0/2.0) * (',
        'texture2D(tDiffuse,  gl_FragCoord.xy  * resolution + dir * (1.0/3.0 - 0.5)) +',
        'texture2D(tDiffuse,  gl_FragCoord.xy  * resolution + dir * (2.0/3.0 - 0.5)));',
        'vec4 rgbB = rgbA * (1.0/2.0) + (1.0/4.0) * (',
        'texture2D(tDiffuse,  gl_FragCoord.xy  * resolution + dir * (0.0/3.0 - 0.5)) +',
        'texture2D(tDiffuse,  gl_FragCoord.xy  * resolution + dir * (3.0/3.0 - 0.5)));',
        'float lumaB = dot(rgbB, vec4(luma, 0.0));',

        'if ( ( lumaB < lumaMin ) || ( lumaB > lumaMax ) ) {',

        'gl_FragColor = rgbA;',

        '} else {',
        'gl_FragColor = rgbB;',

        '}',

        '}'

    ].join('\n')

};

function XRayMaterial(params) {

    var uniforms = {
        uTex: { type: 't', value: params.map || new THREE.Texture() },
        offsetRepeat: { value: new THREE.Vector4(0, 0, 1, 1) },
        alphaProportion: { type: '1f', value: params.alphaProportion || 0.5 },
        diffuse: { value: params.color || new THREE.Color(0xffffff) },
        opacity: { value: params.opacity || 1 },
        gridOffset: { value: 0 }
    };

    setInterval(function() {
        uniforms.gridOffset.value += params.gridOffsetSpeed || 1;
        // m.needsUpdate = true;
    }, 40);

    var m = new THREE.ShaderMaterial({

        uniforms: uniforms,

        // attributes: {
        //  vertexOpacity: { value: [] }
        // },
        vertexShader: '\
            varying float _alpha;\
            varying vec2 vUv;\
            uniform vec4 offsetRepeat;\
            uniform float alphaProportion;\
            \
            void main() {\
                gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\
                vUv = uv * offsetRepeat.zw + offsetRepeat.xy;\
                \
                vec4 worldPosition = modelMatrix * vec4( vec3( position ), 1.0 );\
                vec3 cameraToVertex = normalize( cameraPosition - worldPosition.xyz);\
                _alpha = 1.0 - max( 0.0, dot( normal, cameraToVertex ) );\
                _alpha = max( 0.0, (_alpha - alphaProportion) / (1.0 - alphaProportion) );\
            }',
        //alpha = alphaProportion + (alpha - 0.0) * (1.0 - alphaProportion) / (1.0 - 0.0);\

        fragmentShader:

            'uniform sampler2D uTex;\
            uniform vec3 diffuse;\
            uniform float opacity;\
            uniform float gridOffset;\
            \
            varying float _alpha;\
            varying vec2 vUv;\
            \
            void main() {\
                vec4 texColor = texture2D( uTex, vUv );\
                float _a = _alpha * opacity;\
                if( _a <= 0.0 ) discard;\
                _a = _a * ( sin( vUv.y * 2000.0 + gridOffset ) * .5 + .5 );\
                gl_FragColor = vec4( texColor.rgb * diffuse, _a );\
            \
            }',
        //if ( alpha < .5 ) discard;\

        transparent: true,
        blending: THREE.AdditiveBlending,
        depthTest: false
    });

    return m;
}

export default {
    CopyShader,
    RGBShiftShader,
    AlphaColorShader,
    VerticalTiltShiftShader,
    FXAAShader,
    XRayMaterial,
};
