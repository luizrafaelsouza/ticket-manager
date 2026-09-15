from unittest.mock import MagicMock, patch

from .conftest import auth_header


def _create_ticket(client, user, title="Ticket"):
    response = client.post(
        "/api/tickets",
        json={"title": title, "description": "Descrição", "category": "IT", "priority": "LOW"},
        headers=auth_header(user),
    )
    assert response.status_code == 201
    return response.json()


@patch("app.services.notification_service.smtplib.SMTP")
def test_advance_status_sends_email_to_ticket_creator(mock_smtp_class, client, employee, support):
    ticket = _create_ticket(client, employee, title="Impressora quebrada")

    mock_smtp = MagicMock()
    mock_smtp_class.return_value.__enter__.return_value = mock_smtp

    response = client.patch(
        f"/api/tickets/{ticket['id']}/status",
        json={"status": "IN_PROGRESS"},
        headers=auth_header(support),
    )

    assert response.status_code == 200
    mock_smtp.send_message.assert_called_once()

    sent_message = mock_smtp.send_message.call_args[0][0]
    assert sent_message["To"] == employee.email
    assert sent_message["Subject"] == "Seu ticket 'Impressora quebrada' mudou de status"
    body = sent_message.get_content()
    assert "Aberto" in body
    assert "Em andamento" in body


@patch("app.services.notification_service.smtplib.SMTP")
def test_advance_status_email_failure_does_not_break_response(mock_smtp_class, client, employee, support):
    ticket = _create_ticket(client, employee)
    mock_smtp_class.side_effect = OSError("mailpit indisponível")

    response = client.patch(
        f"/api/tickets/{ticket['id']}/status",
        json={"status": "IN_PROGRESS"},
        headers=auth_header(support),
    )

    assert response.status_code == 200
    assert response.json()["status"] == "IN_PROGRESS"


@patch("app.services.notification_service.smtplib.SMTP")
def test_create_ticket_does_not_send_email(mock_smtp_class, client, employee):
    _create_ticket(client, employee)

    mock_smtp_class.assert_not_called()


@patch("app.services.notification_service.smtplib.SMTP")
def test_advance_status_with_unsendable_title_does_not_break_response(
    mock_smtp_class, client, employee, support
):
    # Título com quebra de linha: o Pydantic só limita tamanho, não filtra
    # caracteres de controle — então isso passa na criação do ticket. Montar
    # o e-mail com esse título faz o EmailMessage levantar ValueError (header
    # não pode ter \r\n) — a resposta da troca de status não pode quebrar por
    # causa disso.
    ticket = _create_ticket(client, employee, title="Titulo\r\nBcc: atacante@evil.com")

    response = client.patch(
        f"/api/tickets/{ticket['id']}/status",
        json={"status": "IN_PROGRESS"},
        headers=auth_header(support),
    )

    assert response.status_code == 200
    assert response.json()["status"] == "IN_PROGRESS"
    mock_smtp_class.assert_not_called()
