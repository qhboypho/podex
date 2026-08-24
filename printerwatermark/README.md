# Watermark In Đơn Hàng — Chrome Extension

Extension Chrome (Manifest V3) giúp đóng dấu **watermark chữ / logo** lên phiếu in đơn
hàng xuất từ sàn TMĐT (TikTok Shop, Shopee, Lazada...) trước khi in, với tuỳ chỉnh:

- Thêm **nhiều lớp watermark** (chữ nhiều dòng, logo ảnh PNG/JPG)
- **Kéo thả trực tiếp** trên trang xem trước để đặt vị trí bất kỳ (hoặc nhập X/Y %)
- Chỉnh **kích thước, độ mờ (opacity), độ xoay, màu, font, đậm/nghiêng**
- Chế độ **lặp kín trang** (kiểu đóng dấu chống bán trùng sàn)
- **In đơn** trực tiếp (Ctrl+P cũng được) hoặc **Tải PDF** đã đóng dấu
- Cấu hình watermark **tự động lưu**, dùng lại cho mọi lần in sau

## Cách cài đặt (Load unpacked)

1. Mở Chrome, vào `chrome://extensions`
2. Bật **Developer mode** (góc trên phải)
3. Bấm **Load unpacked** → chọn thư mục `printerwatermark` này
4. (Nên) Ghim extension lên thanh công cụ

## Cách dùng

1. Vào sàn (TikTok Seller Center...), bấm **In đơn** như bình thường
2. Tab PDF sẽ tự mở bằng **trình xem của extension** (không phải trình PDF mặc định)
3. Bấm nút **Watermark** trên thanh công cụ:
   - **+ Thêm chữ**: nhập nội dung, chọn font/size/màu/độ mờ/xoay
   - **+ Thêm logo**: chọn ảnh logo, chỉnh độ rộng %, độ mờ, xoay
   - **Kéo điểm tròn xanh** trên trang xem trước để đặt vị trí
   - Bật **Lặp kín trang** nếu muốn dấu lặp toàn phiếu
4. Bấm **In đơn** (in luôn cả watermark) hoặc **Tải PDF** để lưu file đã đóng dấu

> Nút bật/tắt trong popup của extension: nếu muốn tắt tạm việc chặn PDF
> (PDF mở bằng trình duyệt như cũ), tắt công tắc **Tự động chặn PDF in đơn**.

## Kiến trúc

```
printerwatermark/
├── manifest.json          # MV3 config
├── background.js          # Service worker: nhận PDF từ content script, mở viewer,
│                          # fetch PDF theo URL, redirect link *.pdf sang viewer
├── content.js             # Hook window.open + click <a> trên trang sàn,
│                          # phát hiện PDF (blob:/...pdf) -> gửi sang viewer
├── viewer/
│   ├── viewer.html/css/js # Trình xem PDF + editor watermark + in/tải
├── popup/                 # Bật/tắt chặn PDF, mở viewer
├── pdfjs/                 # pdf.js (render) + pdf-lib (đóng gói PDF tải về) - bundle local
└── icons/
```

**Luồng hoạt động:** sàn mở PDF dạng `blob:` bằng `window.open` → content script
đọc blob (cùng origin nên đọc được), kiểm tra magic bytes `%PDF`, chuyển base64
gửi background → background lưu tạm và mở `viewer/viewer.html` → viewer render
bằng pdf.js, vẽ watermark lên lớp canvas overlay → in bằng `window.print()`
(khổ giấy tự set theo đúng kích thước phiếu) hoặc tải PDF (ghép ảnh trang đã
đóng dấu bằng pdf-lib).

## Ghi chú

- PDF tải về là bản raster hoá ở ~250 DPI (giữ nguyên bố cục, watermark giống
  hệt bản xem trước).
- Nếu trang sàn thay đổi cách mở PDF (ví dụ mở trong iframe nhúng), dùng nút
  **Chọn PDF** trong viewer để in thủ công, hoặc kéo thả file PDF vào viewer.
