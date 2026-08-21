from app.utils.jwt import create_access_token, verify_access_token

# Sample payload
payload = {
    "sub": "anurudh@gmail.com",
    "role": "Learner"
}

# Generate JWT
token = create_access_token(payload)

print("Generated JWT Token:\n")
print(token)

print("\n" + "=" * 60)

# Verify JWT
decoded_payload = verify_access_token(token)

print("Decoded Payload:\n")
print(decoded_payload)