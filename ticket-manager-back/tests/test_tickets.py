from app.models.enums import Role
from app.models.user import User

from .conftest import auth_header


def test_create_ticket_success(client, employee):
    response = client.post(
        "/api/tickets",
        json={
            "title": "Impressora quebrada",
            "description": "Não liga.",
            "category": "IT",
            "priority": "HIGH",
        },
        headers=auth_header(employee),
    )

    assert response.status_code == 201
    body = response.json()
    assert body["status"] == "OPEN"
    assert body["created_by_id"] == employee.id
    assert body["title"] == "Impressora quebrada"


def test_create_ticket_without_user_returns_401(client):
    response = client.post(
        "/api/tickets",
        json={"title": "X", "description": "Y", "category": "IT", "priority": "LOW"},
    )

    assert response.status_code == 401


def test_create_ticket_with_unknown_user_returns_401(client):
    fake_user = User(id="nao-existe", name="X", email="x@x.com", role=Role.EMPLOYEE, hashed_password="x")
    response = client.post(
        "/api/tickets",
        json={"title": "X", "description": "Y", "category": "IT", "priority": "LOW"},
        headers=auth_header(fake_user),
    )

    assert response.status_code == 401


def test_create_ticket_missing_title_returns_422(client, employee):
    response = client.post(
        "/api/tickets",
        json={"title": "", "description": "Y", "category": "IT", "priority": "LOW"},
        headers=auth_header(employee),
    )

    assert response.status_code == 422
    assert isinstance(response.json()["detail"], str)


def test_create_ticket_invalid_category_returns_422(client, employee):
    response = client.post(
        "/api/tickets",
        json={"title": "X", "description": "Y", "category": "INVALID", "priority": "LOW"},
        headers=auth_header(employee),
    )

    assert response.status_code == 422


def _create_ticket(client, user, title="Ticket", category="IT", priority="LOW"):
    response = client.post(
        "/api/tickets",
        json={"title": title, "description": "Descrição", "category": category, "priority": priority},
        headers=auth_header(user),
    )
    assert response.status_code == 201
    return response.json()


def test_list_tickets_empty_returns_200_empty_page(client, support):
    response = client.get("/api/tickets", headers=auth_header(support))

    assert response.status_code == 200
    body = response.json()
    assert body["items"] == []
    assert body["total"] == 0
    assert body["page"] == 1
    assert body["page_size"] == 10


def test_list_tickets_employee_sees_only_own(client, employee, support):
    _create_ticket(client, employee, title="Da Ana")
    _create_ticket(client, support, title="Do Carlos")

    response = client.get("/api/tickets", headers=auth_header(employee))

    assert response.status_code == 200
    body = response.json()
    assert body["total"] == 1
    assert [item["title"] for item in body["items"]] == ["Da Ana"]


def test_list_tickets_support_sees_all(client, employee, support):
    _create_ticket(client, employee, title="Da Ana")
    _create_ticket(client, support, title="Do Carlos")

    response = client.get("/api/tickets", headers=auth_header(support))

    assert response.status_code == 200
    titles = {item["title"] for item in response.json()["items"]}
    assert titles == {"Da Ana", "Do Carlos"}


def test_list_tickets_ordered_by_created_at_desc_by_default(client, support):
    _create_ticket(client, support, title="Primeiro")
    _create_ticket(client, support, title="Segundo")

    response = client.get("/api/tickets", headers=auth_header(support))

    titles = [item["title"] for item in response.json()["items"]]
    assert titles == ["Segundo", "Primeiro"]


def test_list_tickets_includes_created_by_name(client, employee):
    _create_ticket(client, employee, title="Ticket com nome")

    response = client.get("/api/tickets", headers=auth_header(employee))

    assert response.json()["items"][0]["created_by_name"] == employee.name


def test_list_tickets_filter_by_status(client, support):
    ticket = _create_ticket(client, support, title="Fica aberto")
    _create_ticket(client, support, title="Também aberto")

    response = client.get(
        "/api/tickets", params={"status": "OPEN"}, headers=auth_header(support)
    )

    assert response.status_code == 200
    assert response.json()["total"] == 2
    assert ticket["status"] == "OPEN"


def test_list_tickets_filter_by_category(client, support):
    _create_ticket(client, support, title="TI", category="IT")
    _create_ticket(client, support, title="RH", category="HR")

    response = client.get(
        "/api/tickets", params={"category": "HR"}, headers=auth_header(support)
    )

    titles = [item["title"] for item in response.json()["items"]]
    assert titles == ["RH"]


def test_list_tickets_filter_by_priority(client, support):
    _create_ticket(client, support, title="Baixa", priority="LOW")
    _create_ticket(client, support, title="Urgente", priority="URGENT")

    response = client.get(
        "/api/tickets", params={"priority": "URGENT"}, headers=auth_header(support)
    )

    titles = [item["title"] for item in response.json()["items"]]
    assert titles == ["Urgente"]


def test_list_tickets_sort_by_priority_desc(client, support):
    # Ordem de criação de propósito embaralhada e cobrindo os 4 valores — "HIGH"
    # vem alfabeticamente antes de "LOW", então esse teste pega a ordenação
    # errada (alfabética) se a de severidade não estiver implementada de verdade.
    _create_ticket(client, support, title="Baixa", priority="LOW")
    _create_ticket(client, support, title="Urgente", priority="URGENT")
    _create_ticket(client, support, title="Media", priority="MEDIUM")
    _create_ticket(client, support, title="Alta", priority="HIGH")

    response = client.get(
        "/api/tickets",
        params={"sort_by": "priority", "sort_dir": "desc"},
        headers=auth_header(support),
    )

    titles = [item["title"] for item in response.json()["items"]]
    assert titles == ["Urgente", "Alta", "Media", "Baixa"]


def test_list_tickets_sort_by_priority_asc(client, support):
    _create_ticket(client, support, title="Baixa", priority="LOW")
    _create_ticket(client, support, title="Urgente", priority="URGENT")
    _create_ticket(client, support, title="Alta", priority="HIGH")

    response = client.get(
        "/api/tickets",
        params={"sort_by": "priority", "sort_dir": "asc"},
        headers=auth_header(support),
    )

    titles = [item["title"] for item in response.json()["items"]]
    assert titles == ["Baixa", "Alta", "Urgente"]


def test_list_tickets_pagination(client, support):
    for i in range(3):
        _create_ticket(client, support, title=f"Ticket {i}")

    response = client.get(
        "/api/tickets", params={"page": 1, "page_size": 2}, headers=auth_header(support)
    )

    body = response.json()
    assert body["total"] == 3
    assert body["page"] == 1
    assert body["page_size"] == 2
    assert len(body["items"]) == 2

    second_page = client.get(
        "/api/tickets", params={"page": 2, "page_size": 2}, headers=auth_header(support)
    )
    assert len(second_page.json()["items"]) == 1


def test_list_tickets_invalid_status_returns_422(client, support):
    response = client.get(
        "/api/tickets", params={"status": "INVALID"}, headers=auth_header(support)
    )

    assert response.status_code == 422


def test_list_tickets_invalid_sort_by_returns_422(client, support):
    response = client.get(
        "/api/tickets", params={"sort_by": "invalid"}, headers=auth_header(support)
    )

    assert response.status_code == 422


def test_list_tickets_invalid_page_returns_422(client, support):
    response = client.get(
        "/api/tickets", params={"page": 0}, headers=auth_header(support)
    )

    assert response.status_code == 422


def test_list_tickets_page_size_too_large_returns_422(client, support):
    response = client.get(
        "/api/tickets", params={"page_size": 1000}, headers=auth_header(support)
    )

    assert response.status_code == 422


def test_list_tickets_page_size_zero_returns_422(client, support):
    response = client.get(
        "/api/tickets", params={"page_size": 0}, headers=auth_header(support)
    )

    assert response.status_code == 422


def test_create_ticket_description_too_long_returns_422(client, employee):
    response = client.post(
        "/api/tickets",
        json={
            "title": "X",
            "description": "a" * 5001,
            "category": "IT",
            "priority": "LOW",
        },
        headers=auth_header(employee),
    )

    assert response.status_code == 422
