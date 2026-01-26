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

7. **웹 호스팅 배포** (신규 추가)
   - 무료 웹 호스팅 서비스에 배포
   - 인터넷 URL로 접근 가능
   - GitHub Pages, Netlify, Vercel 등 지원
   - 정적 파일 호스팅 (서버 불필요)

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
- **액션 버튼**: 전체 지우기, Undo, Redo, 저장, 이미지 불러오기, PDF 생성

### 7.3 사용자 인터랙션
1. 도구 선택 → 버튼 클릭
2. 색상/두께/폰트 변경 → 입력 요소 조작
3. 그리기 → 마우스 드래그
4. 텍스트 입력 → 클릭 후 input 엘리먼트에 입력
5. 오브젝트 선택 → 선택 도구로 클릭
6. 오브젝트 이동 → 선택 후 드래그
7. 저장 → 버튼 클릭 → 다운로드
8. PDF 생성 → 버튼 클릭 → URL 입력 다이얼로그 → URL 입력 → 페이지 로드 → PDF 다운로드

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

---

## 변경 이력

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

**문서 버전**: 1.5
**최종 수정일**: 2026-01-26
**작성자**: Architext
**대상 독자**: Developer (구현 담당자)
