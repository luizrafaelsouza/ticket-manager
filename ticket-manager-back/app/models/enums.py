from enum import Enum

from sqlalchemy import Enum as SAEnum


class Role(str, Enum):
    EMPLOYEE = "EMPLOYEE"
    SUPPORT = "SUPPORT"


class Category(str, Enum):
    IT = "IT"
    FACILITIES = "FACILITIES"
    HR = "HR"


class Priority(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    URGENT = "URGENT"


class TicketStatus(str, Enum):
    OPEN = "OPEN"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"
    CLOSED = "CLOSED"


# Instâncias únicas e reutilizadas em todas as colunas do mesmo tipo, para que o
# SQLAlchemy/Alembic não tentem recriar o mesmo ENUM do Postgres mais de uma vez.
role_enum = SAEnum(Role, name="role")
category_enum = SAEnum(Category, name="category")
priority_enum = SAEnum(Priority, name="priority")
ticket_status_enum = SAEnum(TicketStatus, name="ticket_status")
