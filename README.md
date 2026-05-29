# Football Position

Ứng dụng sơ đồ chiến thuật bóng đá — Vite, React, TypeScript, Tailwind, Zustand.

## Tính năng

- **Nhiều chiến thuật** — tạo, sửa tên, nhân bản, xóa; mỗi tactic có `steps[]`
- **Hai đội** — đội nhà (xanh), đội khách (đỏ); chọn 1–11 cầu thủ mỗi đội
- **Vị trí ban đầu** — chỉnh trên sân rồi lưu làm formation mặc định
- **Panel trái** — chọn bước, đổi tên, cập nhật, thêm bước mới, xóa
- **Animation** — Phát qua các bước
- **Zustand + persist** — state toàn cục, không prop drilling; `tactics` lưu `localStorage` key `football-position-v2`

## Chạy

```bash
npm install
npm run dev
```

## Cấu trúc lưu trữ

```json
{
  "tactics": [
    {
      "id": "tactic-…",
      "name": "Chiến thuật 1",
      "config": { "homeCount": 7, "awayCount": 7 },
      "initialPositions": [{ "id": "h-1", "team": "home", "label": "1", "x": 0.5, "y": 0.8 }],
      "steps": [
        {
          "id": "step-…",
          "name": "Bước 1",
          "players": [],
          "ball": { "x": 0.5, "y": 0.5 }
        }
      ]
    }
  ],
  "activeTacticId": "tactic-…"
}
```
