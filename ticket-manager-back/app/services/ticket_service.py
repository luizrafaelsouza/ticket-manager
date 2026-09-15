from typing import Literal

from sqlalchemy import case, func
from sqlalchemy.orm import Session

from app.core.exceptions import InvalidTransitionError, TicketAccessDeniedError, TicketNotFoundError
from app.models.enums import Category, Priority, Role, TicketStatus
from app.models.ticket import Ticket
from app.models.ticket_status_history import TicketStatusHistory
from app.models.user import User
from app.schemas.ticket import TicketCreate

# Mapa de transição estritamente sequencial e sem "reabrir" — a chave é o status
# atual, o valor é o único próximo status válido. CLOSED não tem entrada (fim de linha).
ALLOWED_TRANSITIONS: dict[TicketStatus, TicketStatus] = {
    TicketStatus.OPEN: TicketStatus.IN_PROGRESS,
    TicketStatus.IN_PROGRESS: TicketStatus.RESOLVED,
    TicketStatus.RESOLVED: TicketStatus.CLOSED,
}

# Ordenação explícita de severidade — não depende da ordem de declaração do ENUM
# no banco (que funciona por coincidência no Postgres, mas não é portável: no
# SQLite, usado nos testes, a coluna vira VARCHAR e ordenaria alfabeticamente,
# o que colocaria "HIGH" antes de "LOW").
PRIORITY_RANK = case(
    (Ticket.priority == Priority.LOW, 1),
    (Ticket.priority == Priority.MEDIUM, 2),
    (Ticket.priority == Priority.HIGH, 3),
    (Ticket.priority == Priority.URGENT, 4),
)


def create_ticket(db: Session, payload: TicketCreate, created_by: User) -> Ticket:
    ticket = Ticket(
        title=payload.title,
        description=payload.description,
        category=payload.category,
        priority=payload.priority,
        status=TicketStatus.OPEN,
        created_by_id=created_by.id,
    )
    db.add(ticket)
    db.flush()

    db.add(
        TicketStatusHistory(
            ticket_id=ticket.id,
            from_status=None,
            to_status=TicketStatus.OPEN,
            changed_by_id=created_by.id,
        )
    )

    db.commit()
    db.refresh(ticket)
    return ticket


def list_tickets(
    db: Session,
    current_user: User,
    status: TicketStatus | None = None,
    category: Category | None = None,
    priority: Priority | None = None,
    sort_by: Literal["created_at", "priority"] = "created_at",
    sort_dir: Literal["asc", "desc"] = "desc",
    page: int = 1,
    page_size: int = 10,
) -> tuple[list[Ticket], int]:
    query = db.query(Ticket)

    if current_user.role == Role.EMPLOYEE:
        query = query.filter(Ticket.created_by_id == current_user.id)
    if status is not None:
        query = query.filter(Ticket.status == status)
    if category is not None:
        query = query.filter(Ticket.category == category)
    if priority is not None:
        query = query.filter(Ticket.priority == priority)

    total = query.with_entities(func.count(Ticket.id)).scalar() or 0

    sort_column = PRIORITY_RANK if sort_by == "priority" else Ticket.created_at
    order = sort_column.asc() if sort_dir == "asc" else sort_column.desc()
    query = query.order_by(order)

    items = query.offset((page - 1) * page_size).limit(page_size).all()
    return items, total


def get_ticket(db: Session, current_user: User, ticket_id: str) -> Ticket:
    ticket = db.get(Ticket, ticket_id)
    if ticket is None:
        raise TicketNotFoundError()

    if current_user.role == Role.EMPLOYEE and ticket.created_by_id != current_user.id:
        raise TicketAccessDeniedError()

    return ticket


def update_ticket_status(
    db: Session,
    ticket_id: str,
    new_status: TicketStatus,
    changed_by: User,
    note: str | None = None,
) -> Ticket:
    ticket = db.get(Ticket, ticket_id)
    if ticket is None:
        raise TicketNotFoundError()

    if ALLOWED_TRANSITIONS.get(ticket.status) != new_status:
        raise InvalidTransitionError()

    previous_status = ticket.status
    ticket.status = new_status
    db.add(
        TicketStatusHistory(
            ticket_id=ticket.id,
            from_status=previous_status,
            to_status=new_status,
            changed_by_id=changed_by.id,
            note=note,
        )
    )

    db.commit()
    db.refresh(ticket)
    return ticket
