"""Generate DID and JWK for agent authentication"""
import json
from cryptography.hazmat.primitives.asymmetric import ed25519
from cryptography.hazmat.primitives import serialization
import base58
import base64

# Generate Ed25519 key
private_key = ed25519.Ed25519PrivateKey.generate()
public_key = private_key.public_key()

# Get raw bytes
private_bytes = private_key.private_bytes(
    encoding=serialization.Encoding.Raw,
    format=serialization.PrivateFormat.Raw,
    encryption_algorithm=serialization.NoEncryption()
)
public_bytes = public_key.public_bytes(
    encoding=serialization.Encoding.Raw,
    format=serialization.PublicFormat.Raw
)

# Create DID
multicodec_key = b'\\xed\\x01' + public_bytes
did = f"did:key:z{base58.b58encode(multicodec_key).decode()}"

# Create JWK
jwk = {
    "kty": "OKP",
    "crv": "Ed25519",
    "d": base64.urlsafe_b64encode(private_bytes).decode().rstrip('='),
    "x": base64.urlsafe_b64encode(public_bytes).decode().rstrip('='),
}

print(f"Generated Agent DID and JWK:")
print(f"\\nAGENT_DID={did}")
print(f"\\nAGENT_JWK='{json.dumps(jwk)}'")
print(f"\\n\\nAdd these to your .env file (replace existing AGENT_DID line and add AGENT_JWK)!")
