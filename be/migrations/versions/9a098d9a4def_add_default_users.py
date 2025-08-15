"""Add default users

Revision ID: 9a098d9a4def
Revises: 1a098d9a4cee
Create Date: 2023-08-14 00:01:00.000000

"""
from alembic import op
from sqlalchemy import text

# revision identifiers, used by Alembic.
revision = '9a098d9a4def'
down_revision = '1a098d9a4cee'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add demo users
    op.execute(
        text(
            """
            INSERT INTO users (username, full_name, email, hashed_password, role, department) 
            VALUES 
            ('student1', 'Nguyen Van A', 'student1@example.com', 'password123', 'student', NULL),
            ('manager1', 'Tran Thi B', 'manager1@example.com', 'password123', 'manager', NULL),
            ('dept_it', 'Phong CNTT', 'it@example.com', 'password123', 'department', 'IT'),
            ('dept_academic', 'Phong Dao Tao', 'academic@example.com', 'password123', 'department', 'Academic Affairs'),
            ('leadership1', 'Le Van C', 'leadership1@example.com', 'password123', 'leadership', NULL);
            """
        )
    )


def downgrade() -> None:
    # Remove demo users
    op.execute(
        text(
            """
            DELETE FROM users 
            WHERE username IN ('student1', 'manager1', 'dept_it', 'dept_academic', 'leadership1');
            """
        )
    )
