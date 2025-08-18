"""
Tệp này chứa lệnh SQL để sửa định nghĩa bảng threads trong cơ sở dữ liệu MySQL
"""

# Thực hiện lệnh sau trong MySQL để thêm giá trị mặc định cho trường id
# ALTER TABLE threads MODIFY COLUMN id INT AUTO_INCREMENT;

# Hoặc sử dụng cách tiếp cận đầy đủ hơn:
# ALTER TABLE threads MODIFY COLUMN id VARCHAR(36) DEFAULT (UUID()) NOT NULL;

"""
Để thực hiện thủ công:

1. Kết nối vào MySQL:
   mysql -u username -p

2. Chọn database:
   USE student_support_db;  # Thay student_support_db bằng tên database thực tế

3. Kiểm tra cấu trúc bảng hiện tại:
   DESCRIBE threads;

4. Thực hiện lệnh để thay đổi cấu trúc cột id:
   ALTER TABLE threads MODIFY COLUMN id VARCHAR(36) DEFAULT (UUID()) NOT NULL;

5. Kiểm tra lại cấu trúc bảng:
   DESCRIBE threads;

Nếu sử dụng UUID trong Python, hãy đảm bảo rằng:
1. Model Thread sử dụng String(36) cho trường id
2. Có hàm default=lambda: str(uuid.uuid4()) cho trường id
3. Sửa lại tất cả các truy vấn liên quan để xử lý ID dạng string
"""
