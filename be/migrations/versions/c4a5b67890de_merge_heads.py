"""merge heads

Revision ID: c4a5b67890de
Revises: 9a098d9a4def, ad989c1234fe
Create Date: 2025-08-15 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c4a5b67890de'
down_revision = None
branch_labels = None
depends_on = None

# Đặt cả hai migrations là phụ thuộc (dependencies)
depends_on = ('9a098d9a4def', 'ad989c1234fe')


def upgrade() -> None:
    # Không cần thực hiện thay đổi nào, chỉ merge
    pass


def downgrade() -> None:
    # Không cần thực hiện thay đổi nào, chỉ merge
    pass
