import pytest


async def test_register_verify_login_flow(client):
    """Full real registration flow, exactly as a learner would experience
    it: register -> receive a dev-mode OTP (since no SMTP is configured in
    this test env, it's echoed back per APP_ENV=development) -> verify ->
    get back real JWT tokens -> use them to fetch /auth/me."""
    register_res = await client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Test Learner",
            "email": "learner@example.com",
            "password": "password123",
            "confirm_password": "password123",
            "role": "learner",
        },
    )
    assert register_res.status_code == 201
    body = register_res.json()
    assert body["email"] == "learner@example.com"
    otp = body.get("dev_otp_code")
    assert otp, "dev_otp_code should be echoed back when APP_ENV=development and no SMTP configured"

    verify_res = await client.post(
        "/api/v1/auth/verify-email-otp",
        json={"email": "learner@example.com", "otp": otp},
    )
    assert verify_res.status_code == 200
    tokens = verify_res.json()
    assert tokens["access_token"]
    assert tokens["user"]["role"] == "learner"

    me_res = await client.get(
        "/api/v1/auth/me", headers={"Authorization": f"Bearer {tokens['access_token']}"}
    )
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "learner@example.com"


async def test_register_rejects_mismatched_passwords(client):
    res = await client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Bad Input",
            "email": "bad@example.com",
            "password": "password123",
            "confirm_password": "different",
            "role": "learner",
        },
    )
    assert res.status_code == 400


async def test_register_cannot_self_provision_privileged_role(client):
    """Security regression test: UserRegister.role must be ignored server-side
    — a learner signup request claiming role=administrator must still only
    ever create a learner account (see the comment in routers/auth.py)."""
    register_res = await client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Sneaky",
            "email": "sneaky@example.com",
            "password": "password123",
            "confirm_password": "password123",
            "role": "administrator",
        },
    )
    assert register_res.status_code == 201
    otp = register_res.json()["dev_otp_code"]

    verify_res = await client.post(
        "/api/v1/auth/verify-email-otp",
        json={"email": "sneaky@example.com", "otp": otp},
    )
    assert verify_res.json()["user"]["role"] == "learner"


async def test_login_requires_verified_email(client):
    await client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Unverified",
            "email": "unverified@example.com",
            "password": "password123",
            "confirm_password": "password123",
            "role": "learner",
        },
    )
    login_res = await client.post(
        "/api/v1/auth/login",
        json={"email": "unverified@example.com", "password": "password123"},
    )
    assert login_res.status_code in (400, 401, 403)
