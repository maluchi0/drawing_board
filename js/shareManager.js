class ShareManager {
    constructor(canvasManager) {
        this.canvasManager = canvasManager;
        this.capturedImage = null;
        // imgur 익명 Client-ID (공용 테스트용)
        this.imgurClientId = '546c25a59c58ad7';
    }

    async uploadToImgur(blob) {
        const formData = new FormData();
        formData.append('image', blob);

        try {
            const response = await fetch('https://api.imgur.com/3/image', {
                method: 'POST',
                headers: {
                    'Authorization': `Client-ID ${this.imgurClientId}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('이미지 업로드 실패');
            }

            const data = await response.json();

            if (data.success && data.data && data.data.link) {
                return data.data.link;
            } else {
                throw new Error('이미지 URL을 가져올 수 없습니다');
            }
        } catch (error) {
            console.error('imgur 업로드 에러:', error);
            throw error;
        }
    }

    async captureCanvas() {
        return new Promise((resolve, reject) => {
            this.canvasManager.canvas.toBlob((blob) => {
                if (blob) {
                    this.capturedImage = blob;
                    resolve(blob);
                } else {
                    reject(new Error('Canvas 캡처 실패'));
                }
            }, 'image/png');
        });
    }

    async shareToEmail() {
        try {
            this.showToast('이미지 업로드 중...');

            const blob = await this.captureCanvas();
            const imageUrl = await this.uploadToImgur(blob);

            const subject = encodeURIComponent('그림판 작품 공유');
            const body = encodeURIComponent(
                `그림판에서 그린 작품을 확인해보세요!\n\n이미지: ${imageUrl}`
            );
            const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;

            // Create a temporary link and click it
            const link = document.createElement('a');
            link.href = mailtoUrl;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            this.showToast('이메일 클라이언트를 열고 있습니다...');
        } catch (err) {
            console.error('이메일 공유 실패:', err);
            if (err.message.includes('업로드')) {
                this.showToast('이미지 업로드에 실패했습니다. 인터넷 연결을 확인해주세요');
            } else {
                this.showToast('이메일 클라이언트를 설정해주세요');
            }
        }
    }

    async shareViaWebAPI() {
        if (!navigator.share || !navigator.canShare) {
            this.showToast('이 브라우저는 공유 기능을 지원하지 않습니다');
            return false;
        }

        try {
            const blob = await this.captureCanvas();
            const file = new File([blob], 'drawing.png', { type: 'image/png' });

            if (navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: '내 그림',
                    text: '그림판에서 그린 작품입니다',
                    files: [file]
                });
                console.log('공유 성공');
                return true;
            } else {
                this.showToast('이 브라우저는 파일 공유를 지원하지 않습니다');
                return false;
            }
        } catch (err) {
            if (err.name === 'AbortError') {
                console.log('사용자가 공유를 취소했습니다');
            } else {
                console.error('Web Share API 실패:', err);
                this.showToast('공유에 실패했습니다');
            }
            return false;
        }
    }

    async shareToTwitter() {
        try {
            this.showToast('이미지 업로드 중...');

            const blob = await this.captureCanvas();
            const imageUrl = await this.uploadToImgur(blob);

            console.log('Twitter 공유 이미지 URL:', imageUrl);

            const text = encodeURIComponent('그림판에서 그린 작품을 확인해보세요!');
            const url = encodeURIComponent(imageUrl);
            const twitterUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;

            const popup = window.open(
                twitterUrl,
                'twitter-share',
                'width=550,height=420,resizable=yes,scrollbars=yes'
            );

            // Check for popup blocker after a short delay
            setTimeout(() => {
                if (!popup || popup.closed || typeof popup.closed === 'undefined') {
                    this.showToast('팝업 차단을 해제해주세요');
                }
            }, 100);
        } catch (err) {
            console.error('Twitter 공유 실패:', err);
            if (err.message.includes('업로드')) {
                this.showToast('이미지 업로드에 실패했습니다. 인터넷 연결을 확인해주세요');
            } else {
                this.showToast('팝업 차단을 해제해주세요');
            }
        }
    }

    async shareToFacebook() {
        try {
            this.showToast('이미지 업로드 중...');

            const blob = await this.captureCanvas();
            const imageUrl = await this.uploadToImgur(blob);

            console.log('Facebook 공유 이미지 URL:', imageUrl);

            const url = encodeURIComponent(imageUrl);
            const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;

            const popup = window.open(
                facebookUrl,
                'facebook-share',
                'width=600,height=400,resizable=yes,scrollbars=yes'
            );

            if (!popup) {
                this.showToast('팝업 차단을 해제해주세요');
                return;
            }

            // Check for popup blocker after a short delay
            setTimeout(() => {
                try {
                    if (popup.closed || typeof popup.closed === 'undefined') {
                        this.showToast('팝업 차단을 해제해주세요');
                    }
                } catch (e) {
                    // Ignore cross-origin errors
                }
            }, 100);
        } catch (err) {
            console.error('Facebook 공유 실패:', err);
            if (err.message.includes('업로드')) {
                this.showToast('이미지 업로드에 실패했습니다. 인터넷 연결을 확인해주세요');
            } else {
                this.showToast('팝업 차단을 해제해주세요');
            }
        }
    }

    showShareDialog() {
        const existingDialog = document.getElementById('share-dialog');
        if (existingDialog) {
            existingDialog.remove();
        }

        const dialog = document.createElement('div');
        dialog.id = 'share-dialog';
        dialog.className = 'share-dialog';

        dialog.innerHTML = `
            <div class="share-dialog-content">
                <div class="share-dialog-header">
                    <h3>공유하기</h3>
                    <button class="share-dialog-close" aria-label="닫기">&times;</button>
                </div>
                <div class="share-options">
                    <button class="share-option" data-action="email">
                        <span class="share-icon">✉️</span>
                        <span class="share-text">이메일로 공유</span>
                    </button>
                    <button class="share-option" data-action="twitter">
                        <span class="share-icon">🐦</span>
                        <span class="share-text">Twitter 공유</span>
                    </button>
                    <button class="share-option" data-action="facebook">
                        <span class="share-icon">📘</span>
                        <span class="share-text">Facebook 공유</span>
                    </button>
                    <button class="share-option" data-action="web-share">
                        <span class="share-icon">📤</span>
                        <span class="share-text">기타 공유</span>
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);

        const closeBtn = dialog.querySelector('.share-dialog-close');
        closeBtn.addEventListener('click', () => {
            dialog.remove();
        });

        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                dialog.remove();
            }
        });

        const optionButtons = dialog.querySelectorAll('.share-option');
        optionButtons.forEach(button => {
            button.addEventListener('click', async () => {
                const action = button.dataset.action;

                // Close dialog first for better UX
                dialog.remove();

                // Small delay to ensure dialog is closed before opening popups/mailto
                await new Promise(resolve => setTimeout(resolve, 50));

                try {
                    switch (action) {
                        case 'email':
                            await this.shareToEmail();
                            break;
                        case 'twitter':
                            await this.shareToTwitter();
                            break;
                        case 'facebook':
                            await this.shareToFacebook();
                            break;
                        case 'web-share':
                            await this.shareViaWebAPI();
                            break;
                    }
                } catch (err) {
                    console.error('공유 실패:', err);
                    this.showToast('공유에 실패했습니다');
                }
            });
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.getElementById('share-dialog')) {
                dialog.remove();
            }
        }, { once: true });
    }

    showToast(message) {
        const existingToast = document.getElementById('toast-message');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.id = 'toast-message';
        toast.className = 'toast';
        toast.textContent = message;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }
}
