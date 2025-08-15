"""
Script tạo dữ liệu mẫu cho database
"""
import sys
import os
from sqlalchemy.orm import Session
import uuid

# Thêm thư mục cha vào sys.path để có thể import các module
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.db import SessionLocal, engine, Base
from app.models.models import User, Thread, Message
from app.models.departments import Department

# Tạo các bảng nếu chưa tồn tại
Base.metadata.create_all(bind=engine)

# Tạo session
db = SessionLocal()

# Danh sách phòng ban
departments = [
    {"name": "Phòng Đào tạo", "description": "Quản lý đào tạo và kế hoạch học tập"},
    {"name": "QLSV", "description": "Quản lý công tác sinh viên"},
    {"name": "CNTT", "description": "Công nghệ thông tin và hỗ trợ kỹ thuật"},
    {"name": "Phòng Tài chính", "description": "Quản lý tài chính và học phí"},
    {"name": "Thư viện", "description": "Quản lý thư viện và tài liệu"},
    {"name": "Phòng Tuyển sinh", "description": "Tư vấn và hỗ trợ tuyển sinh"}
]

# Tạo phòng ban
department_ids = {}  # Lưu trữ id của các phòng ban để sử dụng sau này

for dept_data in departments:
    # Kiểm tra xem phòng ban đã tồn tại chưa
    existing_dept = db.query(Department).filter(Department.name == dept_data["name"]).first()
    
    if not existing_dept:
        department = Department(
            # Bỏ id để MySQL tự tạo auto increment
            name=dept_data["name"],
            description=dept_data["description"]
        )
        db.add(department)
        db.commit()
        db.refresh(department)
        department_ids[dept_data["name"]] = department.id
        print(f"Đã tạo phòng ban: {dept_data['name']}")
    else:
        department_ids[dept_data["name"]] = existing_dept.id
        print(f"Phòng ban {dept_data['name']} đã tồn tại")

# Tạo người dùng mẫu nếu chưa có
users = [
    {
        "username": "admin",
        "full_name": "Admin User",
        "email": "admin@example.com",
        "hashed_password": "password123",
        "role": "manager",
        "department": None
    },
    {
        "username": "student1",
        "full_name": "Nguyễn Văn A",
        "email": "student1@example.com",
        "hashed_password": "password123",
        "role": "student",
        "department": None
    },
    {
        "username": "daotao",
        "full_name": "Nhân viên Đào tạo",
        "email": "daotao@example.com",
        "hashed_password": "password123",
        "role": "department",
        "department": "Phòng Đào tạo"
    },
    {
        "username": "qlsv",
        "full_name": "Nhân viên QLSV",
        "email": "qlsv@example.com",
        "hashed_password": "password123",
        "role": "department",
        "department": "QLSV"
    },
    {
        "username": "cntt",
        "full_name": "Nhân viên CNTT",
        "email": "cntt@example.com",
        "hashed_password": "password123",
        "role": "department",
        "department": "CNTT"
    },
    {
        "username": "taichinhketoan",
        "full_name": "Nhân viên Tài chính",
        "email": "taichinhketoan@example.com",
        "hashed_password": "password123",
        "role": "department",
        "department": "Phòng Tài chính"
    }
]

# Tạo người dùng
user_ids = {}
for user_data in users:
    # Kiểm tra xem người dùng đã tồn tại chưa
    existing_user = db.query(User).filter(User.username == user_data["username"]).first()
    
    if not existing_user:
        user = User(
            # Bỏ id để MySQL tự tạo auto increment
            username=user_data["username"],
            full_name=user_data["full_name"],
            email=user_data["email"],
            hashed_password=user_data["hashed_password"],
            role=user_data["role"],
            department=user_data.get("department")
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        user_ids[user_data["username"]] = user.id
        print(f"Đã tạo người dùng: {user_data['username']}")
    else:
        # Cập nhật department cho người dùng đã tồn tại
        if user_data.get("department"):
            existing_user.department = user_data["department"]
            db.commit()
            db.refresh(existing_user)
            print(f"Đã cập nhật department cho người dùng: {user_data['username']}")
        
        user_ids[user_data["username"]] = existing_user.id
        print(f"Người dùng {user_data['username']} đã tồn tại")

print("Hoàn tất tạo dữ liệu mẫu")
db.close()
