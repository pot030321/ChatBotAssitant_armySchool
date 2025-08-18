"""change_thread_id_types

Revision ID: 62cf0e5312b1
Revises: 1a4e152470c3
Create Date: 2025-08-18 08:20:44.106898

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '62cf0e5312b1'
down_revision = '1a4e152470c3'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Đổi kiểu dữ liệu của thread_id trong bảng messages từ Integer sang String(36)
    op.alter_column('messages', 'thread_id',
               existing_type=sa.Integer(),
               type_=sa.String(length=36),
               existing_nullable=False)


def downgrade() -> None:
    # Khôi phục kiểu dữ liệu của thread_id trong bảng messages từ String(36) về Integer
    op.alter_column('messages', 'thread_id',
               existing_type=sa.String(length=36),
               type_=sa.Integer(),
               existing_nullable=False)
