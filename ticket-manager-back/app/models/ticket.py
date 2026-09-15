import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import Category, Priority, TicketStatus, category_enum, priority_enum, ticket_status_enum


class Ticket(Base):
    __tablename__ = "tickets"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[Category] = mapped_column(category_enum, nullable=False, index=True)
    priority: Mapped[Priority] = mapped_column(priority_enum, nullable=False, index=True)
    status: Mapped[TicketStatus] = mapped_column(
        ticket_status_enum, nullable=False, default=TicketStatus.OPEN, index=True
    )
    created_by_id: Mapped[str] = mapped_column(String(64), ForeignKey("users.id"), nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    created_by: Mapped["User"] = relationship("User", foreign_keys=[created_by_id])
    status_history: Mapped[list["TicketStatusHistory"]] = relationship(
        "TicketStatusHistory",
        back_populates="ticket",
        order_by="TicketStatusHistory.changed_at",
        cascade="all, delete-orphan",
    )
