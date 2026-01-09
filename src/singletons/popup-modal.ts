/**
 * 弹框类，用于创建和管理模态弹框
 */
class PopupModal {
    private modal: HTMLDivElement;
    private overlay: HTMLDivElement;
    private content: HTMLDivElement;
    private closeButton: HTMLButtonElement;
    private externalScreenButton: HTMLButtonElement;
    private iframe: HTMLIFrameElement;
    private currentUrl: string = ''; // 保存当前加载的URL
// 进度条相关
    private loadingBar: HTMLDivElement;
    private loadingBarFill: HTMLDivElement;
    private loadingPercentage: HTMLDivElement;
    private progress: number = 0; // 进度值，范围0-100
    private isIframeLoaded: boolean = false; // 跟踪iframe是否已完全加载
    private loadingContainer: HTMLDivElement;
    private loadingBackground: HTMLDivElement;
    private backgroundOverlay: HTMLDivElement;
    private loadingSpinner: HTMLDivElement;
    private loadingTimeout: number | null = null;
    private loadingProgressInterval: number | null = null;
    private bgImageIndex: number = 0;
    private bgImageInterval: number | null = null;
    private backgroundImages: string[] = [
        '/img/epfl-1.jpg',
        '/img/iss.jpg',
        '/img/rocket.jpg'
    ];
    // 拖拽相关变量
    private isDragging: boolean = false;
    private dragStartX: number = 0;
    private dragStartY: number = 0;
    private modalPositionX: number = 0;
    private modalPositionY: number = 0;

    constructor() {
        this.createModal();
        this.bindEvents();
    }

    /**
     * 创建弹框DOM结构
     */
    private createModal(): void {
        // 创建遮罩层
        this.overlay = document.createElement('div');
        this.overlay.className = 'modal-overlay';

        // 创建弹框容器
        this.modal = document.createElement('div');
        this.modal.className = 'popup-modal';

        // 创建弹框头部
        const header = document.createElement('div');
        header.className = 'modal-header';

        // 创建按钮容器
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'modal-buttons';
        buttonContainer.style.display = 'flex';

        // 创建外部屏幕按钮
        this.externalScreenButton = document.createElement('button');
        this.externalScreenButton.className = 'modal-external-screen';
        this.externalScreenButton.textContent = '分屏展示';
        this.externalScreenButton.setAttribute('aria-label', '在另一屏幕显示');
        this.externalScreenButton.style.background = '#3498db';
        this.externalScreenButton.style.color = 'white';
        this.externalScreenButton.style.border = 'none';
        this.externalScreenButton.style.padding = '5px 10px';
        this.externalScreenButton.style.borderRadius = '4px';
        this.externalScreenButton.style.marginRight = '10px';
        this.externalScreenButton.style.cursor = 'pointer';
        this.externalScreenButton.style.fontSize = '12px';
        this.externalScreenButton.style.transition = 'background-color 0.2s ease';
        this.externalScreenButton.id = 'external-screen-btn';

        // 创建关闭按钮
        this.closeButton = document.createElement('button');
        this.closeButton.className = 'modal-close';
        this.closeButton.innerHTML = '×';
        this.closeButton.setAttribute('aria-label', '关闭弹框');

        // 组装头部按钮
        buttonContainer.appendChild(this.externalScreenButton);
        buttonContainer.appendChild(this.closeButton);
        header.appendChild(buttonContainer);

        // 创建弹框内容区域
        this.content = document.createElement('div');
        this.content.className = 'modal-content';

        // 创建iframe
        this.iframe = document.createElement('iframe');
        this.iframe.className = 'modal-iframe';
        this.iframe.setAttribute('frameborder', '0');
        this.iframe.setAttribute('allowfullscreen', 'true');

        // 创建加载背景容器
        this.loadingBackground = document.createElement('div');
        this.loadingBackground.className = 'loading-background';
        
        // 创建半透明遮罩层
        this.backgroundOverlay = document.createElement('div');
        this.backgroundOverlay.className = 'background-overlay';
        // 确保与其他遮罩层样式完全一致
        this.backgroundOverlay.style.position = 'absolute';
        this.backgroundOverlay.style.top = '0';
        this.backgroundOverlay.style.left = '0';
        this.backgroundOverlay.style.width = '100%';
        this.backgroundOverlay.style.height = '100%';
        this.backgroundOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        this.backgroundOverlay.style.zIndex = '2';
        // 添加额外样式以确保视觉一致性
        this.backgroundOverlay.style.pointerEvents = 'none';
        this.backgroundOverlay.style.userSelect = 'none';
        this.backgroundOverlay.style.mixBlendMode = 'normal';
        
        // 将遮罩层添加到加载背景容器
        this.loadingBackground.appendChild(this.backgroundOverlay);

        // 创建加载容器
        this.loadingContainer = document.createElement('div');
        this.loadingContainer.className = 'loading-container';

        // 创建进度条
        this.loadingBar = document.createElement('div');
        this.loadingBar.className = 'loading-bar';

        // 创建进度条内容
        this.loadingBarFill = document.createElement('div');
        this.loadingBarFill.className = 'loading-bar-fill';

        // 创建加载动画
        this.loadingSpinner = document.createElement('div');
        this.loadingSpinner.className = 'loading-spinner';

        // 创建百分比文本
        this.loadingPercentage = document.createElement('div');
        this.loadingPercentage.className = 'loading-percentage';
        this.loadingPercentage.textContent = '0%';

        // 组装进度条结构
        this.loadingBar.appendChild(this.loadingBarFill);
        this.loadingContainer.appendChild(this.loadingSpinner);
        this.loadingContainer.appendChild(this.loadingBar);
        this.loadingContainer.appendChild(this.loadingPercentage); 
        this.loadingBackground.appendChild(this.loadingContainer);

        // 组装DOM结构
        this.content.appendChild(this.iframe);
        this.content.appendChild(this.loadingBackground);
        this.modal.appendChild(header);
        this.modal.appendChild(this.content);
        this.overlay.appendChild(this.modal);

        // 添加样式
        this.addStyles();
    }

    /**
     * 添加CSS样式
     */
    private addStyles(): void {
        const style = document.createElement('style');
        style.textContent = `
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 9999;
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.3s ease, visibility 0.3s ease;
            }

            .modal-overlay.show {
                opacity: 1;
                visibility: visible;
            }

            .popup-modal {
                position: fixed;
                top: 30px;
                border-radius: 8px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
                max-width: 80vw;
                max-height: 90vh;
                width: 800px;
                height: 600px;
                display: flex;
                flex-direction: column;
                transform: scale(0.7);
                transition: transform 0.3s ease;
            }

            .modal-overlay.show .popup-modal {
                transform: scale(1);
            }

            .modal-header {
                display: flex;
                justify-content: flex-end;
                align-items: center;
                padding: 15px 20px;
                border-bottom: 1px solid #e0e0e0;
                background-color: #f8f9fa;
                border-radius: 8px 8px 0 0;
                cursor: move; /* 添加鼠标指针样式 */
                user-select: none; /* 防止文本选择 */
            }

            .modal-close {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #666;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: background-color 0.2s ease, color 0.2s ease;
            }

            .modal-close:hover {
                background-color: #e9ecef;
                color: #333;
            }

            .modal-content {
                flex: 1;
                padding: 0;
                overflow: hidden;
                border-radius: 0 0 8px 8px;
            }

            .modal-iframe {
                width: 100%;
                height: 100%;
                border: none;
                border-radius: 0 0 8px 8px;
                opacity: 0;
                transition: opacity 0.3s ease;
            }

            .modal-iframe.loaded {
                opacity: 1;
            }

            .loading-background {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-size: cover;
                background-position: center;
                background-repeat: no-repeat;
                transition: opacity 0.8s ease-in-out;
                z-index: 5;
                cursor: move; /* 添加鼠标指针样式 */
                user-select: none; /* 防止文本选择 */
            }

            .loading-background::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-size: cover;
                background-position: center;
                background-repeat: no-repeat;
                background-image: var(--before-bg, none);
                transition: opacity 0.8s ease-in-out;
                z-index: -1;
                opacity: var(--before-bg-opacity, 0);
            }

            .loading-container {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 80%;
                max-width: 400px;
                text-align: center;
                z-index: 10;
                opacity: 1;
                transition: opacity 0.3s ease;
                padding-top: 24px; /* 为百分比文本留出空间 */
            }

            .loading-container.hidden {
                opacity: 0;
                pointer-events: none;
            }

            .loading-background.hidden {
                opacity: 0;
                pointer-events: none;
            }

            .loading-spinner {
                width: 80px;
                height: 80px;
                margin: 0 auto 30px;
                border: 4px solid rgba(255, 255, 255, 0.1);
                border-radius: 50%;
                border-top: 4px solid #007bff;
                border-right: 4px solid #00bcd4;
                border-bottom: 4px solid #4caf50;
                border-left: 4px solid #ff9800;
                animation: spin 1.5s linear infinite, pulse 2s ease-in-out infinite;
                animation-play-state: running !important;
                box-shadow: 0 0 20px rgba(0, 123, 255, 0.3), inset 0 0 10px rgba(255, 255, 255, 0.2);
                /* 确保旋转不受父元素transform影响 */
                will-change: transform;
                /* 提升动画性能 */
                backface-visibility: hidden;
                perspective: 1000;
                position: relative;
            }
            
            .loading-spinner::before {
                content: '';
                position: absolute;
                top: 5px;
                left: 5px;
                right: 5px;
                bottom: 5px;
                border: 2px solid rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                border-top-color: rgba(255, 255, 255, 0.8);
                animation: spin 3s linear infinite reverse;
            }
            
            @keyframes pulse {
                0%, 100% {
                    transform: scale(1);
                    box-shadow: 0 0 20px rgba(0, 123, 255, 0.3), inset 0 0 10px rgba(255, 255, 255, 0.2);
                }
                50% {
                    transform: scale(1.05);
                    box-shadow: 0 0 25px rgba(0, 123, 255, 0.5), inset 0 0 15px rgba(255, 255, 255, 0.3);
                }
            }

            @keyframes spin {
                from {
                    transform: rotate(0deg);
                }
                to {
                    transform: rotate(360deg);
                }
            }

            /* 确保loading-spinner在任何状态下都保持动画 */
            .loading-spinner,
            .loading-container *,
            .loading-background * {
                animation-play-state: running !important;
            }

            .loading-bar {
                width: 100%;
                height: 8px; /* 增加进度条粗细 */
                background-color: rgba(255, 255, 255, 0.2);
                border-radius: 4px;
                overflow: hidden;
                margin-bottom: 15px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                position: relative;
            }

            /* 为百分比文本创建独立容器 */
            .loading-percentage {
                font-size: 16px;
                color: white;
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
                margin-top: 8px;
                margin-bottom: 12px;
                text-align: center;
            }

            .loading-bar-fill {
                height: 100%;
                background: linear-gradient(90deg, #007bff, #0056b3, #007bff);
                border-radius: 2px;
                width: 0%;
                transition: width 0.3s ease;
                z-index: 1; /* 确保在最上层显示 */
                box-shadow: 0 0 8px rgba(0, 123, 255, 0.6); /* 添加发光效果增加可见性 */
            }

            .loading-percentage {
                position: relative;
                margin-top: -18px;
                margin-bottom: 10px;
                margin-left: auto;
                margin-right: 0;
                color: #fff;
                font-size: 14px;
                font-weight: 700;
                background-color: rgba(0, 0, 0, 0.7);
                padding: 4px 8px;
                border-radius: 3px;
                min-width: 50px;
                text-align: center;
                z-index: 1000; /* 确保在最上层显示 */
                display: inline-block;
            }

            .loading-text {
                color: #fff;
                font-size: 14px;
                font-weight: 700;
                margin-top: 10px;
                animation: loading-pulse 1.5s ease-in-out infinite;
            }

            @keyframes loading-pulse {
                0%, 100% {
                    opacity: 0.6;
                }
                50% {
                    opacity: 1;
                }
            }

            @media (max-width: 768px) {
                .modal {
                    width: 95vw;
                    height: 80vh;
                    margin: 10px;
                }

                .loading-container {
                    width: 90%;
                }

                .loading-text {
                    font-size: 13px;
                }
            }
        `;

        document.head.appendChild(style);
    }

    /**
     * 绑定事件
     */
    private bindEvents(): void {
        // 点击关闭按钮关闭弹框
        this.closeButton.addEventListener('click', () => {
            this.close();
        });
        
        // 阻止关闭按钮的拖拽事件冒泡
        this.closeButton.addEventListener('mousedown', (e) => {
            e.stopPropagation();
        });
        
        // 阻止外部屏幕按钮的拖拽事件冒泡
        this.externalScreenButton.addEventListener('mousedown', (e) => {
            e.stopPropagation();
        });
        
        // 为外部屏幕按钮添加点击事件
        this.externalScreenButton.addEventListener('click', () => {
            this.showOnExternalScreen();
        });
        
        // 添加拖拽事件
        const header = this.modal.querySelector('.modal-header') as HTMLElement;
        if (header) {
            header.addEventListener('mousedown', (e) => this.startDrag(e));
        }
        
        // 为 loading-background 添加拖拽事件
        if (this.loadingBackground) {
            this.loadingBackground.addEventListener('mousedown', (e) => this.startDrag(e));
        }

        // 点击遮罩层关闭弹框
        this.overlay.addEventListener('click', (e: MouseEvent) => {
            if (e.target === this.overlay) {
                this.close();
            }
        });

        // ESC键关闭弹框
        document.addEventListener('keydown', (e: KeyboardEvent) => {
            if (e.key === 'Escape' && this.isVisible()) {
                this.close();
            }
        });

        // iframe加载完成事件
        this.iframe.addEventListener('load', () => {
            // 标记iframe已加载完成
            this.isIframeLoaded = true;
            
            // 清除进度更新定时器，防止进度条继续更新
            if (this.loadingProgressInterval) {
                clearInterval(this.loadingProgressInterval);
                this.loadingProgressInterval = null;
            }
            
            // 先将进度条从当前值平滑过渡到99%
            const currentProgress = this.progress;
            const transitionSteps = 5;
            const stepInterval = 50; // 每步之间的延迟
            let currentStep = 0;
            
            const transitionInterval = setInterval(() => {
                currentStep++;
                const progressPercentage = currentProgress + ((99 - currentProgress) * currentStep / transitionSteps);
                this.progress = progressPercentage;
                this.loadingBarFill.style.width = `${progressPercentage}%`;
                this.loadingPercentage.textContent = `${Math.round(progressPercentage)}%`;
                
                // 过渡完成
                if (currentStep >= transitionSteps) {
                    clearInterval(transitionInterval);
                    
                    // 短暂延迟后再设置为100%
                    setTimeout(() => {
                        this.progress = 100;
                        this.loadingBarFill.style.width = '100%';
                        this.loadingPercentage.textContent = '100%';
                        
                        // 再等待一会儿，让用户清晰看到100%的状态，然后再隐藏
                        setTimeout(() => {
                            if (this.isIframeLoaded) {
                                this.hideLoading();
                            }
                        }, 700);
                    }, 300);
                }
            }, stepInterval);
        });

        // iframe加载错误事件
        this.iframe.addEventListener('error', () => {
            // 标记为已加载(错误状态)
            this.isIframeLoaded = true;
            this.hideLoading();
        });
    }

    /**
     * 开始拖拽
     */
    private startDrag(event: MouseEvent): void {
        this.isDragging = true;
        
        // 记录鼠标按下的位置
        this.dragStartX = event.clientX;
        this.dragStartY = event.clientY;
        
        // 记录当前模态框的位置
        const rect = this.modal.getBoundingClientRect();
        this.modalPositionX = rect.left;
        this.modalPositionY = rect.top;
        
        // 添加鼠标移动和释放事件监听
        document.addEventListener('mousemove', this.drag.bind(this));
        document.addEventListener('mouseup', this.endDrag.bind(this));
        
        // 防止默认行为
        event.preventDefault();
    }
    
    /**
     * 拖拽移动
     */
    private drag(event: MouseEvent): void {
        if (!this.isDragging) return;
        
        // 计算鼠标移动的距离
        const deltaX = event.clientX - this.dragStartX;
        const deltaY = event.clientY - this.dragStartY;
        
        // 计算新的位置
        let newX = this.modalPositionX + deltaX;
        let newY = this.modalPositionY + deltaY;
        
        // 限制在可视区域内
        const maxX = window.innerWidth - this.modal.offsetWidth;
        const maxY = window.innerHeight - this.modal.offsetHeight;
        
        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));
        
        // 设置新位置
        this.modal.style.left = `${newX}px`;
        this.modal.style.top = `${newY}px`;
        
        // 防止默认行为
        event.preventDefault();
    }
    
    /**
     * 结束拖拽
     */
    private endDrag(): void {
        this.isDragging = false;
        
        // 移除鼠标移动和释放事件监听
        document.removeEventListener('mousemove', this.drag.bind(this));
        document.removeEventListener('mouseup', this.endDrag.bind(this));
    }
    
    /**
     * 显示加载进度条
     */
    private showLoading(): void {
        this.loadingContainer.classList.remove('hidden');
        this.iframe.classList.remove('loaded');
        this.loadingBackground.classList.remove('hidden');
        
        // 设置初始背景图片
        this.bgImageIndex = 0;
        this.loadingBackground.style.backgroundImage = `url(${this.backgroundImages[this.bgImageIndex]})`;
        // 确保伪元素初始状态为透明
        this.loadingBackground.style.setProperty('--before-bg-opacity', '0');
        
        // 设置背景图片切换间隔
        if (this.bgImageInterval) {
            clearInterval(this.bgImageInterval);
        }
        
        // 使用双重背景层实现无缝切换
        // 延长切换间隔到4秒，确保过渡动画有足够时间完成
        this.bgImageInterval = window.setInterval(() => {
            const nextIndex = (this.bgImageIndex + 1) % this.backgroundImages.length;
            
            // 1. 首先将下一张图片设置到伪元素，并开始淡入
            this.loadingBackground.style.setProperty('--before-bg', `url(${this.backgroundImages[nextIndex]})`);
            this.loadingBackground.style.setProperty('--before-bg-opacity', '1');
            
            // 2. 等待过渡动画完成后，更新主背景并重置伪元素
            setTimeout(() => {
                this.loadingBackground.style.backgroundImage = `url(${this.backgroundImages[nextIndex]})`;
                this.loadingBackground.style.setProperty('--before-bg-opacity', '0');
                this.bgImageIndex = nextIndex;
            }, 800); // 等待过渡动画完成
        }, 4000);
        
        // 初始化状态
        this.isIframeLoaded = false;
        this.progress = 0;
        this.loadingBarFill.style.width = '0%';
        this.loadingPercentage.textContent = '0%';
        
        // 清除之前的进度更新定时器
        if (this.loadingProgressInterval) {
            clearInterval(this.loadingProgressInterval);
        }
        
        // 设置进度更新定时器，模拟iframe加载进度
        this.loadingProgressInterval = window.setInterval(() => {
            const increment = Math.random() * 5; // 随机增加0-5%
            this.progress = Math.min(this.progress + increment, 98);
            
            this.loadingBarFill.style.width = `${this.progress}%`;
            this.loadingPercentage.textContent = `${Math.round(this.progress)}%`;
        }, 200);
        
        // 确保loading只在iframe完全加载完成后才隐藏
        if (this.loadingTimeout) {
            clearTimeout(this.loadingTimeout);
            this.loadingTimeout = null;
        }
    }

    /**
     * 隐藏加载进度条
     */
    private hideLoading(): void {
        // 只有在iframe加载完成或发生错误时才能隐藏loading
        if (!this.isIframeLoaded) {
            return;
        }
        
        if (this.loadingTimeout) {
            clearTimeout(this.loadingTimeout);
            this.loadingTimeout = null;
        }
        
        if (this.bgImageInterval) {
            clearInterval(this.bgImageInterval);
            this.bgImageInterval = null;
        }
        
        if (this.loadingProgressInterval) {
            clearInterval(this.loadingProgressInterval);
            this.loadingProgressInterval = null;
        }
        
        this.loadingContainer.classList.add('hidden');
        this.loadingBackground.classList.add('hidden');
        this.iframe.classList.add('loaded');
    }

    /**
     * 显示弹框并加载指定URL
     * @param url 要加载的URL地址
     */
    public show(url: string): void {
        // 保存当前URL用于外部屏幕显示
        this.currentUrl = url;
        
        // 将弹框添加到页面
        document.body.appendChild(this.overlay);

        // 显示加载进度条
        this.showLoading();

        // 设置iframe的src
        this.iframe.src = url;

        // 触发显示动画
        setTimeout(() => {
            this.overlay.classList.add('show');
        }, 10);

        // 禁止页面滚动
        document.body.style.overflow = 'hidden';
    }
    
    /**
     * 在外部屏幕上显示内容
     */
    private showOnExternalScreen(): void {
        // 如果没有URL，则不执行操作
        if (!this.currentUrl) {
            return;
        }
        
        // 尝试检测是否有多个屏幕
        const screenObj = window.screen as any;
        let left = 0;
        let top = 0;
        let width = screenObj.availWidth;
        let height = screenObj.availHeight;
        
        // 检查是否存在多屏环境
        const hasMultipleScreens = screenObj.availLeft !== 0 || 
                                 (screenObj.availLeft + screenObj.availWidth < window.innerWidth);
        
        if (hasMultipleScreens) {
            // 尝试找到第二个屏幕（通常是右侧屏幕）
            if (screenObj.availLeft + screenObj.availWidth < window.innerWidth) {
                // 屏幕排列为右侧
                left = screenObj.availWidth;
                top = 0;
                width = screenObj.availWidth;
                height = screenObj.availHeight;
            }
        }
        
        // 创建新窗口，使用全屏参数
        const externalWindow = window.open(
            '',
            '_blank',
            `left=${Math.floor(left)},top=${Math.floor(top)},width=${width},height=${height},fullscreen=yes,menubar=no,toolbar=no,location=no,status=no,resizable=yes`
        );
        
        if (externalWindow) {
            // 写入HTML内容，包含iframe、加载动画和背景图片切换效果
            externalWindow.document.write(`
                <!DOCTYPE html>
                <html lang="zh-CN">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>外部显示</title>
                    <style>
                        body, html {
                            margin: 0;
                            padding: 0;
                            width: 100%;
                            height: 100%;
                            overflow: hidden;
                            position: relative;
                        }
                        iframe {
                            width: 100vw;
                            height: 100vh;
                            border: none;
                            display: none;
                            position: absolute;
                            top: 0;
                            left: 0;
                            z-index: 3;
                        }
                        #background-container {
                            position: absolute;
                            top: 0;
                            left: 0;
                            width: 100%;
                            height: 100%;
                            z-index: 1;
                            overflow: hidden;
                        }
                        .background-image {
                            position: absolute;
                            top: 0;
                            left: 0;
                            width: 100%;
                            height: 100%;
                            background-size: cover;
                            background-position: center;
                            opacity: 0;
                            transition: opacity 1s ease-in-out;
                        }
                        .background-image.active {
                            opacity: 1;
                        }
                        .background-overlay {
                            position: absolute;
                            top: 0;
                            left: 0;
                            width: 100%;
                            height: 100%;
                            background-color: rgba(0, 0, 0, 0.5);
                            z-index: 2;
                        }
                        #loading {
                            position: absolute;
                            top: 50%;
                            left: 50%;
                            transform: translate(-50%, -50%);
                            display: flex;
                            flex-direction: column;
                            justify-content: center;
                            align-items: center;
                            color: #fff;
                            font-family: Arial, sans-serif;
                            z-index: 3;
                            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
                        }
                        #loading-spinner {
                            width: 50px;
                            height: 50px;
                            border: 4px solid rgba(255, 255, 255, 0.3);
                            border-top: 4px solid #fff;
                            border-radius: 50%;
                            animation: spin 1s linear infinite;
                            margin-bottom: 20px;
                        }
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                        #loading-text {
                            font-size: 18px;
                            text-align: center;
                            font-weight: 500;
                        }
                    </style>
                </head>
                <body>
                    <div id="background-container">
                        <img class="background-image active" src="/img/epfl-1.jpg" alt="背景图片1">
                        <img class="background-image" src="/img/iss.jpg" alt="背景图片2">
                        <img class="background-image" src="/img/rocket.jpg" alt="背景图片3">
                    </div>
                    <div class="background-overlay"></div>
                    <div id="loading">
                        <div id="loading-spinner"></div>
                        <div id="loading-text">加载中，请稍候...</div>
                    </div>
                    <iframe id="content-frame" src="${this.currentUrl}" allowfullscreen></iframe>
                    <script>
                        const iframe = document.getElementById('content-frame');
                        const loading = document.getElementById('loading');
                        const backgroundImages = document.querySelectorAll('.background-image');
                        let currentImageIndex = 0;
                        
                        // 背景图片切换函数
                        function changeBackgroundImage() {
                            // 隐藏当前图片
                            backgroundImages[currentImageIndex].classList.remove('active');
                            
                            // 更新索引
                            currentImageIndex = (currentImageIndex + 1) % backgroundImages.length;
                            
                            // 显示下一张图片
                            backgroundImages[currentImageIndex].classList.add('active');
                        }
                        
                        // 设置定时器，每5秒切换一次背景图片
                        const backgroundInterval = setInterval(changeBackgroundImage, 5000);
                        
                        iframe.onload = function() {
                            // 清除背景切换定时器
                            clearInterval(backgroundInterval);
                            
                            // 隐藏加载动画，显示iframe
                            loading.style.display = 'none';
                            document.getElementById('background-container').style.display = 'none';
                            document.querySelector('.background-overlay').style.display = 'none';
                            iframe.style.display = 'block';
                        };
                        
                        // 监听错误事件
                        iframe.onerror = function() {
                            const loadingText = document.getElementById('loading-text');
                            loadingText.textContent = '加载失败，请重试';
                            loadingText.style.color = '#ff4444';
                        };
                        
                        // 添加超时处理
                        setTimeout(function() {
                            if (loading.style.display !== 'none') {
                                const loadingText = document.getElementById('loading-text');
                                loadingText.textContent = '加载需要一定时间，请耐心等待...';
                            }
                        }, 5000);
                    </script>
                </body>
                </html>
            `);
            
            externalWindow.document.close();
            
            // 监听窗口关闭事件
            externalWindow.addEventListener('beforeunload', () => {
                // 窗口关闭时可以执行一些清理操作
                console.log('外部显示窗口已关闭');
            });
            
            // 关闭原始弹窗
            this.close();
        } else {
            // 只有一个屏幕，使用全屏模式
            this.enterFullScreenMode();
            // 关闭原始弹窗
            this.close();
        }
    }
    
    /**
     * 在单屏环境下进入全屏模式
     */
    private enterFullScreenMode(): void {
        if (!this.currentUrl) {
            return;
        }
        
        const screenObj = window.screen as any;
        
        // 创建全屏模式的新窗口
        const fullscreenWindow = window.open(
            '',
            '_blank',
            `width=${screenObj.availWidth},height=${screenObj.availHeight},fullscreen=yes,menubar=no,toolbar=no,location=no,status=no,resizable=yes`
        );
        
        if (fullscreenWindow) {
            // 设置窗口标题
            fullscreenWindow.document.title = '全屏显示';
            
            // 写入HTML内容，包含iframe、加载动画和背景图片切换效果
            fullscreenWindow.document.write(`
                    <!DOCTYPE html>
                    <html lang="zh-CN">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>全屏显示</title>
                        <style>
                            body, html {
                                margin: 0;
                                padding: 0;
                                width: 100%;
                                height: 100%;
                                overflow: hidden;
                                position: relative;
                            }
                            iframe {
                                width: 100vw;
                                height: 100vh;
                                border: none;
                                display: none;
                                position: absolute;
                                top: 0;
                                left: 0;
                                z-index: 3;
                            }
                            #background-container {
                                position: absolute;
                                top: 0;
                                left: 0;
                                width: 100%;
                                height: 100%;
                                z-index: 1;
                                overflow: hidden;
                            }
                            .background-image {
                                position: absolute;
                                top: 0;
                                left: 0;
                                width: 100%;
                                height: 100%;
                                background-size: cover;
                                background-position: center;
                                opacity: 0;
                                transition: opacity 1s ease-in-out;
                            }
                            .background-image.active {
                                opacity: 1;
                            }
                            .background-overlay {
                                position: absolute;
                                top: 0;
                                left: 0;
                                width: 100%;
                                height: 100%;
                                background-color: rgba(0, 0, 0, 0.5);
                                z-index: 2;
                            }
                            #loading {
                                position: absolute;
                                top: 50%;
                                left: 50%;
                                transform: translate(-50%, -50%);
                                display: flex;
                                flex-direction: column;
                                justify-content: center;
                                align-items: center;
                                color: #fff;
                                font-family: Arial, sans-serif;
                                z-index: 3;
                                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
                            }
                            #loading-spinner {
                                width: 50px;
                                height: 50px;
                                border: 4px solid rgba(255, 255, 255, 0.3);
                                border-top: 4px solid #fff;
                                border-radius: 50%;
                                animation: spin 1s linear infinite;
                                margin-bottom: 20px;
                            }
                            @keyframes spin {
                                0% { transform: rotate(0deg); }
                                100% { transform: rotate(360deg); }
                            }
                            #loading-text {
                                font-size: 18px;
                                text-align: center;
                                font-weight: 500;
                            }
                        </style>
                    </head>
                    <body>
                        <div id="background-container">
                            <img class="background-image active" src="/img/epfl-1.jpg" alt="背景图片1">
                            <img class="background-image" src="/img/iss.jpg" alt="背景图片2">
                            <img class="background-image" src="/img/rocket.jpg" alt="背景图片3">
                        </div>
                        <div class="background-overlay"></div>
                        <div id="loading">
                            <div id="loading-spinner"></div>
                            <div id="loading-text">加载中，请稍候...</div>
                        </div>
                        <iframe id="content-frame" src="${this.currentUrl}" allowfullscreen></iframe>
                        <script>
                            const iframe = document.getElementById('content-frame');
                            const loading = document.getElementById('loading');
                            const backgroundImages = document.querySelectorAll('.background-image');
                            let currentImageIndex = 0;
                            
                            // 背景图片切换函数
                            function changeBackgroundImage() {
                                // 隐藏当前图片
                                backgroundImages[currentImageIndex].classList.remove('active');
                                
                                // 更新索引
                                currentImageIndex = (currentImageIndex + 1) % backgroundImages.length;
                                
                                // 显示下一张图片
                                backgroundImages[currentImageIndex].classList.add('active');
                            }
                            
                            // 设置定时器，每5秒切换一次背景图片
                            const backgroundInterval = setInterval(changeBackgroundImage, 5000);
                            
                            iframe.onload = function() {
                                // 清除背景切换定时器
                                clearInterval(backgroundInterval);
                                
                                // 隐藏加载动画，显示iframe
                                loading.style.display = 'none';
                                document.getElementById('background-container').style.display = 'none';
                                document.querySelector('.background-overlay').style.display = 'none';
                                iframe.style.display = 'block';
                            };
                            
                            // 监听错误事件
                            iframe.onerror = function() {
                                const loadingText = document.getElementById('loading-text');
                                loadingText.textContent = '加载失败，请重试';
                                loadingText.style.color = '#ff4444';
                            };
                            
                            // 添加超时处理
                            setTimeout(function() {
                                if (loading.style.display !== 'none') {
                                    const loadingText = document.getElementById('loading-text');
                                    loadingText.textContent = '加载较慢，请耐心等待...';
                                }
                            }, 5000);
                        </script>
                    </body>
                    </html>
                `);
            
            fullscreenWindow.document.close();
            
            // 尝试请求全屏
            // try {
            //     if (fullscreenWindow.document.documentElement.requestFullscreen) {
            //         fullscreenWindow.document.documentElement.requestFullscreen();
            //     } else if ((fullscreenWindow.document.documentElement as any).webkitRequestFullscreen) {
            //         (fullscreenWindow.document.documentElement as any).webkitRequestFullscreen();
            //     } else if ((fullscreenWindow.document.documentElement as any).mozRequestFullScreen) {
            //         (fullscreenWindow.document.documentElement as any).mozRequestFullScreen();
            //     } else if ((fullscreenWindow.document.documentElement as any).msRequestFullscreen) {
            //         (fullscreenWindow.document.documentElement as any).msRequestFullscreen();
            //     }
            // } catch (err) {
            //     console.warn('无法请求全屏模式:', err);
            // }
        }
    }

    /**
     * 关闭弹框
     */
    public close(): void {
        // 清除加载超时
        if (this.loadingTimeout) {
            clearTimeout(this.loadingTimeout);
            this.loadingTimeout = null;
        }

        this.overlay.classList.remove('show');

        // 等待动画完成后移除DOM
        setTimeout(() => {
            if (this.overlay.parentNode) {
                document.body.removeChild(this.overlay);
            }
            // 清空iframe src
            this.iframe.src = '';
            // 重置加载状态
            this.loadingContainer.classList.remove('hidden');
            this.iframe.classList.remove('loaded');
            // 恢复页面滚动
            document.body.style.overflow = '';
        }, 300);
    }

    /**
     * 检查弹框是否可见
     */
    public isVisible(): boolean {
        return this.overlay.classList.contains('show');
    }

    /**
     * 设置弹框尺寸
     * @param width 宽度
     * @param height 高度
     */
    public setSize(width: string, height: string): void {
        this.modal.style.width = width;
        this.modal.style.height = height;
    }

    /**
     * 获取iframe元素，用于高级操作
     */
    public getIframe(): HTMLIFrameElement {
        return this.iframe;
    }
}

/**
 * 弹框管理器，提供全局弹框操作
 */
class PopupModalManager {
    private static instance: PopupModalManager;
    private currentModal: PopupModal | null = null;

    private constructor() {}

    /**
     * 获取单例实例
     */
    public static getInstance(): PopupModalManager {
        if (!PopupModalManager.instance) {
            PopupModalManager.instance = new PopupModalManager();
        }
        return PopupModalManager.instance;
    }

    /**
     * 显示弹框
     * @param url 要加载的URL
     * @param options 可选配置
     */
    public showModal(url: string, options?: {
        width?: string;
        height?: string;
    }): PopupModal {
        // 如果已有弹框，先关闭
        if (this.currentModal) {
            this.currentModal.close();
        }

        // 创建新弹框
        this.currentModal = new PopupModal();

        // 设置尺寸
        if (options?.width && options?.height) {
            this.currentModal.setSize(options.width, options.height);
        }

        // 显示弹框
        this.currentModal.show(url);

        return this.currentModal;
    }

    /**
     * 关闭当前弹框
     */
    public closeModal(): void {
        if (this.currentModal) {
            this.currentModal.close();
            this.currentModal = null;
        }
    }

    /**
     * 获取当前弹框
     */
    public getCurrentModal(): PopupModal | null {
        return this.currentModal;
    }
}

// 导出类和便捷函数
export { PopupModal, PopupModalManager };

/**
 * 便捷函数：显示弹框
 * @param url 要加载的URL
 * @param options 可选配置
 */
export function showModal(url: string, options?: {
    width?: string;
    height?: string;
}): PopupModal {
    return PopupModalManager.getInstance().showModal(url, options);
}

/**
 * 便捷函数：关闭弹框
 */
export function closeModal(): void {
    PopupModalManager.getInstance().closeModal();
}