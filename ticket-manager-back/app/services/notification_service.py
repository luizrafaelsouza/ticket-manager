import logging
import smtplib
from email.message import EmailMessage

from app.core.config import settings
from app.models.enums import TicketStatus
from app.models.ticket import Ticket

logger = logging.getLogger(__name__)

STATUS_LABELS: dict[TicketStatus, str] = {
    TicketStatus.OPEN: "Aberto",
    TicketStatus.IN_PROGRESS: "Em andamento",
    TicketStatus.RESOLVED: "Resolvido",
    TicketStatus.CLOSED: "Fechado",
}


# Sem timeout, smtplib usa o padrão do socket (pode travar indefinidamente se o
# servidor SMTP não responder) — como isso roda de forma síncrona dentro da
# requisição de troca de status, um SMTP travado prenderia a resposta da API
# junto. 5s é generoso pra uma rede local (Mailpit) e ainda protege em produção.
SMTP_TIMEOUT_SECONDS = 5


def send_status_change_email(
    ticket: Ticket, previous_status: TicketStatus, new_status: TicketStatus
) -> None:
    """Avisa por e-mail quem criou o ticket que o status mudou.

    Efeito colateral best-effort: a mudança de status já foi commitada no
    banco antes desta chamada, então nenhuma falha aqui — nem de montagem da
    mensagem, nem de envio — pode propagar pro chamador; tudo é só logado.
    """
    try:
        message = EmailMessage()
        message["Subject"] = f"Seu ticket '{ticket.title}' mudou de status"
        message["From"] = settings.SMTP_FROM
        message["To"] = ticket.created_by.email
        message.set_content(
            f"O status do seu ticket '{ticket.title}' mudou de "
            f"{STATUS_LABELS[previous_status]} para {STATUS_LABELS[new_status]}."
        )

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=SMTP_TIMEOUT_SECONDS) as smtp:
            smtp.send_message(message)
    except Exception:
        logger.exception("Falha ao enviar e-mail de notificação de mudança de status")
