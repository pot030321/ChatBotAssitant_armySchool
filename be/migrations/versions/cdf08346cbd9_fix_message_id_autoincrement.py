"""fix_message_id_autoincrement

Revision ID: cdf08346cbd9
Revises: 2f2b42670647
Create Date: 2025-08-18 08:29:36.885795

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'cdf08346cbd9'
down_revision = '2f2b42670647'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Sử dụng câu lệnh SQL trực tiếp để thêm AUTO_INCREMENT cho cột id
    op.execute("""
        ALTER TABLE messages 
        MODIFY COLUMN id INT AUTO_INCREMENT
    """)


def downgrade() -> None:
    # Chỉ đổi lại thành INT bình thường nếu cần
    op.execute("""
        ALTER TABLE messages 
        MODIFY COLUMN id INT
    """)
