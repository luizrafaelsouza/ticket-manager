from .conftest import auth_header


def _create_ticket(client, user, title="Ticket"):
    response = client.post(
        "/api/tickets",
        json={"title": title, "description": "Descrição", "category": "IT", "priority": "LOW"},
        headers=auth_header(user),
    )
    assert response.status_code == 201
    return response.json()


def _advance(client, ticket_id, new_status, user):
    return client.patch(
        f"/api/tickets/{ticket_id}/status",
        json={"status": new_status},
        headers=auth_header(user),
    )


def test_advance_status_valid_transition_records_history(client, support):
    ticket = _create_ticket(client, support)

    response = _advance(client, ticket["id"], "IN_PROGRESS", support)

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "IN_PROGRESS"
    assert [item["to_status"] for item in body["history"]] == ["OPEN", "IN_PROGRESS"]
    assert body["history"][-1]["changed_by_name"] == support.name


def test_advance_status_skipping_a_step_returns_409(client, support):
    ticket = _create_ticket(client, support)

    response = _advance(client, ticket["id"], "RESOLVED", support)

    assert response.status_code == 409


def test_advance_status_from_closed_returns_409(client, support):
    ticket = _create_ticket(client, support)
    for next_status in ("IN_PROGRESS", "RESOLVED", "CLOSED"):
        assert _advance(client, ticket["id"], next_status, support).status_code == 200

    response = _advance(client, ticket["id"], "IN_PROGRESS", support)

    assert response.status_code == 409


def test_advance_status_employee_forbidden(client, employee, support):
    ticket = _create_ticket(client, support)

    response = _advance(client, ticket["id"], "IN_PROGRESS", employee)

    assert response.status_code == 403


def test_advance_status_ticket_not_found_returns_404(client, support):
    response = _advance(client, "nao-existe", "IN_PROGRESS", support)

    assert response.status_code == 404


def test_advance_status_without_token_returns_401(client, support):
    ticket = _create_ticket(client, support)

    response = client.patch(
        f"/api/tickets/{ticket['id']}/status", json={"status": "IN_PROGRESS"}
    )

    assert response.status_code == 401


def test_advance_status_note_too_long_returns_422(client, support):
    ticket = _create_ticket(client, support)

    response = client.patch(
        f"/api/tickets/{ticket['id']}/status",
        json={"status": "IN_PROGRESS", "note": "a" * 1001},
        headers=auth_header(support),
    )

    assert response.status_code == 422


def test_get_ticket_returns_full_detail_with_history(client, support):
    ticket = _create_ticket(client, support, title="Detalhe completo")
    _advance(client, ticket["id"], "IN_PROGRESS", support)

    response = client.get(f"/api/tickets/{ticket['id']}", headers=auth_header(support))

    assert response.status_code == 200
    body = response.json()
    assert body["title"] == "Detalhe completo"
    assert body["created_by_name"] == support.name
    assert [item["to_status"] for item in body["history"]] == ["OPEN", "IN_PROGRESS"]
    assert body["history"][0]["from_status"] is None


def test_get_ticket_employee_accessing_others_ticket_returns_403(client, employee, support):
    ticket = _create_ticket(client, support)

    response = client.get(f"/api/tickets/{ticket['id']}", headers=auth_header(employee))

    assert response.status_code == 403


def test_get_ticket_employee_accessing_own_ticket_returns_200(client, employee):
    ticket = _create_ticket(client, employee)

    response = client.get(f"/api/tickets/{ticket['id']}", headers=auth_header(employee))

    assert response.status_code == 200


def test_get_ticket_not_found_returns_404(client, support):
    response = client.get("/api/tickets/nao-existe", headers=auth_header(support))

    assert response.status_code == 404
