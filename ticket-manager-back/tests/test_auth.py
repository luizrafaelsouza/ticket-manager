from datetime import datetime, timedelta, timezone

import jwt

from app.core.config import settings

from .conftest import auth_header

SEED_PASSWORD = "Aa12345678"


def test_login_success(client, employee):
    response = client.post(
        "/api/auth/login", json={"email": employee.email, "password": SEED_PASSWORD}
    )

    assert response.status_code == 200
    body = response.json()
    assert body["token_type"] == "bearer"
    assert body["access_token"]
    assert body["user"]["id"] == employee.id
    assert body["user"]["email"] == employee.email
    assert body["user"]["role"] == "EMPLOYEE"


def test_login_wrong_password_returns_401(client, employee):
    response = client.post(
        "/api/auth/login", json={"email": employee.email, "password": "senha-errada"}
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid email or password"


def test_login_unknown_email_returns_401(client):
    response = client.post(
        "/api/auth/login", json={"email": "ninguem@ticketmanager.local", "password": "qualquer"}
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid email or password"


def test_me_without_token_returns_401(client):
    response = client.get("/api/auth/me")

    assert response.status_code == 401


def test_me_with_valid_token_returns_user(client, employee):
    response = client.get("/api/auth/me", headers=auth_header(employee))

    assert response.status_code == 200
    body = response.json()
    assert body["id"] == employee.id
    assert body["name"] == employee.name


def test_me_with_expired_token_returns_401(client, employee):
    expired_payload = {
        "sub": employee.id,
        "role": employee.role,
        "email": employee.email,
        "exp": datetime.now(timezone.utc) - timedelta(minutes=1),
    }
    expired_token = jwt.encode(expired_payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

    response = client.get("/api/auth/me", headers={"Authorization": f"Bearer {expired_token}"})

    assert response.status_code == 401


def test_me_with_malformed_token_returns_401(client):
    response = client.get("/api/auth/me", headers={"Authorization": "Bearer isto-nao-e-um-jwt"})

    assert response.status_code == 401
