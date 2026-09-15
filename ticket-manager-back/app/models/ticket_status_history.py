import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import TicketStatus, ticket_status_enum


class TicketStatusHistory(Base):
    __tablename__ = "ticket_status_history"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    ticket_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("tickets.id", ondelete="CASCADE"), nullable=False, index=True
    )
    from_status: Mapped[TicketStatus | None] = mapped_column(ticket_status_enum, nullable=True)
    to_status: Mapped[TicketStatus] = mapped_column(ticket_status_enum, nullable=False)
    changed_by_id: Mapped[str] = mapped_column(String(64), ForeignKey("users.id"), nullable=False)
    changed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    note: Mapped[str | None] = mapped_column(String, nullable=True)

    ticket: Mapped["Ticket"] = relationship("Ticket", back_populates="status_history", foreign_keys=[ticket_id])
    changed_by: Mapped["User"] = relationship("User", foreign_keys=[changed_by_id])
