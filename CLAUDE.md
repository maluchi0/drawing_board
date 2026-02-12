# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

HTML5 Canvas 기반의 웹 그림판 애플리케이션. 서버 없이 브라우저에서 직접 실행되는 standalone 애플리케이션이며, Vanilla JavaScript (ES6+ 클래스)로 구현되었습니다.

## 실행 방법

빌드나 컴파일이 필요하지 않습니다. `index.html` 파일을 브라우저에서 직접 열면 실행됩니다.

```bash
# 간단한 HTTP 서버로 실행 (선택사항)
python3 -m http.server 8000
# 또는
npx serve
```

## 코드 아키텍처

### 오브젝트 기반 렌더링 시스템

모든 그림 요소(펜 스트로크, 도형, 텍스트, 이미지)는 객체로 관리됩니다. Canvas는 매 프레임마다 객체 배열을 순회하며 다시 그립니다. 이를 통해:
- 개별 오브젝트 선택/이동/삭제 가능
- Undo/Redo 기능 구현 (히스토리는 객체 배열의 스냅샷)
- 효율적인 상태 관리

### 주요 클래스 구조

**CanvasManager** (`js/canvas.js`)
- Canvas 초기화 및 크기 관리
- 마우스/터치 이벤트 처리
- 도구(tool) 실행 조율
- 히스토리 관리 (Undo/Redo)
- ObjectManager와 협력하여 렌더링

**ObjectManager** (`js/objectManager.js`)
- 오브젝트 생명주기 관리 (추가, 삭제, 업데이트)
- 오브젝트 선택 및 히트 테스트
- 모든 오브젝트를 Canvas에 렌더링 (`renderAll()`)
- 이미지 캐싱 (`imageCache`)

**DrawingTool 및 하위 클래스** (`js/tools.js`)
- 각 도구의 그리기 로직 캡슐화
- 구현체: PenTool, EraserTool, LineTool, RectangleTool, CircleTool, TextTool, ImageTool, SelectTool
- 이벤트 핸들러: `onMouseDown()`, `onMouseMove()`, `onMouseUp()`
- 오브젝트 생성 및 ObjectManager에 추가

**ToolbarManager** (`js/toolbar.js`)
- 툴바 UI 이벤트 처리
- 도구 전환 및 옵션 업데이트
- CanvasManager와 연동

### 데이터 흐름

```
사용자 입력
  ↓
CanvasManager (이벤트 수신)
  ↓
CurrentTool (도구 로직 실행)
  ↓
ObjectManager (오브젝트 추가/수정)
  ↓
renderAll() (Canvas 다시 그리기)
```

### 스크립트 로딩 순서

`index.html`에서 스크립트는 의존성 순서대로 로드됩니다:

1. `utils.js` - 유틸리티 함수
2. `objectManager.js` - ObjectManager 클래스
3. `tools.js` - 도구 클래스들
4. `canvas.js` - CanvasManager (ObjectManager와 도구들에 의존)
5. `pdfExporter.js` - PDF 생성 기능
6. `shareManager.js` - 공유 기능
7. `toolbar.js` - ToolbarManager (CanvasManager에 의존)
8. `app.js` - 애플리케이션 초기화 (모든 클래스 사용)

새로운 모듈을 추가할 때는 이 의존성 순서를 준수해야 합니다.

## 주요 기능 구현 패턴

### 새 도구 추가하기

1. `js/tools.js`에 `DrawingTool`을 상속하는 새 클래스 작성
2. `onMouseDown()`, `onMouseMove()`, `onMouseUp()` 구현
3. 도구가 완료되면 `this.objectManager.addObject()`로 오브젝트 추가
4. `index.html`에 툴바 버튼 추가
5. `js/toolbar.js`의 `toolButtons` 이벤트 리스너에 도구 등록

### 오브젝트 타입 추가하기

1. `js/objectManager.js`의 `renderObject()`에 새 타입의 렌더링 로직 추가
2. `hitTest()`에 히트 테스트 로직 추가 (선택 기능을 지원하려면)
3. 필요시 `getBounds()`에 바운딩 박스 계산 로직 추가

### 히스토리 저장 시점

- 오브젝트 추가/삭제 직후
- 도구 사용 완료 시 (`onMouseUp`)
- 캔버스 전체 지우기 후
- `CanvasManager.saveState()` 호출

## 외부 라이브러리

- **jsPDF** (CDN): PDF 생성 (`js/pdfExporter.js`)
- **Imgur API**: 이미지 업로드 및 공유 (`js/shareManager.js`)

## 개발 시 주의사항

### 한글 입력 지원

`TextTool`은 한글 IME(Input Method Editor)를 올바르게 처리합니다. 텍스트 입력 관련 수정 시 `compositionstart`, `compositionend` 이벤트를 유지해야 합니다.

### Canvas 좌표 변환

마우스 이벤트의 `clientX/Y`를 Canvas 좌표로 변환할 때는 `getBoundingClientRect()`를 사용합니다 (`js/canvas.js` 참조).

### 메모리 관리

- 히스토리 크기 제한: `maxHistorySize = 50`
- 이미지 캐시: `ObjectManager.imageCache`는 동일 이미지의 중복 로드를 방지
- 대용량 이미지나 많은 오브젝트 처리 시 성능 최적화 고려 필요

### 터치 디바이스 지원

마우스 이벤트와 터치 이벤트 모두 지원합니다. 새로운 인터랙션 추가 시 두 가지 모두 고려하세요.

## 코드 스타일

- 클래스명: PascalCase
- 메서드/변수명: camelCase
- 주석: 한국어
- 커밋 메시지: 한국어 (Conventional Commits 형식)
