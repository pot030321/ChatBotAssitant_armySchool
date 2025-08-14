# University Support Portal Demo

Đây là một ứng dụng mẫu về cổng hỗ trợ sinh viên đại học với các vai trò người dùng khác nhau.

## Tính năng chính

- **Đăng nhập**: Hệ thống xác thực với nhiều vai trò
- **Tạo yêu cầu hỗ trợ**: Sinh viên có thể tạo yêu cầu hỗ trợ mới
- **Giao tiếp**: Trao đổi tin nhắn giữa người dùng và nhân viên hỗ trợ
- **Quản lý phiếu hỗ trợ**: Phân công, theo dõi và giải quyết các vấn đề
- **Phân tích**: Báo cáo và thống kê về các phiếu hỗ trợ

## Các vai trò người dùng

### Sinh viên
- Xem dashboard cá nhân
- Tạo yêu cầu hỗ trợ mới
- Theo dõi trạng thái của các yêu cầu
- Trả lời tin nhắn từ nhân viên hỗ trợ

### Quản lý
- Xem tất cả các yêu cầu hỗ trợ
- Phân công yêu cầu cho các phòng ban
- Thiết lập mức ưu tiên
- Theo dõi tình trạng xử lý
- Xem thống kê và báo cáo

### Phòng ban
- Xem các yêu cầu được phân công
- Trả lời và xử lý yêu cầu
- Cập nhật trạng thái xử lý
- Đánh dấu yêu cầu đã được giải quyết

### Lãnh đạo
- Xem tổng quan về tình hình hỗ trợ
- Theo dõi hiệu suất của các phòng ban
- Truy cập báo cáo phân tích

## Tài khoản demo

| Vai trò | Tên đăng nhập | Mật khẩu |
|---------|---------------|----------|
| Sinh viên | student1 | 123456 |
| Quản lý | manager | 123456 |
| Phòng IT | cntt | 123456 |
| Phòng Tài chính | finance | 123456 |
| Phòng Đào tạo | academic | 123456 |
| Lãnh đạo | leadership | 123456 |

## Luồng làm việc điển hình

1. Sinh viên tạo yêu cầu hỗ trợ
2. Quản lý xem xét và phân công cho phòng ban phù hợp
3. Nhân viên phòng ban nhận yêu cầu và bắt đầu xử lý
4. Nhân viên trả lời và trao đổi với sinh viên
5. Khi vấn đề được giải quyết, nhân viên đánh dấu yêu cầu là "đã giải quyết"
6. Quản lý và lãnh đạo có thể theo dõi toàn bộ quá trình này thông qua các báo cáo

## Cấu trúc dự án

- `/src/pages`: Các trang của ứng dụng theo vai trò
- `/src/components`: Các thành phần UI tái sử dụng
- `/src/utils`: Các dịch vụ và tiện ích
- `/src/styles`: File CSS và styling

## Lưu ý kỹ thuật

Dự án này sử dụng mock data và các hàm mô phỏng API thay vì gọi backend thật, để đơn giản hóa quá trình demo và phát triển.