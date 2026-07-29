from app.utils.password import hash_password, verify_password

password = "anurudh123"

# Hash the password
hashed_password = hash_password(password)

print("Original Password :", password)
print("Hashed Password   :", hashed_password)

# Verify correct password
print("\nTesting Correct Password...")
print(verify_password("anurudh123", hashed_password))

# Verify incorrect password
print("\nTesting Wrong Password...")
print(verify_password("wrongpassword", hashed_password))