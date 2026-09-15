from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import Category, Priority, TicketStatus


class TicketCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(min_length=1, max_length=5000)
    category: Category
    priority: Priority


class TicketOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    description: str
    category: Category
    priority: Priority
    status: TicketStatus
    created_by_id: str
    created_at: datetime
    updated_at: datetime


class StatusHistoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    from_status: TicketStatus | None
    to_status: TicketStatus
    changed_by_name: str
    changed_at: datetime


class TicketDetail(BaseModel):
    id: str
    title: str
    description: str
    category: Category
    priority: Priority
    status: TicketStatus
    created_by_name: str
    created_at: datetime
    updated_at: datetime
    history: list[StatusHistoryOut]


class TicketStatusUpdate(BaseModel):
    status: TicketStatus
    note: str | None = Field(default=None, max_length=1000)


class TicketListItem(BaseModel):
    id: str
    title: str
    category: Category
    priority: Priority
    status: TicketStatus
    created_by_name: str
    created_at: datetime
    updated_at: datetime


class PaginatedTickets(BaseModel):
    items: list[TicketListItem]
    total: int
    page: int
    page_size: int
