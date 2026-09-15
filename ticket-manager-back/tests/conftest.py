import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import app.models  # noqa: F401  garante que todos os models estão registrados
from app.core.security import create_access_token, hash_password
from app.db.base import Base
from app.db.session import get_db
from app.main import app
from app.models.enums import Role
from app.models.user import User


def auth_header(user: User) -> dict[str, str]:
    return {"Authorization": f"Bearer {create_access_token(user)}"}

engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture()
def db_session():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def client(db_session):
    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture()
def employee(db_session):
    user = User(
        id="ana-employee",
        name="Ana",
        email="ana@ticketmanager.local",
        hashed_password=hash_password("Aa12345678"),
        role=Role.EMPLOYEE,
    )
    db_session.add(user)
    db_session.commit()
    return user


@pytest.fixture()
def support(db_session):
    user = User(
        id="carlos-support",
        name="Carlos",
        email="carlos@ticketmanager.local",
        hashed_password=hash_password("Aa12345678"),
        role=Role.SUPPORT,
    )
    db_session.add(user)
    db_session.commit()
    return user
