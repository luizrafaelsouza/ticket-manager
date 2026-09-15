from sqlalchemy.orm import Session

from app.core.exceptions import InvalidCredentialsError
from app.core.security import hash_password, verify_password
from app.models.user import User

# Hash fixo só para gastar o mesmo tempo de bcrypt quando o e-mail nem existe —
# sem isso, login com e-mail inexistente responde mais rápido que senha errada
# (pula o bcrypt), o que vaza quais e-mails têm conta via tempo de resposta.
_DUMMY_HASH = hash_password("senha-so-para-igualar-o-tempo-de-resposta")


def authenticate_user(db: Session, email: str, password: str) -> User:
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        verify_password(password, _DUMMY_HASH)
        raise InvalidCredentialsError()
    if not verify_password(password, user.hashed_password):
        raise InvalidCredentialsError()
    return user
