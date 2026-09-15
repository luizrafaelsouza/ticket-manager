from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models.enums import Category, Priority, Role, TicketStatus
from app.models.ticket import Ticket
from app.models.ticket_status_history import TicketStatusHistory
from app.models.user import User

SEED_PASSWORD = "Aa12345678"


def run() -> None:
    db = SessionLocal()
    try:
        if db.query(User).count() > 0:
            return

        ana = User(
            id="ana-employee",
            name="Ana",
            email="ana@ticketmanager.local",
            hashed_password=hash_password(SEED_PASSWORD),
            role=Role.EMPLOYEE,
        )
        carlos = User(
            id="carlos-support",
            name="Carlos",
            email="carlos@ticketmanager.local",
            hashed_password=hash_password(SEED_PASSWORD),
            role=Role.SUPPORT,
        )
        db.add_all([ana, carlos])
        db.flush()

        ticket = Ticket(
            title="Impressora do 3º andar não liga",
            description="A impressora perto da copa parou de responder desde ontem.",
            category=Category.IT,
            priority=Priority.HIGH,
            status=TicketStatus.OPEN,
            created_by_id=ana.id,
        )
        db.add(ticket)
        db.flush()

        db.add(
            TicketStatusHistory(
                ticket_id=ticket.id,
                from_status=None,
                to_status=TicketStatus.OPEN,
                changed_by_id=ana.id,
            )
        )

        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    run()
