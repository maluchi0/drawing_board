# 인터넷 그림판 설계 문서

## 1. 프로젝트 개요

### 1.1 목적
- HTML5 Canvas 기반의 웹 그림판 애플리케이션
- 브라우저에서 index.html을 직접 열어 사용 가능한 standalone 애플리케이션

### 1.2 기술 스택
- HTML5 (Canvas API)
- CSS3
- Vanilla JavaScript (ES6+)
- 외부 라이브러리:
  - jsPDF (PDF 생성)
  - html2canvas (HTML을 이미지로 변환)

## 2. 파일 구조

```
drawing_board/
├── index.html          # 메인 HTML 파일
├── css/
│   ├── style.css       # 메인 스타일시트
│   └── toolbar.css     # 툴바 전용 스타일
├── js/
│   ├── app.js          # 애플리케이션 초기화 및 메인 로직
│   ├── canvas.js       # Canvas 관리 클래스
│   ├── toolbar.js      # 툴바 UI 및 이벤트 처리
│   ├── tools.js        # 그리기 도구 클래스들
│   └── utils.js        # 유틸리티 함수들
├── .gitignore          # Git 무시 파일 (선택)
├── README.md           # 프로젝트 설명 (선택)
└── architect.md        # 본 설계 문서
```

## 3. 아키텍처 설계

### 3.1 전체 구조
```
┌─────────────────────────────────────────┐
│           index.html                     │
│  ┌───────────────────────────────────┐  │
│  │      Toolbar (도구 선택)          │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │                                   │  │
│  │       Canvas (그리기 영역)        │  │
│  │                                   │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### 3.2 모듈 간 관계
```
app.js (Entry Point)
   │
   ├──> CanvasManager
   │      ├──> 캔버스 초기화
   │      ├──> 이벤트 리스너 등록
   │      └──> 드로잉 컨텍스트 관리
   │
   ├──> ToolbarManager
   │      ├──> 도구 선택 UI
   │      ├──> 색상 선택기
   │      └──> 옵션 설정
   │
   ├──> ObjectManager
   │      ├──> 오브젝트 저장 및 관리
   │      ├──> 오브젝트 선택 감지
   │      └──> 오브젝트 이동/변형
   │
   ├──> PDFExporter
   │      ├──> URL 입력 처리
   │      ├──> 페이지 로딩 및 캡처
   │      └──> PDF 생성 및 다운로드
   │
   ├──> ShareManager
   │      ├──> URL 복사 기능
   │      ├──> Canvas 이미지 캡처
   │      └──> 소셜 미디어 공유
   │
   └──> DrawingTools
          ├──> PenTool
          ├──> EraserTool
          ├──> LineTool
          ├──> RectangleTool
          ├──> CircleTool
          ├──> FillTool
          ├──> TextTool
          ├──> ImageTool
          └──> SelectTool
```

## 4. 주요 컴포넌트 설계

### 4.1 CanvasManager 클래스

**책임**
- Canvas 엘리먼트 초기화 및 관리
- 마우스/터치 이벤트 처리
- 드로잉 컨텍스트(2D Context) 관리
- 현재 선택된 도구와 상호작용

**주요 메서드**
- `init()`: 캔버스 초기화
- `attachEventListeners()`: 이벤트 리스너 등록
- `handleMouseDown(event)`: 마우스 다운 이벤트 처리
- `handleMouseMove(event)`: 마우스 이동 이벤트 처리
- `handleMouseUp(event)`: 마우스 업 이벤트 처리
- `getContext()`: 2D 컨텍스트 반환
- `clear()`: 캔버스 지우기
- `exportImage()`: 이미지로 내보내기
- `getMousePosition(event)`: 마우스 좌표 계산

**상태 관리**
- `isDrawing`: 현재 그리기 중인지 여부
- `lastX`, `lastY`: 이전 마우스 위치
- `currentTool`: 현재 선택된 도구 인스턴스

### 4.2 ToolbarManager 클래스

**책임**
- 도구 선택 버튼 관리
- 색상 선택기 관리
- 선 두께, 투명도 등 옵션 관리
- UI 상태 업데이트

**주요 메서드**
- `init()`: 툴바 UI 초기화
- `attachToolListeners()`: 도구 버튼 이벤트 리스너 등록
- `setActiveTool(toolName)`: 활성 도구 설정
- `getCurrentColor()`: 현재 선택된 색상 반환
- `getCurrentLineWidth()`: 현재 선 두께 반환
- `getCurrentFontSize()`: 현재 폰트 크기 반환
- `updateToolButton(toolName)`: 버튼 활성화 상태 업데이트

**상태 관리**
- `activeTool`: 현재 활성화된 도구 이름
- `color`: 현재 선택된 색상
- `lineWidth`: 현재 선 두께
- `fontSize`: 현재 폰트 크기
- `opacity`: 투명도

### 4.3 ObjectManager 클래스

**책임**
- 그려진 모든 오브젝트를 저장하고 관리
- 오브젝트 선택 감지 (히트 테스트)
- 오브젝트 렌더링 순서 관리
- 선택된 오브젝트 변형 (이동, 회전, 크기 조절)
- 이미지 캐시 관리

**주요 메서드**
- `addObject(object)`: 새로운 오브젝트 추가
- `removeObject(id)`: 오브젝트 제거
- `getObjectAt(x, y)`: 특정 좌표의 오브젝트 반환
- `selectObject(id)`: 오브젝트 선택
- `deselectAll()`: 모든 선택 해제
- `moveObject(id, dx, dy)`: 오브젝트 이동
- `renderAll(ctx)`: 모든 오브젝트 다시 그리기
- `getSelectedObject()`: 선택된 오브젝트 반환
- `preloadImage(imageData)`: 이미지 미리 로드 및 캐싱

**상태 관리**
- `objects`: 모든 오브젝트 배열
- `selectedObjectId`: 현재 선택된 오브젝트 ID
- `nextId`: 다음 오브젝트 ID (자동 증가)
- `imageCache`: 이미지 캐시 Map

### 4.4 DrawingTool 추상 클래스

**책임**
- 모든 그리기 도구의 기본 인터페이스 정의

**주요 메서드**
- `onMouseDown(ctx, x, y, options)`: 마우스 다운 시 동작
- `onMouseMove(ctx, x, y, options)`: 마우스 이동 시 동작
- `onMouseUp(ctx, x, y, options)`: 마우스 업 시 동작
- `setOptions(options)`: 도구 옵션 설정

### 4.5 구체적인 도구 클래스들

**PenTool (연필/펜)**
- 자유 곡선 그리기
- 마우스 이동 중 이전 점과 현재 점을 연결하여 path 생성

**EraserTool (지우개)**
- 특정 영역 지우기
- globalCompositeOperation을 'destination-out'으로 설정하여 구현

**LineTool (직선)**
- 시작점과 끝점을 연결하는 직선
- 마우스 다운에서 시작점 저장, 마우스 업에서 직선 오브젝트 생성

**RectangleTool (사각형)**
- 채워진 사각형 또는 테두리만
- 드래그로 크기 결정

**CircleTool (원/타원)**
- 중심점과 반지름으로 원 그리기
- 드래그로 크기 결정

**FillTool (채우기)**
- Flood fill 알고리즘 구현
- 클릭한 지점과 같은 색상의 연결된 영역을 채움

**TextTool (텍스트 도구)**
- 클릭한 위치에 텍스트 입력 모드 진입
- HTML input 엘리먼트를 캔버스 위에 절대 위치로 배치
- 한글 및 영문 입력 지원 (IME 이벤트 처리 필요)
- Enter로 입력 완료 시 텍스트 오브젝트 생성
- ESC로 입력 취소

**ImageTool (이미지 도구)**
- 파일 선택 다이얼로그 열기
- FileReader API로 이미지 파일을 Base64로 변환
- 이미지를 캔버스 중앙에 배치
- 이미지 오브젝트 생성 및 ObjectManager에 추가

**SelectTool (선택 도구)**
- 오브젝트 클릭으로 선택
- 선택된 오브젝트 바운딩 박스 표시
- 드래그로 오브젝트 이동
- 클릭 외부 영역으로 선택 해제

### 4.6 PDFExporter 클래스

**책임**
- URL 입력 받기 및 검증
- 웹 페이지 로딩 및 렌더링
- HTML/Canvas를 PDF로 변환
- PDF 파일 생성 및 다운로드

**주요 메서드**
- `showURLDialog()`: URL 입력 다이얼로그 표시
- `validateURL(url)`: URL 유효성 검사
- `loadPage(url)`: URL 페이지 로드 (iframe 또는 fetch)
- `captureToImage(element)`: HTML 엘리먼트를 이미지로 캡처 (html2canvas 사용)
- `generatePDF(imageData)`: 이미지 데이터를 PDF로 변환 (jsPDF 사용)
- `downloadPDF(pdfBlob, filename)`: PDF 파일 다운로드

**상태 관리**
- `isLoading`: 페이지 로딩 중 여부
- `currentURL`: 현재 처리 중인 URL
- `capturedImage`: 캡처된 이미지 데이터

**처리 플로우**
1. 사용자가 URL 입력
2. URL 검증 (http/https, file:// 프로토콜)
3. 페이지 로드 (CORS 제약 고려)
4. 로드된 콘텐츠를 html2canvas로 이미지 캡처
5. 캡처된 이미지를 jsPDF로 PDF 변환
6. PDF 파일 다운로드

### 4.7 ShareManager 클래스 (수정)

**책임**
- Canvas를 이미지로 캡처
- 이미지를 외부 호스팅 서비스에 업로드
- 소셜 미디어 공유 링크 생성
- 로컬 및 인터넷 환경 모두 지원
- 현재 작업 중인 이미지가 보이도록 공유

**주요 메서드**
- `captureCanvas()`: Canvas를 이미지(Blob 또는 Base64)로 캡처
- `uploadImage(imageBlob)`: 이미지를 외부 호스팅 서비스에 업로드
- `shareViaEmail(imageBase64)`: 이메일로 이미지 공유
- `shareViaTwitter(imageUrl)`: Twitter에 이미지 공유
- `shareViaFacebook(imageUrl)`: Facebook에 이미지 공유
- `shareViaWebAPI(imageFile)`: Web Share API로 공유
- `showShareDialog()`: 공유 옵션 다이얼로그 표시
- `showLoading()`: 로딩 인디케이터 표시
- `hideLoading()`: 로딩 인디케이터 숨김

**상태 관리**
- `capturedImage`: 캡처된 이미지 Blob
- `uploadedImageUrl`: 업로드된 이미지 URL
- `isUploading`: 업로드 중 여부

**공유 옵션 및 전략**

1. **이메일 공유**
   - Canvas를 Base64로 변환
   - HTML 이메일 본문에 img 태그로 포함
   - data URI 형식 사용
   - 로컬/인터넷 모두 동작

2. **Twitter 공유**
   - Canvas를 이미지 호스팅 서비스(imgur)에 업로드
   - 업로드된 이미지 URL 획득
   - Twitter Web Intent에 이미지 URL 포함
   - 로컬/인터넷 모두 동작 (인터넷 연결 필요)

3. **Facebook 공유**
   - Canvas를 이미지 호스팅 서비스(imgur)에 업로드
   - 업로드된 이미지 URL 획득
   - 임시 HTML 페이지 생성 (Open Graph 메타 태그 포함)
   - 또는 이미지 URL을 직접 공유
   - 로컬/인터넷 모두 동작 (인터넷 연결 필요)

4. **Web Share API**
   - Canvas를 File 객체로 변환
   - 네이티브 공유 시트로 직접 공유
   - 로컬/인터넷 모두 동작 (HTTPS 필요)
   - 모바일 우선

## 5. 데이터 구조

### 5.1 도구 옵션 객체
```
{
  color: 색상 코드 (16진수 문자열),
  lineWidth: 선 두께 (숫자, 픽셀),
  fontSize: 폰트 크기 (숫자, 픽셀),
  opacity: 투명도 (0.0 ~ 1.0),
  lineCap: 선 끝 모양 ('round', 'butt', 'square'),
  lineJoin: 선 연결 모양 ('round', 'bevel', 'miter'),
  fillStyle: 채우기 스타일 ('solid', 'none')
}
```

### 5.2 오브젝트 데이터 구조
```
{
  id: 고유 식별자 (문자열),
  type: 오브젝트 타입 ('line', 'rectangle', 'circle', 'path', 'text', 'image'),
  data: {
    // 타입별로 다른 데이터 포함

    // line
    startX, startY, endX, endY

    // rectangle
    x, y, width, height

    // circle
    centerX, centerY, radius

    // path (자유 곡선)
    points: [{x, y}, {x, y}, ...]

    // text
    x, y, text, fontSize, fontFamily, textAlign, textBaseline

    // image
    x, y, width, height, imageData (Base64), originalWidth, originalHeight
  },
  style: {
    color, lineWidth, opacity, lineCap, lineJoin, fillStyle
  },
  bounds: {
    x, y, width, height  // 바운딩 박스
  },
  selected: 선택 여부 (boolean),
  zIndex: 렌더링 순서 (숫자)
}
```

## 6. 기능 요구사항

### 6.1 필수 기능

1. **그리기 도구**
   - 연필/펜 (자유 곡선)
   - 지우개
   - 직선
   - 사각형
   - 원/타원
   - 텍스트 입력 (한글/영문)
   - 이미지 불러오기

2. **색상 및 스타일**
   - 색상 선택 (컬러 피커)
   - 선 두께 조절
   - 폰트 크기 조절 (텍스트용)
   - 투명도 조절

3. **캔버스 조작**
   - 전체 지우기
   - 실행 취소 (Undo)
   - 다시 실행 (Redo)

4. **파일 관리**
   - 이미지로 저장 (PNG)
   - 이미지 내보내기
   - 이미지 불러오기 (캔버스에 추가)

5. **오브젝트 관리**
   - 선택 도구로 오브젝트 선택
   - 선택된 오브젝트 바운딩 박스 표시
   - 드래그로 오브젝트 위치 이동
   - 오브젝트 삭제 (Delete 키)
   - 클릭 외부 영역으로 선택 해제

6. **PDF 생성**
   - URL 입력 다이얼로그
   - 인터넷 URL 입력 지원 (http://, https://)
   - 로컬 파일 URL 입력 지원 (file://)
   - 웹 페이지를 이미지로 캡처
   - 캡처된 이미지를 PDF로 변환
   - PDF 파일 다운로드

7. **웹 호스팅 배포**
   - 무료 웹 호스팅 서비스에 배포
   - 인터넷 URL로 접근 가능
   - GitHub Pages, Netlify, Vercel 등 지원
   - 정적 파일 호스팅 (서버 불필요)

8. **공유하기 기능** (신규 추가)
   - 이메일로 이미지 공유
   - Twitter에 이미지 공유
   - Facebook에 이미지 공유
   - Web Share API로 직접 공유
   - 로컬 및 인터넷 환경 모두 지원
   - 현재 작업 중인 Canvas 이미지 포함

## 7. UI/UX 설계

### 7.1 레이아웃
```
┌──────────────────────────────────────────────┐
│  [도구] [색상] [두께] [폰트] [액션 버튼]      │  <- 상단 툴바
├──────────────────────────────────────────────┤
│                                              │
│                                              │
│              Canvas 영역                     │
│                                              │
│                                              │
└──────────────────────────────────────────────┘
```

### 7.2 툴바 구성
- **도구 버튼**: 선택, 펜, 지우개, 직선, 사각형, 원, 텍스트, 이미지
- **색상 선택기**: HTML5 color input
- **선 두께**: range input (1-20px)
- **폰트 크기**: range input (12-72px) - 텍스트 도구 선택 시 표시
- **액션 버튼**: 전체 지우기, Undo, Redo, 저장, 이미지 불러오기, PDF 생성, 공유하기

### 7.3 사용자 인터랙션
1. 도구 선택 → 버튼 클릭
2. 색상/두께/폰트 변경 → 입력 요소 조작
3. 그리기 → 마우스 드래그
4. 텍스트 입력 → 클릭 후 input 엘리먼트에 입력
5. 오브젝트 선택 → 선택 도구로 클릭
6. 오브젝트 이동 → 선택 후 드래그
7. 저장 → 버튼 클릭 → 다운로드
8. PDF 생성 → 버튼 클릭 → URL 입력 다이얼로그 → URL 입력 → 페이지 로드 → PDF 다운로드
9. 공유하기 → 버튼 클릭 → 공유 옵션 선택 → URL 복사 또는 이미지 공유

## 8. 이벤트 처리 구조

### 8.1 이벤트 흐름
```
사용자 액션
   │
   ├─ 도구 선택 → ToolbarManager → CanvasManager.setTool()
   │
   ├─ 마우스 다운 → CanvasManager.handleMouseDown()
   │                  └─> currentTool.onMouseDown()
   │
   ├─ 마우스 이동 → CanvasManager.handleMouseMove()
   │                  └─> currentTool.onMouseMove()
   │
   └─ 마우스 업   → CanvasManager.handleMouseUp()
                      └─> currentTool.onMouseUp()
                      └─> ObjectManager.addObject() (오브젝트 완성 시)
```

### 8.2 주요 이벤트
- `mousedown`: 그리기 시작 또는 오브젝트 선택
- `mousemove`: 그리기 진행 또는 오브젝트 이동
- `mouseup`: 그리기 종료 또는 오브젝트 이동 완료
- `mouseleave`: 캔버스 영역 벗어남 (그리기 중단)
- `click`: 버튼 액션 (도구 선택, 저장 등)
- `input`: 색상, 두께, 폰트 크기 변경
- `keydown`: Delete(오브젝트 삭제), Ctrl+Z(Undo), Ctrl+Y(Redo), Enter/ESC(텍스트 입력)

## 9. 핵심 설계 가이드

### 9.1 초기화 순서
1. DOM 로드 완료 대기
2. CanvasManager 인스턴스 생성 및 초기화
3. ObjectManager 인스턴스 생성
4. ToolbarManager 인스턴스 생성 및 초기화
5. 기본 도구 설정 (예: PenTool)
6. 이벤트 리스너 등록
7. 첫 렌더링

### 9.2 오브젝트 기반 렌더링

**기본 원칙**
- Canvas에 직접 그리지 않고 오브젝트를 메모리에 저장
- 렌더링은 저장된 오브젝트 배열을 순회하며 수행
- 오브젝트 변경 시 전체 재렌더링

**렌더링 프로세스**
1. Canvas 전체 지우기
2. ObjectManager의 objects 배열을 zIndex 순서로 순회
3. 각 오브젝트 타입에 맞는 렌더링 함수 호출
4. 선택된 오브젝트가 있으면 바운딩 박스 표시

### 9.3 선택 감지 (Hit Test)

**기본 바운딩 박스 검사**
- 클릭 좌표가 오브젝트의 bounds 내부인지 확인
- 여러 오브젝트가 겹친 경우 zIndex가 높은(최상위) 오브젝트 선택
- objects 배열을 역순으로 순회하여 첫 번째 히트된 오브젝트 반환

**타입별 정밀 검사**
- Line: 점과 선분 사이의 거리 계산
- Circle: 중심점과의 거리가 반지름 이내인지 확인
- Text: measureText로 실제 텍스트 영역 계산
- Path: 각 선분에 대해 거리 계산

### 9.4 바운딩 박스 계산

**타입별 계산 방법**
- Line: min/max(startX, endX), min/max(startY, endY) + lineWidth 고려
- Rectangle: 이미 x, y, width, height 존재
- Circle: centerX-radius, centerY-radius, radius*2
- Path: 모든 points의 min/max X, Y 계산
- Text: measureText()의 width와 fontSize 기반 height 계산, textBaseline 고려 필요
- Image: 이미 x, y, width, height 존재

### 9.5 텍스트 입력 처리

**입력 모드 진입**
- TextTool로 캔버스 클릭 시
- HTML input 엘리먼트 동적 생성
- 캔버스 위에 절대 위치로 배치 (클릭 좌표)
- 현재 선택된 fontSize, color 적용
- 자동 포커스

**한글 입력 지원 (IME)**
- compositionstart, compositionupdate, compositionend 이벤트 처리
- 조합 중일 때는 Enter 키 무시
- 조합 완료 후 Enter로 입력 완료

**텍스트 오브젝트 생성**
- 입력 완료 시 text 오브젝트 생성
- fontFamily는 한글 지원 폰트 사용 (예: "Malgun Gothic", "맑은 고딕", Arial, sans-serif)
- textBaseline은 'alphabetic' 사용 권장
- bounds 계산 시 textBaseline에 따른 y 좌표 조정 필요

**텍스트 렌더링**
- Canvas의 fillText() 메서드 사용
- font, fillStyle, globalAlpha 설정 후 그리기
- 선택된 경우 bounds 기반 사각형 표시

### 9.6 이미지 불러오기 처리

**파일 선택**
- 숨겨진 input[type="file"] 엘리먼트 사용
- accept="image/*" 속성으로 이미지만 필터링
- 프로그래밍 방식으로 클릭 트리거

**이미지 로딩**
- FileReader API로 파일을 Base64 Data URL로 변환
- Image 객체 생성 및 src 설정
- onload 이벤트에서 이미지 로드 완료 확인

**이미지 오브젝트 생성**
- 원본 크기 저장 (naturalWidth, naturalHeight)
- 필요시 최대 크기 제한하여 스케일 조정
- 캔버스 중앙에 배치
- imageData는 Base64 문자열로 저장

**이미지 캐싱**
- ObjectManager에 이미지 캐시 Map 유지
- 동일한 imageData는 한 번만 로드
- 렌더링 시 캐시된 Image 객체 재사용
- 렌더링 전에 이미지 preload 필요

**이미지 렌더링**
- 캐시에서 Image 객체 가져오기
- Canvas의 drawImage() 메서드로 그리기
- 이미지가 아직 로드 안 된 경우 로드 후 재렌더링

### 9.7 Undo/Redo 구현

**상태 저장**
- ImageData 대신 오브젝트 배열 전체를 스냅샷으로 저장
- Deep copy 필요 (JSON.parse(JSON.stringify()) 또는 구조적 복제)
- 각 그리기 작업 완료 시 현재 상태를 history 스택에 push

**Undo**
- 현재 상태를 redo 스택에 저장
- history 스택에서 이전 상태 pop
- 오브젝트 배열 복원
- 전체 재렌더링

**Redo**
- redo 스택에서 상태 pop
- history 스택에 push
- 오브젝트 배열 복원
- 전체 재렌더링

**메모리 관리**
- history 스택 최대 크기 제한 (예: 50개)
- 새로운 작업 시 redo 스택 초기화

### 9.8 이미지 저장

**Canvas to Blob**
- canvas.toBlob() 메서드 사용
- PNG 포맷으로 저장
- Blob을 URL로 변환하여 다운로드 링크 생성
- 프로그래밍 방식으로 링크 클릭하여 다운로드

### 9.9 PDF 생성 처리

**외부 라이브러리 로드**
- jsPDF: PDF 생성 라이브러리
- html2canvas: HTML을 Canvas 이미지로 변환
- CDN 링크를 통해 로드 또는 npm 패키지 사용
- index.html의 <head>나 <body> 끝에 스크립트 태그로 로드

**URL 입력 다이얼로그**
- 모달 다이얼로그 또는 prompt() 사용
- URL 입력 받기 (input[type="text"])
- 확인/취소 버튼
- 로딩 인디케이터 표시

**URL 검증**
- http://, https:// 프로토콜 확인
- file:// 프로토콜 지원 (로컬 파일)
- 빈 문자열 체크
- 유효하지 않은 URL 형식 에러 처리

**페이지 로딩 방식**

방법 1: iframe 사용 (권장)
- 숨겨진 iframe 엘리먼트 생성
- iframe.src에 URL 설정
- iframe.onload 이벤트에서 로드 완료 확인
- CORS 제약: 다른 도메인의 경우 접근 제한 가능
- Same-origin policy로 인해 크로스 도메인 접근 시 에러 발생 가능

방법 2: 현재 캔버스 캡처
- URL 로드 대신 현재 그림판 화면을 PDF로 변환
- CORS 문제 없음
- Canvas를 직접 이미지로 변환

**HTML to Image 변환**
- html2canvas 라이브러리 사용
- 대상 엘리먼트 (iframe의 body 또는 canvas) 선택
- html2canvas(element, options) 호출
- Promise 반환, 완료 시 Canvas 엘리먼트 획득
- Canvas에서 이미지 데이터 추출 (toDataURL 또는 toBlob)

**Image to PDF 변환**
- jsPDF 인스턴스 생성
- 페이지 크기 설정 (A4, Letter 등)
- addImage() 메서드로 이미지 추가
- 이미지 크기를 PDF 페이지에 맞게 조정
- 여러 페이지 필요 시 addPage() 호출
- save() 메서드로 PDF 다운로드

**CORS 제약 처리**
- 외부 도메인 접근 시 CORS 에러 발생 가능
- 해결 방법:
  1. 현재 캔버스만 PDF로 변환 (외부 URL 로드 하지 않음)
  2. 프록시 서버 사용 (서버 필요, standalone 앱에는 부적합)
  3. 브라우저 확장 기능으로 우회 (사용자가 직접 설치 필요)
  4. 사용자에게 CORS 제약 안내 및 로컬 파일 사용 권장

**로딩 상태 표시**
- 로딩 인디케이터 (스피너) 표시
- "페이지 로딩 중...", "PDF 생성 중..." 메시지
- 진행률 표시 (선택 사항)
- 완료 시 "PDF 다운로드 완료" 메시지

**에러 처리**
- URL이 유효하지 않을 때
- CORS 에러 발생 시
- 페이지 로드 실패 시
- PDF 생성 실패 시
- 사용자에게 명확한 에러 메시지 표시

**대안 구현: Canvas를 PDF로**
- URL 로드 대신 현재 그림판 Canvas를 PDF로 변환
- CORS 문제 없음
- Canvas를 이미지로 변환 (toDataURL)
- jsPDF로 이미지를 PDF에 추가
- 더 간단하고 안정적인 구현

### 9.10 공유하기 기능 처리 (수정)

**공유 다이얼로그 표시**
- 모달 다이얼로그 또는 드롭다운 메뉴
- 공유 옵션 목록 표시:
  1. 이메일로 공유
  2. Twitter 공유
  3. Facebook 공유
  4. 기타 (Web Share API)

**Canvas 이미지 캡처**
- canvas.toBlob() 또는 canvas.toDataURL('image/png') 사용
- Base64 인코딩된 이미지 데이터 획득 (이메일용)
- Blob 형식 획득 (업로드 및 Web Share API용)
- PNG 포맷으로 캡처

**외부 이미지 호스팅 업로드**

이미지 호스팅 서비스 선택:
- imgur API (권장)
  - 무료, API 키 불필요 (익명 업로드 가능)
  - 업로드 제한: 하루 1250개 (IP 기준)
  - 반환: 이미지 URL
- imgbb API
  - 무료, API 키 필요
  - 업로드 제한: 월 5000개
- 기타: postimages, freeimage.host

업로드 프로세스:
1. Canvas를 Blob으로 변환
2. FormData 생성 및 Blob 추가
3. fetch()로 이미지 호스팅 API에 POST 요청
4. 응답에서 업로드된 이미지 URL 추출
5. 이미지 URL을 소셜 미디어 공유에 사용

**이메일 공유 (Base64 이미지 포함)**
```
프로세스:
1. Canvas를 Base64로 변환
2. HTML 이메일 본문 생성 (img 태그에 Base64 포함)
3. mailto 링크 생성
4. 이메일 클라이언트 실행

구현 방식:
const imageBase64 = canvas.toDataURL('image/png');
const subject = encodeURIComponent('그림판 작품 공유');
const htmlBody = `
<html>
  <body>
    <p>그림판에서 그린 작품을 확인해보세요!</p>
    <img src="${imageBase64}" alt="Drawing" style="max-width:100%;">
  </body>
</html>
`;
const body = encodeURIComponent(htmlBody);
const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;

window.location.href = mailtoUrl;
```

**주의사항**
- HTML 본문은 일부 이메일 클라이언트에서만 지원
- Gmail, Outlook 웹메일은 HTML 본문 지원 안 함
- 대안: Base64 이미지를 텍스트로 포함하고 수신자가 브라우저에서 열도록 안내
- 또는 이미지를 업로드하여 URL만 본문에 포함

**Twitter 공유 (이미지 호스팅 활용)**

동작 방식:
1. Canvas를 Blob으로 캡처
2. imgur API에 이미지 업로드
3. 업로드된 이미지 URL 획득
4. 텍스트에 이미지 URL 포함하여 Twitter 공유

구현 프로세스:
```
1. Canvas 캡처:
   canvas.toBlob(blob => { ... })

2. imgur에 업로드:
   const formData = new FormData();
   formData.append('image', blob);

   fetch('https://api.imgur.com/3/image', {
     method: 'POST',
     headers: {
       'Authorization': 'Client-ID [익명 클라이언트 ID]'
     },
     body: formData
   })

3. 이미지 URL 획득:
   const response = await fetch(...);
   const data = await response.json();
   const imageUrl = data.data.link;

4. Twitter 공유:
   const text = encodeURIComponent('그림판 작품을 확인해보세요!');
   const url = encodeURIComponent(imageUrl);
   const twitterUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;

   window.open(twitterUrl, '_blank', 'width=550,height=420');
```

**imgur 익명 업로드**
- Client-ID: 익명 업로드용 공용 ID 사용 또는 등록
- 인증 불필요
- 업로드 제한: IP당 하루 1250개
- 업로드된 이미지는 영구 보관

**장점**
- 로컬 환경에서도 동작 (인터넷 연결만 있으면)
- 실제 Canvas 이미지가 Twitter에 표시됨
- 페이지 URL이 아닌 이미지 URL 공유로 미리보기 확실

**제약사항**
- 인터넷 연결 필요 (API 호출)
- 업로드 시간 소요 (로딩 인디케이터 필요)
- imgur API 제한 (하루 1250개)

**Facebook 공유 (이미지 호스팅 활용)**

동작 방식:
1. Canvas를 Blob으로 캡처
2. imgur API에 이미지 업로드
3. 업로드된 이미지 URL 획득
4. 이미지 URL을 Facebook Share Dialog로 공유

구현 프로세스:
```
1. Canvas 캡처 및 imgur 업로드:
   (Twitter와 동일한 업로드 프로세스 사용)

2. 이미지 URL 획득:
   const imageUrl = data.data.link;

3. Facebook 공유:
   const url = encodeURIComponent(imageUrl);
   const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;

   const popup = window.open(
     facebookUrl,
     'facebook-share',
     'width=600,height=400,resizable=yes,scrollbars=yes'
   );

   if (!popup || popup.closed) {
     alert('팝업 차단을 해제해주세요');
   }
```

**Facebook의 이미지 URL 처리**
- 이미지 URL(imgur 링크)을 공유하면 Facebook이 자동으로 이미지 미리보기 생성
- Open Graph 메타 태그 없어도 이미지 URL이면 자동 감지
- 사용자가 그린 Canvas 이미지가 Facebook에 표시됨

**장점**
- 로컬 환경에서도 동작 (인터넷 연결만 있으면)
- 인터넷 환경에서도 동일하게 동작
- 실제 Canvas 이미지가 Facebook 미리보기로 표시됨
- 페이지 URL이 아닌 이미지 URL 공유

**제약사항**
- 인터넷 연결 필수 (imgur API 호출)
- 업로드 시간 소요 (1-3초, 로딩 인디케이터 필요)
- imgur API 제한 (IP당 하루 1250개)

**Web Share API (대안, 모바일 우선)**

동작 방식:
- 모바일 네이티브 공유 시트 활용
- Canvas를 Blob/File로 변환하여 직접 공유 가능
- 사용자가 공유 대상 선택 (이메일, 메신저, 소셜 미디어 등)

구현:
```
기능 확인:
if (navigator.share && navigator.canShare) {
  // Web Share API 지원
}

공유 실행:
const blob = await canvas.toBlob();
const file = new File([blob], 'drawing.png', { type: 'image/png' });

if (navigator.canShare({ files: [file] })) {
  await navigator.share({
    title: '내 그림',
    text: '그림판에서 그린 작품입니다',
    files: [file]
  });
}
```

장점:
- 이미지 직접 공유 가능
- 모바일에서 다양한 앱으로 공유

제약:
- HTTPS 필요
- 주로 모바일 지원 (Chrome Android, Safari iOS)
- 데스크톱 지원 제한적

**Web Share API 사용**
```
기능 확인:
if (navigator.share && navigator.canShare) { ... }

Canvas를 File로 변환:
canvas.toBlob(blob => {
  const file = new File([blob], 'drawing.png', { type: 'image/png' });

  if (navigator.canShare({ files: [file] })) {
    navigator.share({
      title: '내 그림',
      text: '그림판에서 그린 작품입니다',
      files: [file]
    });
  }
});

제약:
- HTTPS 필요
- 사용자 제스처(클릭) 후에만 호출 가능
- 모바일에서 주로 지원 (Chrome Android 89+, Safari iOS 15+)
- 데스크톱 지원 제한적
- 파일 공유는 일부 브라우저만 지원
```

**공유 플로우**

이메일 공유:
1. 공유 버튼 클릭
2. "이메일로 공유" 옵션 선택
3. mailto 링크 생성 (제목, 본문에 페이지 URL 포함)
4. window.location.href = mailtoUrl 또는 window.open() 호출
5. 사용자의 기본 이메일 클라이언트 자동 실행

Twitter 공유:
1. 공유 버튼 클릭
2. "Twitter 공유" 옵션 선택
3. Twitter Web Intent URL 생성 (텍스트와 페이지 URL 포함)
4. window.open()으로 새 창 열기 (550x420)
5. 사용자가 Twitter에서 직접 트윗 작성 및 게시

Facebook 공유:
1. 공유 버튼 클릭
2. "Facebook 공유" 옵션 선택
3. Facebook Share Dialog URL 생성 (페이지 URL 포함)
4. window.open()으로 새 창 열기 (600x400)
5. 사용자가 Facebook에서 직접 게시

Web Share API (기타 공유):
1. 공유 버튼 클릭
2. "기타 공유" 옵션 선택
3. Canvas를 Blob/File로 변환
4. navigator.canShare() 확인
5. navigator.share() 호출하여 네이티브 공유 시트 표시
6. 사용자가 공유 대상 선택 (메신저, 이메일, SNS 등)
7. 미지원 시 "이 브라우저는 공유 기능을 지원하지 않습니다" 메시지

**에러 처리**
- 이메일 클라이언트 미설정: "이메일 클라이언트를 설정해주세요" 안내
- 팝업 차단: "팝업 차단을 해제해주세요" 안내
- Web Share API 미지원: "이 브라우저는 공유 기능을 지원하지 않습니다" 메시지
- HTTPS 아닌 환경: Web Share API 동작 안 함 안내
- Canvas 캡처 실패: "이미지 생성에 실패했습니다" 메시지

## 10. 성능 고려사항

### 10.1 최적화 전략
- 불필요한 리렌더링 방지 (변경 시에만 render 호출)
- 마우스 이동 이벤트 throttling
- Canvas 크기를 CSS와 실제 픽셀 크기 일치
- History 스택 크기 제한
- 이미지 캐싱으로 중복 로딩 방지
- 큰 이미지는 자동 스케일링

### 10.2 브라우저 호환성
- Canvas API는 모든 모던 브라우저 지원
- ES6+ 문법 사용
- FileReader API 지원 확인
- TextMetrics API는 최신 브라우저에서만 actualBoundingBox 지원

## 11. 텍스트 오브젝트 클릭 문제 해결 방안

### 11.1 문제 분석
텍스트 오브젝트 클릭이 동작하지 않는 주요 원인:

1. **바운딩 박스 계산 오류**
   - textBaseline 설정에 따라 y 좌표 의미가 다름
   - 'alphabetic'는 베이스라인이 y 위치, 텍스트는 위쪽에 그려짐
   - 'top'은 텍스트 상단이 y 위치
   - bounds 계산 시 이를 반영하지 않으면 선택 영역이 어긋남

2. **폰트 설정 누락**
   - 한글 폰트가 제대로 지정되지 않으면 텍스트가 제대로 렌더링되지 않음
   - fallback 폰트 체인 필요

3. **measureText 호출 시점**
   - bounds 계산 전에 정확한 font 설정 필요
   - ctx.font가 설정되지 않으면 width가 부정확

### 11.2 설계 개선 사항

**폰트 설정**
- fontFamily 기본값: 'Arial, "Malgun Gothic", "맑은 고딕", sans-serif'
- 여러 fallback 폰트 지정하여 한글/영문 모두 지원

**textBaseline 설정**
- 'alphabetic' 권장 (Canvas 기본값)
- bounds 계산 시 y 좌표에서 fontSize * 0.8 정도 빼서 상단 위치 계산
- 또는 TextMetrics의 actualBoundingBoxAscent/Descent 활용 (최신 브라우저)

**바운딩 박스 계산 개선**
- 렌더링과 bounds 계산에서 동일한 font 설정 사용
- textBaseline에 따른 y 좌표 보정
- width는 measureText().width
- height는 fontSize 또는 actualBoundingBoxAscent + actualBoundingBoxDescent

**텍스트 렌더링 시 디버깅**
- 선택된 텍스트의 bounds를 사각형으로 표시하여 영역 확인
- console.log로 bounds 값 확인

### 11.3 구현 체크리스트

Developer는 다음 사항을 확인해야 합니다:

1. **텍스트 오브젝트 생성 시**
   - fontFamily에 한글 폰트 포함
   - textBaseline 명시적 설정
   - fontSize 올바르게 전달

2. **바운딩 박스 계산 시**
   - ctx.font를 먼저 설정
   - textBaseline에 따라 y 좌표 조정
   - measureText() 호출하여 실제 width 계산

3. **텍스트 렌더링 시**
   - font, fillStyle, globalAlpha 모두 설정
   - textAlign, textBaseline 설정
   - 선택된 경우 bounds 사각형 그려서 검증

4. **선택 감지 시**
   - 최신 bounds로 히트 테스트
   - 클릭 좌표와 bounds 영역 비교
   - 디버깅을 위해 클릭 좌표와 bounds 로그 출력

## 12. 개발 시 주의사항

### 12.1 코딩 컨벤션
- ES6 클래스 문법 사용
- 명확한 변수/함수 네이밍
- 주석으로 복잡한 로직 설명
- 모듈화된 코드 작성

### 12.2 테스트 포인트
- 각 도구가 정상적으로 그려지는지
- 색상/두께 변경이 즉시 반영되는지
- Undo/Redo가 올바르게 동작하는지
- 이미지 저장이 정상적으로 되는지
- 캔버스 영역 밖으로 나갔을 때 그리기가 중단되는지
- 오브젝트 선택이 정확하게 동작하는지
- 선택된 오브젝트가 드래그로 이동되는지
- 바운딩 박스가 올바르게 표시되는지
- Delete 키로 오브젝트가 삭제되는지
- 여러 오브젝트가 겹쳤을 때 최상위 오브젝트가 선택되는지
- **텍스트 입력 시 한글과 영문이 정상적으로 입력되는지**
- **텍스트가 올바른 위치와 크기로 표시되는지**
- **텍스트 오브젝트가 클릭으로 정확하게 선택되는지**
- 이미지 파일이 정상적으로 불러와지는지
- 이미지가 캔버스에 올바르게 표시되는지
- 큰 이미지가 적절히 스케일링되는지
- **URL 입력 다이얼로그가 정상적으로 표시되는지**
- **유효한 URL이 올바르게 검증되는지**
- **PDF 생성이 정상적으로 완료되는지**
- **생성된 PDF가 다운로드되는지**
- **CORS 에러 시 적절한 에러 메시지가 표시되는지**
- **공유 다이얼로그가 정상적으로 표시되는지**
- **이메일 공유 시 mailto 링크가 정상적으로 동작하는지**
- **Twitter 공유 시 팝업 창이 정상적으로 열리는지**
- **Facebook 공유 시 팝업 창이 정상적으로 열리는지**
- **팝업 차단 시 에러 메시지가 표시되는지**
- **Web Share API가 지원되는 브라우저에서 동작하는지**
- **Canvas 이미지가 Web Share API로 정상적으로 공유되는지**
- **Open Graph 메타 태그가 올바르게 설정되어 있는지**

### 12.3 에러 처리
- Canvas 지원 여부 확인
- 파일 다운로드 실패 처리
- 이미지 로드 실패 처리
- 이벤트 리스너 중복 등록 방지
- 빈 텍스트 입력 처리
- **URL 유효성 검증 실패 처리**
- **CORS 에러 처리 및 사용자 안내**
- **PDF 라이브러리 로드 실패 처리**
- **PDF 생성 실패 처리**
- **이메일 클라이언트 미설정 시 에러 안내**
- **팝업 차단 시 에러 안내**
- **Web Share API 미지원 시 에러 안내**
- **공유 권한 거부 처리**
- **Canvas 이미지 캡처 실패 처리**

## 13. PDF 생성 기능 구현 권장 사항

### 13.1 구현 우선순위

**1단계: Canvas를 PDF로 변환 (권장)**
- 현재 그림판의 Canvas를 PDF로 변환
- CORS 문제 없음, 구현 단순
- jsPDF만 있으면 구현 가능
- 사용자가 그린 그림을 PDF로 저장하는 기능

**2단계: 외부 URL 로딩 (선택 사항)**
- iframe 또는 새 창으로 URL 로드
- Same-origin 페이지만 캡처 가능
- CORS 제약으로 대부분의 외부 사이트 접근 불가
- 로컬 파일(file://) 접근 제한 있음

### 13.2 CDN 링크

index.html에 다음 스크립트 태그 추가:

```
<!-- jsPDF -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>

<!-- html2canvas (URL 로딩 시 필요) -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
```

### 13.3 기본 구현 플로우

**Canvas를 PDF로 (권장 구현)**
```
1. 사용자가 "PDF 생성" 버튼 클릭
2. 현재 Canvas의 이미지 데이터 획득
   - canvas.toDataURL('image/png')
3. jsPDF 인스턴스 생성
   - new jspdf.jsPDF()
4. Canvas 크기에 맞는 PDF 페이지 크기 설정
5. 이미지를 PDF에 추가
   - pdf.addImage(imageData, 'PNG', x, y, width, height)
6. PDF 다운로드
   - pdf.save('drawing.pdf')
```

**URL을 PDF로 (고급 구현, CORS 제약 있음)**
```
1. 사용자가 URL 입력
2. URL 검증
3. 숨겨진 iframe 생성 및 URL 로드
4. iframe 로드 완료 대기
5. html2canvas로 iframe 내용 캡처
   - html2canvas(iframe.contentDocument.body)
6. 캡처된 Canvas를 이미지로 변환
7. jsPDF로 이미지를 PDF에 추가
8. PDF 다운로드
```

### 13.4 CORS 문제 대응

**문제**
- 외부 도메인의 콘텐츠는 Same-Origin Policy로 접근 불가
- iframe의 contentDocument에 접근 시 CORS 에러
- 대부분의 웹사이트는 X-Frame-Options 헤더로 iframe 로딩 차단

**해결 방안**
1. **현재 Canvas만 PDF로** (가장 실용적)
   - 외부 URL 로딩 기능 제외
   - 그림판에 그린 내용만 PDF로 변환

2. **동일 도메인만 지원**
   - file:// 프로토콜이나 동일 도메인의 페이지만 로드
   - 사용자에게 제약 사항 명시

3. **브라우저 확장 기능 안내**
   - 사용자에게 CORS 해제 확장 프로그램 설치 안내
   - 개발/테스트 환경에서만 사용 권장

4. **URL 대신 파일 업로드**
   - HTML 파일 업로드 받기
   - 업로드된 파일 내용을 iframe에 로드
   - Same-origin이므로 접근 가능

### 13.5 사용자 경험 개선

**로딩 상태 표시**
- 로딩 스피너 또는 프로그레스 바
- "PDF 생성 중..." 메시지
- 완료 시 "다운로드 완료" 알림

**에러 메시지**
- URL이 잘못되었을 때: "유효한 URL을 입력해주세요"
- CORS 에러: "해당 페이지는 보안 정책으로 인해 접근할 수 없습니다"
- 로드 실패: "페이지를 불러올 수 없습니다"

**파일명 설정**
- 기본: drawing_YYYYMMDD_HHMMSS.pdf
- 사용자가 파일명 입력 가능하도록 옵션 제공

## 14. 웹 호스팅 배포 가이드

### 14.1 무료 호스팅 서비스 비교

**GitHub Pages (권장)**
- 장점: GitHub 계정만 있으면 무료, 설정 간단, 자동 배포
- 제약: Public 저장소 필요 (무료 계정)
- URL 형식: https://username.github.io/repository-name/
- 배포 방법: Git push만으로 자동 배포

**Netlify**
- 장점: 드래그 앤 드롭 배포, 커스텀 도메인 무료
- 제약: 월 배포 횟수 제한 (무료 플랜)
- URL 형식: https://site-name.netlify.app/
- 배포 방법: 파일 업로드 또는 Git 연동

**Vercel**
- 장점: 빠른 성능, Git 자동 배포
- 제약: 개인 프로젝트만 무료
- URL 형식: https://project-name.vercel.app/
- 배포 방법: CLI 또는 Git 연동

**Cloudflare Pages**
- 장점: 빠른 CDN, 무제한 대역폭
- 제약: Git 저장소 연동 필요
- URL 형식: https://project-name.pages.dev/
- 배포 방법: Git 연동 자동 배포

### 14.2 GitHub Pages 배포 프로세스 (권장)

**사전 준비**
1. GitHub 계정 생성
2. 로컬에 Git 설치 확인
3. drawing_board 디렉토리를 Git 저장소로 초기화

**배포 단계**

1. **Git 저장소 초기화**
   - drawing_board 디렉토리에서 git init
   - .gitignore 파일 생성 (필요시)
   - git add로 파일 추가
   - git commit으로 커밋

2. **GitHub 저장소 생성**
   - GitHub에서 새 저장소 생성
   - 저장소 이름: drawing-board (또는 원하는 이름)
   - Public 설정 (무료 호스팅을 위해)

3. **저장소 연결 및 푸시**
   - git remote add origin <저장소 URL>
   - git branch -M main
   - git push -u origin main

4. **GitHub Pages 활성화**
   - 저장소 Settings > Pages 메뉴
   - Source: Deploy from a branch
   - Branch: main, 폴더: / (root)
   - Save 클릭

5. **배포 완료**
   - 몇 분 후 URL 활성화
   - https://username.github.io/drawing-board/
   - Actions 탭에서 배포 진행 상황 확인

**커스텀 도메인 (선택 사항)**
- 도메인 구매 후 DNS 설정
- GitHub Pages에서 Custom domain 입력
- CNAME 파일 자동 생성

### 14.3 Netlify 배포 프로세스 (드래그 앤 드롭)

**배포 단계**

1. **Netlify 계정 생성**
   - netlify.com 접속
   - 무료 계정 가입

2. **사이트 배포**
   - "Add new site" > "Deploy manually" 선택
   - drawing_board 폴더 전체를 드래그 앤 드롭
   - 자동으로 배포 시작

3. **배포 완료**
   - 자동 생성된 URL 확인
   - https://random-name.netlify.app/
   - Site settings에서 사이트 이름 변경 가능

4. **업데이트 배포**
   - 파일 수정 후 다시 드래그 앤 드롭
   - 또는 Git 저장소 연동하여 자동 배포

### 14.4 배포 시 고려사항

**경로 설정**
- 모든 파일 경로는 상대 경로 사용
- 절대 경로 사용 시 배포 URL 고려
- 예: /css/style.css 대신 ./css/style.css 또는 css/style.css

**CDN 라이브러리**
- jsPDF, html2canvas는 CDN 링크 사용
- 인터넷 연결 필요
- 오프라인에서는 동작하지 않음

**브라우저 호환성**
- 모든 모던 브라우저에서 테스트
- Chrome, Firefox, Safari, Edge
- 모바일 브라우저 확인

**HTTPS**
- 대부분의 무료 호스팅은 자동으로 HTTPS 제공
- Canvas API는 보안 컨텍스트에서 더 안정적

**파일 크기**
- 이미지 오브젝트 저장 시 Base64로 인한 크기 증가
- localStorage 사용 시 용량 제한 (5-10MB)
- 큰 프로젝트는 서버 저장 고려

### 14.5 배포 체크리스트

Developer는 배포 전에 다음을 확인해야 합니다:

**코드 확인**
- [ ] 모든 파일 경로가 상대 경로인지 확인
- [ ] 콘솔 에러가 없는지 확인
- [ ] 외부 라이브러리 CDN 링크 확인
- [ ] 모든 기능이 정상 동작하는지 테스트

**Git 설정 (GitHub Pages 사용 시)**
- [ ] .gitignore 파일 생성 (node_modules, .DS_Store 등)
- [ ] 불필요한 파일 제외
- [ ] 커밋 메시지 작성
- [ ] 저장소 Public 설정

**배포 후 확인**
- [ ] 배포 URL 접속 확인
- [ ] 모든 CSS/JS 파일 로드 확인
- [ ] Canvas 렌더링 확인
- [ ] 도구들이 정상 작동하는지 확인
- [ ] 텍스트 입력 한글 지원 확인
- [ ] 이미지 불러오기 확인
- [ ] PDF 생성 확인
- [ ] 모바일에서 접속 확인

**공유**
- [ ] URL 복사하여 공유
- [ ] README.md에 배포 URL 추가
- [ ] 프로젝트 설명 작성

### 14.6 트러블슈팅

**404 에러**
- index.html이 루트 디렉토리에 있는지 확인
- GitHub Pages 설정에서 브랜치와 폴더 확인
- 배포 완료까지 몇 분 소요됨

**CSS/JS 로드 안 됨**
- 파일 경로 확인 (대소문자 구분)
- 상대 경로 사용 확인
- 브라우저 개발자 도구 Network 탭 확인

**Canvas 동작 안 함**
- HTTPS로 접속하는지 확인
- 브라우저 콘솔 에러 확인
- CORS 에러 발생 시 CDN 링크 확인

**한글 폰트 안 나옴**
- 폰트 fallback 설정 확인
- 시스템 폰트 사용 확인
- 웹 폰트 필요 시 Google Fonts 사용

## 15. 공유하기 기능 구현 가이드

### 15.1 구현 우선순위

**1단계: imgur API 연동 (필수, Twitter/Facebook용)**
- Canvas 이미지를 imgur에 업로드하는 공통 함수
- 로컬/인터넷 모두 동작 (인터넷 연결 필요)
- 업로드된 이미지 URL 반환

**2단계: 이메일 공유 (필수)**
- Canvas를 Base64로 변환
- HTML 이메일 본문에 이미지 포함
- 로컬/인터넷 모두 동작

**3단계: Twitter 공유 (필수)**
- imgur에 업로드 후 이미지 URL 공유
- 로컬/인터넷 모두 동작

**4단계: Facebook 공유 (필수)**
- imgur에 업로드 후 이미지 URL 공유
- 로컬/인터넷 모두 동작

**5단계: Web Share API (선택, 모바일 우선)**
- Canvas 이미지를 파일로 직접 공유
- 로컬/인터넷 모두 동작 (HTTPS 필요)

### 15.2 공유 다이얼로그 UI 설계

**다이얼로그 구성**
```
┌─────────────────────────┐
│     공유하기            │
├─────────────────────────┤
│  [✉️] 이메일로 공유     │
│  [🐦] Twitter 공유      │
│  [📘] Facebook 공유     │
│  [📤] 기타 공유         │
└─────────────────────────┘
```

**버튼 구성**
- 아이콘 + 텍스트 조합
- 클릭 시 해당 공유 기능 실행
- 새 창 열림 또는 이메일 클라이언트 실행
- 에러 발생 시 토스트 메시지 표시

### 15.3 imgur API 연동 (공통 함수)

**imgur 익명 업로드 API**
```
엔드포인트: https://api.imgur.com/3/image
메서드: POST
헤더: Authorization: Client-ID [익명 클라이언트 ID]
본문: FormData with image blob

익명 Client-ID:
- 공용 익명 ID 사용 또는 imgur에서 직접 등록
- 등록 URL: https://api.imgur.com/oauth2/addclient
- 익명 업로드는 Client-ID만 있으면 OAuth 불필요
```

**업로드 구현**
```
프로세스:
1. Canvas를 Blob으로 변환
2. FormData 생성
3. fetch()로 imgur API 호출
4. 응답에서 이미지 URL 추출

공통 함수:
async function uploadToImgur(canvasBlob) {
  const formData = new FormData();
  formData.append('image', canvasBlob);

  const response = await fetch('https://api.imgur.com/3/image', {
    method: 'POST',
    headers: {
      'Authorization': 'Client-ID YOUR_CLIENT_ID'
    },
    body: formData
  });

  if (!response.ok) {
    throw new Error('이미지 업로드 실패');
  }

  const data = await response.json();
  return data.data.link;  // 업로드된 이미지 URL
}

사용 예:
try {
  showLoading('이미지 업로드 중...');
  const imageUrl = await uploadToImgur(canvasBlob);
  hideLoading();
  return imageUrl;
} catch (error) {
  hideLoading();
  alert('이미지 업로드에 실패했습니다');
}
```

**응답 형식**
```
{
  "data": {
    "id": "ABC123",
    "link": "https://i.imgur.com/ABC123.png",
    "deletehash": "XYZ789",
    ...
  },
  "success": true,
  "status": 200
}
```

**에러 처리**
- 네트워크 에러: "인터넷 연결을 확인해주세요"
- API 제한 초과: "업로드 한도가 초과되었습니다"
- 업로드 실패: "이미지 업로드에 실패했습니다"

**로컬/인터넷 환경 지원**
- 로컬: 인터넷 연결만 있으면 동작 (file:// 프로토콜에서도 fetch 가능)
- 인터넷: 정상 동작
- CORS 문제 없음 (imgur API는 CORS 허용)

### 15.4 이메일 공유 구현

**Canvas Base64 이미지 포함 방식**
```
프로세스:
1. Canvas를 Base64로 변환
2. 이미지 URL을 imgur에 업로드 (선택 사항)
3. HTML 이메일 본문 생성
4. mailto 링크로 이메일 클라이언트 실행

방법 1: imgur 이미지 URL 사용 (권장)
const imageUrl = await uploadToImgur(canvasBlob);
const subject = encodeURIComponent('그림판 작품 공유');
const body = encodeURIComponent(
  `그림판에서 그린 작품을 확인해보세요!\n\n이미지: ${imageUrl}`
);
const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;
window.location.href = mailtoUrl;

방법 2: Base64 이미지 직접 포함 (제약 많음)
const imageBase64 = canvas.toDataURL('image/png');
const subject = encodeURIComponent('그림판 작품 공유');
// HTML 본문은 대부분의 이메일 클라이언트에서 지원 안 함
const body = encodeURIComponent(
  `그림판 작품입니다. 브라우저에서 다음 데이터 URL을 열어보세요:\n\n${imageBase64}`
);
const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;
window.location.href = mailtoUrl;
```

**권장 구현**
- imgur에 업로드하여 이미지 URL 본문에 포함
- 수신자가 URL 클릭하여 이미지 확인
- HTML 이메일은 대부분의 클라이언트에서 지원 안 하므로 비권장

**로컬/인터넷 환경 지원**
- 로컬: imgur 업로드는 인터넷 연결만 있으면 동작
- 인터넷: 정상 동작
- 이메일 클라이언트 설정 필요

### 15.5 Twitter 공유 구현 (수정 - 이미지 호스팅 활용)

**Twitter Web Intent + imgur 이미지 URL**
```
프로세스:
1. Canvas를 Blob으로 캡처
2. imgur API에 이미지 업로드 (공통 함수 사용)
3. 업로드된 이미지 URL 획득
4. 텍스트에 이미지 URL 포함하여 Twitter 공유

구현:
async function shareToTwitter() {
  try {
    // 로딩 표시
    showLoading('이미지 업로드 중...');

    // Canvas를 Blob으로 변환
    canvas.toBlob(async (blob) => {
      // imgur에 업로드
      const imageUrl = await uploadToImgur(blob);

      hideLoading();

      // Twitter 공유 URL 생성
      const text = encodeURIComponent('그림판에서 그린 작품을 확인해보세요!');
      const url = encodeURIComponent(imageUrl);
      const twitterUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;

      // 팝업 창 열기
      const popup = window.open(
        twitterUrl,
        'twitter-share',
        'width=550,height=420,resizable=yes,scrollbars=yes'
      );

      // 팝업 차단 확인
      if (!popup || popup.closed) {
        alert('팝업 차단을 해제해주세요');
      }
    });
  } catch (error) {
    hideLoading();
    alert('공유에 실패했습니다: ' + error.message);
  }
}
```

**Twitter의 이미지 URL 처리**
- imgur 이미지 URL을 공유하면 Twitter가 자동으로 이미지 카드 생성
- 트윗에 이미지 미리보기 표시됨
- 사용자가 그린 Canvas 이미지가 Twitter에 표시됨

**장점**
- 로컬 환경에서도 동작 (인터넷 연결만 있으면)
- 인터넷 환경에서도 동일하게 동작
- 실제 Canvas 이미지가 Twitter 카드로 표시됨
- 페이지 URL이 아닌 이미지 URL 공유

**제약사항**
- 인터넷 연결 필수 (imgur API 호출)
- 업로드 시간 소요 (1-3초, 로딩 인디케이터 필요)
- imgur API 제한 (IP당 하루 1250개)
- 팝업 차단 가능성

### 15.6 Facebook 공유 구현 (수정 - 이미지 호스팅 활용)

**Facebook Share Dialog + imgur 이미지 URL**
```
프로세스:
1. Canvas를 Blob으로 캡처
2. imgur API에 이미지 업로드 (공통 함수 사용)
3. 업로드된 이미지 URL 획득
4. 이미지 URL을 Facebook Share Dialog로 공유

구현:
async function shareToFacebook() {
  try {
    // 로딩 표시
    showLoading('이미지 업로드 중...');

    // Canvas를 Blob으로 변환
    canvas.toBlob(async (blob) => {
      // imgur에 업로드
      const imageUrl = await uploadToImgur(blob);

      hideLoading();

      // Facebook 공유 URL 생성
      const url = encodeURIComponent(imageUrl);
      const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;

      // 팝업 창 열기
      const popup = window.open(
        facebookUrl,
        'facebook-share',
        'width=600,height=400,resizable=yes,scrollbars=yes'
      );

      // 팝업 차단 확인
      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        alert('팝업 차단을 해제해주세요');
      }
    });
  } catch (error) {
    hideLoading();
    alert('공유에 실패했습니다: ' + error.message);
  }
}
```

**Facebook의 이미지 URL 처리**
- imgur 이미지 URL을 공유하면 Facebook이 자동으로 이미지 미리보기 생성
- 게시물에 이미지 미리보기 표시됨
- 사용자가 그린 Canvas 이미지가 Facebook에 표시됨

**장점**
- 로컬 환경에서도 동작 (인터넷 연결만 있으면)
- 인터넷 환경에서도 동일하게 동작
- 실제 Canvas 이미지가 Facebook 미리보기로 표시됨
- 페이지 URL이 아닌 이미지 URL 공유

**제약사항**
- 인터넷 연결 필수 (imgur API 호출)
- 업로드 시간 소요 (1-3초, 로딩 인디케이터 필요)
- imgur API 제한 (IP당 하루 1250개)
- 팝업 차단 가능성
- Facebook이 imgur 이미지를 크롤링하여 캐시하므로 즉시 미리보기 표시됨

### 15.7 Web Share API 구현 (선택, 모바일 우선)

**기능 확인 및 실행**
```
프로세스:
1. Web Share API 지원 확인
2. Canvas를 Blob으로 변환
3. File 객체 생성
4. 파일 공유 가능 여부 확인
5. navigator.share() 호출

구현:
// 지원 확인
if (!navigator.share || !navigator.canShare) {
  alert('이 브라우저는 공유 기능을 지원하지 않습니다');
  return;
}

// Canvas를 Blob으로 변환
canvas.toBlob(async (blob) => {
  try {
    // File 객체 생성
    const file = new File([blob], 'drawing.png', { type: 'image/png' });

    // 파일 공유 가능 확인
    if (navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: '내 그림',
        text: '그림판에서 그린 작품입니다',
        files: [file]
      });
      console.log('공유 성공');
    } else {
      alert('이 브라우저는 파일 공유를 지원하지 않습니다');
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      console.log('사용자가 공유를 취소했습니다');
    } else {
      console.error('공유 실패:', err);
      alert('공유에 실패했습니다');
    }
  }
}, 'image/png');
```

**브라우저 지원**
- Chrome Android 89+: 파일 공유 지원
- Safari iOS 15+: 파일 공유 지원
- Chrome Desktop 89+: URL/텍스트만 지원, 파일 미지원
- Firefox, Edge: 제한적 지원

**장점**
- 네이티브 공유 시트 활용
- Canvas 이미지를 직접 공유 가능
- 사용자가 다양한 앱 선택 가능 (메신저, 이메일, SNS 등)

**제약**
- HTTPS 필수
- 사용자 제스처(클릭) 후에만 호출 가능
- 모바일 위주 지원
- 데스크톱에서는 제한적

### 15.8 토스트 메시지 구현 (에러 표시용)

**토스트 UI**
```
┌──────────────────────────────┐
│ ⚠️ 팝업 차단을 해제해주세요      │
└──────────────────────────────┘
```

**표시 로직**
- 하단 중앙에 표시
- 3초 후 자동 사라짐
- 애니메이션 효과 (fade in/out)
- 여러 메시지 동시 표시 방지

**사용 시나리오**
- 팝업 차단 시: "팝업 차단을 해제해주세요"
- 이메일 클라이언트 미설정 시: "이메일 클라이언트를 설정해주세요"
- Web Share API 미지원 시: "이 브라우저는 공유 기능을 지원하지 않습니다"
- 공유 실패 시: "공유에 실패했습니다"

**CSS 구현**
- position: fixed
- bottom: 20px, left: 50%, transform: translateX(-50%)
- 배경색: 에러는 빨강/주황, 정보는 파랑/초록
- 패딩, 둥근 모서리, 그림자
- z-index 높게 설정 (9999)

### 15.9 브라우저 호환성

**mailto 링크**
- 모든 브라우저 지원
- 단, 이메일 클라이언트 설정 필요

**Twitter/Facebook Web Intent**
- 모든 브라우저 지원
- 팝업 차단 가능성 있음

**Web Share API**
- Chrome 89+ (Android): 파일 공유 지원
- Safari 15+ (iOS): 파일 공유 지원
- Chrome Desktop 89+: URL/텍스트만, 파일 미지원
- Firefox, Edge: 제한적 지원
- 미지원 시 "지원하지 않습니다" 메시지 표시

**Canvas.toBlob()**
- 모든 모던 브라우저 지원
- IE는 미지원 (polyfill 필요하나 IE는 EOL)

### 15.10 사용자 경험 개선

**명확한 피드백**
- 복사 완료: "URL이 복사되었습니다"
- 저장 완료: "이미지가 저장되었습니다"
- 공유 실패: "공유할 수 없습니다. 이미지를 저장하여 직접 업로드해주세요"

**접근성**
- 키보드로 다이얼로그 탐색 가능
- ESC 키로 다이얼로그 닫기
- 아이콘에 대체 텍스트

**모바일 최적화**
- 터치 친화적인 버튼 크기
- Web Share API 우선 사용
- 네이티브 공유 시트 활용

### 15.11 테스트 시나리오

**이메일 공유 테스트**
1. Canvas에 그림 그리기
2. 공유 버튼 클릭
3. "이메일로 공유" 선택
4. imgur 업로드 로딩 표시 확인 (방법 1 사용 시)
5. 이메일 클라이언트가 자동으로 열리는지 확인
6. 제목과 본문에 텍스트 및 이미지 URL이 포함되어 있는지 확인
7. imgur URL로 이미지가 실제로 보이는지 확인
8. 이메일 클라이언트 미설정 시 에러 메시지 확인
9. 로컬 환경(file://)과 인터넷 환경 모두에서 테스트

**Twitter 공유 테스트**
1. Canvas에 그림 그리기
2. 공유 버튼 클릭
3. "Twitter 공유" 선택
4. imgur 업로드 로딩 표시 확인
5. 새 창(팝업)이 열리는지 확인
6. 팝업 차단 시 토스트 메시지 확인
7. Twitter 로그인 페이지 또는 트윗 작성 화면 확인
8. 텍스트와 imgur 이미지 URL이 포함되어 있는지 확인
9. 트윗 미리보기에서 Canvas 이미지가 표시되는지 확인
10. 트윗하여 이미지 카드가 정상 표시되는지 확인
11. 로컬 환경(file://)과 인터넷 환경 모두에서 테스트

**Facebook 공유 테스트**
1. Canvas에 그림 그리기
2. 공유 버튼 클릭
3. "Facebook 공유" 선택
4. imgur 업로드 로딩 표시 확인
5. 새 창(팝업)이 열리는지 확인
6. 팝업 차단 시 토스트 메시지 확인
7. Facebook 로그인 페이지 또는 공유 화면 확인
8. imgur 이미지 URL이 포함되어 있는지 확인
9. 공유 미리보기에서 Canvas 이미지가 표시되는지 확인
10. 게시하여 이미지가 정상 표시되는지 확인
11. 로컬 환경(file://)과 인터넷 환경 모두에서 테스트

**Web Share API 테스트**
1. 모바일 기기 (Android Chrome 또는 iOS Safari) 사용
2. Canvas에 그림 그리기
3. 공유 버튼 클릭
4. "기타 공유" 선택
5. 네이티브 공유 시트가 나타나는지 확인
6. 다양한 앱(메신저, 이메일, SNS 등)이 표시되는지 확인
7. 앱 선택하여 이미지가 공유되는지 확인
8. 미지원 브라우저에서 에러 메시지 확인

**팝업 차단 테스트**
1. 브라우저 설정에서 팝업 차단 활성화
2. Twitter 또는 Facebook 공유 시도
3. 토스트 메시지로 "팝업 차단을 해제해주세요" 표시되는지 확인

---

## 변경 이력

### v1.7 (2026-01-27)
- **공유 기능 대폭 개선**: 로컬/인터넷 환경 모두 지원, 실제 Canvas 이미지 공유
- **imgur API 연동 추가**: Canvas 이미지를 외부 호스팅 서비스에 업로드
  - 익명 업로드 방식 사용 (Client-ID만 필요)
  - 로컬 환경(file://)에서도 동작 (인터넷 연결 필요)
  - 공통 uploadToImgur() 함수로 재사용성 향상
- **이메일 공유 개선**: imgur 이미지 URL 포함 방식으로 변경
  - 방법 1(권장): imgur URL 포함
  - 방법 2(제약 많음): Base64 직접 포함
- **Twitter 공유 개선**: imgur 이미지 URL 공유로 실제 Canvas 이미지가 Twitter 카드로 표시
- **Facebook 공유 개선**: imgur 이미지 URL 공유로 실제 Canvas 이미지가 미리보기로 표시
- **핵심 해결 과제**:
  - 페이지 URL이 아닌 실제 Canvas 이미지가 소셜 미디어에 표시됨
  - 로컬과 인터넷 환경 모두에서 동일하게 동작
  - 동적 Canvas 이미지 공유 문제 해결
- 구현 우선순위 재정리
- 테스트 시나리오 전면 업데이트 (로컬/인터넷 환경 테스트 추가)

### v1.6.1 (2026-01-26)
- **공유 기능 수정**: URL 복사 및 이미지 저장 기능 삭제
- **신규 기능**: 이메일 공유 추가 (mailto 링크 사용)
- Twitter/Facebook 공유 설계 수정 및 개선
  - Twitter Web Intent API 사용
  - Facebook Share Dialog 사용
  - 팝업 차단 감지 및 에러 처리
  - Open Graph 메타 태그 설정 가이드
- Web Share API 구현 상세화 (모바일 우선)
- 동적 이미지 공유 제약사항 명시
- 팝업 차단 처리 로직 추가
- 테스트 시나리오 업데이트

### v1.6 (2026-01-26)
- **신규 기능**: 공유하기 기능 추가
- ShareManager 클래스 설계
- URL 복사 기능 (Clipboard API + Fallback)
- Canvas 이미지 캡처 및 저장
- Web Share API 연동
- 소셜 미디어 공유 (Twitter, Facebook)
- 토스트 메시지 UI 설계
- 공유 다이얼로그 UI 설계
- 브라우저 호환성 및 fallback 전략
- 공유 기능 테스트 시나리오

### v1.5 (2026-01-26)
- **신규 기능**: 무료 웹 호스팅 배포 가이드 추가
- 무료 호스팅 서비스 비교 (GitHub Pages, Netlify, Vercel, Cloudflare Pages)
- GitHub Pages 배포 프로세스 상세 가이드
- Netlify 드래그 앤 드롭 배포 가이드
- 배포 시 고려사항 (경로 설정, HTTPS, 브라우저 호환성)
- 배포 체크리스트 및 트러블슈팅 가이드
- 인터넷 URL로 접근 가능하도록 설정

### v1.4 (2026-01-26)
- **신규 기능**: URL을 PDF로 변환하는 기능 추가
- PDFExporter 클래스 설계
- 외부 라이브러리 의존성 추가 (jsPDF, html2canvas)
- URL 입력 다이얼로그 설계
- PDF 생성 프로세스 및 CORS 제약 처리 가이드
- 대안 구현 방안 제시 (Canvas를 PDF로)
- PDF 관련 테스트 포인트 및 에러 처리 추가

### v1.3 (2026-01-26)
- **설계 문서 재정리**: 구현 코드 제거, 설계와 가이드만 명확하게 작성
- **텍스트 오브젝트 문제 분석 추가**: 클릭이 안 되는 원인과 해결 방안 명시
- 바운딩 박스 계산 시 textBaseline 고려 필요성 강조
- 한글 지원 폰트 설정 가이드 추가
- ObjectManager에 이미지 캐시 관리 책임 추가
- 텍스트/이미지 렌더링 가이드 개선

### v1.2 (2026-01-26)
- 텍스트 입력 및 이미지 불러오기 기능 추가
- TextTool, ImageTool 설계

### v1.1 (2026-01-26)
- 오브젝트 선택 및 위치 이동 기능 추가
- SelectTool, ObjectManager 설계

### v1.0 (2026-01-26)
- 초기 설계 문서 작성
- 기본 그리기 도구 설계

---

**문서 버전**: 1.7
**최종 수정일**: 2026-01-27
**작성자**: Architext
**대상 독자**: Developer (구현 담당자)
