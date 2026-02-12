class CanvasManager {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.isDrawing = false;
        this.currentTool = null;
        this.objectManager = new ObjectManager();
        this.history = [];
        this.historyStep = -1;
        this.maxHistorySize = 50;

        this.init();
    }

    init() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        this.attachEventListeners();
        this.saveState();
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        const maxWidth = container.clientWidth - 40;
        const maxHeight = container.clientHeight - 40;

        this.canvas.width = Math.min(1200, maxWidth);
        this.canvas.height = Math.min(800, maxHeight);

        this.objectManager.renderAll(this.ctx);
    }

    attachEventListeners() {
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('mouseleave', (e) => this.handleMouseLeave(e));

        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.canvas.dispatchEvent(mouseEvent);
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.canvas.dispatchEvent(mouseEvent);
        });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            const mouseEvent = new MouseEvent('mouseup', {});
            this.canvas.dispatchEvent(mouseEvent);
        });
    }

    handleMouseDown(event) {
        if (!this.currentTool) return;

        this.isDrawing = true;
        const coords = Utils.getCanvasCoordinates(this.canvas, event);
        const options = this.getDrawingOptions();

        this.currentTool.onMouseDown(this.ctx, coords.x, coords.y, options, event);
    }

    handleMouseMove(event) {
        if (!this.isDrawing || !this.currentTool) return;

        const coords = Utils.getCanvasCoordinates(this.canvas, event);
        const options = this.getDrawingOptions();

        this.currentTool.onMouseMove(this.ctx, coords.x, coords.y, options, event);
    }

    handleMouseUp(event) {
        if (!this.isDrawing || !this.currentTool) return;

        const coords = Utils.getCanvasCoordinates(this.canvas, event);
        const options = this.getDrawingOptions();

        this.currentTool.onMouseUp(this.ctx, coords.x, coords.y, options, event);
        this.isDrawing = false;

        this.objectManager.renderAll(this.ctx);
        this.saveState();
    }

    handleMouseLeave(event) {
        if (this.isDrawing) {
            this.handleMouseUp(event);
        }
    }

    getDrawingOptions() {
        if (window.toolbarManager) {
            return {
                color: window.toolbarManager.getCurrentColor(),
                lineWidth: window.toolbarManager.getCurrentLineWidth(),
                opacity: window.toolbarManager.getCurrentOpacity(),
                fontSize: window.toolbarManager.getCurrentFontSize(),
                lineCap: 'round',
                lineJoin: 'round'
            };
        }
        return {
            color: '#000000',
            lineWidth: 2,
            opacity: 1.0,
            fontSize: 16,
            lineCap: 'round',
            lineJoin: 'round'
        };
    }

    setTool(tool) {
        this.currentTool = tool;
        if (tool && tool.setObjectManager) {
            tool.setObjectManager(this.objectManager);
        }
    }

    getContext() {
        return this.ctx;
    }

    getObjectManager() {
        return this.objectManager;
    }

    clear() {
        this.objectManager.clear();
        this.objectManager.renderAll(this.ctx);
        this.saveState();
    }

    saveState() {
        if (this.historyStep < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyStep + 1);
        }

        const state = this.objectManager.getState();
        this.history.push(state);

        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        } else {
            this.historyStep++;
        }
    }

    undo() {
        if (this.historyStep > 0) {
            this.historyStep--;
            const state = this.history[this.historyStep];
            this.objectManager.setState(state);
            this.objectManager.renderAll(this.ctx);
        }
    }

    redo() {
        if (this.historyStep < this.history.length - 1) {
            this.historyStep++;
            const state = this.history[this.historyStep];
            this.objectManager.setState(state);
            this.objectManager.renderAll(this.ctx);
        }
    }

    canUndo() {
        return this.historyStep > 0;
    }

    canRedo() {
        return this.historyStep < this.history.length - 1;
    }

    deleteSelectedObject() {
        // 하위 호환성을 위해 유지
        this.deleteSelectedObjects();
    }

    deleteSelectedObjects() {
        const selectedIds = [...this.objectManager.selectedObjectIds];
        if (selectedIds.length > 0) {
            this.objectManager.removeObjects(selectedIds);
            this.objectManager.renderAll(this.ctx);
            this.saveState();
        }
    }

    selectAllObjects() {
        this.objectManager.selectAll();
        this.objectManager.renderAll(this.ctx);
    }

    setCustomCanvasSize(width, height) {
        // 범위 검증
        const validWidth = Math.max(400, Math.min(2400, width));
        const validHeight = Math.max(300, Math.min(1600, height));

        // 기존 객체 데이터 보존 (ObjectManager에 저장됨)
        this.canvas.width = validWidth;
        this.canvas.height = validHeight;

        // 재렌더링
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, validWidth, validHeight);
        this.objectManager.renderAll(this.ctx);

        return { width: validWidth, height: validHeight };
    }

    getCurrentCanvasSize() {
        return {
            width: this.canvas.width,
            height: this.canvas.height
        };
    }

    exportImage(filename = 'drawing.png') {
        Utils.downloadCanvas(this.canvas, filename);
    }
}
