"""add departments table and foreign keys

Revision ID: ad989c1234fe
Revises: 1a098d9a4cee
Create Date: 2025-08-14 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql
import uuid

# revision identifiers, used by Alembic.
revision = 'ad989c1234fe'
down_revision = '1a098d9a4cee'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. Tạo bảng departments
    op.create_table('departments',
        sa.Column('id', sa.String(36), primary_key=True, default=str(uuid.uuid4())),
        sa.Column('name', sa.String(100), nullable=False, unique=True, index=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now())
    )
    
    # 2. Thêm cột department_id vào bảng users
    op.add_column('users',
        sa.Column('department_id', sa.String(36), sa.ForeignKey('departments.id'), nullable=True)
    )
    
    # 3. Thêm cột assigned_department_id vào bảng threads
    op.add_column('threads',
        sa.Column('assigned_department_id', sa.String(36), sa.ForeignKey('departments.id'), nullable=True)
    )
    
    # 4. Cập nhật ENUM status của threads để bao gồm "new" và "assigned"
    op.execute('ALTER TABLE threads MODIFY COLUMN status ENUM("new", "pending", "assigned", "in_progress", "resolved", "escalated") NOT NULL DEFAULT "new"')
    
    # 5. Cập nhật ENUM priority của threads để bao gồm "medium"
    op.execute('ALTER TABLE threads MODIFY COLUMN priority ENUM("low", "medium", "normal", "high", "urgent") NOT NULL DEFAULT "normal"')


def downgrade() -> None:
    # 1. Khôi phục ENUM priority của threads
    op.execute('ALTER TABLE threads MODIFY COLUMN priority ENUM("low", "normal", "high", "urgent") NOT NULL DEFAULT "normal"')
    
    # 2. Khôi phục ENUM status của threads
    op.execute('ALTER TABLE threads MODIFY COLUMN status ENUM("pending", "in_progress", "resolved", "escalated") NOT NULL DEFAULT "pending"')
    
    # 3. Xóa cột assigned_department_id khỏi bảng threads
    op.drop_column('threads', 'assigned_department_id')
    
    # 4. Xóa cột department_id khỏi bảng users
    op.drop_column('users', 'department_id')
    
    # 5. Xóa bảng departments
    op.drop_table('departments')
