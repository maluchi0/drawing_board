class ObjectManager {
    constructor() {
        this.objects = [];
        this.selectedObjectId = null;
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
            if (this.selectedObjectId === id) {
                this.selectedObjectId = null;
            }
        }
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

    selectObject(id) {
        this.deselectAll();
        const obj = this.objects.find(o => o.id === id);
        if (obj) {
            obj.selected = true;
            this.selectedObjectId = id;
        }
    }

    deselectAll() {
        this.objects.forEach(obj => obj.selected = false);
        this.selectedObjectId = null;
    }

    getSelectedObject() {
        return this.objects.find(obj => obj.id === this.selectedObjectId);
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

    renderAll(ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        this.objects.forEach(obj => {
            this.renderObject(ctx, obj);
        });

        const selected = this.getSelectedObject();
        if (selected) {
            this.drawSelectionBox(ctx, selected);
        }
    }

    renderObject(ctx, obj) {
        ctx.save();
        ctx.strokeStyle = obj.style.color;
        ctx.lineWidth = obj.style.lineWidth;
        ctx.lineCap = obj.style.lineCap || 'round';
        ctx.lineJoin = obj.style.lineJoin || 'round';
        ctx.globalAlpha = obj.style.opacity;

        switch (obj.type) {
            case 'line':
                ctx.beginPath();
                ctx.moveTo(obj.data.startX, obj.data.startY);
                ctx.lineTo(obj.data.endX, obj.data.endY);
                ctx.stroke();
                break;

            case 'rectangle':
                ctx.strokeRect(obj.data.x, obj.data.y, obj.data.width, obj.data.height);
                break;

            case 'circle':
                ctx.beginPath();
                ctx.arc(obj.data.centerX, obj.data.centerY, obj.data.radius, 0, 2 * Math.PI);
                ctx.stroke();
                break;

            case 'path':
                if (obj.data.points.length > 1) {
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
                ctx.fillStyle = obj.style.color;
                ctx.globalAlpha = obj.style.opacity;
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
        this.selectedObjectId = null;
    }

    clear() {
        this.objects = [];
        this.selectedObjectId = null;
        this.nextId = 1;
    }
}
