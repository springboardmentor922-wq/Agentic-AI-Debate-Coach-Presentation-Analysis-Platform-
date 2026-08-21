from app.utils.password import hash_password, verify_password

password = "haru1234"

# Hash the password
hashed_password = hash_password(password)

print("Original Password :", password)
print("Hashed Password   :", hashed_password)

# Verify correct password
print("\nTesting Correct Password...")
print(verify_password("haru1234", hashed_password))

# Verify incorrect password
print("\nTesting Wrong Password...")
print(verify_password("wrongpassword", hashed_password))