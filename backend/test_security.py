from app.auth.security import hash_password, verify_password

password = "123456"

hashed = hash_password(password)

print("Hashed Password:", hashed)

print(
    verify_password(
        password,
        hashed
    )
)