"""fix_message_table

Revision ID: d20ca63b0a1e
Revises: cdf08346cbd9
Create Date: 2025-08-18 08:31:33.427980

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'd20ca63b0a1e'
down_revision = 'cdf08346cbd9'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Sử dụng phương pháp khác để sửa vấn đề với bảng messages
    # 1. Tạo bảng messages tạm thời với cấu trúc đúng
    op.execute("""
        CREATE TABLE messages_new (
            id INT AUTO_INCREMENT PRIMARY KEY,
            thread_id VARCHAR(36) NOT NULL,
            user_id INT,
            sender ENUM('student', 'manager', 'department', 'leadership', 'system', 'assistant') NOT NULL,
            text TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)
    
    # 2. Sao chép dữ liệu từ messages sang messages_new (nếu có)
    op.execute("""
        INSERT INTO messages_new (thread_id, user_id, sender, text, created_at)
        SELECT thread_id, user_id, sender, text, created_at
        FROM messages
    """)
    
    # 3. Xóa bảng messages cũ
    op.execute("DROP TABLE messages")
    
    # 4. Đổi tên bảng messages_new thành messages
    op.execute("RENAME TABLE messages_new TO messages")


def downgrade() -> None:
    # Trong trường hợp rollback, chúng ta phải tạo lại bảng messages với cấu trúc cũ
    # Tuy nhiên, việc này có thể gây mất dữ liệu, nên cần cân nhắc kỹ
    pass
