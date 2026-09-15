class InvalidCredentialsError(Exception):
    pass


class TicketNotFoundError(Exception):
    pass


class TicketAccessDeniedError(Exception):
    pass


class InvalidTransitionError(Exception):
    pass
