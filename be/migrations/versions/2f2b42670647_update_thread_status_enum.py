"""update_thread_status_enum

Revision ID: 2f2b42670647
Revises: 62cf0e5312b1
Create Date: 2025-08-18 08:25:14.511393

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '2f2b42670647'
down_revision = '62cf0e5312b1'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Sử dụng câu lệnh SQL trực tiếp để thay đổi định nghĩa enum
    op.execute("""
        ALTER TABLE threads 
        MODIFY COLUMN status ENUM('new', 'pending', 'assigned', 'in_progress', 'resolved', 'escalated') DEFAULT 'new' NOT NULL
    """)


def downgrade() -> None:
    # Khôi phục định nghĩa enum cũ nếu cần quay lại
    op.execute("""
        ALTER TABLE threads 
        MODIFY COLUMN status ENUM('new', 'pending', 'in_progress', 'resolved', 'escalated') DEFAULT 'new' NOT NULL
    """)
