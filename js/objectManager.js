class ObjectManager {
    constructor() {
        this.objects = [];
        this.selectedObjectIds = [];
        this.nextId = 1;
        this.imageCache = new Map();
    }

    addObject(object) {
        object.id = this.nextId++;
        object.selected = false;
        object.zIndex = this.objects.length;
        this.objects.push(object);
        return object.id;
    }

    removeObject(id) {
        const index = this.objects.findIndex(obj => obj.id === id);
        if (index !== -1) {
            this.objects.splice(index, 1);
            const selectedIndex = this.selectedObjectIds.indexOf(id);
            if (selectedIndex !== -1) {
                this.selectedObjectIds.splice(selectedIndex, 1);
            }
        }
    }

    removeObjects(ids) {
        ids.forEach(id => this.removeObject(id));
    }

    getObjectAt(x, y) {
        for (let i = this.objects.length - 1; i >= 0; i--) {
            const obj = this.objects[i];
            if (this.hitTest(obj, x, y)) {
                return obj;
            }
        }
        return null;
    }

    hitTest(obj, x, y) {
        const bounds = obj.bounds;

        if (x < bounds.x || x > bounds.x + bounds.width ||
            y < bounds.y || y > bounds.y + bounds.height) {
            return false;
        }

        switch (obj.type) {
            case 'line':
                return this.hitTestLine(obj, x, y);
            case 'rectangle':
                return true;
            case 'circle':
                return this.hitTestCircle(obj, x, y);
            case 'ellipse':
                return this.hitTestEllipse(obj, x, y);
            case 'path':
                return this.hitTestPath(obj, x, y);
            default:
                return true;
        }
    }

    hitTestLine(obj, x, y) {
        const { startX, startY, endX, endY } = obj.data;
        const lineWidth = obj.style.lineWidth;
        const distance = this.pointToLineDistance(x, y, startX, startY, endX, endY);
        return distance <= lineWidth / 2 + 5;
    }

    hitTestCircle(obj, x, y) {
        const { centerX, centerY, radius } = obj.data;
        const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
        const lineWidth = obj.style.lineWidth;
        return Math.abs(distance - radius) <= lineWidth / 2 + 5;
    }

    hitTestEllipse(obj, x, y) {
        const { centerX, centerY, radiusX, radiusY } = obj.data;
        // 타원 방정식: ((x-cx)/rx)^2 + ((y-cy)/ry)^2 = 1
        // 경계선 근처 클릭 감지
        const normalizedDistance = Math.pow((x - centerX) / radiusX, 2) + Math.pow((y - centerY) / radiusY, 2);
        const lineWidth = obj.style.lineWidth;
        const threshold = lineWidth / Math.min(radiusX, radiusY) + 0.1;
        return Math.abs(Math.sqrt(normalizedDistance) - 1) <= threshold;
    }

    hitTestPath(obj, x, y) {
        const points = obj.data.points;
        const lineWidth = obj.style.lineWidth;

        for (let i = 0; i < points.length - 1; i++) {
            const distance = this.pointToLineDistance(
                x, y,
                points[i].x, points[i].y,
                points[i + 1].x, points[i + 1].y
            );
            if (distance <= lineWidth / 2 + 3) {
                return true;
            }
        }
        return false;
    }

    pointToLineDistance(px, py, x1, y1, x2, y2) {
        const A = px - x1;
        const B = py - y1;
        const C = x2 - x1;
        const D = y2 - y1;

        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;

        if (lenSq !== 0) {
            param = dot / lenSq;
        }

        let xx, yy;

        if (param < 0) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }

        const dx = px - xx;
        const dy = py - yy;
        return Math.sqrt(dx * dx + dy * dy);
    }

    selectObject(id, addToSelection = false) {
        if (!addToSelection) {
            this.deselectAll();
        }
        const obj = this.objects.find(o => o.id === id);
        if (obj && !obj.selected) {
            obj.selected = true;
            this.selectedObjectIds.push(id);
        }
    }

    toggleSelection(id) {
        const obj = this.objects.find(o => o.id === id);
        if (!obj) return;

        if (obj.selected) {
            obj.selected = false;
            const index = this.selectedObjectIds.indexOf(id);
            if (index !== -1) {
                this.selectedObjectIds.splice(index, 1);
            }
        } else {
            obj.selected = true;
            this.selectedObjectIds.push(id);
        }
    }

    selectAll() {
        this.deselectAll();
        this.objects.forEach(obj => {
            obj.selected = true;
            this.selectedObjectIds.push(obj.id);
        });
    }

    deselectAll() {
        this.objects.forEach(obj => obj.selected = false);
        this.selectedObjectIds = [];
    }

    getSelectedObject() {
        // 하위 호환성을 위한 메서드: 첫 번째 선택된 객체 반환
        if (this.selectedObjectIds.length > 0) {
            return this.objects.find(obj => obj.id === this.selectedObjectIds[0]);
        }
        return null;
    }

    getSelectedObjects() {
        return this.objects.filter(obj => this.selectedObjectIds.includes(obj.id));
    }

    moveObject(id, dx, dy) {
        const obj = this.objects.find(o => o.id === id);
        if (!obj) return;

        switch (obj.type) {
            case 'line':
                obj.data.startX += dx;
                obj.data.startY += dy;
                obj.data.endX += dx;
                obj.data.endY += dy;
                break;
            case 'rectangle':
                obj.data.x += dx;
                obj.data.y += dy;
                break;
            case 'circle':
                obj.data.centerX += dx;
                obj.data.centerY += dy;
                break;
            case 'ellipse':
                obj.data.centerX += dx;
                obj.data.centerY += dy;
                break;
            case 'path':
                obj.data.points.forEach(point => {
                    point.x += dx;
                    point.y += dy;
                });
                break;
            case 'text':
                obj.data.x += dx;
                obj.data.y += dy;
                break;
            case 'image':
                obj.data.x += dx;
                obj.data.y += dy;
                break;
        }

        obj.bounds.x += dx;
        obj.bounds.y += dy;
    }

    moveObjects(ids, dx, dy) {
        ids.forEach(id => this.moveObject(id, dx, dy));
    }

    getObjectsInRect(x1, y1, x2, y2) {
        // 드래그 영역과 겹치는 모든 객체 반환 (부분선택)
        const results = [];
        for (const obj of this.objects) {
            const bounds = obj.bounds;
            // 사각형 교차 검사
            if (!(bounds.x + bounds.width < x1 ||
                  bounds.x > x2 ||
                  bounds.y + bounds.height < y1 ||
                  bounds.y > y2)) {
                results.push(obj);
            }
        }
        return results;
    }

    renderAll(ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        this.objects.forEach(obj => {
            this.renderObject(ctx, obj);
        });

        // 선택된 모든 객체에 대해 선택 박스 그리기
        const selectedObjects = this.getSelectedObjects();
        selectedObjects.forEach(obj => {
            this.drawSelectionBox(ctx, obj);
        });
    }

    renderObject(ctx, obj) {
        // 하위 호환성: 기존 color 속성을 strokeColor로 자동 마이그레이션
        if (obj.style.color && !obj.style.strokeColor) {
            obj.style.strokeColor = obj.style.color;
            // fillColor가 없을 때만 'transparent' 설정 (기존 값이 있으면 유지)
            if (!obj.style.fillColor) {
                obj.style.fillColor = 'transparent';
            }
            delete obj.style.color;
        }

        ctx.save();
        ctx.lineWidth = obj.style.lineWidth || 1;
        ctx.globalAlpha = obj.style.opacity || 1;
        ctx.lineCap = obj.style.lineCap || 'round';
        ctx.lineJoin = obj.style.lineJoin || 'round';

        switch (obj.type) {
            case 'line':
                ctx.strokeStyle = obj.style.strokeColor || '#000000';
                ctx.beginPath();
                ctx.moveTo(obj.data.startX, obj.data.startY);
                ctx.lineTo(obj.data.endX, obj.data.endY);
                ctx.stroke();
                break;

            case 'rectangle':
                // 채우기가 있으면 먼저 채우기
                if (obj.style.fillColor && obj.style.fillColor !== 'transparent') {
                    ctx.fillStyle = obj.style.fillColor;
                    ctx.fillRect(obj.data.x, obj.data.y, obj.data.width, obj.data.height);
                }
                // 윤곽선 그리기
                ctx.strokeStyle = obj.style.strokeColor || '#000000';
                ctx.strokeRect(obj.data.x, obj.data.y, obj.data.width, obj.data.height);
                break;

            case 'circle':
                ctx.beginPath();
                ctx.arc(obj.data.centerX, obj.data.centerY, obj.data.radius, 0, 2 * Math.PI);
                // 채우기
                if (obj.style.fillColor && obj.style.fillColor !== 'transparent') {
                    ctx.fillStyle = obj.style.fillColor;
                    ctx.fill();
                }
                // 윤곽선
                ctx.strokeStyle = obj.style.strokeColor || '#000000';
                ctx.stroke();
                break;

            case 'ellipse':
                ctx.beginPath();
                ctx.ellipse(obj.data.centerX, obj.data.centerY,
                           obj.data.radiusX, obj.data.radiusY,
                           obj.data.rotation || 0, 0, 2 * Math.PI);
                // 채우기
                if (obj.style.fillColor && obj.style.fillColor !== 'transparent') {
                    ctx.fillStyle = obj.style.fillColor;
                    ctx.fill();
                }
                // 윤곽선
                ctx.strokeStyle = obj.style.strokeColor || '#000000';
                ctx.stroke();
                break;

            case 'path':
                if (obj.data.points.length > 1) {
                    ctx.strokeStyle = obj.style.strokeColor || '#000000';
                    ctx.beginPath();
                    ctx.moveTo(obj.data.points[0].x, obj.data.points[0].y);
                    for (let i = 1; i < obj.data.points.length; i++) {
                        ctx.lineTo(obj.data.points[i].x, obj.data.points[i].y);
                    }
                    ctx.stroke();
                }
                break;

            case 'text':
                ctx.font = `${obj.data.fontSize}px ${obj.data.fontFamily}`;
                ctx.fillStyle = obj.style.strokeColor || '#000000';  // 텍스트는 fillStyle 사용
                ctx.globalAlpha = obj.style.opacity || 1;
                ctx.textAlign = obj.data.textAlign || 'left';
                ctx.textBaseline = obj.data.textBaseline || 'alphabetic';
                ctx.fillText(obj.data.text, obj.data.x, obj.data.y);
                break;

            case 'image':
                this.renderImageObject(ctx, obj);
                break;
        }

        ctx.restore();
    }

    renderImageObject(ctx, obj) {
        const imageData = obj.data.imageData;

        if (this.imageCache.has(imageData)) {
            const img = this.imageCache.get(imageData);
            ctx.globalAlpha = obj.style.opacity || 1.0;
            ctx.drawImage(
                img,
                obj.data.x,
                obj.data.y,
                obj.data.width,
                obj.data.height
            );
        } else {
            const img = new Image();
            img.onload = () => {
                this.imageCache.set(imageData, img);
                ctx.save();
                ctx.globalAlpha = obj.style.opacity || 1.0;
                ctx.drawImage(
                    img,
                    obj.data.x,
                    obj.data.y,
                    obj.data.width,
                    obj.data.height
                );
                ctx.restore();
            };
            img.src = imageData;
        }
    }

    drawSelectionBox(ctx, obj) {
        ctx.save();
        ctx.strokeStyle = '#0066ff';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.globalAlpha = 1;

        const padding = 5;
        ctx.strokeRect(
            obj.bounds.x - padding,
            obj.bounds.y - padding,
            obj.bounds.width + padding * 2,
            obj.bounds.height + padding * 2
        );

        const handleSize = 8;
        ctx.fillStyle = '#0066ff';

        const corners = [
            { x: obj.bounds.x - padding, y: obj.bounds.y - padding },
            { x: obj.bounds.x + obj.bounds.width + padding, y: obj.bounds.y - padding },
            { x: obj.bounds.x - padding, y: obj.bounds.y + obj.bounds.height + padding },
            { x: obj.bounds.x + obj.bounds.width + padding, y: obj.bounds.y + obj.bounds.height + padding }
        ];

        corners.forEach(corner => {
            ctx.fillRect(corner.x - handleSize / 2, corner.y - handleSize / 2, handleSize, handleSize);
        });

        ctx.restore();
    }

    getState() {
        return JSON.parse(JSON.stringify({
            objects: this.objects,
            nextId: this.nextId
        }));
    }

    setState(state) {
        this.objects = JSON.parse(JSON.stringify(state.objects));
        this.nextId = state.nextId;
        this.selectedObjectIds = [];
    }

    clear() {
        this.objects = [];
        this.selectedObjectIds = [];
        this.nextId = 1;
    }
}
