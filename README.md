# 인터넷 그림판 (Internet Drawing Board)

HTML5 Canvas 기반의 웹 그림판 애플리케이션입니다.

## 🎨 주요 기능

### 그리기 도구
- **선택 도구**: 오브젝트 선택 및 이동
- **펜**: 자유 곡선 그리기
- **지우개**: 그림 지우기
- **직선**: 직선 그리기
- **사각형**: 사각형 그리기
- **원**: 원 그리기
- **텍스트**: 한글/영문 텍스트 입력
- **이미지**: 이미지 파일 불러오기

### 기능
- 색상 선택 (컬러 피커)
- 선 두께 조절 (1-20px)
- 투명도 조절 (0-100%)
- 폰트 크기 조절 (12-72px)
- 실행 취소 (Undo) / 다시 실행 (Redo)
- 전체 지우기
- PNG 이미지로 저장
- **PDF 생성**
- **공유하기** (imgur API 연동)
  - 이메일로 공유 (Canvas 이미지 URL 포함)
  - Twitter 공유 (실제 Canvas 이미지 표시)
  - Facebook 공유 (실제 Canvas 이미지 미리보기)
  - 기타 공유 (Web Share API, 모바일)
  - 로컬/인터넷 환경 모두 지원

### 오브젝트 관리
- 오브젝트 선택 및 이동
- 바운딩 박스 표시
- Delete/Backspace 키로 삭제

## 🚀 사용 방법

### 로컬 실행
1. 이 저장소를 클론하거나 다운로드
2. `index.html` 파일을 브라우저에서 열기

### 온라인 사용
배포된 URL: [여기에 배포 URL이 추가됩니다]

## ⌨️ 키보드 단축키

- `Ctrl + Z`: 실행 취소 (Undo)
- `Ctrl + Y` 또는 `Ctrl + Shift + Z`: 다시 실행 (Redo)
- `Delete` 또는 `Backspace`: 선택된 오브젝트 삭제
- `Enter`: 텍스트 입력 완료
- `ESC`: 텍스트 입력 취소

## 🛠️ 기술 스택

- HTML5 (Canvas API)
- CSS3 (Flexbox)
- Vanilla JavaScript (ES6+)
- jsPDF (PDF 생성)

## 📁 파일 구조

```
drawing_board/
├── index.html          # 메인 HTML 파일
├── css/
│   ├── style.css       # 메인 스타일시트
│   ├── toolbar.css     # 툴바 스타일
│   └── share.css       # 공유 다이얼로그 스타일
├── js/
│   ├── app.js          # 애플리케이션 초기화
│   ├── canvas.js       # Canvas 관리
│   ├── objectManager.js # 오브젝트 관리
│   ├── toolbar.js      # 툴바 UI 및 이벤트
│   ├── tools.js        # 그리기 도구들
│   ├── pdfExporter.js  # PDF 생성
│   ├── shareManager.js # 공유 기능
│   └── utils.js        # 유틸리티 함수
└── architect.md        # 설계 문서
```

## 🌟 특징

- **Standalone 애플리케이션**: 서버 없이 브라우저에서 직접 실행
- **오브젝트 기반 렌더링**: 모든 그림 요소를 독립적으로 관리
- **한글 완벽 지원**: 텍스트 입력 시 한글 IME 지원
- **모던 브라우저 호환**: Chrome, Firefox, Safari, Edge 지원
- **반응형 디자인**: 다양한 화면 크기 지원

## 📝 라이센스

이 프로젝트는 학습 및 개인 사용을 위한 목적으로 제작되었습니다.

## 🔗 참고

- [Canvas API - MDN](https://developer.mozilla.org/ko/docs/Web/API/Canvas_API)
- [jsPDF Documentation](https://github.com/parallax/jsPDF)

---

**버전**: 1.7
**최종 업데이트**: 2026-01-27
