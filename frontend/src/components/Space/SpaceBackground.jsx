import { Canvas, useFrame, useThree } from "@react-three/fiber";

import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  BackSide,
  Color,
  DoubleSide,
  IcosahedronGeometry,
  MathUtils,
  MeshStandardMaterial,
  Object3D,
  Vector3,
} from "three";

import {
  useEffect,
  useMemo,
  useRef,
} from "react";

import "../../styles/space.css";


/* =========================================================
   GLOBAL SETTINGS
========================================================= */

const TRAVEL_SPEED = 7.5;

const STAR_RESET_Z = -150;
const STAR_START_Z = -150;

const CAMERA_Z = 8;

/* =========================================================
   CINEMATIC SUN POSITION
   Used by the planet shader so every planet receives
   the same warm directional light from the visible sun.
========================================================= */
const SUN_POSITION = new Vector3(-30, 16, -88);
const SUN_LIGHT_POSITION = SUN_POSITION.clone();


/* =========================================================
   PLANET TYPES
========================================================= */

const PLANET_TYPES = [
  "earth",
  "ocean",
  "desert",
  "forest",
  "gas",
  "storm",
  "lava",
  "ice",
  "crystal",
  "toxic",
  "redRock",
  "darkRock",
];


/* =========================================================
   PLANET COLOR PALETTES
========================================================= */

const PLANET_PALETTES = {

  earth: [
    "#06152e",
    "#1670a8",
    "#4e9845",
  ],

  ocean: [
    "#02152c",
    "#075c91",
    "#27b8d8",
  ],

  desert: [
    "#3a1708",
    "#b86528",
    "#e9b66d",
  ],

  forest: [
    "#031b0d",
    "#176c35",
    "#75a94e",
  ],

  gas: [
    "#69452f",
    "#c18b5c",
    "#f0d0a0",
  ],

  storm: [
    "#181735",
    "#514e9c",
    "#c9b8ff",
  ],

  lava: [
    "#080303",
    "#711207",
    "#ff5b16",
  ],

  ice: [
    "#071b30",
    "#438db5",
    "#d7f5ff",
  ],

  crystal: [
    "#18052b",
    "#713bb2",
    "#e9b4ff",
  ],

  toxic: [
    "#061a0a",
    "#3d8918",
    "#b8ef3c",
  ],

  redRock: [
    "#210506",
    "#8d241b",
    "#d76b38",
  ],

  darkRock: [
    "#030405",
    "#252b31",
    "#68717b",
  ],

};


/* =========================================================
   RANDOM PLANET CONFIG
========================================================= */

function randomPlanetConfig() {

  const type =
    PLANET_TYPES[
      Math.floor(
        Math.random() *
        PLANET_TYPES.length
      )
    ];

  const palette =
    PLANET_PALETTES[type];

  const size =
    0.75 +
    Math.random() * 4.4;

  const atmosphereColors = {

    earth: "#3e9cff",

    ocean: "#28c9ff",

    desert: "#ff9d54",

    forest: "#53d47d",

    gas: "#e8b27c",

    storm: "#9f8cff",

    lava: "#ff4824",

    ice: "#75d9ff",

    crystal: "#c47cff",

    toxic: "#8cff36",

    redRock: "#ff633e",

    darkRock: "#778899",

  };

  const atmosphere =
    atmosphereColors[type];

  const ringChance =
    Math.random();

  const ring =
    ringChance < 0.28;

  return {

    type,

    size,

    atmosphere,

    ring,

    speed:
      0.22 +
      Math.random() * 0.75,

    rotationSpeed:
      0.045 +
      Math.random() * 0.22,

    orbit:
      0.35 +
      Math.random() * 2.8,

    phase:
      Math.random() *
      Math.PI *
      2,

    palette,

  };
}


/* =========================================================
   STAR SHADER
========================================================= */

const starVertexShader = `
uniform float uTime;

attribute float aSize;
attribute float aBrightness;

varying float vBrightness;

void main() {

    vec4 mvPosition =
        modelViewMatrix *
        vec4(position, 1.0);

    float depth =
        max(
            1.0,
            -mvPosition.z
        );

    gl_PointSize =
        aSize *
        (65.0 / depth);

    gl_PointSize =
        clamp(
            gl_PointSize,
            1.0,
            12.0
        );

    vBrightness =
        aBrightness;

    gl_Position =
        projectionMatrix *
        mvPosition;
}
`;


const starFragmentShader = `
varying float vBrightness;

void main() {

    vec2 p =
        gl_PointCoord -
        vec2(0.5);

    float d =
        length(p);

    float core =
        smoothstep(
            0.18,
            0.0,
            d
        );

    float horizontal =
        exp(
            -abs(p.y) * 28.0
        ) *
        smoothstep(
            0.55,
            0.0,
            abs(p.x)
        );

    float vertical =
        exp(
            -abs(p.x) * 28.0
        ) *
        smoothstep(
            0.55,
            0.0,
            abs(p.y)
        );

    float diagonal =
        exp(
            -abs(p.x + p.y) * 20.0
        ) *
        smoothstep(
            0.55,
            0.0,
            abs(p.x - p.y)
        ) *
        0.25;

    float alpha =
        max(
            core,
            max(
                horizontal,
                max(
                    vertical,
                    diagonal
                )
            )
        );

    alpha *=
        vBrightness;

    vec3 starColor =
        vec3(
            1.0,
            0.94,
            0.82
        );

    gl_FragColor =
        vec4(
            starColor,
            alpha
        );
}
`;


/* =========================================================
   STAR FIELD
========================================================= */

function StarField() {

  const pointsRef =
    useRef(null);

  const materialRef =
    useRef(null);

  const data =
    useMemo(() => {

      const count = 18000;

      const positions =
        new Float32Array(
          count * 3
        );

      const sizes =
        new Float32Array(
          count
        );

      const brightness =
        new Float32Array(
          count
        );

      for (
        let i = 0;
        i < count;
        i++
      ) {

        const z =
          STAR_START_Z +
          Math.random() * 145;

        const spread =
          45 +
          Math.abs(z) * 0.18;

        positions[i * 3] =
          (
            Math.random() -
            0.5
          ) *
          spread;

        positions[i * 3 + 1] =
          (
            Math.random() -
            0.5
          ) *
          spread *
          0.62;

        positions[i * 3 + 2] =
          z;

        sizes[i] =
          Math.random() < 0.08
            ? 4.5 +
              Math.random() * 4
            : 1.2 +
              Math.random() * 2.5;

        brightness[i] =
          0.35 +
          Math.random() * 0.65;
      }

      return {
        positions,
        sizes,
        brightness,
      };

    }, []);

  useFrame(
    (_, delta) => {

      if (
        !pointsRef.current
      ) {
        return;
      }

      const position =
        pointsRef.current
          .geometry
          .attributes
          .position
          .array;

      for (
        let i = 0;
        i < position.length;
        i += 3
      ) {

        position[i + 2] +=
          TRAVEL_SPEED *
          delta;

        if (
          position[i + 2] >
          CAMERA_Z + 3
        ) {

          /*
           * IMPORTANT:
           * Respawn stars across the SAME depth range as the
           * initial field. Previously recycled stars were packed
           * into only ~30 units, which made the star field look
           * progressively less dense after travelling.
           */
          const newZ =
            STAR_START_Z +
            Math.random() * 145;

          const newSpread =
            45 +
            Math.abs(newZ) * 0.18;

          position[i + 2] =
            newZ;

          position[i] =
            (
              Math.random() -
              0.5
            ) *
            newSpread;

          position[i + 1] =
            (
              Math.random() -
              0.5
            ) *
            newSpread *
            0.62;
        }
      }

      pointsRef.current
        .geometry
        .attributes
        .position
        .needsUpdate = true;

      if (
        materialRef.current
      ) {

        materialRef.current
          .uniforms
          .uTime
          .value +=
          delta;
      }
    }
  );

  return (
    <points
      ref={pointsRef}
      frustumCulled={false}
    >

      <bufferGeometry>

        <bufferAttribute
          attach="attributes-position"
          args={[
            data.positions,
            3,
          ]}
        />

        <bufferAttribute
          attach="attributes-aSize"
          args={[
            data.sizes,
            1,
          ]}
        />

        <bufferAttribute
          attach="attributes-aBrightness"
          args={[
            data.brightness,
            1,
          ]}
        />

      </bufferGeometry>

      <shaderMaterial
        ref={materialRef}
        vertexShader={
          starVertexShader
        }
        fragmentShader={
          starFragmentShader
        }
        uniforms={{
          uTime: {
            value: 0,
          },
        }}
        transparent
        depthWrite={false}
        blending={
          AdditiveBlending
        }
      />

    </points>
  );
}


/* =========================================================
   COSMIC BACKGROUND
========================================================= */

const cosmicBackgroundVertexShader = `
varying vec2 vUv;

void main() {

    vUv = uv;

    gl_Position =
        projectionMatrix *
        modelViewMatrix *
        vec4(position,1.0);
}
`;


const cosmicBackgroundFragmentShader = `
uniform float uTime;

uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;

uniform float uOpacity;

varying vec2 vUv;

float hash(vec2 p) {

    return fract(
        sin(
            dot(
                p,
                vec2(
                    127.1,
                    311.7
                )
            )
        )
        *
        43758.5453123
    );
}

float noise(vec2 p) {

    vec2 i =
        floor(p);

    vec2 f =
        fract(p);

    f =
        f*f*
        (
            3.0 -
            2.0*f
        );

    float a =
        hash(i);

    float b =
        hash(
            i +
            vec2(1.0,0.0)
        );

    float c =
        hash(
            i +
            vec2(0.0,1.0)
        );

    float d =
        hash(
            i +
            vec2(1.0,1.0)
        );

    return mix(
        mix(a,b,f.x),
        mix(c,d,f.x),
        f.y
    );
}

float fbm(vec2 p) {

    float value = 0.0;

    float amplitude = 0.5;

    for(
        int i=0;
        i<6;
        i++
    ) {

        value +=
            noise(p) *
            amplitude;

        p *= 2.0;

        amplitude *= 0.5;
    }

    return value;
}

void main() {

    vec2 uv =
        vUv -
        vec2(0.5);

    uv.x *= 1.65;

    float dist =
        length(uv);

    vec2 cloudUV =
        uv * 2.8;

    cloudUV.x +=
        uTime * 0.006;

    float cloud =
        fbm(cloudUV);

    vec2 cloudUV2 =
        uv * 5.5;

    cloudUV2.x -=
        uTime * 0.004;

    float cloud2 =
        fbm(cloudUV2);

    float radial =
        1.0 -
        smoothstep(
            0.08,
            0.95,
            dist
        );

    float band =
        exp(
            -abs(uv.y) *
            4.2
        );

    float bandNoise =
        fbm(
            vec2(
                uv.x * 2.8,
                uv.y * 5.0
            )
        );

    band *=
        smoothstep(
            0.25,
            0.75,
            bandNoise
        );

    float center =
        1.0 -
        smoothstep(
            0.0,
            0.38,
            length(
                uv *
                vec2(1.0,1.35)
            )
        );

    center =
        pow(
            center,
            2.5
        );

    float intensity =
        cloud * 0.42;

    intensity +=
        cloud2 * 0.18;

    intensity +=
        radial * 0.18;

    intensity +=
        band * 0.48;

    intensity +=
        center * 0.75;

    intensity *=
        uOpacity;

    vec3 cosmicColor =
        mix(
            uColorA,
            uColorB,
            clamp(
                cloud * 0.8 +
                band * 0.25,
                0.0,
                1.0
            )
        );

    cosmicColor =
        mix(
            cosmicColor,
            uColorC,
            center * 0.72
        );

    cosmicColor +=
        vec3(
            1.0,
            0.72,
            0.40
        ) *
        center *
        0.18;

    gl_FragColor =
        vec4(
            cosmicColor,
            intensity
        );
}
`;


function CosmicBackgroundLight({
  position,
  scale,
  colorA,
  colorB,
  colorC,
  opacity = 0.12,
  speed = 0.002,
}) {

  const ref =
    useRef(null);

  const uniforms =
    useMemo(
      () => ({
        uTime: {
          value: 0,
        },

        uColorA: {
          value:
            new Color(colorA),
        },

        uColorB: {
          value:
            new Color(colorB),
        },

        uColorC: {
          value:
            new Color(colorC),
        },

        uOpacity: {
          value:
            opacity,
        },
      }),
      [
        colorA,
        colorB,
        colorC,
        opacity,
      ]
    );

  useFrame(
    (state, delta) => {

      if (
        !ref.current
      ) {
        return;
      }

      uniforms.uTime.value =
        state.clock.elapsedTime;

      ref.current.rotation.z +=
        delta *
        speed;

      ref.current.position.z +=
        delta *
        TRAVEL_SPEED *
        0.045;

      if (
        ref.current.position.z >
        20
      ) {

        ref.current.position.z =
          -145;
      }
    }
  );

  return (
    <mesh
      ref={ref}
      position={position}
      scale={scale}
      renderOrder={-10}
    >

      <planeGeometry
        args={[
          2,
          2,
        ]}
      />

      <shaderMaterial
        uniforms={uniforms}
        vertexShader={
          cosmicBackgroundVertexShader
        }
        fragmentShader={
          cosmicBackgroundFragmentShader
        }
        transparent
        depthWrite={false}
        depthTest={false}
        blending={
          AdditiveBlending
        }
        side={DoubleSide}
      />

    </mesh>
  );
}


/* =========================================================
   PLANET VERTEX SHADER
========================================================= */

const planetVertexShader = `
uniform float uTime;
uniform float uType;
uniform float uSeed;

varying vec3 vNormal;
varying vec3 vWorldPosition;
varying vec3 vLocalPosition;
varying vec2 vUv;

float hash(vec3 p) {

    p =
        fract(
            p * 0.3183099 +
            vec3(
                0.1,
                0.2,
                0.3
            )
        );

    p *= 17.0;

    return fract(
        p.x *
        p.y *
        p.z *
        (
            p.x +
            p.y +
            p.z
        )
    );
}

float noise(vec3 p) {

    vec3 i =
        floor(p);

    vec3 f =
        fract(p);

    f =
        f*f*
        (
            3.0 -
            2.0*f
        );

    float n000 =
        hash(
            i +
            vec3(0,0,0)
        );

    float n100 =
        hash(
            i +
            vec3(1,0,0)
        );

    float n010 =
        hash(
            i +
            vec3(0,1,0)
        );

    float n110 =
        hash(
            i +
            vec3(1,1,0)
        );

    float n001 =
        hash(
            i +
            vec3(0,0,1)
        );

    float n101 =
        hash(
            i +
            vec3(1,0,1)
        );

    float n011 =
        hash(
            i +
            vec3(0,1,1)
        );

    float n111 =
        hash(
            i +
            vec3(1,1,1)
        );

    return mix(
        mix(
            mix(n000,n100,f.x),
            mix(n010,n110,f.x),
            f.y
        ),
        mix(
            mix(n001,n101,f.x),
            mix(n011,n111,f.x),
            f.y
        ),
        f.z
    );
}

float fbm(vec3 p) {

    float value = 0.0;

    float amplitude = 0.5;

    for(
        int i=0;
        i<5;
        i++
    ) {

        value +=
            noise(p) *
            amplitude;

        p *= 2.0;

        amplitude *= 0.5;
    }

    return value;
}

void main() {

    vec3 p =
        normalize(position);

    float terrain =
        fbm(
            p * 5.0 +
            uSeed
        );

    float fine =
        fbm(
            p * 16.0 +
            uSeed * 1.7
        );

    float displacement = 0.0;

    if(
        uType > 2.5 &&
        uType < 12.5
    ) {

        displacement =
            (
                terrain -
                0.5
            ) *
            0.075;

        displacement +=
            (
                fine -
                0.5
            ) *
            0.022;
    }

    vec3 displacedPosition =
        position +
        normal *
        displacement;

    vec4 worldPosition =
        modelMatrix *
        vec4(
            displacedPosition,
            1.0
        );

    vWorldPosition =
        worldPosition.xyz;

    vLocalPosition =
        normalize(
            displacedPosition
        );

    vNormal =
        normalize(
            mat3(modelMatrix) *
            normal
        );

    vUv =
        uv;

    gl_Position =
        projectionMatrix *
        modelViewMatrix *
        vec4(
            displacedPosition,
            1.0
        );
}
`;


/* =========================================================
   PLANET FRAGMENT SHADER
========================================================= */

const planetFragmentShader = `
uniform float uTime;
uniform float uType;
uniform float uSeed;

uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;

uniform vec3 uLightPosition;
uniform vec3 uCameraPosition;

varying vec3 vNormal;
varying vec3 vWorldPosition;
varying vec3 vLocalPosition;
varying vec2 vUv;


/* =========================================================
   NOISE
========================================================= */

float hash(vec3 p) {

    p =
        fract(
            p * 0.3183099 +
            vec3(
                0.1,
                0.2,
                0.3
            )
        );

    p *= 17.0;

    return fract(
        p.x *
        p.y *
        p.z *
        (
            p.x +
            p.y +
            p.z
        )
    );
}


float noise(vec3 p) {

    vec3 i =
        floor(p);

    vec3 f =
        fract(p);

    f =
        f*f*
        (
            3.0 -
            2.0*f
        );

    float n000 =
        hash(
            i +
            vec3(0,0,0)
        );

    float n100 =
        hash(
            i +
            vec3(1,0,0)
        );

    float n010 =
        hash(
            i +
            vec3(0,1,0)
        );

    float n110 =
        hash(
            i +
            vec3(1,1,0)
        );

    float n001 =
        hash(
            i +
            vec3(0,0,1)
        );

    float n101 =
        hash(
            i +
            vec3(1,0,1)
        );

    float n011 =
        hash(
            i +
            vec3(0,1,1)
        );

    float n111 =
        hash(
            i +
            vec3(1,1,1)
        );

    return mix(
        mix(
            mix(n000,n100,f.x),
            mix(n010,n110,f.x),
            f.y
        ),
        mix(
            mix(n001,n101,f.x),
            mix(n011,n111,f.x),
            f.y
        ),
        f.z
    );
}


float fbm(vec3 p) {

    float value = 0.0;

    float amplitude = 0.5;

    for(
        int i=0;
        i<6;
        i++
    ) {

        value +=
            noise(p) *
            amplitude;

        p *= 2.0;

        amplitude *= 0.5;
    }

    return value;
}


/* =========================================================
   EARTH
========================================================= */

vec3 earthSurface(vec3 n) {

    float continents =
        fbm(
            n * 3.7 +
            uSeed
        );

    float detail =
        fbm(
            n * 11.0 +
            uSeed * 2.0
        );

    float mountains =
        fbm(
            n * 24.0 +
            uSeed
        );

    vec3 oceanDeep =
        vec3(
            0.005,
            0.025,
            0.08
        );

    vec3 ocean =
        vec3(
            0.015,
            0.16,
            0.36
        );

    vec3 landDark =
        vec3(
            0.025,
            0.075,
            0.025
        );

    vec3 land =
        vec3(
            0.13,
            0.35,
            0.10
        );

    vec3 desert =
        vec3(
            0.48,
            0.31,
            0.13
        );

    float oceanMask =
        smoothstep(
            0.40,
            0.54,
            continents
        );

    vec3 water =
        mix(
            oceanDeep,
            ocean,
            continents
        );

    float landMask =
        smoothstep(
            0.49,
            0.58,
            continents
        );

    vec3 landColor =
        mix(
            landDark,
            land,
            detail
        );

    landColor =
        mix(
            landColor,
            desert,
            smoothstep(
                0.62,
                0.78,
                detail
            ) * 0.28
        );

    landColor *=
        0.72 +
        mountains * 0.45;

    vec3 color =
        mix(
            water,
            landColor,
            landMask
        );

    float latitude =
        abs(n.y);

    float ice =
        smoothstep(
            0.72,
            0.93,
            latitude
        );

    color =
        mix(
            color,
            vec3(
                0.88,
                0.95,
                1.0
            ),
            ice
        );

    float clouds =
        fbm(
            n * 8.5 +
            vec3(
                uTime * 0.006,
                0.0,
                uTime * 0.004
            )
        );

    float cloudMask =
        smoothstep(
            0.62,
            0.76,
            clouds
        );

    color =
        mix(
            color,
            vec3(
                0.92,
                0.97,
                1.0
            ),
            cloudMask * 0.45
        );

    return color;
}


/* =========================================================
   OCEAN PLANET
========================================================= */

vec3 oceanSurface(vec3 n) {

    float waves =
        fbm(
            n * 7.0 +
            uSeed
        );

    float deep =
        fbm(
            n * 20.0 +
            uSeed
        );

    vec3 dark =
        vec3(
            0.002,
            0.015,
            0.045
        );

    vec3 blue =
        vec3(
            0.015,
            0.20,
            0.48
        );

    vec3 cyan =
        vec3(
            0.03,
            0.55,
            0.72
        );

    vec3 color =
        mix(
            dark,
            blue,
            waves
        );

    color =
        mix(
            color,
            cyan,
            smoothstep(
                0.62,
                0.82,
                deep
            ) * 0.55
        );

    return color;
}


/* =========================================================
   DESERT
========================================================= */

vec3 desertSurface(vec3 n) {

    float dunes =
        fbm(
            vec3(
                n.x * 5.0,
                n.y * 14.0,
                n.z * 5.0
            ) +
            uSeed
        );

    float detail =
        fbm(
            n * 25.0 +
            uSeed
        );

    vec3 dark =
        vec3(
            0.12,
            0.035,
            0.008
        );

    vec3 sand =
        vec3(
            0.65,
            0.30,
            0.08
        );

    vec3 bright =
        vec3(
            0.95,
            0.67,
            0.31
        );

    vec3 color =
        mix(
            dark,
            sand,
            dunes
        );

    color =
        mix(
            color,
            bright,
            detail * 0.35
        );

    return color;
}


/* =========================================================
   FOREST PLANET
========================================================= */

vec3 forestSurface(vec3 n) {

    float terrain =
        fbm(
            n * 4.2 +
            uSeed
        );

    float vegetation =
        fbm(
            n * 13.0 +
            uSeed * 2.0
        );

    vec3 dark =
        vec3(
            0.005,
            0.025,
            0.008
        );

    vec3 green =
        vec3(
            0.025,
            0.23,
            0.055
        );

    vec3 bright =
        vec3(
            0.25,
            0.55,
            0.12
        );

    vec3 color =
        mix(
            dark,
            green,
            terrain
        );

    color =
        mix(
            color,
            bright,
            vegetation * 0.32
        );

    float polar =
        smoothstep(
            0.75,
            0.94,
            abs(n.y)
        );

    color =
        mix(
            color,
            vec3(
                0.68,
                0.82,
                0.72
            ),
            polar * 0.22
        );

    return color;
}


/* =========================================================
   GAS GIANT
========================================================= */

vec3 gasSurface(vec3 n) {

    float latitude =
        n.y;

    float turbulence =
        fbm(
            n * 6.0 +
            uSeed
        );

    float bands =
        sin(
            latitude * 34.0 +
            turbulence * 8.0 +
            uSeed
        );

    bands =
        bands *
        0.5 +
        0.5;

    float detail =
        fbm(
            n * 18.0 +
            uSeed
        );

    vec3 color =
        mix(
            uColorA,
            uColorB,
            bands
        );

    color =
        mix(
            color,
            uColorC,
            detail * 0.3
        );

    float storms =
        smoothstep(
            0.72,
            0.92,
            abs(
                sin(
                    latitude * 13.0 +
                    turbulence * 2.0
                )
            )
        );

    color *=
        1.0 -
        storms * 0.22;

    return color;
}


/* =========================================================
   STORM GIANT
========================================================= */

vec3 stormSurface(vec3 n) {

    float clouds =
        fbm(
            n * 5.0 +
            uSeed
        );

    float bands =
        sin(
            n.y * 40.0 +
            clouds * 10.0
        );

    bands =
        bands * 0.5 +
        0.5;

    vec3 color =
        mix(
            uColorA,
            uColorB,
            bands
        );

    float lightning =
        smoothstep(
            0.76,
            0.92,
            fbm(
                n * 31.0 +
                uSeed
            )
        );

    color =
        mix(
            color,
            uColorC,
            lightning * 0.30
        );

    return color;
}


/* =========================================================
   LAVA
========================================================= */

vec3 lavaSurface(vec3 n) {

    float crust =
        fbm(
            n * 7.0 +
            uSeed
        );

    float cracks =
        fbm(
            n * 18.0 +
            uSeed
        );

    vec3 rock =
        vec3(
            0.012,
            0.003,
            0.002
        );

    vec3 hotRock =
        vec3(
            0.22,
            0.012,
            0.002
        );

    vec3 lava =
        vec3(
            1.0,
            0.12,
            0.008
        );

    vec3 color =
        mix(
            rock,
            hotRock,
            smoothstep(
                0.42,
                0.58,
                crust
            )
        );

    color =
        mix(
            color,
            lava,
            smoothstep(
                0.58,
                0.76,
                cracks
            )
        );

    return color;
}


/* =========================================================
   ICE
========================================================= */

vec3 iceSurface(vec3 n) {

    float large =
        fbm(
            n * 5.0 +
            uSeed
        );

    float cracks =
        fbm(
            n * 27.0 +
            uSeed
        );

    vec3 deep =
        vec3(
            0.01,
            0.055,
            0.12
        );

    vec3 blue =
        vec3(
            0.10,
            0.42,
            0.65
        );

    vec3 white =
        vec3(
            0.82,
            0.96,
            1.0
        );

    vec3 color =
        mix(
            deep,
            blue,
            large
        );

    color =
        mix(
            color,
            white,
            smoothstep(
                0.45,
                0.78,
                cracks
            )
        );

    return color;
}


/* =========================================================
   CRYSTAL
========================================================= */

vec3 crystalSurface(vec3 n) {

    float pattern =
        fbm(
            n * 8.0 +
            uSeed
        );

    float facets =
        smoothstep(
            0.35,
            0.75,
            fbm(
                n * 21.0 +
                uSeed
            )
        );

    vec3 dark =
        vec3(
            0.035,
            0.005,
            0.08
        );

    vec3 purple =
        vec3(
            0.35,
            0.04,
            0.62
        );

    vec3 bright =
        vec3(
            0.90,
            0.38,
            1.0
        );

    vec3 color =
        mix(
            dark,
            purple,
            pattern
        );

    color =
        mix(
            color,
            bright,
            facets * 0.55
        );

    return color;
}


/* =========================================================
   TOXIC
========================================================= */

vec3 toxicSurface(vec3 n) {

    float toxic =
        fbm(
            n * 6.0 +
            uSeed
        );

    float bubbles =
        fbm(
            n * 29.0 +
            uSeed
        );

    vec3 dark =
        vec3(
            0.005,
            0.025,
            0.004
        );

    vec3 green =
        vec3(
            0.10,
            0.38,
            0.015
        );

    vec3 acid =
        vec3(
            0.60,
            1.0,
            0.05
        );

    vec3 color =
        mix(
            dark,
            green,
            toxic
        );

    color =
        mix(
            color,
            acid,
            smoothstep(
                0.70,
                0.90,
                bubbles
            ) * 0.42
        );

    return color;
}


/* =========================================================
   RED ROCK
========================================================= */

vec3 redRockSurface(vec3 n) {

    float terrain =
        fbm(
            n * 5.0 +
            uSeed
        );

    float detail =
        fbm(
            n * 25.0 +
            uSeed
        );

    vec3 dark =
        vec3(
            0.045,
            0.006,
            0.004
        );

    vec3 red =
        vec3(
            0.38,
            0.025,
            0.012
        );

    vec3 orange =
        vec3(
            0.78,
            0.20,
            0.055
        );

    vec3 color =
        mix(
            dark,
            red,
            terrain
        );

    color =
        mix(
            color,
            orange,
            detail * 0.35
        );

    return color;
}


/* =========================================================
   DARK ROCK
========================================================= */

vec3 darkRockSurface(vec3 n) {

    float terrain =
        fbm(
            n * 6.0 +
            uSeed
        );

    float craters =
        fbm(
            n * 32.0 +
            uSeed
        );

    vec3 dark =
        vec3(
            0.006,
            0.008,
            0.010
        );

    vec3 rock =
        vec3(
            0.10,
            0.12,
            0.14
        );

    vec3 highlight =
        vec3(
            0.32,
            0.36,
            0.40
        );

    vec3 color =
        mix(
            dark,
            rock,
            terrain
        );

    color =
        mix(
            color,
            highlight,
            smoothstep(
                0.75,
                0.92,
                craters
            ) * 0.25
        );

    return color;
}


/* =========================================================
   MAIN PLANET SHADER
========================================================= */

void main() {

    vec3 normal =
        normalize(vNormal);

    vec3 localNormal =
        normalize(vLocalPosition);

    vec3 viewDir =
        normalize(
            uCameraPosition -
            vWorldPosition
        );

    vec3 lightDir =
        normalize(
            uLightPosition -
            vWorldPosition
        );

    float NdotL =
        max(
            dot(
                normal,
                lightDir
            ),
            0.0
        );

    float halfLambert =
        NdotL *
        0.72 +
        0.28;

    vec3 color;


    /* -----------------------------------------------------
       PLANET TYPE
    ----------------------------------------------------- */

    if(uType < 1.5) {

        color =
            earthSurface(
                localNormal
            );

    }

    else if(uType < 2.5) {

        color =
            oceanSurface(
                localNormal
            );

    }

    else if(uType < 3.5) {

        color =
            desertSurface(
                localNormal
            );

    }

    else if(uType < 4.5) {

        color =
            forestSurface(
                localNormal
            );

    }

    else if(uType < 5.5) {

        color =
            gasSurface(
                localNormal
            );

    }

    else if(uType < 6.5) {

        color =
            stormSurface(
                localNormal
            );

    }

    else if(uType < 7.5) {

        color =
            lavaSurface(
                localNormal
            );

    }

    else if(uType < 8.5) {

        color =
            iceSurface(
                localNormal
            );

    }

    else if(uType < 9.5) {

        color =
            crystalSurface(
                localNormal
            );

    }

    else if(uType < 10.5) {

        color =
            toxicSurface(
                localNormal
            );

    }

    else if(uType < 11.5) {

        color =
            redRockSurface(
                localNormal
            );

    }

    else {

        color =
            darkRockSurface(
                localNormal
            );
    }


    /* =====================================================
       LIGHTING
    ===================================================== */

    float lighting =
        0.035 +
        halfLambert *
        0.95;

    color *=
        lighting;


    /* =====================================================
       SPECULAR
    ===================================================== */

    vec3 reflected =
        reflect(
            -lightDir,
            normal
        );

    float specular =
        pow(
            max(
                dot(
                    reflected,
                    viewDir
                ),
                0.0
            ),
            80.0
        );

    color +=
        vec3(
            0.42,
            0.68,
            1.0
        ) *
        specular *
        0.24;


    /* =====================================================
       ATMOSPHERE RIM
    ===================================================== */

    float fresnel =
        pow(
            1.0 -
            max(
                dot(
                    normal,
                    viewDir
                ),
                0.0
            ),
            4.0
        );

    vec3 atmosphereColor =
        uColorC;

    color +=
        atmosphereColor *
        fresnel *
        0.22;


    /* =====================================================
       SPECIAL GLOW
    ===================================================== */

    if(uType > 6.5 && uType < 7.5) {

        color +=
            vec3(
                1.0,
                0.04,
                0.005
            ) *
            fresnel *
            0.35;
    }

    if(uType > 8.5 && uType < 9.5) {

        color +=
            vec3(
                0.55,
                0.15,
                1.0
            ) *
            fresnel *
            0.35;
    }

    if(uType > 9.5 && uType < 10.5) {

        color +=
            vec3(
                0.15,
                1.0,
                0.02
            ) *
            fresnel *
            0.28;
    }


    /* =====================================================
       CINEMATIC TONEMAP
    ===================================================== */

    color =
        color /
        (
            color +
            vec3(0.30)
        );

    color =
        pow(
            color,
            vec3(0.92)
        );


    gl_FragColor =
        vec4(
            color,
            1.0
        );
}
`;


/* =========================================================
   ATMOSPHERE
========================================================= */

const atmosphereVertexShader = `
varying vec3 vNormal;

void main() {

    vNormal =
        normalize(
            mat3(modelMatrix) *
            normal
        );

    vec4 worldPosition =
        modelMatrix *
        vec4(
            position,
            1.0
        );

    gl_Position =
        projectionMatrix *
        viewMatrix *
        worldPosition;
}
`;


const atmosphereFragmentShader = `
uniform vec3 uColor;

varying vec3 vNormal;

void main() {

    vec3 viewDirection =
        normalize(
            cameraPosition
        );

    float fresnel =
        pow(
            1.0 -
            abs(
                dot(
                    vNormal,
                    viewDirection
                )
            ),
            3.0
        );

    float alpha =
        fresnel *
        0.70;

    gl_FragColor =
        vec4(
            uColor,
            alpha
        );
}
`;


/* =========================================================
   PLANET
========================================================= */

function Planet({
  position,
  config,
}) {

  const groupRef =
    useRef(null);

  const planetRef =
    useRef(null);

  const atmosphereRef =
    useRef(null);

  const ringRef =
    useRef(null);

  const {
    type,
    size,
    atmosphere,
    speed,
    rotationSpeed,
    orbit,
    phase,
    palette,
    ring,
  } = config;


  const typeValue =
    PLANET_TYPES.indexOf(type) + 1;


  const seed =
    useMemo(
      () =>
        Math.random() * 1000,
      []
    );


  const materialUniforms =
    useMemo(
      () => ({

        uTime: {
          value: 0,
        },

        uSeed: {
          value: seed,
        },

        uColorA: {
          value:
            new Color(
              palette[0]
            ),
        },

        uColorB: {
          value:
            new Color(
              palette[1]
            ),
        },

        uColorC: {
          value:
            new Color(
              palette[2]
            ),
        },

        uLightPosition: {
          value:
            SUN_LIGHT_POSITION.clone(),
        },

        uCameraPosition: {
          value:
            new Vector3()
        },

        uType: {
          value:
            typeValue,
        },

      }),
      [
        palette,
        seed,
        typeValue,
      ]
    );


  const atmosphereUniforms =
    useMemo(
      () => ({

        uColor: {
          value:
            new Color(
              atmosphere
            ),
        },

      }),
      [
        atmosphere,
      ]
    );


  const startPosition =
    useMemo(
      () => [
        position[0],
        position[1],
        position[2],
      ],
      [position]
    );


  useFrame(
    (state, delta) => {

      if(
        !groupRef.current
      ) {
        return;
      }

      const time =
        state.clock.elapsedTime;

      // Continuous fixed Sun lighting for every planet.
      materialUniforms.uLightPosition.value.copy(
        SUN_LIGHT_POSITION
      );


      groupRef.current.position.z +=
        TRAVEL_SPEED *
        speed *
        delta;


      groupRef.current.position.x =
        startPosition[0] +
        Math.sin(
          time *
          0.15 +
          phase
        ) *
        orbit;


      groupRef.current.position.y =
        startPosition[1] +
        Math.cos(
          time *
          0.12 +
          phase
        ) *
        orbit *
        0.35;


      if(
        planetRef.current
      ) {

        planetRef.current.rotation.y +=
          delta *
          rotationSpeed;

        planetRef.current.rotation.x +=
          delta *
          rotationSpeed *
          0.11;
      }


      if(
        atmosphereRef.current
      ) {

        atmosphereRef.current.rotation.y -=
          delta *
          rotationSpeed *
          0.35;
      }


      if(
        ringRef.current
      ) {

        ringRef.current.rotation.z +=
          delta *
          0.025;
      }


      /*
       * IMPORTANT:
       * When planet comes back from front,
       * it gets a completely new procedural
       * configuration.
       */

      if(
        groupRef.current.position.z >
        CAMERA_Z + 12
      ) {

        const next =
          randomPlanetConfig();


        groupRef.current.position.z =
          -125 -
          Math.random() *
          75;

        groupRef.current.position.x =
          (
            Math.random() -
            0.5
          ) *
          42;

        groupRef.current.position.y =
          (
            Math.random() -
            0.5
          ) *
          25;

        /*
         * Update shader colors/type.
         */

        const nextType =
          PLANET_TYPES.indexOf(
            next.type
          ) + 1;

        materialUniforms.uType.value =
          nextType;

        materialUniforms.uColorA.value.set(
          next.palette[0]
        );

        materialUniforms.uColorB.value.set(
          next.palette[1]
        );

        materialUniforms.uColorC.value.set(
          next.palette[2]
        );

        atmosphereUniforms.uColor.value.set(
          next.atmosphere
        );

        materialUniforms.uSeed.value =
          Math.random() * 1000;

        materialUniforms.uTime.value =
          time;
      }


      materialUniforms
        .uCameraPosition
        .value.copy(
          state.camera.position
        );

      materialUniforms.uTime.value =
        time;
    }
  );


  return (
    <group
      ref={groupRef}
      position={startPosition}
    >

      {/* =================================================
          PLANET BODY
      ================================================= */}

      <mesh
        ref={planetRef}
        castShadow
        receiveShadow
        frustumCulled={true}
      >

        <sphereGeometry
          args={[
            size,
            160,
            160,
          ]}
        />

        <shaderMaterial
          uniforms={
            materialUniforms
          }
          vertexShader={
            planetVertexShader
          }
          fragmentShader={
            planetFragmentShader
          }
          lights={false}
          transparent={false}
          depthWrite
          depthTest
        />

      </mesh>


      {/* =================================================
          ATMOSPHERE
      ================================================= */}

      <mesh
        ref={atmosphereRef}
        scale={[
          1.045,
          1.045,
          1.045,
        ]}
      >

        <sphereGeometry
          args={[
            size,
            128,
            128,
          ]}
        />

        <shaderMaterial
          uniforms={
            atmosphereUniforms
          }
          vertexShader={
            atmosphereVertexShader
          }
          fragmentShader={
            atmosphereFragmentShader
          }
          transparent
          blending={
            AdditiveBlending
          }
          depthWrite={false}
          depthTest
          side={BackSide}
        />

      </mesh>


      {/* =================================================
          RINGS
      ================================================= */}

      {ring && (

        <group
          ref={ringRef}
          rotation={[
            1.05,
            0.20,
            0.12,
          ]}
        >

          <mesh>

            <ringGeometry
              args={[
                size * 1.25,
                size * 2.20,
                128,
              ]}
            />

            <meshBasicMaterial
              color={
                palette[2]
              }
              transparent
              opacity={0.62}
              side={DoubleSide}
              depthWrite={false}
            />

          </mesh>


          <mesh>

            <ringGeometry
              args={[
                size * 1.48,
                size * 1.62,
                128,
              ]}
            />

            <meshBasicMaterial
              color="#fff1d2"
              transparent
              opacity={0.30}
              side={DoubleSide}
              depthWrite={false}
            />

          </mesh>

        </group>

      )}

    </group>
  );
}


/* =========================================================
   PLANET SYSTEM
   MANY UNIQUE PLANETS
========================================================= */

function PlanetSystem() {

  const planets =
    useMemo(
      () => {

        return [

          {
            position: [
              -13,
              2,
              -34,
            ],
            config: {
              ...randomPlanetConfig(),
              size: 5.0,
            },
          },

          {
            position: [
              15,
              4,
              -62,
            ],
            config: {
              ...randomPlanetConfig(),
              size: 4.2,
              type: "gas",
              palette:
                PLANET_PALETTES.gas,
              ring: true,
            },
          },

          {
            position: [
              -7,
              -4,
              -22,
            ],
            config: {
              ...randomPlanetConfig(),
              size: 1.35,
              type: "lava",
              palette:
                PLANET_PALETTES.lava,
            },
          },

          {
            position: [
              8,
              -3,
              -48,
            ],
            config: {
              ...randomPlanetConfig(),
              size: 2.3,
              type: "ice",
              palette:
                PLANET_PALETTES.ice,
            },
          },

          {
            position: [
              3,
              5,
              -80,
            ],
            config: {
              ...randomPlanetConfig(),
              size: 1.15,
            },
          },

          {
            position: [
              -18,
              -7,
              -105,
            ],
            config: {
              ...randomPlanetConfig(),
              size: 3.3,
              type: "storm",
              palette:
                PLANET_PALETTES.storm,
              ring: true,
            },
          },

          {
            position: [
              20,
              8,
              -92,
            ],
            config: {
              ...randomPlanetConfig(),
              size: 2.4,
              type: "ocean",
              palette:
                PLANET_PALETTES.ocean,
            },
          },

          {
            position: [
              -25,
              10,
              -118,
            ],
            config: {
              ...randomPlanetConfig(),
              size: 2.8,
              type: "desert",
              palette:
                PLANET_PALETTES.desert,
            },
          },

          {
            position: [
              26,
              -10,
              -135,
            ],
            config: {
              ...randomPlanetConfig(),
              size: 3.5,
              type: "crystal",
              palette:
                PLANET_PALETTES.crystal,
              ring: true,
            },
          },

          {
            position: [
              -5,
              16,
              -150,
            ],
            config: {
              ...randomPlanetConfig(),
              size: 1.7,
              type: "toxic",
              palette:
                PLANET_PALETTES.toxic,
            },
          },

          {
            position: [
              34,
              12,
              -118,
            ],
            config: {
              ...randomPlanetConfig(),
              size: 2.1,
              type: "redRock",
              palette:
                PLANET_PALETTES.redRock,
            },
          },

          {
            position: [
              -34,
              -13,
              -142,
            ],
            config: {
              ...randomPlanetConfig(),
              size: 2.7,
              type: "darkRock",
              palette:
                PLANET_PALETTES.darkRock,
            },
          },

        ];

      },
      []
    );


  return (
    <>

      {planets.map(
        (
          planet,
          index
        ) => (

          <Planet
            key={index}
            position={
              planet.position
            }
            config={
              planet.config
            }
          />

        )
      )}

    </>
  );
}

/* =========================================================
   ASTEROID FIELD
========================================================= */

function AsteroidField() {

  const meshRef =
    useRef(null);

  const object =
    useMemo(
      () =>
        new Object3D(),
      []
    );


  const asteroidGeometry =
    useMemo(() => {

      const geometry =
        new IcosahedronGeometry(
          1,
          2
        );

      const position =
        geometry.attributes.position;

      for(
        let i=0;
        i<position.count;
        i++
      ) {

        const x =
          position.getX(i);

        const y =
          position.getY(i);

        const z =
          position.getZ(i);

        const length =
          Math.sqrt(
            x*x +
            y*y +
            z*z
          );

        if(
          length === 0
        ) {
          continue;
        }

        const random =
          0.72 +
          Math.random() *
          0.48;

        position.setXYZ(

          i,

          (
            x / length
          ) *
          random *
          (
            0.72 +
            Math.random() *
            0.55
          ),

          (
            y / length
          ) *
          random *
          (
            0.72 +
            Math.random() *
            0.55
          ),

          (
            z / length
          ) *
          random *
          (
            0.72 +
            Math.random() *
            0.55
          )

        );
      }

      geometry.computeVertexNormals();

      return geometry;

    }, []);


  const asteroidMaterial =
    useMemo(
      () =>
        new MeshStandardMaterial({

          color:
            new Color(
              "#77736d"
            ),

          roughness:
            0.96,

          metalness:
            0.015,

          flatShading:
            true,

        }),
      []
    );


  const asteroids =
    useMemo(() => {

      const count =
        560;

      return Array.from(
        {
          length:
            count,
        },
        () => {

          const r =
            Math.random();

          let size;

          if(
            r < 0.72
          ) {

            size =
              0.035 +
              Math.random() *
              0.14;

          } else if(
            r < 0.95
          ) {

            size =
              0.14 +
              Math.random() *
              0.30;

          } else {

            size =
              0.30 +
              Math.random() *
              0.60;
          }

          return {

            x:
              (
                Math.random() -
                0.5
              ) *
              82,

            y:
              (
                Math.random() -
                0.5
              ) *
              50,

            z:
              -25 -
              Math.random() *
              125,

            size,

            speed:
              0.45 +
              Math.random() *
              1.25,

            rotationX:
              Math.random() *
              Math.PI,

            rotationY:
              Math.random() *
              Math.PI,

            rotationZ:
              Math.random() *
              Math.PI,

            spinX:
              (
                Math.random() -
                0.5
              ) *
              1.8,

            spinY:
              (
                Math.random() -
                0.5
              ) *
              1.8,

            spinZ:
              (
                Math.random() -
                0.5
              ) *
              1.8,

            scaleX:
              0.62 +
              Math.random() *
              0.80,

            scaleY:
              0.62 +
              Math.random() *
              0.80,

            scaleZ:
              0.62 +
              Math.random() *
              0.80,

          };

        }
      );

    }, []);


  useEffect(() => {

    if(
      meshRef.current
    ) {

      meshRef.current
        .instanceMatrix
        .setUsage(35044);
    }

  }, []);


  useFrame(
    (_, delta) => {

      if(
        !meshRef.current
      ) {
        return;
      }

      asteroids.forEach(
        (
          asteroid,
          index
        ) => {

          asteroid.z +=
            TRAVEL_SPEED *
            asteroid.speed *
            delta;

          if(
            asteroid.z >
            CAMERA_Z + 8
          ) {

            asteroid.z =
              -125 -
              Math.random() *
              65;

            asteroid.x =
              (
                Math.random() -
                0.5
              ) *
              82;

            asteroid.y =
              (
                Math.random() -
                0.5
              ) *
              50;
          }

          asteroid.rotationX +=
            asteroid.spinX *
            delta;

          asteroid.rotationY +=
            asteroid.spinY *
            delta;

          asteroid.rotationZ +=
            asteroid.spinZ *
            delta;

          object.position.set(
            asteroid.x,
            asteroid.y,
            asteroid.z
          );

          object.rotation.set(
            asteroid.rotationX,
            asteroid.rotationY,
            asteroid.rotationZ
          );

          object.scale.set(

            asteroid.size *
              asteroid.scaleX,

            asteroid.size *
              asteroid.scaleY,

            asteroid.size *
              asteroid.scaleZ

          );

          object.updateMatrix();

          meshRef.current
            .setMatrixAt(
              index,
              object.matrix
            );
        }
      );

      meshRef.current
        .instanceMatrix
        .needsUpdate = true;
    }
  );


  return (
    <instancedMesh
      ref={meshRef}
      args={[
        asteroidGeometry,
        asteroidMaterial,
        asteroids.length,
      ]}
      frustumCulled={false}
      castShadow
      receiveShadow
    />
  );
}


/* =========================================================
   GALAXY
========================================================= */

function Galaxy() {

  const galaxyRef =
    useRef(null);

  const data =
    useMemo(() => {

      const count =
        18000;

      const positions =
        new Float32Array(
          count * 3
        );

      const colors =
        new Float32Array(
          count * 3
        );

      const center =
        new Color(
          "#fff5dd"
        );

      const middle =
        new Color(
          "#bd75ff"
        );

      const outer =
        new Color(
          "#487cff"
        );

      for(
        let i=0;
        i<count;
        i++
      ) {

        const radius =
          Math.pow(
            Math.random(),
            1.7
          ) *
          25;

        const arms = 5;

        const arm =
          Math.floor(
            Math.random() *
            arms
          ) *
          (
            Math.PI * 2 /
            arms
          );

        const spiral =
          radius *
          0.32;

        const spread =
          (
            Math.random() -
            0.5
          ) *
          (
            0.5 +
            radius *
            0.035
          );

        const angle =
          arm +
          spiral +
          spread;

        positions[i * 3] =
          Math.cos(angle) *
          radius;

        positions[i * 3 + 1] =
          (
            Math.random() -
            0.5
          ) *
          Math.max(
            0.3,
            radius * 0.09
          );

        positions[i * 3 + 2] =
          Math.sin(angle) *
          radius;

        const ratio =
          radius / 25;

        let color;

        if(
          ratio < 0.4
        ) {

          color =
            center
              .clone()
              .lerp(
                middle,
                ratio / 0.4
              );

        } else {

          color =
            middle
              .clone()
              .lerp(
                outer,
                (
                  ratio -
                  0.4
                ) /
                0.6
              );
        }

        colors[i * 3] =
          color.r;

        colors[i * 3 + 1] =
          color.g;

        colors[i * 3 + 2] =
          color.b;
      }

      return {
        positions,
        colors,
      };

    }, []);


  useFrame(
    (_, delta) => {

      if(
        !galaxyRef.current
      ) {
        return;
      }

      galaxyRef.current.rotation.y +=
        delta *
        0.025;

      galaxyRef.current.position.z +=
        delta *
        TRAVEL_SPEED *
        0.42;

      if(
        galaxyRef.current.position.z >
        10
      ) {

        galaxyRef.current.position.z =
          -125;
      }
    }
  );


  return (
    <group
      ref={galaxyRef}
      position={[
        10,
        5,
        -72,
      ]}
      rotation={[
        0.55,
        0,
        -0.25,
      ]}
    >

      <points>

        <bufferGeometry>

          <bufferAttribute
            attach="attributes-position"
            args={[
              data.positions,
              3,
            ]}
          />

          <bufferAttribute
            attach="attributes-color"
            args={[
              data.colors,
              3,
            ]}
          />

        </bufferGeometry>

        <pointsMaterial
          size={0.055}
          vertexColors
          transparent
          opacity={0.82}
          depthWrite={false}
          blending={
            AdditiveBlending
          }
        />

      </points>

      <mesh>

        <sphereGeometry
          args={[
            2.8,
            48,
            48,
          ]}
        />

        <meshBasicMaterial
          color="#fff3d2"
          transparent
          opacity={0.17}
          blending={
            AdditiveBlending
          }
          depthWrite={false}
        />

      </mesh>

    </group>
  );
}


/* =========================================================
   NEBULA
========================================================= */

function Nebula({
  position,
  scale,
  color,
  speed = 0.1,
}) {

  const ref =
    useRef(null);

  useFrame(
    (_, delta) => {

      if(
        !ref.current
      ) {
        return;
      }

      ref.current.rotation.z +=
        delta *
        speed;

      ref.current.rotation.x +=
        delta *
        speed *
        0.4;

      ref.current.position.z +=
        delta *
        TRAVEL_SPEED *
        0.15;

      if(
        ref.current.position.z >
        15
      ) {

        ref.current.position.z =
          -110;
      }
    }
  );


  return (
    <mesh
      ref={ref}
      position={position}
      scale={scale}
    >

      <icosahedronGeometry
        args={[
          1,
          5,
        ]}
      />

      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.035}
        blending={
          AdditiveBlending
        }
        depthWrite={false}
        side={BackSide}
      />

    </mesh>
  );
}


/* =========================================================
   DISTANT GALAXY
========================================================= */

function DistantGalaxy({
  position,
  scale = 1,
  rotation = [
    0,
    0,
    0,
  ],
}) {

  const ref =
    useRef(null);

  const data =
    useMemo(() => {

      const count =
        7000;

      const positions =
        new Float32Array(
          count * 3
        );

      const colors =
        new Float32Array(
          count * 3
        );

      const center =
        new Color(
          "#fff4d6"
        );

      const purple =
        new Color(
          "#b77cff"
        );

      const blue =
        new Color(
          "#6e8fff"
        );

      for(
        let i=0;
        i<count;
        i++
      ) {

        const radius =
          Math.pow(
            Math.random(),
            1.8
          ) *
          12;

        const arms = 4;

        const arm =
          Math.floor(
            Math.random() *
            arms
          ) *
          (
            Math.PI * 2 /
            arms
          );

        const angle =
          arm +
          radius * 0.38 +
          (
            Math.random() -
            0.5
          ) *
          (
            0.25 +
            radius * 0.035
          );

        positions[i * 3] =
          Math.cos(angle) *
          radius;

        positions[i * 3 + 1] =
          (
            Math.random() -
            0.5
          ) *
          (
            0.4 +
            radius * 0.07
          );

        positions[i * 3 + 2] =
          Math.sin(angle) *
          radius;

        const ratio =
          radius / 12;

        let color;

        if(
          ratio < 0.4
        ) {

          color =
            center
              .clone()
              .lerp(
                purple,
                ratio / 0.4
              );

        } else {

          color =
            purple
              .clone()
              .lerp(
                blue,
                (
                  ratio -
                  0.4
                ) /
                0.6
              );
        }

        colors[i * 3] =
          color.r;

        colors[i * 3 + 1] =
          color.g;

        colors[i * 3 + 2] =
          color.b;
      }

      return {
        positions,
        colors,
      };

    }, []);


  useFrame(
    (_, delta) => {

      if(
        !ref.current
      ) {
        return;
      }

      ref.current.rotation.y +=
        delta *
        0.012;

      ref.current.position.z +=
        delta *
        TRAVEL_SPEED *
        0.18;

      if(
        ref.current.position.z >
        20
      ) {

        ref.current.position.z =
          -150;
      }
    }
  );


  return (
    <group
      ref={ref}
      position={position}
      rotation={rotation}
      scale={scale}
    >

      <points>

        <bufferGeometry>

          <bufferAttribute
            attach="attributes-position"
            args={[
              data.positions,
              3,
            ]}
          />

          <bufferAttribute
            attach="attributes-color"
            args={[
              data.colors,
              3,
            ]}
          />

        </bufferGeometry>

        <pointsMaterial
          size={0.045}
          vertexColors
          transparent
          opacity={0.65}
          depthWrite={false}
          blending={
            AdditiveBlending
          }
        />

      </points>

      <mesh>

        <sphereGeometry
          args={[
            1.8,
            32,
            32,
          ]}
        />

        <meshBasicMaterial
          color="#fff0d2"
          transparent
          opacity={0.08}
          blending={
            AdditiveBlending
          }
          depthWrite={false}
        />

      </mesh>

    </group>
  );
}

/* =========================================================
   REALISTIC PROCEDURAL BLACK HOLE
========================================================= */

const blackHoleVertexShader = `
uniform float uTime;

varying vec2 vUv;
varying vec3 vWorldPosition;

void main() {

    vUv = uv;

    vec4 worldPosition =
        modelMatrix *
        vec4(position, 1.0);

    vWorldPosition =
        worldPosition.xyz;

    gl_Position =
        projectionMatrix *
        viewMatrix *
        worldPosition;
}
`;


/* =========================================================
   ACCRETION DISK SHADER
========================================================= */

const blackHoleDiskFragmentShader = `
uniform float uTime;

varying vec2 vUv;


/* ---------------------------------------------------------
   HASH
--------------------------------------------------------- */

float hash(vec2 p) {

    return fract(
        sin(
            dot(
                p,
                vec2(
                    127.1,
                    311.7
                )
            )
        ) *
        43758.5453123
    );
}


/* ---------------------------------------------------------
   NOISE
--------------------------------------------------------- */

float noise(vec2 p) {

    vec2 i =
        floor(p);

    vec2 f =
        fract(p);

    f =
        f *
        f *
        (
            3.0 -
            2.0 *
            f
        );

    float a =
        hash(i);

    float b =
        hash(
            i +
            vec2(
                1.0,
                0.0
            )
        );

    float c =
        hash(
            i +
            vec2(
                0.0,
                1.0
            )
        );

    float d =
        hash(
            i +
            vec2(
                1.0,
                1.0
            )
        );

    return mix(
        mix(a,b,f.x),
        mix(c,d,f.x),
        f.y
    );
}


/* ---------------------------------------------------------
   FBM
--------------------------------------------------------- */

float fbm(vec2 p) {

    float value =
        0.0;

    float amplitude =
        0.5;

    for(
        int i = 0;
        i < 5;
        i++
    ) {

        value +=
            noise(p) *
            amplitude;

        p *=
            2.0;

        amplitude *=
            0.5;
    }

    return value;
}


/* ---------------------------------------------------------
   MAIN
--------------------------------------------------------- */

void main() {

    vec2 centered =
        vUv -
        vec2(0.5);

    /*
      Convert plane UV into
      radial coordinates.
    */

    float radius =
        length(
            centered *
            vec2(
                2.0,
                1.0
            )
        );

    float angle =
        atan(
            centered.y,
            centered.x
        );


    /* -----------------------------------------------------
       DISK MASK
    ----------------------------------------------------- */

    float innerEdge =
        smoothstep(
            0.20,
            0.30,
            radius
        );

    float outerEdge =
        1.0 -
        smoothstep(
            0.78,
            1.0,
            radius
        );

    float disk =
        innerEdge *
        outerEdge;


    /* -----------------------------------------------------
       SPIRAL MOTION
    ----------------------------------------------------- */

    float rotation =
        uTime *
        0.75;

    float spiral =
        angle +
        rotation +
        radius *
        9.0;


    /* -----------------------------------------------------
       TURBULENCE
    ----------------------------------------------------- */

    float turbulence =
        fbm(
            vec2(
                spiral *
                0.75,

                radius *
                12.0
            )
        );


    float turbulence2 =
        fbm(
            vec2(
                angle * 4.0 +
                uTime * 0.25,

                radius * 25.0
            )
        );


    /* -----------------------------------------------------
       HOT INNER DISK
    ----------------------------------------------------- */

    float innerHeat =
        1.0 -
        smoothstep(
            0.18,
            0.62,
            radius
        );

    innerHeat =
        pow(
            innerHeat,
            1.7
        );


    /* -----------------------------------------------------
       DISK BANDS
    ----------------------------------------------------- */

    float bands =
        sin(
            radius *
            48.0
            -
            uTime *
            2.5
            +
            turbulence *
            8.0
        );

    bands =
        bands *
        0.5 +
        0.5;

    bands =
        smoothstep(
            0.25,
            0.72,
            bands
        );


    /* -----------------------------------------------------
       FINAL ENERGY
    ----------------------------------------------------- */

    float intensity =
        disk *
        (
            0.35 +
            turbulence *
            0.38 +
            bands *
            0.20
        );

    intensity +=
        innerHeat *
        0.75;


    /* -----------------------------------------------------
       BLACK HOLE CENTER
    ----------------------------------------------------- */

    float eventHorizon =
        1.0 -
        smoothstep(
            0.17,
            0.27,
            radius
        );

    intensity *=
        1.0 -
        eventHorizon;


    /* -----------------------------------------------------
       COLOR TEMPERATURE
    ----------------------------------------------------- */

    vec3 deepRed =
        vec3(
            0.28,
            0.008,
            0.001
        );

    vec3 red =
        vec3(
            0.95,
            0.055,
            0.006
        );

    vec3 orange =
        vec3(
            1.0,
            0.25,
            0.025
        );

    vec3 yellow =
        vec3(
            1.0,
            0.72,
            0.22
        );

    vec3 color =
        mix(
            deepRed,
            red,
            smoothstep(
                0.25,
                0.55,
                innerHeat
            )
        );

    color =
        mix(
            color,
            orange,
            innerHeat *
            0.70
        );

    color =
        mix(
            color,
            yellow,
            innerHeat *
            innerHeat *
            0.35
        );


    /* -----------------------------------------------------
       HOT SPOTS
    ----------------------------------------------------- */

    float hotspots =
        smoothstep(
            0.62,
            0.88,
            turbulence2
        );

    color +=
        vec3(
            1.0,
            0.42,
            0.08
        ) *
        hotspots *
        0.32;


    /* -----------------------------------------------------
       EDGE FALLOFF
    ----------------------------------------------------- */

    intensity *=
        smoothstep(
            1.0,
            0.55,
            radius
        );


    gl_FragColor =
        vec4(
            color,
            intensity
        );
}
`;


/* =========================================================
   BLACK HOLE GLOW / LENSING RING
========================================================= */

const blackHoleRingFragmentShader = `
uniform float uTime;

varying vec2 vUv;

void main() {

    vec2 p =
        vUv -
        vec2(0.5);

    float radius =
        length(p);


    /* Very thin photon ring */

    float ring =
        exp(
            -pow(
                (radius - 0.225) *
                90.0,
                2.0
            )
        );


    /* Secondary soft glow */

    float glow =
        exp(
            -pow(
                (radius - 0.25) *
                18.0,
                2.0
            )
        );


    float outerGlow =
        exp(
            -pow(
                (radius - 0.31) *
                8.0,
                2.0
            )
        );


    float pulse =
        0.92 +
        sin(
            uTime *
            1.8
        ) *
        0.08;


    float intensity =
        ring *
        1.5 *
        pulse
        +
        glow *
        0.38
        +
        outerGlow *
        0.10;


    vec3 color =
        vec3(
            1.0,
            0.20,
            0.025
        );


    color =
        mix(
            color,
            vec3(
                1.0,
                0.58,
                0.12
            ),
            glow
        );


    gl_FragColor =
        vec4(
            color,
            intensity
        );
}
`;


/* =========================================================
   BLACK HOLE DUST PARTICLES
========================================================= */

function BlackHoleParticles({
  radius = 5,
}) {

  const pointsRef =
    useRef(null);


  const data =
    useMemo(() => {

      const count =
        2800;


      const positions =
        new Float32Array(
          count * 3
        );

      const sizes =
        new Float32Array(
          count
        );


      for(
        let i = 0;
        i < count;
        i++
      ) {

        const r =
          2.7 +
          Math.random() *
          radius *
          1.35;


        const angle =
          Math.random() *
          Math.PI *
          2;


        /*
          Flattened accretion disk.
        */

        const thickness =
          (
            Math.random() -
            0.5
          ) *
          0.55;


        positions[i * 3] =
          Math.cos(angle) *
          r;

        positions[i * 3 + 1] =
          thickness *
          (
            0.4 +
            Math.random()
          );

        positions[i * 3 + 2] =
          Math.sin(angle) *
          r;


        sizes[i] =
          0.018 +
          Math.random() *
          0.045;
      }


      return {
        positions,
        sizes,
      };

    }, [radius]);


  useFrame(
    (_, delta) => {

      if(
        !pointsRef.current
      ) {
        return;
      }


      pointsRef.current.rotation.y +=
        delta *
        0.45;


      pointsRef.current.rotation.z +=
        delta *
        0.015;
    }
  );


  return (
    <points
      ref={pointsRef}
      frustumCulled={false}
    >

      <bufferGeometry>

        <bufferAttribute
          attach="attributes-position"
          args={[
            data.positions,
            3,
          ]}
        />

        <bufferAttribute
          attach="attributes-size"
          args={[
            data.sizes,
            1,
          ]}
        />

      </bufferGeometry>


      <pointsMaterial
        color="#ff9a38"
        size={0.045}
        transparent
        opacity={0.62}
        depthWrite={false}
        blending={
          AdditiveBlending
        }
        sizeAttenuation
      />

    </points>
  );
}


/* =========================================================
   BLACK HOLE
========================================================= */

function BlackHole({
  position = [
    18,
    5,
    -105,
  ],

  size = 4.5,

  speed = 0.18,

  tilt = 0.52,
}) {

  const groupRef =
    useRef(null);

  const diskRef =
    useRef(null);

  const ringRef =
    useRef(null);

  const horizonRef =
    useRef(null);


  const diskUniforms =
    useMemo(
      () => ({
        uTime: {
          value: 0,
        },
      }),
      []
    );


  const ringUniforms =
    useMemo(
      () => ({
        uTime: {
          value: 0,
        },
      }),
      []
    );


  useFrame(
    (state, delta) => {

      if(
        !groupRef.current
      ) {
        return;
      }


      const time =
        state.clock.elapsedTime;


      /* ---------------------------------------------------
         Move black hole through space
      --------------------------------------------------- */

      groupRef.current.position.z +=
        TRAVEL_SPEED *
        speed *
        delta;


      /* ---------------------------------------------------
         Slow gravitational rotation
      --------------------------------------------------- */

      if(
        diskRef.current
      ) {

        diskRef.current.rotation.z +=
          delta *
          0.30;

        diskRef.current.rotation.y +=
          delta *
          0.035;
      }


      if(
        ringRef.current
      ) {

        ringRef.current.rotation.z -=
          delta *
          0.045;
      }


      if(
        horizonRef.current
      ) {

        horizonRef.current.rotation.y +=
          delta *
          0.08;
      }


      /* ---------------------------------------------------
         Recycle
      --------------------------------------------------- */

      if(
        groupRef.current.position.z >
        CAMERA_Z + 15
      ) {

        groupRef.current.position.z =
          -145 -
          Math.random() *
          55;

        groupRef.current.position.x =
          (
            Math.random() -
            0.5
          ) *
          45;

        groupRef.current.position.y =
          (
            Math.random() -
            0.5
          ) *
          24;
      }


      diskUniforms.uTime.value =
        time;

      ringUniforms.uTime.value =
        time;
    }
  );


  return (
    <group
      ref={groupRef}
      position={position}
      rotation={[
        tilt,
        -0.12,
        0.08,
      ]}
    >

      {/* =================================================
          ACCRETION DISK
      ================================================= */}

      <mesh
        ref={diskRef}
        scale={[
          1.0,
          0.48,
          1.0,
        ]}
      >

        <planeGeometry
          args={[
            size * 5.2,
            size * 5.2,
          ]}
        />

        <shaderMaterial
          uniforms={
            diskUniforms
          }
          vertexShader={
            blackHoleVertexShader
          }
          fragmentShader={
            blackHoleDiskFragmentShader
          }
          transparent
          depthWrite={false}
          blending={
            AdditiveBlending
          }
          side={DoubleSide}
        />

      </mesh>


      {/* =================================================
          PHOTON RING
      ================================================= */}

      <mesh
        ref={ringRef}
        scale={[
          1.0,
          0.48,
          1.0,
        ]}
      >

        <planeGeometry
          args={[
            size * 2.9,
            size * 2.9,
          ]}
        />

        <shaderMaterial
          uniforms={
            ringUniforms
          }
          vertexShader={
            blackHoleVertexShader
          }
          fragmentShader={
            blackHoleRingFragmentShader
          }
          transparent
          depthWrite={false}
          blending={
            AdditiveBlending
          }
          side={DoubleSide}
        />

      </mesh>


      {/* =================================================
          EVENT HORIZON
      ================================================= */}

      <mesh
        ref={horizonRef}
      >

        <sphereGeometry
          args={[
            size * 0.54,
            96,
            96,
          ]}
        />

        <meshBasicMaterial
          color="#000000"
          side={BackSide}
        />

      </mesh>


      {/* =================================================
          INNER DARK CORE
      ================================================= */}

      <mesh>

        <sphereGeometry
          args={[
            size * 0.50,
            64,
            64,
          ]}
        />

        <meshBasicMaterial
          color="#000000"
        />

      </mesh>


      {/* =================================================
          PARTICLE / DUST DISK
      ================================================= */}

      <BlackHoleParticles
        radius={size}
      />

    </group>
  );
}
/* =========================================================
   MILKY WAY
========================================================= */

function MilkyWay() {

  const groupRef =
    useRef(null);

  const data =
    useMemo(() => {

      const count =
        24000;

      const positions =
        new Float32Array(
          count * 3
        );

      const colors =
        new Float32Array(
          count * 3
        );

      const white =
        new Color(
          "#fff7e8"
        );

      const warm =
        new Color(
          "#ffd9b0"
        );

      const blue =
        new Color(
          "#8eb8ff"
        );

      for(
        let i=0;
        i<count;
        i++
      ) {

        const distance =
          25 +
          Math.random() *
          95;

        const angle =
          Math.random() *
          Math.PI *
          2;

        const width =
          (
            Math.random() -
            0.5
          ) *
          (
            5 +
            distance *
            0.045
          );

        const x =
          Math.cos(angle) *
          distance;

        const z =
          Math.sin(angle) *
          distance;

        positions[i * 3] =
          x;

        positions[i * 3 + 1] =
          width;

        positions[i * 3 + 2] =
          z - 45;

        const random =
          Math.random();

        const color =
          random < 0.55
            ? white
            : random < 0.78
              ? warm
              : blue;

        colors[i * 3] =
          color.r;

        colors[i * 3 + 1] =
          color.g;

        colors[i * 3 + 2] =
          color.b;
      }

      return {
        positions,
        colors,
      };

    }, []);


  useFrame(
    (_, delta) => {

      if(
        !groupRef.current
      ) {
        return;
      }

      groupRef.current.rotation.y +=
        delta *
        0.0025;
    }
  );


  return (
    <group
      ref={groupRef}
      rotation={[
        0.42,
        0.15,
        -0.28,
      ]}
    >

      <points
        frustumCulled={false}
      >

        <bufferGeometry>

          <bufferAttribute
            attach="attributes-position"
            args={[
              data.positions,
              3,
            ]}
          />

          <bufferAttribute
            attach="attributes-color"
            args={[
              data.colors,
              3,
            ]}
          />

        </bufferGeometry>

        <pointsMaterial
          size={0.045}
          vertexColors
          transparent
          opacity={0.58}
          depthWrite={false}
          blending={
            AdditiveBlending
          }
        />

      </points>

    </group>
  );
}


/* =========================================================
   CAMERA
========================================================= */

function CameraMotion() {

  const {
    camera,
    pointer,
  } = useThree();

  const target =
    useMemo(
      () =>
        new Vector3(),
      []
    );

  useFrame(
    (state) => {

      const time =
        state.clock.elapsedTime;

      target.set(

        pointer.x *
          0.7 +
          Math.sin(
            time * 0.08
          ) *
          0.12,

        pointer.y *
          0.35 +
          Math.cos(
            time * 0.06
          ) *
          0.08,

        -30

      );

      camera.position.x =
        MathUtils.lerp(
          camera.position.x,
          target.x,
          0.025
        );

      camera.position.y =
        MathUtils.lerp(
          camera.position.y,
          target.y,
          0.025
        );

      camera.lookAt(
        target
      );
    }
  );

  return null;
}


/* =========================================================
   CINEMATIC SUN
   Large visible star + layered glow + point light.
========================================================= */

function CinematicSun() {

  const groupRef = useRef(null);
  const coreRef = useRef(null);
  const glowRef = useRef(null);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const t = state.clock.elapsedTime;

    groupRef.current.rotation.z += delta * 0.018;

    if (coreRef.current) {
      const pulse = 1 + Math.sin(t * 0.75) * 0.018;
      coreRef.current.scale.setScalar(pulse);
    }

    if (glowRef.current) {
      const glowPulse = 1 + Math.sin(t * 0.55) * 0.035;
      glowRef.current.scale.setScalar(glowPulse);
    }
  });

  return (
    <group
      ref={groupRef}
      position={SUN_POSITION.toArray()}
    >

      {/* Powerful light source */}
      <pointLight
        color="#ffd08a"
        intensity={260}
        distance={280}
        decay={1.35}
      />

      {/* Soft secondary warm fill */}
      <pointLight
        color="#ff8b32"
        intensity={55}
        distance={160}
        decay={1.7}
      />

      {/* Outer atmospheric glow */}
      <mesh
        ref={glowRef}
        scale={[1.75, 1.75, 1.75]}
      >
        <sphereGeometry args={[9.2, 64, 64]} />
        <meshBasicMaterial
          color="#ff8a22"
          transparent
          opacity={0.21}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <mesh scale={[1.35, 1.35, 1.35]}>
        <sphereGeometry args={[6.0, 64, 64]} />
        <meshBasicMaterial
          color="#ffb347"
          transparent
          opacity={0.21}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Sun corona */}
      <mesh scale={[1.12, 1.12, 1.12]}>
        <sphereGeometry args={[5.8, 64, 64]} />
        <meshBasicMaterial
          color="#ffcf78"
          transparent
          opacity={0.36}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Hot visible solar surface */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[5.35, 96, 96]} />
        <meshBasicMaterial color="#fff1bd" />
      </mesh>

      {/* Cross-shaped solar flare */}
      <mesh rotation={[0, 0, Math.PI / 4]} scale={[1, 1, 1]}>
        <planeGeometry args={[25, 0.38]} />
        <meshBasicMaterial
          color="#ffd27a"
          transparent
          opacity={0.21}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <mesh rotation={[0, 0, -Math.PI / 4]}>
        <planeGeometry args={[25, 0.38]} />
        <meshBasicMaterial
          color="#ffb14d"
          transparent
          opacity={0.10}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

    </group>
  );
}


/* =========================================================
   LIGHTING
========================================================= */

function SpaceLighting() {

  return (
    <>

      <ambientLight
        intensity={0.055}
      />

      {/* Fixed Sun light — never moves or recycles. */}
      <pointLight
        position={[
          SUN_LIGHT_POSITION.x,
          SUN_LIGHT_POSITION.y,
          SUN_LIGHT_POSITION.z,
        ]}
        intensity={320}
        distance={300}
        decay={1.25}
        color="#fff0b8"
        castShadow
      />

      {/* Gentle fill from the same Sun position. */}
      <pointLight
        position={[
          SUN_LIGHT_POSITION.x,
          SUN_LIGHT_POSITION.y,
          SUN_LIGHT_POSITION.z,
        ]}
        intensity={45}
        distance={190}
        decay={1.7}
        color="#ffb45e"
      />

      <pointLight
        position={[
          12,
          5,
          -35,
        ]}
        intensity={10}
        distance={55}
        color="#8d6cff"
      />

      <pointLight
        position={[
          -18,
          -8,
          -50,
        ]}
        intensity={7}
        distance={60}
        color="#3b7cff"
      />

      <pointLight
        position={[
          0,
          8,
          -95,
        ]}
        intensity={5}
        distance={80}
        color="#ffb77a"
      />

    </>
  );
}


/* =========================================================
   SCENE
========================================================= */

function SpaceScene() {

  return (
    <>

      <color
        attach="background"
        args={[
          "#010207",
        ]}
      />

      <fog
        attach="fog"
        args={[
          "#010207",
          35,
          145,
        ]}
      />


      <CameraMotion />

      <SpaceLighting />


      {/* ===================================================
          COSMIC LIGHTS
      =================================================== */}

      <CosmicBackgroundLight
        position={[
          -18,
          8,
          -105,
        ]}
        scale={[
          55,
          30,
          1,
        ]}
        colorA="#101d66"
        colorB="#4c3ca8"
        colorC="#e7d5ff"
        opacity={0.20}
        speed={0.0015}
      />

      <CosmicBackgroundLight
        position={[
          17,
          7,
          -92,
        ]}
        scale={[
          48,
          27,
          1,
        ]}
        colorA="#111d67"
        colorB="#633ba9"
        colorC="#ffe1c1"
        opacity={0.17}
        speed={-0.001}
      />

      <CosmicBackgroundLight
        position={[
          4,
          -7,
          -125,
        ]}
        scale={[
          65,
          34,
          1,
        ]}
        colorA="#0c245d"
        colorB="#294fb1"
        colorC="#cbd8ff"
        opacity={0.14}
        speed={0.0012}
      />

      <CosmicBackgroundLight
        position={[
          -34,
          -5,
          -138,
        ]}
        scale={[
          42,
          27,
          1,
        ]}
        colorA="#17134d"
        colorB="#4f2b98"
        colorC="#d2b7ff"
        opacity={0.11}
        speed={-0.0008}
      />

      <CosmicBackgroundLight
        position={[
          32,
          15,
          -145,
        ]}
        scale={[
          38,
          23,
          1,
        ]}
        colorA="#0b1b48"
        colorB="#3153a4"
        colorC="#a9c6ff"
        opacity={0.09}
        speed={0.0007}
      />


      {/* ===================================================
          CINEMATIC SUN
      =================================================== */}

      <CinematicSun />


      {/* ===================================================
          STARS
      =================================================== */}

      <StarField />


      {/* ===================================================
          GALAXIES
      =================================================== */}

      <Galaxy />

      <DistantGalaxy
        position={[
          -35,
          18,
          -105,
        ]}
        scale={0.9}
        rotation={[
          0.7,
          0.2,
          -0.4,
        ]}
      />

      <DistantGalaxy
        position={[
          32,
          -12,
          -125,
        ]}
        scale={0.65}
        rotation={[
          1.1,
          -0.3,
          0.5,
        ]}
      />

      <DistantGalaxy
        position={[
          42,
          20,
          -95,
        ]}
        scale={0.45}
        rotation={[
          0.4,
          0.8,
          -0.2,
        ]}
      />

      <DistantGalaxy
        position={[
          -40,
          -20,
          -140,
        ]}
        scale={0.55}
        rotation={[
          0.9,
          0.2,
          0.3,
        ]}
      />


      {/* ===================================================
          NEBULAE
      =================================================== */}

      <Nebula
        position={[
          -20,
          6,
          -45,
        ]}
        scale={[
          20,
          8,
          11,
        ]}
        color="#6336ff"
        speed={0.008}
      />

      <Nebula
        position={[
          20,
          -5,
          -65,
        ]}
        scale={[
          18,
          7,
          12,
        ]}
        color="#244cff"
        speed={-0.006}
      />

      <Nebula
        position={[
          -5,
          14,
          -90,
        ]}
        scale={[
          25,
          8,
          12,
        ]}
        color="#a63cff"
        speed={0.005}
      />


      {/* ===================================================
          MILKY WAY
      =================================================== */}

      <MilkyWay />


      {/* ===================================================
          MANY UNIQUE PLANETS
      =================================================== */}

      <PlanetSystem />


      {/* ===================================================
          REALISTIC BLACK HOLE
      =================================================== */}

      <BlackHole
        position={[
          18,
          6,
          -110,
        ]}
        size={5.2}
        speed={0.16}
        tilt={0.58}
      />


      {/* ===================================================
          ASTEROIDS
      =================================================== */}

      <AsteroidField />

    </>
  );
}


/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function SpaceBackground() {

  return (
    <div
      className="space-background"
    >

      <Canvas

        camera={{
          position: [
            0,
            0,
            CAMERA_Z,
          ],

          fov: 68,

          near: 0.1,

          far: 180,
        }}

        dpr={[
          1,
          1.5,
        ]}

        gl={{
          antialias: true,

          alpha: false,

          powerPreference:
            "high-performance",
          toneMapping:
            ACESFilmicToneMapping,
          toneMappingExposure:
            1.12,
        }}

      >

        <SpaceScene />

      </Canvas>

    </div>
  );
}