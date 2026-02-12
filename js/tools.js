class DrawingTool {
    constructor() {
        this.startX = 0;
        this.startY = 0;
        this.objectManager = null;
    }

    setObjectManager(objectManager) {
        this.objectManager = objectManager;
    }

    onMouseDown(ctx, x, y, options, event) {}
    onMouseMove(ctx, x, y, options, event) {}
    onMouseUp(ctx, x, y, options, event) {}
    setOptions(options) {}
}

class PenTool extends DrawingTool {
    constructor() {
        super();
        this.points = [];
        this.isDrawing = false;
    }

    onMouseDown(ctx, x, y, options) {
        this.isDrawing = true;
        this.points = [{ x, y }];

        ctx.save();
        ctx.strokeStyle = options.foregroundColor || options.color || '#000000';
        ctx.lineWidth = options.lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalAlpha = options.opacity;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.restore();
    }

    onMouseMove(ctx, x, y, options) {
        if (!this.isDrawing) return;

        this.points.push({ x, y });

        ctx.save();
        ctx.strokeStyle = options.foregroundColor || options.color || '#000000';
        ctx.lineWidth = options.lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalAlpha = options.opacity;
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.restore();
    }

    onMouseUp(ctx, x, y, options) {
        if (!this.isDrawing) return;

        this.isDrawing = false;

        if (this.points.length > 1 && this.objectManager) {
            const minX = Math.min(...this.points.map(p => p.x));
            const minY = Math.min(...this.points.map(p => p.y));
            const maxX = Math.max(...this.points.map(p => p.x));
            const maxY = Math.max(...this.points.map(p => p.y));

            const object = {
                type: 'path',
                data: {
                    points: [...this.points]
                },
                style: {
                    strokeColor: options.foregroundColor || options.color || '#000000',
                    fillColor: 'transparent',
                    lineWidth: options.lineWidth,
                    opacity: options.opacity,
                    lineCap: 'round',
                    lineJoin: 'round'
                },
                bounds: {
                    x: minX - options.lineWidth,
                    y: minY - options.lineWidth,
                    width: maxX - minX + options.lineWidth * 2,
                    height: maxY - minY + options.lineWidth * 2
                }
            };

            this.objectManager.addObject(object);
        }

        this.points = [];
    }
}

class EraserTool extends DrawingTool {
    constructor() {
        super();
        this.isErasing = false;
    }

    onMouseDown(ctx, x, y, options) {
        this.isErasing = true;
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = options.lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.restore();
    }

    onMouseMove(ctx, x, y, options) {
        if (!this.isErasing) return;

        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = options.lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.restore();
    }

    onMouseUp(ctx, x, y, options) {
        this.isErasing = false;
        ctx.globalCompositeOperation = 'source-over';
    }
}

class LineTool extends DrawingTool {
    constructor() {
        super();
        this.isDrawing = false;
    }

    onMouseDown(ctx, x, y, options) {
        this.isDrawing = true;
        this.startX = x;
        this.startY = y;
    }

    onMouseMove(ctx, x, y, options) {
        if (!this.isDrawing || !this.objectManager) return;

        this.objectManager.renderAll(ctx);

        ctx.save();
        ctx.strokeStyle = options.foregroundColor || options.color || '#000000';
        ctx.lineWidth = options.lineWidth;
        ctx.lineCap = 'round';
        ctx.globalAlpha = options.opacity;
        ctx.beginPath();
        ctx.moveTo(this.startX, this.startY);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.restore();
    }

    onMouseUp(ctx, x, y, options) {
        if (!this.isDrawing) return;

        this.isDrawing = false;

        if (this.objectManager) {
            const minX = Math.min(this.startX, x);
            const minY = Math.min(this.startY, y);
            const maxX = Math.max(this.startX, x);
            const maxY = Math.max(this.startY, y);

            const object = {
                type: 'line',
                data: {
                    startX: this.startX,
                    startY: this.startY,
                    endX: x,
                    endY: y
                },
                style: {
                    strokeColor: options.foregroundColor || options.color || '#000000',
                    fillColor: 'transparent',
                    lineWidth: options.lineWidth,
                    opacity: options.opacity,
                    lineCap: 'round'
                },
                bounds: {
                    x: minX - options.lineWidth / 2,
                    y: minY - options.lineWidth / 2,
                    width: maxX - minX + options.lineWidth,
                    height: maxY - minY + options.lineWidth
                }
            };

            this.objectManager.addObject(object);
            this.objectManager.renderAll(ctx);
        }
    }
}

class RectangleTool extends DrawingTool {
    constructor() {
        super();
        this.isDrawing = false;
    }

    onMouseDown(ctx, x, y, options) {
        this.isDrawing = true;
        this.startX = x;
        this.startY = y;
    }

    onMouseMove(ctx, x, y, options) {
        if (!this.isDrawing || !this.objectManager) return;

        this.objectManager.renderAll(ctx);

        const width = x - this.startX;
        const height = y - this.startY;

        ctx.save();
        ctx.globalAlpha = options.opacity;
        // 채우기
        if (options.backgroundColor && options.backgroundColor !== 'transparent') {
            ctx.fillStyle = options.backgroundColor;
            ctx.fillRect(this.startX, this.startY, width, height);
        }
        // 윤곽선
        ctx.strokeStyle = options.foregroundColor || options.color || '#000000';
        ctx.lineWidth = options.lineWidth;
        ctx.strokeRect(this.startX, this.startY, width, height);
        ctx.restore();
    }

    onMouseUp(ctx, x, y, options) {
        if (!this.isDrawing) return;

        this.isDrawing = false;

        if (this.objectManager) {
            const width = x - this.startX;
            const height = y - this.startY;

            const actualX = width < 0 ? this.startX + width : this.startX;
            const actualY = height < 0 ? this.startY + height : this.startY;
            const actualWidth = Math.abs(width);
            const actualHeight = Math.abs(height);

            const object = {
                type: 'rectangle',
                data: {
                    x: actualX,
                    y: actualY,
                    width: actualWidth,
                    height: actualHeight
                },
                style: {
                    strokeColor: options.foregroundColor || options.color || '#000000',
                    fillColor: options.backgroundColor || 'transparent',
                    lineWidth: options.lineWidth,
                    opacity: options.opacity
                },
                bounds: {
                    x: actualX - options.lineWidth / 2,
                    y: actualY - options.lineWidth / 2,
                    width: actualWidth + options.lineWidth,
                    height: actualHeight + options.lineWidth
                }
            };

            this.objectManager.addObject(object);
            this.objectManager.renderAll(ctx);
        }
    }
}

class CircleTool extends DrawingTool {
    constructor() {
        super();
        this.isDrawing = false;
    }

    onMouseDown(ctx, x, y, options, event) {
        this.isDrawing = true;
        this.startX = x;
        this.startY = y;
    }

    onMouseMove(ctx, x, y, options, event) {
        if (!this.isDrawing || !this.objectManager) return;

        this.objectManager.renderAll(ctx);

        const isEllipseMode = event && (event.shiftKey || event.altKey);

        ctx.save();
        ctx.globalAlpha = options.opacity;
        ctx.beginPath();

        if (isEllipseMode) {
            // 타원 그리기: 시작점과 현재점으로 만들어지는 사각형에 내접
            const width = Math.abs(x - this.startX);
            const height = Math.abs(y - this.startY);
            const centerX = (this.startX + x) / 2;
            const centerY = (this.startY + y) / 2;
            const radiusX = width / 2;
            const radiusY = height / 2;

            ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
        } else {
            // 원 그리기: 시작점과 현재점으로 만들어지는 사각형에 내접하는 정원
            const width = Math.abs(x - this.startX);
            const height = Math.abs(y - this.startY);
            const size = Math.max(width, height);
            const centerX = this.startX + (x > this.startX ? size : -size) / 2;
            const centerY = this.startY + (y > this.startY ? size : -size) / 2;
            const radius = size / 2;

            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        }

        // 채우기
        if (options.backgroundColor && options.backgroundColor !== 'transparent') {
            ctx.fillStyle = options.backgroundColor;
            ctx.fill();
        }
        // 윤곽선
        ctx.strokeStyle = options.foregroundColor || options.color || '#000000';
        ctx.lineWidth = options.lineWidth;
        ctx.stroke();
        ctx.restore();
    }

    onMouseUp(ctx, x, y, options, event) {
        if (!this.isDrawing) return;

        this.isDrawing = false;

        if (this.objectManager) {
            const isEllipseMode = event && (event.shiftKey || event.altKey);

            if (isEllipseMode) {
                // 타원 객체 생성
                const width = Math.abs(x - this.startX);
                const height = Math.abs(y - this.startY);
                const centerX = (this.startX + x) / 2;
                const centerY = (this.startY + y) / 2;
                const radiusX = width / 2;
                const radiusY = height / 2;

                if (radiusX > 0 && radiusY > 0) {
                    const object = {
                        type: 'ellipse',
                        data: {
                            centerX: centerX,
                            centerY: centerY,
                            radiusX: radiusX,
                            radiusY: radiusY,
                            rotation: 0
                        },
                        style: {
                            strokeColor: options.foregroundColor || options.color || '#000000',
                            fillColor: options.backgroundColor || 'transparent',
                            lineWidth: options.lineWidth,
                            opacity: options.opacity
                        },
                        bounds: {
                            x: centerX - radiusX - options.lineWidth / 2,
                            y: centerY - radiusY - options.lineWidth / 2,
                            width: radiusX * 2 + options.lineWidth,
                            height: radiusY * 2 + options.lineWidth
                        }
                    };

                    this.objectManager.addObject(object);
                    this.objectManager.renderAll(ctx);
                }
            } else {
                // 원 객체 생성
                const width = Math.abs(x - this.startX);
                const height = Math.abs(y - this.startY);
                const size = Math.max(width, height);
                const centerX = this.startX + (x > this.startX ? size : -size) / 2;
                const centerY = this.startY + (y > this.startY ? size : -size) / 2;
                const radius = size / 2;

                if (radius > 0) {
                    const object = {
                        type: 'circle',
                        data: {
                            centerX: centerX,
                            centerY: centerY,
                            radius: radius
                        },
                        style: {
                            strokeColor: options.foregroundColor || options.color || '#000000',
                            fillColor: options.backgroundColor || 'transparent',
                            lineWidth: options.lineWidth,
                            opacity: options.opacity
                        },
                        bounds: {
                            x: centerX - radius - options.lineWidth / 2,
                            y: centerY - radius - options.lineWidth / 2,
                            width: radius * 2 + options.lineWidth,
                            height: radius * 2 + options.lineWidth
                        }
                    };

                    this.objectManager.addObject(object);
                    this.objectManager.renderAll(ctx);
                }
            }
        }
    }
}

class FillTool extends DrawingTool {
    onMouseDown(ctx, x, y, options) {
        const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
        const targetColor = this.getPixelColor(imageData, x, y);
        const fillColor = Utils.hexToRgb(options.color);
        fillColor.a = Math.round(options.opacity * 255);

        if (Utils.colorsMatch(targetColor, fillColor)) {
            return;
        }

        this.floodFill(imageData, x, y, targetColor, fillColor);
        ctx.putImageData(imageData, 0, 0);
    }

    getPixelColor(imageData, x, y) {
        const index = (Math.floor(y) * imageData.width + Math.floor(x)) * 4;
        return {
            r: imageData.data[index],
            g: imageData.data[index + 1],
            b: imageData.data[index + 2],
            a: imageData.data[index + 3]
        };
    }

    setPixelColor(imageData, x, y, color) {
        const index = (Math.floor(y) * imageData.width + Math.floor(x)) * 4;
        imageData.data[index] = color.r;
        imageData.data[index + 1] = color.g;
        imageData.data[index + 2] = color.b;
        imageData.data[index + 3] = color.a;
    }

    floodFill(imageData, startX, startY, targetColor, fillColor) {
        const stack = [[Math.floor(startX), Math.floor(startY)]];
        const width = imageData.width;
        const height = imageData.height;
        const visited = new Set();

        while (stack.length > 0) {
            const [x, y] = stack.pop();

            if (x < 0 || x >= width || y < 0 || y >= height) continue;

            const key = `${x},${y}`;
            if (visited.has(key)) continue;
            visited.add(key);

            const currentColor = this.getPixelColor(imageData, x, y);

            if (!Utils.colorsMatch(currentColor, targetColor, 1)) continue;

            this.setPixelColor(imageData, x, y, fillColor);

            stack.push([x + 1, y]);
            stack.push([x - 1, y]);
            stack.push([x, y + 1]);
            stack.push([x, y - 1]);
        }
    }

    onMouseMove(ctx, x, y, options) {}
    onMouseUp(ctx, x, y, options) {}
}

class SelectTool extends DrawingTool {
    constructor() {
        super();
        this.mode = 'none';  // 'none', 'drag_move', 'drag_select'
        this.lastX = 0;
        this.lastY = 0;
    }

    onMouseDown(ctx, x, y, options, event) {
        if (!this.objectManager) return;

        const isMultiSelect = event && (event.shiftKey || event.ctrlKey || event.metaKey);
        const obj = this.objectManager.getObjectAt(x, y);

        if (obj) {
            // 객체 클릭: 선택 및 이동 모드
            if (isMultiSelect) {
                this.objectManager.toggleSelection(obj.id);
            } else {
                if (!this.objectManager.selectedObjectIds.includes(obj.id)) {
                    this.objectManager.selectObject(obj.id, false);
                }
            }
            this.mode = 'drag_move';
        } else {
            // 빈 곳 클릭: 영역 선택 모드
            if (!isMultiSelect) {
                this.objectManager.deselectAll();
            }
            this.mode = 'drag_select';
        }

        this.startX = x;
        this.startY = y;
        this.lastX = x;
        this.lastY = y;

        this.objectManager.renderAll(ctx);
    }

    onMouseMove(ctx, x, y, options, event) {
        if (!this.objectManager) return;

        if (this.mode === 'drag_move') {
            // 선택된 객체 이동
            const dx = x - this.lastX;
            const dy = y - this.lastY;
            this.objectManager.moveObjects(
                this.objectManager.selectedObjectIds, dx, dy
            );
            this.objectManager.renderAll(ctx);
        } else if (this.mode === 'drag_select') {
            // 선택 영역 표시
            this.objectManager.renderAll(ctx);
            ctx.save();
            ctx.strokeStyle = '#0066ff';
            ctx.fillStyle = 'rgba(0, 102, 255, 0.1)';
            ctx.setLineDash([5, 5]);
            ctx.globalAlpha = 1;
            const width = x - this.startX;
            const height = y - this.startY;
            ctx.fillRect(this.startX, this.startY, width, height);
            ctx.strokeRect(this.startX, this.startY, width, height);
            ctx.restore();
        }

        this.lastX = x;
        this.lastY = y;
    }

    onMouseUp(ctx, x, y, options, event) {
        if (!this.objectManager) return;

        if (this.mode === 'drag_select') {
            // 드래그 영역 내 객체 선택 (부분선택)
            const isMultiSelect = event && (event.shiftKey || event.ctrlKey || event.metaKey);

            const x1 = Math.min(this.startX, x);
            const y1 = Math.min(this.startY, y);
            const x2 = Math.max(this.startX, x);
            const y2 = Math.max(this.startY, y);

            const objectsInRect = this.objectManager.getObjectsInRect(
                x1, y1, x2, y2
            );

            if (isMultiSelect) {
                // 기존 선택에 추가
                objectsInRect.forEach(obj => {
                    this.objectManager.selectObject(obj.id, true);
                });
            } else {
                // 기존 선택 해제 후 새로 선택
                this.objectManager.deselectAll();
                objectsInRect.forEach(obj => {
                    this.objectManager.selectObject(obj.id, true);
                });
            }
        }

        this.mode = 'none';
        this.objectManager.renderAll(ctx);
    }
}

class TextTool extends DrawingTool {
    constructor() {
        super();
        this.inputElement = null;
        this.canvas = null;
        this.clickX = 0;
        this.clickY = 0;
        this.isComposing = false;
        this.isInputActive = false;
        this.currentOptions = null;
    }

    onMouseDown(ctx, x, y, options) {
        if (!this.objectManager) return;

        if (this.inputElement && this.isInputActive) {
            return;
        }

        if (this.inputElement) {
            this.finishTextInput(ctx, this.currentOptions);
        }

        this.canvas = ctx.canvas;
        this.clickX = x;
        this.clickY = y;
        this.currentOptions = options;

        this.createInputElement(x, y, options);
    }

    createInputElement(x, y, options) {
        const canvasRect = this.canvas.getBoundingClientRect();

        this.inputElement = document.createElement('input');
        this.inputElement.type = 'text';
        this.inputElement.style.position = 'absolute';
        this.inputElement.style.left = (canvasRect.left + x) + 'px';
        this.inputElement.style.top = (canvasRect.top + y) + 'px';
        this.inputElement.style.fontSize = (options.fontSize || 16) + 'px';
        this.inputElement.style.color = options.foregroundColor || options.color || '#000000';
        this.inputElement.style.border = '2px solid #0066ff';
        this.inputElement.style.outline = 'none';
        this.inputElement.style.background = 'rgba(255, 255, 255, 0.9)';
        this.inputElement.style.padding = '2px 4px';
        this.inputElement.style.minWidth = '200px';
        this.inputElement.style.fontFamily = 'Arial, "Malgun Gothic", "맑은 고딕", sans-serif';
        this.inputElement.style.zIndex = '1000';
        this.inputElement.style.pointerEvents = 'auto';

        this.inputElement.addEventListener('mousedown', (e) => {
            e.stopPropagation();
        });

        this.inputElement.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        this.inputElement.addEventListener('focus', () => {
            this.isInputActive = true;
        });

        this.inputElement.addEventListener('compositionstart', () => {
            this.isComposing = true;
        });

        this.inputElement.addEventListener('compositionend', () => {
            this.isComposing = false;
        });

        this.inputElement.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !this.isComposing) {
                e.preventDefault();
                this.finishTextInput(this.canvas.getContext('2d'), options);
            } else if (e.key === 'Escape') {
                e.preventDefault();
                this.cancelTextInput();
            }
        });

        this.inputElement.addEventListener('blur', (e) => {
            this.isInputActive = false;

            setTimeout(() => {
                if (this.inputElement && !this.isInputActive) {
                    this.finishTextInput(this.canvas.getContext('2d'), options);
                }
            }, 200);
        });

        document.body.appendChild(this.inputElement);

        setTimeout(() => {
            if (this.inputElement) {
                this.inputElement.focus();
            }
        }, 0);
    }

    finishTextInput(ctx, options) {
        if (!this.inputElement) return;

        this.isInputActive = false;
        const text = this.inputElement.value.trim();

        this.removeInputElement();

        if (text && this.objectManager) {
            const fontSize = options.fontSize || 16;
            const fontFamily = 'Arial, "Malgun Gothic", "맑은 고딕", sans-serif';
            const textBaseline = 'alphabetic';

            ctx.save();
            ctx.font = `${fontSize}px ${fontFamily}`;
            ctx.textBaseline = textBaseline;
            const metrics = ctx.measureText(text);
            ctx.restore();

            const textWidth = metrics.width;
            let textHeight = fontSize * 1.2;
            let boundsY = this.clickY - fontSize * 0.8;

            if (metrics.actualBoundingBoxAscent !== undefined &&
                metrics.actualBoundingBoxDescent !== undefined) {
                textHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
                boundsY = this.clickY - metrics.actualBoundingBoxAscent;
            }

            const object = {
                type: 'text',
                data: {
                    x: this.clickX,
                    y: this.clickY,
                    text: text,
                    fontSize: fontSize,
                    fontFamily: fontFamily,
                    textAlign: 'left',
                    textBaseline: textBaseline
                },
                style: {
                    strokeColor: options.foregroundColor || options.color || '#000000',
                    fillColor: 'transparent',
                    opacity: options.opacity
                },
                bounds: {
                    x: this.clickX,
                    y: boundsY,
                    width: textWidth,
                    height: textHeight
                }
            };

            this.objectManager.addObject(object);
            this.objectManager.renderAll(ctx);
        }
    }

    cancelTextInput() {
        this.isInputActive = false;
        this.removeInputElement();
    }

    removeInputElement() {
        if (this.inputElement) {
            this.inputElement.remove();
            this.inputElement = null;
        }
        this.isInputActive = false;
        this.currentOptions = null;
    }

    onMouseMove(ctx, x, y, options) {}
    onMouseUp(ctx, x, y, options) {}
}

class ImageTool extends DrawingTool {
    constructor() {
        super();
        this.fileInput = null;
    }

    onMouseDown(ctx, x, y, options) {
        this.openFileDialog(ctx, options);
    }

    openFileDialog(ctx, options) {
        if (this.fileInput) {
            this.fileInput.remove();
        }

        this.fileInput = document.createElement('input');
        this.fileInput.type = 'file';
        this.fileInput.accept = 'image/*';
        this.fileInput.style.display = 'none';

        this.fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.loadImage(file, ctx, options);
            }
        });

        document.body.appendChild(this.fileInput);
        this.fileInput.click();
    }

    loadImage(file, ctx, options) {
        if (!file.type.startsWith('image/')) {
            alert('이미지 파일만 선택할 수 있습니다.');
            return;
        }

        const reader = new FileReader();

        reader.onload = (e) => {
            const img = new Image();

            img.onload = () => {
                this.addImageObject(img, e.target.result, ctx, options);
            };

            img.onerror = () => {
                alert('이미지를 불러오는데 실패했습니다.');
            };

            img.src = e.target.result;
        };

        reader.onerror = () => {
            alert('파일을 읽는데 실패했습니다.');
        };

        reader.readAsDataURL(file);
    }

    addImageObject(img, imageData, ctx, options) {
        if (!this.objectManager) return;

        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 600;

        let scale = 1;
        if (img.width > MAX_WIDTH || img.height > MAX_HEIGHT) {
            scale = Math.min(MAX_WIDTH / img.width, MAX_HEIGHT / img.height);
        }

        const displayWidth = img.width * scale;
        const displayHeight = img.height * scale;

        const canvasWidth = ctx.canvas.width;
        const canvasHeight = ctx.canvas.height;
        const x = (canvasWidth - displayWidth) / 2;
        const y = (canvasHeight - displayHeight) / 2;

        const object = {
            type: 'image',
            data: {
                x: x,
                y: y,
                width: displayWidth,
                height: displayHeight,
                imageData: imageData,
                originalWidth: img.naturalWidth,
                originalHeight: img.naturalHeight
            },
            style: {
                opacity: options.opacity || 1.0
            },
            bounds: {
                x: x,
                y: y,
                width: displayWidth,
                height: displayHeight
            }
        };

        this.objectManager.addObject(object);
        this.objectManager.renderAll(ctx);

        if (this.fileInput) {
            this.fileInput.remove();
            this.fileInput = null;
        }
    }

    onMouseMove(ctx, x, y, options) {}
    onMouseUp(ctx, x, y, options) {}
}

class PaintTool extends DrawingTool {
    onMouseDown(ctx, x, y, options) {
        // 클릭한 위치의 객체 찾기
        const obj = this.objectManager.getObjectAt(x, y);

        if (!obj) return;

        // 객체 내부(fillColor)만 전경색으로 채우기
        // strokeColor는 변경하지 않음 (윤곽선 유지)
        obj.style.fillColor = options.foregroundColor || options.color || '#000000';

        // 즉시 다시 그리기
        this.objectManager.renderAll(ctx);
    }

    onMouseMove(ctx, x, y, options) {
        // 드래그 중에는 아무것도 하지 않음
    }

    onMouseUp(ctx, x, y, options) {
        // 마우스 업 시에도 아무것도 하지 않음 (mouseDown에서 처리 완료)
    }
}

class EyedropperTool extends DrawingTool {
    onMouseDown(ctx, x, y, options) {
        // 캔버스에서 픽셀 색상 가져오기
        const pixelData = ctx.getImageData(
            Math.floor(x),
            Math.floor(y),
            1,
            1
        ).data;

        const r = pixelData[0];
        const g = pixelData[1];
        const b = pixelData[2];

        // RGB를 HEX로 변환
        const hexColor = this.rgbToHex(r, g, b);

        // 전경색으로 설정 (ToolbarManager 업데이트)
        this.updateForegroundColor(hexColor);
    }

    onMouseMove(ctx, x, y, options) {
        // 마우스 이동 시 커서 변경 등 (선택사항)
    }

    onMouseUp(ctx, x, y, options) {
        // 아무것도 하지 않음
    }

    rgbToHex(r, g, b) {
        const toHex = (n) => {
            const hex = Math.max(0, Math.min(255, n)).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };
        return '#' + toHex(r) + toHex(g) + toHex(b);
    }

    updateForegroundColor(color) {
        // ToolbarManager의 전경색 업데이트
        if (window.toolbarManager) {
            window.toolbarManager.fgColor = color;
            window.toolbarManager.color = color;  // 하위 호환성
            const fgSwatch = document.getElementById('fgColorSwatch');
            const fgPicker = document.getElementById('fgColorPicker');
            if (fgSwatch) fgSwatch.style.backgroundColor = color;
            if (fgPicker) fgPicker.value = color;
        }
    }
}

class FreeSelectTool extends DrawingTool {
    constructor() {
        super();
        this.points = [];
        this.isDrawing = false;
    }

    onMouseDown(ctx, x, y, options, event) {
        this.isDrawing = true;
        this.points = [{ x, y }];

        // Shift/Ctrl/Cmd 키 확인 (멀티 선택)
        this.isMultiSelect = event && (event.shiftKey || event.ctrlKey || event.metaKey);

        if (!this.isMultiSelect && this.objectManager) {
            this.objectManager.deselectAll();
        }

        if (this.objectManager) {
            this.objectManager.renderAll(ctx);
            this.drawPath(ctx, options);
        }
    }

    onMouseMove(ctx, x, y, options) {
        if (!this.isDrawing || !this.objectManager) return;

        this.points.push({ x, y });

        // 전체 다시 그리고 경로 그리기
        this.objectManager.renderAll(ctx);
        this.drawPath(ctx, options);
    }

    onMouseUp(ctx, x, y, options) {
        if (!this.isDrawing || !this.objectManager) return;

        this.isDrawing = false;

        // 경로 닫기 (마지막 점과 첫 점 연결)
        if (this.points.length > 2) {
            this.points.push(this.points[0]);

            // 경로 내부의 객체 선택
            this.selectObjectsInsidePath();
        }

        this.points = [];
        this.objectManager.renderAll(ctx);
    }

    drawPath(ctx, options) {
        if (this.points.length < 2) return;

        ctx.save();
        ctx.strokeStyle = '#0066ff';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.globalAlpha = 0.8;

        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);

        for (let i = 1; i < this.points.length; i++) {
            ctx.lineTo(this.points[i].x, this.points[i].y);
        }

        // 현재 마우스 위치까지 점선 연결
        ctx.stroke();
        ctx.restore();
    }

    selectObjectsInsidePath() {
        // 모든 객체를 순회하며 경로 내부에 있는지 확인
        const allObjects = this.objectManager.objects;

        allObjects.forEach(obj => {
            // 객체의 중심점이 경로 내부에 있는지 확인
            const centerX = obj.bounds.x + obj.bounds.width / 2;
            const centerY = obj.bounds.y + obj.bounds.height / 2;

            if (this.isPointInPolygon(centerX, centerY, this.points)) {
                this.objectManager.selectObject(obj.id, true);
            }
        });
    }

    // Ray casting algorithm: 점이 다각형 내부에 있는지 확인
    isPointInPolygon(x, y, polygon) {
        let inside = false;

        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i].x, yi = polygon[i].y;
            const xj = polygon[j].x, yj = polygon[j].y;

            const intersect = ((yi > y) !== (yj > y))
                && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);

            if (intersect) inside = !inside;
        }

        return inside;
    }
}
