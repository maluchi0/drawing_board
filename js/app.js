document.addEventListener('DOMContentLoaded', () => {
    const canvasManager = new CanvasManager('drawingCanvas');

    const toolbarManager = new ToolbarManager(canvasManager);

    window.canvasManager = canvasManager;
    window.toolbarManager = toolbarManager;

    console.log('그림판 애플리케이션이 초기화되었습니다.');
    console.log('사용 가능한 도구: 선택, 펜, 지우개, 직선, 사각형, 원, 텍스트, 이미지');
    console.log('기능: PNG 저장, PDF 생성, Undo/Redo, 오브젝트 삭제');
    console.log('단축키: Ctrl+Z (실행 취소), Ctrl+Y (다시 실행), Delete (선택 항목 삭제)');
});
