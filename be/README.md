# Student Support Chat API - Backend

## Cấu trúc dự án

```
be/
  ├── app/                      # Thư mục chính của ứng dụng
  │   ├── config/               # Cấu hình ứng dụng
  │   ├── controllers/          # Controllers (không dùng trong FastAPI, nhưng giữ để mở rộng)
  │   ├── database/             # Cấu hình và kết nối database
  │   ├── models/               # SQLAlchemy models
  │   ├── routers/              # FastAPI routers
  │   ├── schemas/              # Pydantic schemas
  │   ├── services/             # Business logic
  │   └── utils/                # Tiện ích
  ├── migrations/               # Alembic migrations
  │   ├── versions/             # Migration scripts
  │   └── env.py                # Alembic configuration
  ├── tests/                    # Tests
  ├── alembic.ini               # Alembic config
  ├── .env                      # Environment variables (private)
  └── requirements.txt          # Dependencies
```

## Cài đặt

### Yêu cầu hệ thống

- Python 3.9+
- MySQL (qua Laragon)

### Cài đặt môi trường

1. Tạo và kích hoạt môi trường ảo:

```bash
# Windows
python -m venv venv
venv\Scripts\activate
```

2. Cài đặt dependencies:

```bash
pip install -r requirements.txt
```

### Thiết lập database

1. Khởi động Laragon và đảm bảo MySQL đang chạy

2. Tạo database:
   - Mở HeidiSQL hoặc công cụ quản lý MySQL
   - Tạo database mới: `student_support_chat`

3. Cấu hình biến môi trường:
   - Sao chép file `.env.example` thành `.env`
   - Điều chỉnh `DATABASE_URL` nếu cần
   - Thêm GEMINI_API_KEY nếu muốn sử dụng AI

4. Chạy migrations:

```bash
alembic upgrade head
```

### Chạy ứng dụng

```bash
uvicorn app.main:app --reload
```

Hoặc qua PowerShell với biến môi trường:
```powershell
$env:GEMINI_API_KEY = "your_api_key_here"
$env:PYTHONUTF8 = "1"
python -m uvicorn app.main:app --reload --port 8000
```

Truy cập API docs tại http://localhost:8000/docs

## API Endpoints

### Authentication
- POST `/auth/login` - Đăng nhập
- POST `/auth/register` - Đăng ký người dùng mới
- GET `/auth/me` - Lấy thông tin người dùng hiện tại

### Threads (Cuộc hội thoại)
- GET `/threads` - Lấy danh sách threads
- POST `/threads` - Tạo thread mới
- GET `/threads/{thread_id}` - Lấy thông tin thread
- PATCH `/threads/{thread_id}` - Cập nhật thread
- POST `/threads/{thread_id}/assign` - Phân công thread cho phòng/khoa
- POST `/threads/{thread_id}/escalate` - Chuyển thread lên cấp cao hơn

### Messages (Tin nhắn)
- GET `/threads/{thread_id}/messages` - Lấy tin nhắn trong thread
- POST `/threads/{thread_id}/messages` - Thêm tin nhắn mới

### Leadership (Lãnh đạo)
- GET `/leadership/threads` - Lấy danh sách threads (cho lãnh đạo)
- GET `/leadership/analytics` - Lấy thống kê (cho lãnh đạo)
