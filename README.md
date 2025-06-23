# Excel to Invoice - Ứng dụng quản lý hóa đơn

Ứng dụng web đơn giản giúp bạn nhập dữ liệu từ file Excel và tạo hóa đơn thanh toán chuyên nghiệp.

## Tính năng chính

- ✅ **Upload file Excel**: Hỗ trợ định dạng .xlsx và .xls
- ✅ **Drag & Drop**: Kéo thả file dễ dàng
- ✅ **Hiển thị dữ liệu**: Bảng dữ liệu đầy đủ với thống kê tổng hợp  
- ✅ **Xuất hóa đơn PDF**: Tạo hóa đơn thanh toán chuyên nghiệp
- ✅ **Giao diện hiện đại**: Thiết kế đẹp mắt, responsive
- ✅ **Tự động tính toán**: Tổng tiền, đã thanh toán, còn nợ

## Cách sử dụng

### 1. Chuẩn bị file Excel

File Excel cần có các cột sau theo thứ tự:

| STT | Ngày tháng | Loại giao dịch | Loại hàng | Đơn giá | Số lượng | Thành tiền | Thanh toán | Còn nợ | Ghi chú |
|-----|------------|----------------|-----------|---------|----------|------------|------------|---------|---------|
| 1   | 01/01/2024 | Bán hàng       | Sản phẩm A| 100000  | 2        | 200000     | 150000     | 50000   | Ghi chú |

### 2. Sử dụng ứng dụng

1. **Mở file `index.html`** trong trình duyệt web
2. **Upload file Excel**:
   - Click "Chọn file" hoặc kéo thả file vào vùng upload
   - Ứng dụng sẽ tự động đọc và hiển thị dữ liệu
3. **Xem dữ liệu**: Kiểm tra bảng dữ liệu và thống kê tổng hợp
4. **Tạo hóa đơn**: Click "Xuất hóa đơn" để xem preview hóa đơn
5. **Tải PDF**: Click "Tải xuống PDF" để lưu hóa đơn

## Cấu trúc file

```
Excel2Invoice/
├── index.html      # Giao diện chính
├── styles.css      # Stylesheet
├── script.js       # Logic xử lý
└── README.md       # Hướng dẫn này
```

## Công nghệ sử dụng

- **HTML5**: Cấu trúc trang web
- **CSS3**: Thiết kế giao diện với gradient và animation
- **JavaScript**: Logic xử lý dữ liệu
- **SheetJS**: Thư viện đọc file Excel  
- **jsPDF**: Thư viện tạo file PDF
- **Font Awesome**: Icons đẹp mắt
- **Google Fonts**: Font Inter hiện đại

## Tính năng nâng cao

### Thống kê tự động
- Tổng số giao dịch
- Tổng thành tiền
- Đã thanh toán
- Còn nợ

### Định dạng dữ liệu
- Tự động format số tiền theo chuẩn Việt Nam
- Chuyển đổi ngày tháng từ Excel sang định dạng VN
- Validate dữ liệu đầu vào

### Giao diện responsive  
- Tối ưu cho desktop và mobile
- Hiệu ứng hover và animation mượt mà
- Loading spinner khi xử lý

## Lưu ý quan trọng

1. **Định dạng Excel**: Đảm bảo file Excel có đúng cấu trúc cột như mô tả
2. **Trình duyệt**: Sử dụng trình duyệt hiện đại (Chrome, Firefox, Safari, Edge)
3. **Dữ liệu số**: Các cột tiền tệ cần nhập số, không nhập chữ
4. **Font tiếng Việt**: PDF có thể không hiển thị hoàn hảo dấu tiếng Việt do hạn chế font

## Khắc phục sự cố

### File không đọc được
- Kiểm tra định dạng file (.xlsx hoặc .xls)
- Đảm bảo file không bị corrupt
- Kiểm tra cấu trúc cột có đúng không

### PDF không tải xuống
- Kiểm tra trình duyệt có cho phép download không
- Thử tải lại trang và làm lại

### Dữ liệu hiển thị sai
- Kiểm tra định dạng dữ liệu trong Excel
- Đảm bảo cột số tiền chỉ chứa số
- Kiểm tra định dạng ngày tháng

## Hỗ trợ

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra Console của trình duyệt (F12) để xem lỗi
2. Đảm bảo file Excel đúng định dạng
3. Thử với file Excel khác để test

---

**Tác giả**: AI Assistant  
**Phiên bản**: 1.0  
**Cập nhật**: 2024 