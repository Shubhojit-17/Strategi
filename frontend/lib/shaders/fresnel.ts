// Fresnel Shader for Bubble Edge Glow Effect

export const fresnelVertexShader = `
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vWorldPosition;

void main() {
  vNormal = normalize(normalMatrix * normal);
  vPosition = position;
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPosition.xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const fresnelFragmentShader = `
uniform vec3 glowColor;
uniform float intensity;
uniform float power;
varying vec3 vNormal;
varying vec3 vWorldPosition;

void main() {
  vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
  float fresnel = pow(1.0 - dot(vNormal, viewDirection), power);
  vec3 glow = glowColor * fresnel * intensity;
  float alpha = fresnel * 0.5;
  gl_FragColor = vec4(glow, alpha);
}
`;
