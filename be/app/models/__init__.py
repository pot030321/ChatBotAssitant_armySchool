# Import các model vào đây để Alembic có thể phát hiện
from .models import User, Thread, Message  # noqa
from .departments import Department  # noqa

# Export các model để sử dụng trong ứng dụng
__all__ = ['User', 'Thread', 'Message', 'Department']
