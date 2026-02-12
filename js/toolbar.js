class ToolbarManager {
    constructor(canvasManager) {
        this.canvasManager = canvasManager;
        this.tools = {
            select: new SelectTool(),
            freeSelect: new FreeSelectTool(),
            pen: new PenTool(),
            eraser: new EraserTool(),
            line: new LineTool(),
            rectangle: new RectangleTool(),
            circle: new CircleTool(),
            fill: new FillTool(),
            text: new TextTool(),
            image: new ImageTool(),
            paint: new PaintTool(),
            eyedropper: new EyedropperTool()
        };
        this.activeTool = 'select';
        this.color = '#000000';  // 하위 호환성
        this.fgColor = '#000000';  // 전경색
        this.bgColor = '#ffffff';  // 배경색
        this.activeFgOrBg = 'fg';  // 'fg' or 'bg'
        this.lineWidth = 5;
        this.opacity = 1.0;
        this.fontSize = 16;
        this.pdfExporter = new PDFExporter(canvasManager);
        this.shareManager = new ShareManager(canvasManager);
        this.saveManager = new SaveManager(canvasManager);

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
        // Foreground/Background Color 스와치 이벤트 설정
        const fgSwatch = document.getElementById('fgColorSwatch');
        const fgPicker = document.getElementById('fgColorPicker');
        const bgSwatch = document.getElementById('bgColorSwatch');
        const bgPicker = document.getElementById('bgColorPicker');
        const swapBtn = document.getElementById('colorSwapBtn');
        const resetBtn = document.getElementById('colorResetBtn');

        // 전경색 스와치 클릭 → color picker 열기
        if (fgSwatch && fgPicker) {
            fgSwatch.addEventListener('click', () => {
                this.activeFgOrBg = 'fg';
                this.updateSwatchUI();
                fgPicker.click();
            });

            fgPicker.addEventListener('input', (e) => {
                this.fgColor = e.target.value;
                this.color = this.fgColor;  // 하위 호환성
                fgSwatch.style.backgroundColor = this.fgColor;
            });
        }

        // 배경색 스와치 클릭 → color picker 열기
        if (bgSwatch && bgPicker) {
            bgSwatch.addEventListener('click', () => {
                this.activeFgOrBg = 'bg';
                this.updateSwatchUI();
                bgPicker.click();
            });

            bgPicker.addEventListener('input', (e) => {
                this.bgColor = e.target.value;
                bgSwatch.style.backgroundColor = this.bgColor;
            });
        }

        // 전환 버튼 (X 키)
        if (swapBtn) {
            swapBtn.addEventListener('click', () => this.swapColors());
        }

        // 리셋 버튼 (D 키)
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetColors());
        }

        // 초기 색상 스와치 표시
        if (fgSwatch && bgSwatch) {
            fgSwatch.style.backgroundColor = this.fgColor;
            bgSwatch.style.backgroundColor = this.bgColor;
        }

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
            this.canvasManager.deleteSelectedObjects();
        });

        const pdfBtn = document.getElementById('pdfBtn');
        pdfBtn.addEventListener('click', () => {
            this.pdfExporter.exportCanvasToPDF();
        });

        const shareBtn = document.getElementById('shareBtn');
        shareBtn.addEventListener('click', () => {
            this.shareManager.showShareDialog();
        });

        const resizeCanvasBtn = document.getElementById('resizeCanvasBtn');
        if (resizeCanvasBtn) {
            resizeCanvasBtn.addEventListener('click', () => {
                const widthInput = document.getElementById('canvasWidth');
                const heightInput = document.getElementById('canvasHeight');

                const width = parseInt(widthInput.value);
                const height = parseInt(heightInput.value);

                if (isNaN(width) || isNaN(height)) {
                    alert('유효한 숫자를 입력해주세요.');
                    return;
                }

                const result = this.canvasManager.setCustomCanvasSize(width, height);

                // 범위 조정된 경우 알림
                if (result.width !== width || result.height !== height) {
                    widthInput.value = result.width;
                    heightInput.value = result.height;
                    alert(`크기가 제한 범위로 조정되었습니다.\n${result.width} × ${result.height}px`);
                }
            });

            // 초기값 설정
            const currentSize = this.canvasManager.getCurrentCanvasSize();
            document.getElementById('canvasWidth').value = currentSize.width;
            document.getElementById('canvasHeight').value = currentSize.height;
        }

        document.addEventListener('keydown', (e) => {
            const target = e.target;
            const isInputField = target.tagName === 'INPUT' ||
                                 target.tagName === 'TEXTAREA' ||
                                 target.isContentEditable;

            if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
                if (!isInputField) {
                    e.preventDefault();
                    this.canvasManager.selectAllObjects();
                }
            } else if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
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
                    this.canvasManager.deleteSelectedObjects();
                }
            } else if (e.key === 'x' || e.key === 'X') {
                // 전경색/배경색 전환 (X 키)
                if (!isInputField) {
                    e.preventDefault();
                    this.swapColors();
                }
            } else if (e.key === 'd' || e.key === 'D') {
                // 색상 리셋 (D 키)
                if (!isInputField) {
                    e.preventDefault();
                    this.resetColors();
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

    swapColors() {
        [this.fgColor, this.bgColor] = [this.bgColor, this.fgColor];
        this.color = this.fgColor;  // 하위 호환성

        const fgSwatch = document.getElementById('fgColorSwatch');
        const bgSwatch = document.getElementById('bgColorSwatch');
        const fgPicker = document.getElementById('fgColorPicker');
        const bgPicker = document.getElementById('bgColorPicker');

        if (fgSwatch) fgSwatch.style.backgroundColor = this.fgColor;
        if (bgSwatch) bgSwatch.style.backgroundColor = this.bgColor;
        if (fgPicker) fgPicker.value = this.fgColor;
        if (bgPicker) bgPicker.value = this.bgColor;
    }

    resetColors() {
        this.fgColor = '#000000';
        this.bgColor = '#ffffff';
        this.color = this.fgColor;  // 하위 호환성

        const fgSwatch = document.getElementById('fgColorSwatch');
        const bgSwatch = document.getElementById('bgColorSwatch');
        const fgPicker = document.getElementById('fgColorPicker');
        const bgPicker = document.getElementById('bgColorPicker');

        if (fgSwatch) fgSwatch.style.backgroundColor = this.fgColor;
        if (bgSwatch) bgSwatch.style.backgroundColor = this.bgColor;
        if (fgPicker) fgPicker.value = this.fgColor;
        if (bgPicker) bgPicker.value = this.bgColor;
    }

    updateSwatchUI() {
        const fgSwatch = document.getElementById('fgColorSwatch');
        const bgSwatch = document.getElementById('bgColorSwatch');

        if (this.activeFgOrBg === 'fg') {
            if (fgSwatch) fgSwatch.classList.add('active');
            if (bgSwatch) bgSwatch.classList.remove('active');
        } else {
            if (bgSwatch) bgSwatch.classList.add('active');
            if (fgSwatch) fgSwatch.classList.remove('active');
        }
    }

    getCurrentColor() {
        return this.fgColor;  // 하위 호환성: 전경색 반환
    }

    getForegroundColor() {
        return this.fgColor;
    }

    getBackgroundColor() {
        return this.bgColor;
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

class SaveManager {
    constructor(canvasManager) {
        this.canvasManager = canvasManager;
        this.maxSlots = 5;
        this.storageKey = 'drawingBoard_saves';
        this.init();
    }

    init() {
        const saveProjectBtn = document.getElementById('saveProjectBtn');
        const openProjectBtn = document.getElementById('openProjectBtn');
        const closeDialogBtn = document.getElementById('closeDialogBtn');

        if (saveProjectBtn) {
            saveProjectBtn.addEventListener('click', () => this.openDialog('save'));
        }
        if (openProjectBtn) {
            openProjectBtn.addEventListener('click', () => this.openDialog('load'));
        }
        if (closeDialogBtn) {
            closeDialogBtn.addEventListener('click', () => this.closeDialog());
        }

        // 슬롯 버튼 이벤트
        this.attachSlotListeners();
    }

    openDialog(mode) {
        const dialog = document.getElementById('saveLoadDialog');
        const title = document.getElementById('dialogTitle');

        if (title) {
            title.textContent = mode === 'save' ? '작업 저장' : '작업 불러오기';
        }
        this.updateSlotDisplay();
        if (dialog) {
            dialog.style.display = 'flex';
        }
    }

    closeDialog() {
        const dialog = document.getElementById('saveLoadDialog');
        if (dialog) {
            dialog.style.display = 'none';
        }
    }

    attachSlotListeners() {
        for (let i = 1; i <= this.maxSlots; i++) {
            const slot = document.querySelector(`.save-slot[data-slot="${i}"]`);
            if (!slot) continue;

            const saveBtn = slot.querySelector('.slot-save-btn');
            const loadBtn = slot.querySelector('.slot-load-btn');
            const deleteBtn = slot.querySelector('.slot-delete-btn');

            if (saveBtn) {
                saveBtn.addEventListener('click', () => this.saveToSlot(i));
            }
            if (loadBtn) {
                loadBtn.addEventListener('click', () => this.loadFromSlot(i));
            }
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => this.deleteSlot(i));
            }
        }
    }

    getSaves() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : {};
        } catch (err) {
            console.error('저장 데이터를 읽을 수 없습니다:', err);
            return {};
        }
    }

    setSaves(saves) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(saves));
        } catch (err) {
            if (err.name === 'QuotaExceededError') {
                alert('저장 공간이 부족합니다. 다른 슬롯을 삭제해주세요.');
            } else {
                alert('저장 중 오류 발생: ' + err.message);
            }
            throw err;
        }
    }

    saveToSlot(slotNumber) {
        try {
            const state = this.canvasManager.objectManager.getState();
            const thumbnail = this.generateThumbnail();
            const saves = this.getSaves();

            saves[slotNumber] = {
                state: state,
                thumbnail: thumbnail,
                date: new Date().toISOString(),
                timestamp: Date.now()
            };

            this.setSaves(saves);
            this.updateSlotDisplay();

            alert(`슬롯 ${slotNumber}에 저장되었습니다.`);
        } catch (err) {
            console.error('저장 실패:', err);
        }
    }

    loadFromSlot(slotNumber) {
        const saves = this.getSaves();
        const save = saves[slotNumber];

        if (!save) {
            alert('저장된 데이터가 없습니다.');
            return;
        }

        if (confirm('현재 작업을 불러온 데이터로 교체하시겠습니까?')) {
            this.canvasManager.objectManager.setState(save.state);

            // 모든 Tool의 objectManager 참조 재설정
            if (window.toolbarManager && window.toolbarManager.tools) {
                Object.values(window.toolbarManager.tools).forEach(tool => {
                    if (tool && tool.setObjectManager) {
                        tool.setObjectManager(this.canvasManager.objectManager);
                    }
                });
            }

            this.canvasManager.objectManager.renderAll(this.canvasManager.ctx);
            this.canvasManager.saveState();  // Undo 히스토리에 추가
            this.closeDialog();
            alert(`슬롯 ${slotNumber}에서 불러왔습니다.`);
        }
    }

    deleteSlot(slotNumber) {
        if (!confirm(`슬롯 ${slotNumber}의 저장 데이터를 삭제하시겠습니까?`)) {
            return;
        }

        const saves = this.getSaves();
        delete saves[slotNumber];
        this.setSaves(saves);
        this.updateSlotDisplay();
    }

    generateThumbnail() {
        const canvas = this.canvasManager.canvas;
        const thumbnailCanvas = document.createElement('canvas');
        thumbnailCanvas.width = 120;
        thumbnailCanvas.height = 80;
        const ctx = thumbnailCanvas.getContext('2d');

        // 캔버스를 썸네일 크기로 축소
        ctx.drawImage(canvas, 0, 0, 120, 80);

        return thumbnailCanvas.toDataURL('image/png');
    }

    updateSlotDisplay() {
        const saves = this.getSaves();

        for (let i = 1; i <= this.maxSlots; i++) {
            const slot = document.querySelector(`.save-slot[data-slot="${i}"]`);
            if (!slot) continue;

            const canvas = slot.querySelector('.slot-canvas');
            const dateEl = slot.querySelector('.slot-date');
            const loadBtn = slot.querySelector('.slot-load-btn');
            const deleteBtn = slot.querySelector('.slot-delete-btn');

            const save = saves[i];

            if (save) {
                // 썸네일 표시
                const ctx = canvas.getContext('2d');
                const img = new Image();
                img.onload = () => {
                    ctx.drawImage(img, 0, 0);
                };
                img.src = save.thumbnail;

                // 날짜 표시
                const date = new Date(save.date);
                if (dateEl) {
                    dateEl.textContent = date.toLocaleString('ko-KR');
                }

                // 버튼 활성화
                if (loadBtn) loadBtn.disabled = false;
                if (deleteBtn) deleteBtn.disabled = false;
            } else {
                // 빈 슬롯
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#f0f0f0';
                ctx.fillRect(0, 0, 120, 80);
                ctx.fillStyle = '#999';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.font = '12px sans-serif';
                ctx.fillText('비어있음', 60, 40);

                if (dateEl) {
                    dateEl.textContent = '비어있음';
                }
                if (loadBtn) loadBtn.disabled = true;
                if (deleteBtn) deleteBtn.disabled = true;
            }
        }
    }
}
