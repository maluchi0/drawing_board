class PDFExporter {
    constructor(canvasManager) {
        this.canvasManager = canvasManager;
        this.isLoading = false;
        this.currentURL = null;
    }

    async exportCanvasToPDF() {
        if (this.isLoading) {
            alert('PDF 생성 중입니다. 잠시만 기다려주세요.');
            return;
        }

        try {
            this.isLoading = true;
            this.showLoadingMessage('PDF 생성 중...');

            const canvas = this.canvasManager.canvas;
            const imageData = canvas.toDataURL('image/png');

            const pdf = new window.jspdf.jsPDF({
                orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
                unit: 'px',
                format: [canvas.width, canvas.height]
            });

            pdf.addImage(imageData, 'PNG', 0, 0, canvas.width, canvas.height);

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
            const filename = `drawing_${timestamp}.pdf`;

            pdf.save(filename);

            this.hideLoadingMessage();
            this.showSuccessMessage('PDF 다운로드 완료!');

        } catch (error) {
            console.error('PDF 생성 오류:', error);
            this.hideLoadingMessage();
            alert('PDF 생성 중 오류가 발생했습니다: ' + error.message);
        } finally {
            this.isLoading = false;
        }
    }

    showLoadingMessage(message) {
        let loadingDiv = document.getElementById('pdf-loading');
        if (!loadingDiv) {
            loadingDiv = document.createElement('div');
            loadingDiv.id = 'pdf-loading';
            loadingDiv.style.position = 'fixed';
            loadingDiv.style.top = '50%';
            loadingDiv.style.left = '50%';
            loadingDiv.style.transform = 'translate(-50%, -50%)';
            loadingDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
            loadingDiv.style.color = 'white';
            loadingDiv.style.padding = '20px 40px';
            loadingDiv.style.borderRadius = '8px';
            loadingDiv.style.zIndex = '10000';
            loadingDiv.style.fontSize = '16px';
            loadingDiv.style.fontWeight = 'bold';
            document.body.appendChild(loadingDiv);
        }
        loadingDiv.textContent = message;
        loadingDiv.style.display = 'block';
    }

    hideLoadingMessage() {
        const loadingDiv = document.getElementById('pdf-loading');
        if (loadingDiv) {
            loadingDiv.style.display = 'none';
        }
    }

    showSuccessMessage(message) {
        const loadingDiv = document.getElementById('pdf-loading');
        if (loadingDiv) {
            loadingDiv.textContent = message;
            loadingDiv.style.backgroundColor = 'rgba(0, 128, 0, 0.8)';
            setTimeout(() => {
                this.hideLoadingMessage();
                loadingDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
            }, 2000);
        }
    }

    validateURL(url) {
        if (!url || url.trim() === '') {
            return { valid: false, message: 'URL을 입력해주세요.' };
        }

        try {
            const urlObj = new URL(url);
            const protocol = urlObj.protocol;

            if (protocol !== 'http:' && protocol !== 'https:' && protocol !== 'file:') {
                return { valid: false, message: '유효한 URL 형식이 아닙니다. (http://, https://, file://만 지원)' };
            }

            return { valid: true };
        } catch (error) {
            return { valid: false, message: '유효한 URL 형식이 아닙니다.' };
        }
    }

    showURLDialog() {
        const url = prompt('PDF로 변환할 URL을 입력하세요:\n\n주의: CORS 정책으로 인해 대부분의 외부 사이트는 접근이 제한됩니다.\n현재 Canvas를 PDF로 변환하려면 취소를 누르세요.');

        if (url === null) {
            return;
        }

        if (url.trim() === '') {
            this.exportCanvasToPDF();
            return;
        }

        const validation = this.validateURL(url);
        if (!validation.valid) {
            alert(validation.message);
            return;
        }

        alert('URL 로딩 기능은 CORS 제약으로 인해 제한됩니다.\n대신 현재 Canvas를 PDF로 변환합니다.');
        this.exportCanvasToPDF();
    }

    async exportURLToPDF(url) {
        alert('외부 URL을 PDF로 변환하는 기능은 CORS 정책으로 인해 지원되지 않습니다.\n\n해결 방법:\n1. 현재 Canvas를 PDF로 변환\n2. 웹 브라우저의 "인쇄 > PDF로 저장" 기능 사용\n3. 브라우저 확장 프로그램 설치');
    }
}
