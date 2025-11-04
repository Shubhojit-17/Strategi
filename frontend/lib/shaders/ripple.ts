// Ripple Effect Shader for Upload Surface

export const rippleVertexShader = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const rippleFragmentShader = `
uniform float time;
uniform vec2 mouse;
uniform float rippleStrength;
varying vec2 vUv;

void main() {
  vec2 uv = vUv;
  float dist = distance(uv, mouse);
  
  // Create ripple waves
  float ripple = sin(dist * 10.0 - time * 3.0) * rippleStrength;
  ripple *= exp(-dist * 3.0); // Fade with distance
  
  vec3 color = vec3(0.235, 0.949, 1.0); // Neon aqua
  float alpha = ripple * 0.3;
  
  gl_FragColor = vec4(color, alpha);
}
`;
