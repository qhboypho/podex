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
5. Sau khi nạp mới/cập nhật extension, **refresh lại trang sàn** để content script được inject

## Cách dùng

### Cách 1 — Tự động (mặc định)
1. Vào sàn (TikTok Seller Center...), bấm **In đơn** như bình thường
2. Tab PDF **tự mở bằng trình của extension** (không hiện trình PDF mặc định của Chrome) —
   extension nhận diện PDF ở mức response header (`Content-Type: application/pdf`),
   nên bắt được cả link kiểu `.../easesafe/...?expire=...` của TikTok không có đuôi `.pdf`

### Cách 2 — Bấm icon extension trên tab PDF
1. Nếu tab PDF đã mở bằng trình mặc định của Chrome (hoặc tự động chặn bị tắt):
   đang đứng ở tab đó, **bấm icon extension**
2. Popup hiện nút **"Đóng dấu watermark tab này"** → bấm là tab chuyển ngay sang
   cửa sổ làm việc watermark với đúng file PDF đó

### Đóng dấu & in
1. Bấm nút **Watermark** trên thanh công cụ:
   - **+ Thêm chữ**: nhập nội dung, chọn font/size/màu/độ mờ/xoay
   - **+ Thêm logo**: chọn ảnh logo, chỉnh độ rộng %, độ mờ, xoay
   - **Kéo điểm tròn xanh** trên trang xem trước để đặt vị trí
   - Bật **Lặp kín trang** nếu muốn dấu lặp toàn phiếu
2. Bấm **In đơn** (in luôn cả watermark) hoặc **Tải PDF** để lưu file đã đóng dấu

> Nút bật/tắt trong popup của extension: tắt công tắc **Tự động chặn PDF in đơn**
> nếu muốn PDF mở bằng trình duyệt như cũ (lúc đó dùng Cách 2 để đóng dấu).

## Kiến trúc

```
printerwatermark/
├── manifest.json          # MV3 config
├── background.js          # Service worker:
│                          #  - webRequest.onHeadersReceived: phát hiện main frame
│                          #    trả PDF theo Content-Type (application/pdf hoặc
│                          #    binary kiểu octet-stream mà Chrome tự sniff ra PDF,
│                          #    vd link awbprint của Shopee) -> redirect sang viewer
│                          #  - nhận PDF (base64) từ content script, mở viewer
│                          #  - fetch PDF theo URL (có cookie) cho viewer
│                          #  - phục vụ popup: nhận diện/đóng dấu tab PDF hiện tại
├── content.js             # Hook window.open + click <a> trên trang sàn,
│                          # phát hiện PDF dạng blob:/...pdf -> gửi sang viewer;
│                          # trên domain sàn: quan sát iframe/embed/object chứa
│                          # PDF blob (kiểu trang awbprint của Shopee) -> chuyển
│                          # tab sang viewer
├── viewer/
│   ├── viewer.html/css/js # Trình xem PDF + editor watermark + in/tải
├── popup/                 # Bật/tắt chặn PDF, đóng dấu tab hiện tại, mở viewer
├── pdfjs/                 # pdf.js (render) + pdf-lib (đóng gói PDF tải về) - bundle local
└── icons/
```

**Luồng hoạt động (link như TikTok):** bấm In trên sàn → tab mới điều hướng tới URL
PDF → `webRequest.onHeadersReceived` thấy response PDF (Content-Type `application/pdf`
hoặc kiểu binary như `octet-stream` mà Chrome sẽ tự sniff ra PDF — vd link AWB của
Shopee) → tab được chuyển hướng sang `viewer/viewer.html?url=...` → viewer nhờ
background fetch lại URL (kèm cookie đăng nhập) → render bằng pdf.js, vẽ watermark
lên lớp canvas overlay → in bằng `window.print()` (khổ giấy tự set theo đúng kích
thước phiếu) hoặc tải PDF (ghép ảnh trang đã đóng dấu bằng pdf-lib).

**Luồng blob:** sàn mở PDF dạng `blob:` → content script đọc blob (cùng origin),
kiểm tra magic bytes `%PDF`, chuyển base64 gửi background → mở viewer.

**Luồng Shopee (awbprint):** Shopee tự custom trang in — tải PDF bằng XHR rồi nhúng
vào `<iframe src="blob:...">` ngay trong trang, không có navigation nào để bắt ở mức
header. Content script trên các domain sàn (Shopee, Lazada, TikTok Seller) quan sát
DOM: thấy iframe/embed/object mang src PDF (blob:/https) là đọc thử bytes, đúng PDF
thì chuyển luôn tab đó sang viewer để đóng dấu.

## Ghi chú

- PDF tải về là bản raster hoá ở ~250 DPI (giữ nguyên bố cục, watermark giống
  hệt bản xem trước).
- Link PDF một-lần/nhanh hết hạn: viewer fetch lại ngay sau khi redirect nên vẫn hoạt
  động; nếu hết hạn thật sự, kéo thả file PDF vào viewer hoặc bấm **Chọn PDF** để in thủ công.
- Nút **Mở link bằng tab thường** trên màn lỗi sẽ mở link gốc mà không bị extension
  chặn lại (bypass trong 2 phút).
- Nếu trang sàn nhúng PDF trong iframe (không mở tab mới), dùng kéo thả/chọn file thủ công.
