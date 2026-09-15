from typing import Callable

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core import security
from app.db.session import get_db
from app.models.enums import Role
from app.models.user import User

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Identifica o usuário atual a partir de um JWT no header Authorization: Bearer.

    Antes desta função decodificar o token de verdade, o projeto usava um
    header simples (X-Dev-User-Id) como placeholder de desenvolvimento. O
    contrato (recebe nada, devolve um User ou levanta 401) não mudou, então
    nenhuma rota/serviço que já dependia dela precisou ser alterado.
    """
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    payload = security.decode_access_token(credentials.credentials)
    if payload is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

    user = db.get(User, payload.get("sub"))
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    return user


def require_role(*roles: Role) -> Callable[[User], User]:
    """Dependency factory: só deixa passar usuários com um dos papéis informados.

    Usa get_current_user por baixo, então herda o mesmo comportamento de 401
    quando ninguém está identificado — aqui só entra em jogo depois disso,
    quando o usuário existe mas não tem o papel certo (→ 403).
    """

    def dependency(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action",
            )
        return current_user

    return dependency
