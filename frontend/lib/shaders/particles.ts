// Particle Shader for Neural Network Effect

export const particleVertexShader = `
attribute vec3 velocity;
uniform float time;
uniform float speedMultiplier;
uniform float sphereRadius;
uniform float vortexStrength;

varying vec3 vColor;

void main() {
  vec3 pos = position;
  
  // Animate particles based on velocity and time
  pos += velocity * time * speedMultiplier;
  
  // Vortex effect (spiral motion)
  if (vortexStrength > 0.0) {
    float dist = length(pos.xy);
    float angle = atan(pos.y, pos.x) + time * speedMultiplier * vortexStrength;
    pos.x = dist * cos(angle);
    pos.y = dist * sin(angle);
  }
  
  // Keep particles within sphere bounds
  if (length(pos) > sphereRadius) {
    pos = normalize(pos) * (sphereRadius - 0.1);
  }
  
  vColor = vec3(1.0);
  
  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = 3.0 * (300.0 / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;
}
`;

export const particleFragmentShader = `
uniform vec3 particleColor;
uniform float particleSize;
varying vec3 vColor;

void main() {
  // Create circular particle
  vec2 center = gl_PointCoord - vec2(0.5);
  float dist = length(center);
  
  if (dist > 0.5) {
    discard;
  }
  
  // Soft edges
  float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
  
  gl_FragColor = vec4(particleColor * vColor, alpha * 0.8);
}
`;
