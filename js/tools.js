class DrawingTool {
    constructor() {
        this.startX = 0;
        this.startY = 0;
        this.objectManager = null;
    }

    setObjectManager(objectManager) {
        this.objectManager = objectManager;
    }

    onMouseDown(ctx, x, y, options) {}
    onMouseMove(ctx, x, y, options) {}
    onMouseUp(ctx, x, y, options) {}
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
        ctx.strokeStyle = options.color;
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
        ctx.strokeStyle = options.color;
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
                    color: options.color,
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
        ctx.strokeStyle = options.color;
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
                    color: options.color,
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
        ctx.strokeStyle = options.color;
        ctx.lineWidth = options.lineWidth;
        ctx.globalAlpha = options.opacity;
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
                    color: options.color,
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

    onMouseDown(ctx, x, y, options) {
        this.isDrawing = true;
        this.startX = x;
        this.startY = y;
    }

    onMouseMove(ctx, x, y, options) {
        if (!this.isDrawing || !this.objectManager) return;

        this.objectManager.renderAll(ctx);

        const radius = Math.sqrt(Math.pow(x - this.startX, 2) + Math.pow(y - this.startY, 2));

        ctx.save();
        ctx.strokeStyle = options.color;
        ctx.lineWidth = options.lineWidth;
        ctx.globalAlpha = options.opacity;
        ctx.beginPath();
        ctx.arc(this.startX, this.startY, radius, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.restore();
    }

    onMouseUp(ctx, x, y, options) {
        if (!this.isDrawing) return;

        this.isDrawing = false;

        if (this.objectManager) {
            const radius = Math.sqrt(Math.pow(x - this.startX, 2) + Math.pow(y - this.startY, 2));

            if (radius > 0) {
                const object = {
                    type: 'circle',
                    data: {
                        centerX: this.startX,
                        centerY: this.startY,
                        radius: radius
                    },
                    style: {
                        color: options.color,
                        lineWidth: options.lineWidth,
                        opacity: options.opacity
                    },
                    bounds: {
                        x: this.startX - radius - options.lineWidth / 2,
                        y: this.startY - radius - options.lineWidth / 2,
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
        this.isDragging = false;
        this.lastX = 0;
        this.lastY = 0;
        this.selectedObject = null;
    }

    onMouseDown(ctx, x, y, options) {
        if (!this.objectManager) return;

        const obj = this.objectManager.getObjectAt(x, y);

        if (obj) {
            this.objectManager.selectObject(obj.id);
            this.selectedObject = obj;
            this.isDragging = true;
            this.lastX = x;
            this.lastY = y;
        } else {
            this.objectManager.deselectAll();
            this.selectedObject = null;
        }

        this.objectManager.renderAll(ctx);
    }

    onMouseMove(ctx, x, y, options) {
        if (!this.isDragging || !this.selectedObject || !this.objectManager) return;

        const dx = x - this.lastX;
        const dy = y - this.lastY;

        this.objectManager.moveObject(this.selectedObject.id, dx, dy);
        this.objectManager.renderAll(ctx);

        this.lastX = x;
        this.lastY = y;
    }

    onMouseUp(ctx, x, y, options) {
        this.isDragging = false;
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
        this.inputElement.style.color = options.color;
        this.inputElement.style.border = '2px solid #0066ff';
        this.inputElement.style.outline = 'none';
        this.inputElement.style.background = 'rgba(255, 255, 255, 0.9)';
        this.inputElement.style.padding = '2px 4px';
        this.inputElement.style.minWidth = '100px';
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
                    color: options.color,
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
