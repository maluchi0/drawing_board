class ToolbarManager {
    constructor(canvasManager) {
        this.canvasManager = canvasManager;
        this.tools = {
            select: new SelectTool(),
            pen: new PenTool(),
            eraser: new EraserTool(),
            line: new LineTool(),
            rectangle: new RectangleTool(),
            circle: new CircleTool(),
            fill: new FillTool(),
            text: new TextTool(),
            image: new ImageTool()
        };
        this.activeTool = 'select';
        this.color = '#000000';
        this.lineWidth = 2;
        this.opacity = 1.0;
        this.fontSize = 16;
        this.pdfExporter = new PDFExporter(canvasManager);
        this.shareManager = new ShareManager(canvasManager);

        this.init();
    }

    init() {
        this.attachToolListeners();
        this.attachOptionListeners();
        this.attachActionListeners();
        this.setActiveTool('select');
    }

    attachToolListeners() {
        const toolButtons = document.querySelectorAll('.tool-btn');
        toolButtons.forEach(button => {
            button.addEventListener('click', () => {
                const toolName = button.dataset.tool;
                this.setActiveTool(toolName);
            });
        });
    }

    attachOptionListeners() {
        const colorPicker = document.getElementById('colorPicker');
        colorPicker.addEventListener('input', (e) => {
            this.color = e.target.value;
        });

        const lineWidthSlider = document.getElementById('lineWidth');
        const lineWidthValue = document.getElementById('lineWidthValue');
        lineWidthSlider.addEventListener('input', (e) => {
            this.lineWidth = parseInt(e.target.value);
            lineWidthValue.textContent = this.lineWidth;
        });

        const opacitySlider = document.getElementById('opacity');
        const opacityValue = document.getElementById('opacityValue');
        opacitySlider.addEventListener('input', (e) => {
            this.opacity = parseInt(e.target.value) / 100;
            opacityValue.textContent = e.target.value;
        });

        const fontSizeSlider = document.getElementById('fontSize');
        const fontSizeValue = document.getElementById('fontSizeValue');
        fontSizeSlider.addEventListener('input', (e) => {
            this.fontSize = parseInt(e.target.value);
            fontSizeValue.textContent = this.fontSize;
        });
    }

    attachActionListeners() {
        const clearBtn = document.getElementById('clearBtn');
        clearBtn.addEventListener('click', () => {
            if (confirm('정말로 전체를 지우시겠습니까?')) {
                this.canvasManager.clear();
            }
        });

        const undoBtn = document.getElementById('undoBtn');
        undoBtn.addEventListener('click', () => {
            this.canvasManager.undo();
        });

        const redoBtn = document.getElementById('redoBtn');
        redoBtn.addEventListener('click', () => {
            this.canvasManager.redo();
        });

        const saveBtn = document.getElementById('saveBtn');
        saveBtn.addEventListener('click', () => {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
            this.canvasManager.exportImage(`drawing_${timestamp}.png`);
        });

        const deleteBtn = document.getElementById('deleteBtn');
        deleteBtn.addEventListener('click', () => {
            this.canvasManager.deleteSelectedObject();
        });

        const pdfBtn = document.getElementById('pdfBtn');
        pdfBtn.addEventListener('click', () => {
            this.pdfExporter.exportCanvasToPDF();
        });

        const shareBtn = document.getElementById('shareBtn');
        shareBtn.addEventListener('click', () => {
            this.shareManager.showShareDialog();
        });

        document.addEventListener('keydown', (e) => {
            const target = e.target;
            const isInputField = target.tagName === 'INPUT' ||
                                 target.tagName === 'TEXTAREA' ||
                                 target.isContentEditable;

            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                if (!isInputField) {
                    e.preventDefault();
                    this.canvasManager.undo();
                }
            } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                if (!isInputField) {
                    e.preventDefault();
                    this.canvasManager.redo();
                }
            } else if (e.key === 'Delete' || e.key === 'Backspace') {
                if (!isInputField) {
                    e.preventDefault();
                    this.canvasManager.deleteSelectedObject();
                }
            }
        });
    }

    setActiveTool(toolName) {
        if (!this.tools[toolName]) return;

        this.activeTool = toolName;
        this.canvasManager.setTool(this.tools[toolName]);

        const toolButtons = document.querySelectorAll('.tool-btn');
        toolButtons.forEach(button => {
            if (button.dataset.tool === toolName) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    }

    getCurrentColor() {
        return this.color;
    }

    getCurrentLineWidth() {
        return this.lineWidth;
    }

    getCurrentOpacity() {
        return this.opacity;
    }

    getCurrentFontSize() {
        return this.fontSize;
    }

    getActiveTool() {
        return this.activeTool;
    }
}
