from typing import Literal

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, require_role
from app.db.session import get_db
from app.models.enums import Category, Priority, Role, TicketStatus
from app.models.ticket import Ticket
from app.models.user import User
from app.schemas.ticket import (
    PaginatedTickets,
    StatusHistoryOut,
    TicketCreate,
    TicketDetail,
    TicketListItem,
    TicketOut,
    TicketStatusUpdate,
)
from app.services import notification_service, ticket_service

router = APIRouter(prefix="/tickets", tags=["tickets"])


def _build_ticket_detail(ticket: Ticket) -> TicketDetail:
    return TicketDetail(
        id=ticket.id,
        title=ticket.title,
        description=ticket.description,
        category=ticket.category,
        priority=ticket.priority,
        status=ticket.status,
        created_by_name=ticket.created_by.name,
        created_at=ticket.created_at,
        updated_at=ticket.updated_at,
        history=[
            StatusHistoryOut(
                from_status=item.from_status,
                to_status=item.to_status,
                changed_by_name=item.changed_by.name,
                changed_at=item.changed_at,
            )
            for item in ticket.status_history
        ],
    )


@router.post("", response_model=TicketOut, status_code=status.HTTP_201_CREATED)
def create_ticket(
    payload: TicketCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TicketOut:
    ticket = ticket_service.create_ticket(db, payload, current_user)
    return TicketOut.model_validate(ticket)


@router.get("", response_model=PaginatedTickets)
def list_tickets(
    status_: TicketStatus | None = Query(default=None, alias="status"),
    category: Category | None = None,
    priority: Priority | None = None,
    sort_by: Literal["created_at", "priority"] = "created_at",
    sort_dir: Literal["asc", "desc"] = "desc",
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PaginatedTickets:
    tickets, total = ticket_service.list_tickets(
        db,
        current_user,
        status=status_,
        category=category,
        priority=priority,
        sort_by=sort_by,
        sort_dir=sort_dir,
        page=page,
        page_size=page_size,
    )
    items = [
        TicketListItem(
            id=ticket.id,
            title=ticket.title,
            category=ticket.category,
            priority=ticket.priority,
            status=ticket.status,
            created_by_name=ticket.created_by.name,
            created_at=ticket.created_at,
            updated_at=ticket.updated_at,
        )
        for ticket in tickets
    ]
    return PaginatedTickets(items=items, total=total, page=page, page_size=page_size)


@router.get("/{ticket_id}", response_model=TicketDetail)
def get_ticket(
    ticket_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TicketDetail:
    ticket = ticket_service.get_ticket(db, current_user, ticket_id)
    return _build_ticket_detail(ticket)


@router.patch("/{ticket_id}/status", response_model=TicketDetail)
def update_ticket_status(
    ticket_id: str,
    payload: TicketStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(Role.SUPPORT)),
) -> TicketDetail:
    ticket = ticket_service.update_ticket_status(
        db, ticket_id, payload.status, current_user, note=payload.note
    )

    previous_status = ticket.status_history[-1].from_status
    if previous_status is not None:
        notification_service.send_status_change_email(ticket, previous_status, ticket.status)

    return _build_ticket_detail(ticket)
