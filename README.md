# Cổng Hỗ Trợ Sinh Viên

## Giới thiệu

Ứng dụng hỗ trợ sinh viên với tích hợp AI, cho phép sinh viên đặt câu hỏi, nhận phản hồi từ phòng/khoa và theo dõi quá trình giải quyết.

## Tài khoản demo

| Vai trò | Tên đăng nhập | Mật khẩu |
|---------|---------------|----------|
| Sinh viên | student1 | 123456 |
| Quản lý | manager | 123456 |
| Phòng IT | cntt | 123456 |
| Phòng Tài chính | finance | 123456 |
| Phòng Đào tạo | academic | 123456 |
| Lãnh đạo | leadership | 123456 |

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

# 4. Chạy server
uvicorn app.main:app --reload
```

### Frontend

```bash
# 1. Cài đặt dependencies
npm install

# 2. Chạy ứng dụng
npm run dev
```

## Quy trình sử dụng

1. **Sinh viên** đăng nhập và gửi câu hỏi
2. **Quản lý** phân công cho phòng/khoa phù hợp
3. **Phòng/khoa** trả lời và xử lý yêu cầu
4. **Lãnh đạo** theo dõi thống kê và hiệu suất

## Các chức năng chính

### Sinh viên
- Đặt câu hỏi mới
- Xem lịch sử câu hỏi
- Xem FAQ

### Phòng/khoa
- Xem yêu cầu được phân công
- Trả lời và cập nhật trạng thái

### Quản lý
- Phân công yêu cầu
- Xem thống kê

### Lãnh đạo
- Bảng điều khiển tổng quan
- Xem theo phòng/khoa
- Báo cáo và phân tích

## Xử lý lỗi API

Một số API có thể chưa hoàn thiện, hệ thống sử dụng mock data để đảm bảo UI hoạt động:
- `/threads/{id}/messages`: Trả về 422 Unprocessable Entity
- `/threads/statistics`: Trả về 404 Not Found

## Liên hệ

Liên hệ qua email hoặc GitHub để được hỗ trợ.