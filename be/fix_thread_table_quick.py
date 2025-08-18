"""
Khắc phục nhanh: Tạo lại bảng threads với cấu trúc đúng
"""

from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

# Load biến môi trường
load_dotenv()

# Lấy chuỗi kết nối DB từ biến môi trường hoặc sử dụng giá trị mặc định
DATABASE_URL = os.getenv("DATABASE_URL", "mysql+pymysql://username:password@localhost/student_support_db")

# Kết nối đến database
engine = create_engine(DATABASE_URL)

def fix_thread_table():
    """
    Sửa chữa bảng threads bằng cách tạo lại với cấu trúc đúng
    """
    with engine.connect() as conn:
        # 1. Kiểm tra xem bảng có tồn tại không
        result = conn.execute(text("SHOW TABLES LIKE 'threads'"))
        table_exists = result.fetchone() is not None
        
        if table_exists:
            # 2. Nếu có, tạo bảng tạm thời
            print("Tạo bảng tạm thời...")
            conn.execute(text("CREATE TABLE threads_temp LIKE threads"))
            
            # 3. Sửa đổi cấu trúc cột ID trong bảng tạm thời
            conn.execute(text("""
                ALTER TABLE threads_temp 
                MODIFY COLUMN id VARCHAR(36) NOT NULL PRIMARY KEY
            """))
            
            # 4. Copy dữ liệu cũ sang bảng mới (nếu có)
            try:
                conn.execute(text("INSERT INTO threads_temp SELECT * FROM threads"))
                print("Đã sao chép dữ liệu sang bảng tạm thời")
            except Exception as e:
                print(f"Không thể sao chép dữ liệu: {e}")
            
            # 5. Xóa bảng cũ
            conn.execute(text("DROP TABLE threads"))
            print("Đã xóa bảng threads cũ")
            
            # 6. Đổi tên bảng tạm thời thành bảng chính
            conn.execute(text("RENAME TABLE threads_temp TO threads"))
            print("Đã đổi tên bảng tạm thời thành threads")
        else:
            # Nếu bảng chưa tồn tại, tạo mới với cấu trúc đúng
            print("Bảng threads không tồn tại, tạo mới...")
            conn.execute(text("""
                CREATE TABLE threads (
                    id VARCHAR(36) NOT NULL PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    student_id INT,
                    department VARCHAR(100),
                    topic VARCHAR(100),
                    issue_type VARCHAR(100),
                    assigned_to VARCHAR(100),
                    status VARCHAR(20) NOT NULL DEFAULT 'new',
                    priority VARCHAR(20) NOT NULL DEFAULT 'normal',
                    assignee_id INT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (student_id) REFERENCES users(id),
                    FOREIGN KEY (assignee_id) REFERENCES users(id)
                )
            """))
        
        # Kiểm tra kết quả
        result = conn.execute(text("DESCRIBE threads"))
        table_structure = result.fetchall()
        print("\nCấu trúc bảng threads sau khi sửa:")
        for column in table_structure:
            print(column)
        
        print("\nSửa chữa hoàn tất!")

if __name__ == "__main__":
    fix_thread_table()
