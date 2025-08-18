# Cổng Hỗ Trợ Sinh Viên Thông Minh

## Giới thiệu

Hệ thống hỗ trợ sinh viên thông minh dựa trên Large Language Models (LLM), cho phép:
- Sinh viên đặt câu hỏi với AI và nhận phản hồi tức thì
- Tạo yêu cầu trợ giúp chuyển đến các phòng/khoa chức năng
- Quản lý phân công và theo dõi toàn bộ quy trình xử lý yêu cầu
- Phân tích dữ liệu và báo cáo hiệu suất cho lãnh đạo

## Tài khoản demo

| Vai trò | Tên đăng nhập | Mật khẩu | Chức năng chính |
|---------|---------------|----------|-----------------|
| Sinh viên | student1 | 123456 | Tạo yêu cầu, chat với AI |
| Quản lý | manager | 123456 | Phân công yêu cầu, quản lý hệ thống |
| Phòng IT | cntt | 123456 | Xử lý yêu cầu CNTT |
| Phòng Tài chính | finance | 123456 | Xử lý yêu cầu tài chính |
| Phòng Đào tạo | academic | 123456 | Xử lý yêu cầu đào tạo |
| Lãnh đạo | leadership | 123456 | Xem thống kê, báo cáo |

## Công nghệ sử dụng

### Backend
- FastAPI: Framework API hiệu suất cao
- SQLAlchemy: ORM cho database
- MySQL: Hệ quản trị cơ sở dữ liệu
- Alembic: Quản lý migration database
- Pydantic: Validation và serialization dữ liệu

### Frontend
- React 18: UI framework
- Vite: Build tool hiệu năng cao
- React Router: Quản lý routing
- CSS modules: Styling components

## Cài đặt và chạy

### Backend

```bash
# 1. Vào thư mục backend
cd be

# 2. Tạo và kích hoạt môi trường ảo
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac

# 3. Cài đặt các gói phụ thuộc
pip install -r requirements.txt

# 4. Chạy migration để tạo cấu trúc database
alembic upgrade head

# 5. Chạy server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
# 1. Cài đặt dependencies
npm install

# 2. Chạy ứng dụng
npm run dev
```

## Quy trình làm việc đầy đủ

1. **Sinh viên** đăng nhập vào hệ thống
   - Chat với AI assistant để giải đáp thắc mắc
   - Nếu cần sự hỗ trợ của con người, tạo yêu cầu mới
   - Theo dõi trạng thái của yêu cầu

2. **Quản lý**
   - Xem danh sách yêu cầu mới
   - Phân loại và phân công cho phòng/khoa phù hợp
   - Theo dõi tổng quan toàn bộ hệ thống

3. **Phòng/khoa**
   - Nhận yêu cầu được phân công
   - Xử lý và phản hồi cho sinh viên
   - Cập nhật trạng thái giải quyết
   - Đánh dấu hoàn thành khi đã xử lý xong

4. **Lãnh đạo**
   - Theo dõi thống kê và hiệu suất
   - Phân tích dữ liệu và báo cáo
   - Ra quyết định dựa trên dữ liệu thực tế

## Các chức năng chi tiết

### Sinh viên
- Đăng nhập/đăng ký tài khoản
- Chat với AI assistant
- Tạo yêu cầu hỗ trợ mới
- Xem lịch sử yêu cầu
- Nhận thông báo khi có cập nhật
- Đánh giá chất lượng phản hồi

### Phòng/khoa
- Xem yêu cầu được phân công
- Phản hồi và tương tác với sinh viên
- Cập nhật trạng thái xử lý
- Chuyển tiếp yêu cầu đến bộ phận khác
- Đánh dấu hoàn thành

### Quản lý
- Phân loại yêu cầu
- Phân công cho phòng/khoa
- Giám sát tiến độ xử lý
- Quản lý tài khoản người dùng
- Xem báo cáo và thống kê

### Lãnh đạo
- Bảng điều khiển tổng quan
- Báo cáo hiệu suất theo phòng/khoa
- Phân tích thời gian xử lý yêu cầu
- Thống kê loại yêu cầu phổ biến
- Xu hướng và dự báo nhu cầu

## Cấu hình hệ thống

### Kết nối Backend/Frontend

Điều chỉnh địa chỉ backend trong file `src/utils/api.js`:

```javascript
// Thay đổi giá trị này theo địa chỉ máy chủ backend 
const API_URL = 'http://localhost:8000';
```

### Cấu hình Database

Chỉnh sửa thông tin kết nối database trong file `be/app/config/settings.py`

### Cấu hình LLM API

Thêm API key cho Gemini trong file môi trường `.env`
