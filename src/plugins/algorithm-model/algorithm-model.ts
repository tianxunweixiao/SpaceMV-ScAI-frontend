import { KeepTrackPlugin } from '../KeepTrackPlugin';
import { keepTrackApi } from '@app/keepTrackApi';
import { getEl } from '@app/lib/get-el';
import { SoundNames } from '../sounds/sounds';
import { ToastMsgType, KeepTrackApiEvents } from '@app/interfaces';
import industryAlgorithmsIcon from '@public/img/icons/industry-algorithms.png';
import thirdPartyToolsIcon from '@public/img/icons/third-party-tools.png';
import agentIcon from '@public/img/icons/agent.png';
import llmIcon from '@public/img/icons/llm.png';

export class AlgorithmModelPlugin extends KeepTrackPlugin {
  readonly id = 'AlgorithmModelPlugin';
  dependencies_ = [];
  bottomIconImg = industryAlgorithmsIcon;
  bottomIconLabel = '算法模型';
  bottomIconElementName = 'menu-algorithm-model';
  sideMenuElementName = 'algorithm-model-menu';
  sideMenuTitle = '算法与模型选择';

  // 设置页面HTML结构
  // 在原有 LLM 模型后面添加 RAG 和 workflow 模型
sideMenuElementHtml = keepTrackApi.html`
  <div id="algorithm-model-menu" class="side-menu-parent start-hidden text-select">
    <div id="algorithm-model-content" class="side-menu">
      <div class="algorithm-model-grid">
        <div class="algorithm-model-item" data-type="third-party">
          <div class="algorithm-model-icon">
            <img src="${thirdPartyToolsIcon}" alt="第三方工具">
          </div>
          <div class="algorithm-model-title">第三方工具</div>
          <div class="algorithm-model-desc">集成外部服务工具</div>
        </div>
        
        <div class="algorithm-model-item" data-type="agent">
          <div class="algorithm-model-icon">
            <img src="${agentIcon}" alt="Agent">
          </div>
          <div class="algorithm-model-title">Agent</div>
          <div class="algorithm-model-desc">语言模型服务</div>
        </div>
        
        <div class="algorithm-model-item" data-type="llm">
          <div class="algorithm-model-icon">
            <img src="${llmIcon}" alt="LLM">
          </div>
          <div class="algorithm-model-title">LLM</div>
          <div class="algorithm-model-desc">智能问答服务</div>
        </div>
      </div>     
    </div>
  </div>

  <!-- 在线Agent聊天内容框 -->
    <div id="agent-chat-container" class="start-hidden">
      <div class="chat-container">
        <div class="chat-layout">
          <!-- 左侧模型选择面板 -->
          <div class="model-selection-panel">
            <div class="model-panel-header">
              <h6>选择模型</h6>
            </div>
            <div class="model-options">
              <div class="model-loading">加载模型列表中...</div>
            </div>
          </div>
          <!-- 右侧聊天区域 -->
          <div class="chat-main">
        <div class="chat-header">
          <h6>与在线Agent对话</h6>
          <button id="close-chat-btn" class="close-btn">×</button>
        </div>
        <div id="chat-messages" class="chat-messages">
          <div class="welcome-message">
            <p>欢迎使用在线Agent，请选择问题：</p>
          </div>
          <div class="suggested-questions">
            <div class="suggested-question" data-question="请分析当前星座的健康状况">请分析当前星座的健康状况</div>
            <div class="suggested-question" data-question="预测未来7天的卫星碰撞风险">预测未来7天的卫星碰撞风险</div>
            <div class="suggested-question" data-question="显示所有在轨故障卫星">显示所有在轨故障卫星</div>
          </div>
        </div>
        <div class="chat-input-area">
          <input type="text" disabled id="user-question" placeholder="输入您的问题..." style="box-shadow:none; border: 1px solid #e0e0e0 !important;"/>
          <button id="send-question-btn" class="send-btn">📤</button>
        </div>
      </div>
    </div>
  </div>
 
`;

// 同时需要在 handleModelSelection 方法中添加对新模型的处理
private handleModelSelection(modelType: string): void {
  switch(modelType) {
    case 'agent':
      keepTrackApi.getUiManager().toast('开发中，敬请期待。', ToastMsgType.standby);
      break;
    case 'llm':
      this.showChatContainer('llm');
      break;
    case 'rag':
      this.showChatContainer('rag');
      break;
    case 'workflow':
      this.showChatContainer('workflow');
      break;
    case 'third-party':
      keepTrackApi.getUiManager().toast('此算法模型已集成于覆盖性分析插件', ToastMsgType.standby);
      break;
  }
}

  // 添加CSS样式
  private addCss() {
    const style = document.createElement('style');

    style.textContent = `
      #algorithm-model-content {
        color: #333;
        height: 100%;
        display: flex;
        flex-direction: column;
      }
      
      .algorithm-model-header h5 {
        margin: 0 0 8px 0;
        color: #f5f5f5;
        font-size: 18px;
        font-weight: 600;
      }
      
      .algorithm-model-description {
        margin: 0;
        color: #7f8c8d;
        font-size: 14px;
      }
      
      .algorithm-model-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
        padding: 20px 15px;
        overflow-y: auto;
        max-height: 100%;
      }
      
      .algorithm-model-item {
        background: #ffffff;
        border: 2px solid #ecf0f1;
        border-radius: 12px;
        padding: 20px 15px;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        position: relative;
        overflow: hidden;
        justify-content: center;
      }
      
      .algorithm-model-item:hover {
        border-color: #3498db;
        transform: translateY(-3px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
      }
      
      /* 禁用状态样式 */
      .algorithm-model-item.disabled {
        opacity: 0.6;
        cursor: not-allowed;
        border-color: #e0e0e0;
        background-color: #f8f9fa;
      }
      
      .algorithm-model-item.disabled:hover {
        border-color: #e0e0e0;
        transform: none;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      }
      
      .algorithm-model-item.disabled:hover .algorithm-model-icon img {
        filter: brightness(0.7);
        transform: none;
      }
      
      .algorithm-model-disabled-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: rgba(255, 255, 255, 0.8);
        border-radius: 10px;
      }
      
      .algorithm-model-disabled-text {
        background-color: #e74c3c;
        color: white;
        padding: 4px 12px;
        border-radius: 15px;
        font-size: 12px;
        font-weight: 600;
      }
      
      .algorithm-model-item.selected {
        border-color: #27ae60;
        background-color: #f0f9f4;
        box-shadow: 0 5px 15px rgba(39, 174, 96, 0.15);
      }
      
      .algorithm-model-icon {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: #f8f9fa;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
      
      .algorithm-model-icon img {
        width: 36px;
        height: 36px;
        object-fit: contain;
        filter: brightness(0.7);
        transition: all 0.3s ease;
      }
      
      .algorithm-model-item:hover .algorithm-model-icon img {
        filter: brightness(1);
        transform: scale(1.1);
      }
      
      .algorithm-model-title {
        font-size: 14px;
        font-weight: 600;
        color: #2c3e50;
        margin: 0;
      }
      
      .algorithm-model-desc {
        font-size: 13px;
        color: #7f8c8d;
        margin: 0;
        line-height: 1.4;
      }
      
      .algorithm-model-footer {
        padding: 15px;
        border-top: 1px solid #e0e0e0;
        background: #f8f9fa;
      }
      
      .selected-model-info {
        font-size: 14px;
        color: #2c3e50;
        text-align: center;
        padding: 10px;
        background: #ffffff;
        border-radius: 8px;
        border: 1px solid #e0e0e0;
      }
      
      /* 在线Agent聊天框样式 */
      #agent-chat-container {
        position: fixed;
        top: 48%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 90%;
        max-width: 900px;
        height: 75vh;
        max-height: 700px;
        background: #ffffff;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        z-index: 1000;
      }
      
      /* 可拖拽区域样式 */
      .chat-header {
        cursor: move;
      }
      
      /* 拖拽过程中禁止选择文本 */
      .dragging {
        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
      }

      .chat-container { 
        display: flex;
        flex-direction: column;
        height: 100%;
      }
      
      .chat-layout {
        display: flex;
        height: 100%;
      }
      
      /* 模型选择面板样式 */
      .model-selection-panel {
        width: 200px;
        background: #f8f9fa;
        border-right: 1px solid #e0e0e0;
        display: flex;
        flex-direction: column;
      }
      
      .model-panel-header {
        padding: 15px;
        background: #ffffff;
      }
      
      .model-panel-header h6 {
        margin: 0;
        color: #2c3e50;
        font-size: 16px;
        font-weight: 600;
      }
      
      .model-options {
        padding: 10px;
        flex: 1;
        overflow-y: auto;
      }
      
      .model-option {
        padding: 12px 15px;
        margin-bottom: 5px;
        background: #ffffff;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 14px;
        color: #2c3e50;
        text-align: left;
      }
      
      .model-option:hover {
        background: #3498db;
        color: #ffffff;
        border-color: #3498db;
      }
      
      .model-option.selected {
        background: #3498db;
        color: #ffffff;
        border-color: #3498db;
      }
      
      /* 模型加载和错误状态样式 */
      .model-loading {
        padding: 12px 15px;
        text-align: center;
        color: #7f8c8d;
        font-size: 14px;
      }
      
      .model-error {
        padding: 12px 15px;
        text-align: center;
        color: #e74c3c;
        font-size: 14px;
      }
      
      /* 主聊天区域样式 */
      .chat-main {
        flex: 1;
        display: flex;
        flex-direction: column;
      }
      
      .chat-header {
        padding: 20px;
        border-bottom: 1px solid #e0e0e0;
        background: #f8f9fa;
        border-radius: 12px 12px 0 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .chat-header h6 {
        margin: 0;
        color: #2c3e50;
        font-size: 18px;
        font-weight: 600;
      }
      
      .close-btn {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #7f8c8d;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.3s ease;
      }
      
      .close-btn:hover {
        background: #e0e0e0;
        color: #2c3e50;
      }
      
      .chat-messages {
        flex: 1;
        padding: 20px;
        overflow-y: auto;
        background: #fafafa;
      }
      
      .welcome-message {
        padding: 8px 12px;
        background: #ffffff;
        border-radius: 8px;
        border: 1px solid #e0e0e0;
      }
      
      .welcome-message p {
        margin: 0;
        color: #2c3e50;
        font-size: 14px;
      }
      
      .suggested-questions {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-bottom: 20px;
        padding: 10px 0;
      }
      
      .suggested-question {
        padding: 4px 12px;
        background: #e3f2fd;
        border: 1px solid #bbdefb;
        border-radius: 25px;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 12px;
        color: #1565c0;
        text-align: left;
        max-width: 80%;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        display: inline-block;
        flex: none;
        line-height: 1.2;
      }
      
      .suggested-question:hover {
        background: #2196f3;
        color: #ffffff;
        border-color: #1976d2;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
        white-space: normal;
        overflow: visible;
        max-width: 90%;
        z-index: 10;
      }
      
      .chat-input-area {
        padding: 20px;
        border-top: 1px solid #e0e0e0;
        display: flex;
        align-items: center;
        gap: 10px;
        background: #f8f9fa;
        border-radius: 0 0 12px 12px;
      }
      
      #user-question {
        flex: 1;
        padding: 12px 16px;
        border: 1px solid #e0e0e0;
        border-radius: 25px;
        font-size: 14px;
        outline: none;
        transition: border-color 0.3s ease;
        color: #333333; /* 设置文字颜色为深灰色，确保清晰可见 */
      }
      
      #user-question:focus {
        border-color: #3498db;
      }
      
      .send-btn {
        width: 32px;
        height: 32px;
        padding: 0;
        background: #3498db;
        color: #ffffff;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        font-size: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
      }
      
      .send-btn:hover {
        background: #2980b9;
        transform: translateY(-2px);
      }
      
      /* 发送按钮禁用状态样式 */
      .send-btn.disabled {
        background: #cccccc;
        cursor: not-allowed;
      }
      
      .send-btn.disabled:hover {
        background: #cccccc;
        transform: none;
      }
      
      .message {
        margin-bottom: 15px;
        padding: 12px 16px;
        border-radius: 12px;
        max-width: 80%;
        word-wrap: break-word;
      }
      
      .user-message {
        background: #3498db;
        color: #ffffff;
        margin-left: auto;
        border-bottom-right-radius: 4px;
      }
      
      .agent-message {
        background: #ffffff;
        color: #2c3e50;
        border: 1px solid #e0e0e0;
        border-bottom-left-radius: 4px;
      }
      
      .message-loading {
        display: flex;
        gap: 4px;
        align-items: center;
      }
      
      .loading-dot {
        width: 8px;
        height: 8px;
        background: #3498db;
        border-radius: 50%;
        animation: loading 1.4s infinite ease-in-out both;
      }
      
      .loading-dot:nth-child(1) {
        animation-delay: -0.32s;
      }
      
      .loading-dot:nth-child(2) {
        animation-delay: -0.16s;
      }
      
      @keyframes loading {
        0%, 80%, 100% {
          transform: scale(0);
        }
        40% {
          transform: scale(1.0);
        }
      }
      
      /* 响应式聊天框 */
      @media (max-width: 768px) {
        #agent-chat-container {
          width: 95%;
          height: 90vh;
          top: 5%;
          left: 50%;
          transform: translateX(-50%);
        }
      }
      
      /* 响应式设计 */
    @media (max-width: 768px) {
      .algorithm-model-grid {
        grid-template-columns: 1fr;
        gap: 12px;
      }
      
      .algorithm-model-item {
        padding: 15px 10px;
      }
      
      .algorithm-model-icon {
        width: 50px;
        height: 50px;
      }
      
      .algorithm-model-icon img {
        width: 30px;
        height: 30px;
      }
    }

    /* iframe弹窗样式 */
    .agent-iframe-overlay {
      animation: fadeIn 0.3s ease;
    }
    
    .agent-iframe-modal {
      animation: scaleIn 0.3s ease;
    }
    
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
    
    @keyframes scaleIn {
      from {
        transform: scale(0.95);
        opacity: 0;
      }
      to {
        transform: scale(1);
        opacity: 1;
      }
    }
    
    /* 响应式iframe弹窗 */
    @media (max-width: 768px) {
      .agent-iframe-modal {
        width: 95%;
        height: 95vh;
        max-width: none;
      }
    }
    `;
    document.head.appendChild(style);
  }

  // 添加JavaScript逻辑
  addJs(): void {
    super.addJs();

    // 添加CSS样式
    this.addCss();

    // 等待UI加载完成
    keepTrackApi.on(KeepTrackApiEvents.uiManagerFinal, () => {
      this.setupEventListeners();
    });
  }

  // 设置事件监听器
  private setupEventListeners(): void {
    const modelItems = document.querySelectorAll('.algorithm-model-item');
    
    // 移除对selectedInfo元素的依赖，确保事件监听器始终能设置
    modelItems.forEach(item => {
      item.addEventListener('click', () => {
        // 检查是否禁用
        if (item.classList.contains('disabled')) {
          keepTrackApi.getUiManager().toast('此模型功能暂不可用', ToastMsgType.caution);
          return;
        }
        
        // 移除所有选中状态
        modelItems.forEach(i => i.classList.remove('selected'));
        
        // 添加选中状态
        item.classList.add('selected');
        
        // 获取模型类型和标题
        const modelType = item.getAttribute('data-type') || '';
        const modelTitle = item.querySelector('.algorithm-model-title')?.textContent || '';
        const modelDesc = item.querySelector('.algorithm-model-desc')?.textContent || '';
        
        // 尝试更新选中信息，如果元素存在的话
        const selectedInfo = getEl('selected-model-info') as HTMLElement;
        if (selectedInfo) {
          selectedInfo.innerHTML = `
            <div style="font-weight: 600; color: #27ae60;">已选择: ${modelTitle}</div>
            <div style="font-size: 13px; color: #7f8c8d; margin-top: 5px;">${modelDesc}</div>
          `;
        }
        
        // 播放选择声音
        keepTrackApi.getSoundManager()?.play(SoundNames.TOGGLE_ON);
        
        // 这里可以添加处理选择不同模型类型的逻辑
        this.handleModelSelection(modelType);
      });
    });
  }

  // 显示包含iframe的大型弹窗
  private showIframeModal(url: string, title: string): void {
    // 检查是否已存在弹窗，如果存在则先移除
    const existingModal = document.getElementById('agent-iframe-modal');
    if (existingModal) {
      document.body.removeChild(existingModal);
    }

    // 创建背景遮罩
    const overlay = document.createElement('div');
    overlay.id = 'agent-iframe-overlay';
    overlay.className = 'agent-iframe-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.background = 'rgba(0, 0, 0, 0.7)';
    overlay.style.zIndex = '9999';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.backdropFilter = 'blur(4px)';

    // 创建弹窗容器
    const modal = document.createElement('div');
    modal.id = 'agent-iframe-modal';
    modal.className = 'agent-iframe-modal';
    modal.style.position = 'relative';
    modal.style.width = '90%';
    modal.style.maxWidth = '1400px';
    modal.style.height = '90vh';
    modal.style.maxHeight = '900px';
    modal.style.background = 'white';
    modal.style.borderRadius = '12px';
    modal.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.3)';
    modal.style.overflow = 'hidden';

    // 创建弹窗头部
    const modalHeader = document.createElement('div');
    modalHeader.className = 'agent-iframe-modal-header';
    modalHeader.style.display = 'flex';
    modalHeader.style.justifyContent = 'space-between';
    modalHeader.style.alignItems = 'center';
    modalHeader.style.padding = '15px 20px';
    modalHeader.style.background = '#f8f9fa';
    modalHeader.style.borderBottom = '1px solid #e9ecef';

    // 创建标题
    const modalTitle = document.createElement('h3');
    modalTitle.textContent = title;
    modalTitle.style.margin = '0';
    modalTitle.style.color = '#2c3e50';
    modalTitle.style.fontSize = '18px';

    // 创建按钮容器
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.gap = '10px';
    
    // 创建显示到另一屏幕按钮
    const externalScreenBtn = document.createElement('button');
    externalScreenBtn.id = 'external-screen-btn';
    externalScreenBtn.textContent = '分屏展示';
    externalScreenBtn.style.background = '#3498db';
    externalScreenBtn.style.color = 'white';
    externalScreenBtn.style.border = 'none';
    externalScreenBtn.style.borderRadius = '4px';
    externalScreenBtn.style.padding = '6px 12px';
    externalScreenBtn.style.cursor = 'pointer';
    externalScreenBtn.style.fontSize = '14px';
    externalScreenBtn.style.transition = 'background-color 0.2s ease';
    externalScreenBtn.onmouseover = (e) => {
      const target = e.target as HTMLElement;
      target.style.background = '#2980b9';
    };
    externalScreenBtn.onmouseout = (e) => {
      const target = e.target as HTMLElement;
      target.style.background = '#3498db';
    };
    externalScreenBtn.addEventListener('click', () => {
      this.showOnExternalScreen(url, title);
    });

    // 创建关闭按钮
    const closeBtn = document.createElement('button');
    closeBtn.id = 'close-iframe-modal-btn';
    closeBtn.textContent = '×';
    closeBtn.style.background = 'none';
    closeBtn.style.border = 'none';
    closeBtn.style.fontSize = '24px';
    closeBtn.style.color = '#7f8c8d';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.padding = '0';
    closeBtn.style.width = '32px';
    closeBtn.style.height = '32px';
    closeBtn.style.display = 'flex';
    closeBtn.style.alignItems = 'center';
    closeBtn.style.justifyContent = 'center';
    closeBtn.style.borderRadius = '50%';
    closeBtn.style.transition = 'all 0.2s ease';
    closeBtn.onmouseover = (e) => {
      const target = e.target as HTMLElement;
      target.style.background = '#e9ecef';
      target.style.color = '#2c3e50';
    };

    closeBtn.onmouseout = (e) => {
      const target = e.target as HTMLElement;
      target.style.background = 'none';
      target.style.color = '#7f8c8d';
    };

    // 添加关闭事件
    closeBtn.addEventListener('click', () => this.hideIframeModal());

    // 创建iframe容器
    const iframeContainer = document.createElement('div');
    iframeContainer.style.width = '100%';
    iframeContainer.style.height = 'calc(100% - 55px)';
    iframeContainer.style.overflow = 'hidden';

    // 创建iframe
    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.style.display = 'block';

    // 组装元素
    buttonContainer.appendChild(externalScreenBtn);
    buttonContainer.appendChild(closeBtn);
    modalHeader.appendChild(modalTitle);
    modalHeader.appendChild(buttonContainer);
    iframeContainer.appendChild(iframe);
    modal.appendChild(modalHeader);
    modal.appendChild(iframeContainer);
    overlay.appendChild(modal);

    // 添加点击背景关闭弹窗的功能
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        this.hideIframeModal();
      }
    });

    // 添加键盘Esc关闭功能
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.hideIframeModal();
        document.removeEventListener('keydown', handleEsc);
      }
    };
    document.addEventListener('keydown', handleEsc);

    // 添加到文档
    document.body.appendChild(overlay);
  }

  // 在外部屏幕上显示iframe内容
  private showOnExternalScreen(url: string, title: string): void {
    // 检查是否有多个屏幕可用
    if (window.screen.availWidth <= window.innerWidth && window.screen.availHeight <= window.innerHeight) {
      // 只有一个屏幕可用，使用全屏模式
      this.enterFullScreenMode(url, title);
      return;
    }

    // 计算外部屏幕的位置和大小
    let left = 0;
    let top = 0;
    let width = 0;
    let height = 0;

    // 尝试找到第二个屏幕（通常是右侧屏幕）
    const screenObj = window.screen as any;
    if (screenObj.availLeft + screenObj.availWidth < window.innerWidth) {
      // 屏幕排列为右侧
      left = screenObj.availWidth;
      top = 0;
      width = screenObj.availWidth;
      height = screenObj.availHeight;
    } else {
      // 默认使用最大可用屏幕尺寸
      width = screenObj.availWidth;
      height = screenObj.availHeight;
    }

    // 创建一个新窗口在外部屏幕上
    const externalWindow = window.open(
      '',
      '_blank',
      `left=${left},top=${top},width=${width},height=${height},fullscreen=yes`
    );

    if (externalWindow) {
      // 设置窗口标题
      externalWindow.document.title = title;
      
      // 创建全屏iframe
      externalWindow.document.body.style.margin = '0';
      externalWindow.document.body.style.padding = '0';
      externalWindow.document.body.style.overflow = 'hidden';
      
      const iframe = externalWindow.document.createElement('iframe');
      iframe.src = url;
      iframe.style.width = '100vw';
      iframe.style.height = '100vh';
      iframe.style.border = 'none';
      iframe.style.display = 'block';
      
      externalWindow.document.body.appendChild(iframe);
      
      // 尝试请求全屏（如果浏览器支持）
      if (externalWindow.document.documentElement.requestFullscreen) {
        try {
          externalWindow.document.documentElement.requestFullscreen();
        } catch (err) {
          console.warn('无法请求全屏模式:', err);
        }
      }
      
      // 添加窗口关闭事件监听，清除模型选择
      externalWindow.addEventListener('beforeunload', () => {
        // 清除所有算法模型选择项的选中状态
        const modelItems = document.querySelectorAll('.algorithm-model-item');
        modelItems.forEach(item => {
          item.classList.remove('selected');
        });

        // 重置选中模型信息显示
        const selectedInfo = getEl('selected-model-info') as HTMLElement;
        if (selectedInfo) {
          selectedInfo.innerHTML = `
            <div style="font-size: 14px; color: #7f8c8d;">请选择一个算法或模型类型</div>
          `;
        }
      });
    }
  }

  // 进入全屏模式
  private enterFullScreenMode(url: string, title: string): void {
    // 在当前屏幕创建全屏模式的新窗口
    const fullScreenWindow = window.open(
      '',
      '_blank',
      'width=' + screen.availWidth + ',height=' + screen.availHeight + ',fullscreen=yes'
    );

    if (fullScreenWindow) {
      // 设置窗口标题
      fullScreenWindow.document.title = title;
      
      // 创建全屏iframe
      fullScreenWindow.document.body.style.margin = '0';
      fullScreenWindow.document.body.style.padding = '0';
      fullScreenWindow.document.body.style.overflow = 'hidden';
      
      const iframe = fullScreenWindow.document.createElement('iframe');
      iframe.src = url;
      iframe.style.width = '100vw';
      iframe.style.height = '100vh';
      iframe.style.border = 'none';
      iframe.style.display = 'block';
      
      fullScreenWindow.document.body.appendChild(iframe);
      
      // 尝试请求全屏
      if (fullScreenWindow.document.documentElement.requestFullscreen) {
        try {
          fullScreenWindow.document.documentElement.requestFullscreen();
        } catch (err) {
          console.warn('无法请求全屏模式:', err);
        }
      }
    }
  }

  // 隐藏iframe弹窗并清除Agent选择
  private hideIframeModal(): void {
    const overlay = document.getElementById('agent-iframe-overlay');
    const modal = document.getElementById('agent-iframe-modal');

    // 移除弹窗和遮罩
    if (overlay && modal) {
      // 添加淡出动画效果
      overlay.style.transition = 'opacity 0.3s ease';
      modal.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
      modal.style.transform = 'scale(0.95)';
      modal.style.opacity = '0';
      overlay.style.opacity = '0';

      // 动画结束后移除元素
      setTimeout(() => {
        if (overlay && document.body.contains(overlay)) {
          document.body.removeChild(overlay);
        }
      }, 300);
    }

    // 清除所有算法模型选择项的选中状态
    const modelItems = document.querySelectorAll('.algorithm-model-item');
    modelItems.forEach(item => {
      item.classList.remove('selected');
    });

    // 重置选中模型信息显示
    const selectedInfo = getEl('selected-model-info') as HTMLElement;
    if (selectedInfo) {
      selectedInfo.innerHTML = `
        <div style="font-size: 14px; color: #7f8c8d;">请选择一个算法或模型类型</div>
      `;
    }
  }

  // 显示聊天内容框
  private showChatContainer(modelType: string = 'online-agent'): void {
    const chatContainer = document.getElementById('agent-chat-container');
    if (chatContainer) {
      chatContainer.classList.remove('start-hidden');
      
      // 清除当前对话内容，根据模型类型设置不同的欢迎信息和建议问题
      const chatMessages = document.getElementById('chat-messages');
      const chatHeaderTitle = chatContainer.querySelector('.chat-header h6');
      
      if (chatMessages && chatHeaderTitle) {
        // 初始化当前选择的模型为空，等待从ollama加载
        this.currentModel = '';
        
        // 从ollama获取模型列表
        this.loadModelsFromOllama();
        
        let welcomeMessage = '';
        let suggestedQuestionsHtml = '';
        
        // LLM的欢迎信息和问题
        chatHeaderTitle.textContent = '对话';
        welcomeMessage = '欢迎使用语言模型服务，请选择一个问题：';
        suggestedQuestionsHtml = `
          <div class="suggested-question" data-question="什么是TLE文件？">什么是TLE文件？</div>
          <div class="suggested-question" data-question="太阳同步轨道卫星的特点是什么？">太阳同步轨道卫星的特点是什么？</div>
          <div class="suggested-question" data-question="简述GPS系统的构成">简述GPS系统的构成</div>
        `;
        
        chatMessages.innerHTML = `
          <div class="welcome-message">
            <p>${welcomeMessage}</p>
          </div>
          <div class="suggested-questions">
            ${suggestedQuestionsHtml}
          </div>
        `;
      }
      
      // 设置关闭按钮事件
      const closeBtn = document.getElementById('close-chat-btn');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => this.hideChatContainer());
      }
      
      // 添加拖拽功能
      this.setupChatContainerDrag();
      
      // 设置建议问题点击事件和发送按钮事件
      const suggestedQuestions = document.querySelectorAll('.suggested-question');
      const userQuestionInput = document.getElementById('user-question') as HTMLInputElement;
      const sendBtn = document.getElementById('send-question-btn');
      
      // 确保输入框可交互
      if (userQuestionInput) {
        userQuestionInput.disabled = false;
      }
      
      suggestedQuestions.forEach(question => {
        question.addEventListener('click', () => {
          const questionText = question.getAttribute('data-question') || '';
          if (userQuestionInput) {
            userQuestionInput.value = questionText;
            userQuestionInput.focus(); // 自动聚焦到输入框
          }
        });
      });
      
      if (sendBtn && userQuestionInput) {
        sendBtn.addEventListener('click', () => {
          if (userQuestionInput.value.trim()) {
            this.sendQuestion(userQuestionInput.value.trim());
            userQuestionInput.value = '';
          }
        });
        
        // 回车发送
        userQuestionInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter' && userQuestionInput.value.trim()) {
            this.sendQuestion(userQuestionInput.value.trim());
            userQuestionInput.value = '';
          }
        });
      }
    }
  }

  // 隐藏聊天内容框并清除模型选择
  private hideChatContainer(): void {
    const chatContainer = document.getElementById('agent-chat-container');
    const overlay = document.getElementById('agent-chat-overlay');
    
    // 隐藏聊天窗口
    if (chatContainer) {
      chatContainer.classList.add('start-hidden');
    }
    if (overlay) {
      document.body.removeChild(overlay);
    }
    
    // 清除所有算法模型选择项的选中状态
    const modelItems = document.querySelectorAll('.algorithm-model-item');
    modelItems.forEach(item => {
      item.classList.remove('selected');
    });
    
    // 重置选中模型信息显示
    const selectedInfo = getEl('selected-model-info') as HTMLElement;
    if (selectedInfo) {
      selectedInfo.innerHTML = `
        <div style="font-size: 14px; color: #7f8c8d;">请选择一个算法或模型类型</div>
      `;
    }
  }

  // 设置聊天容器的拖拽功能
  private setupChatContainerDrag(): void {
    const chatContainer = document.getElementById('agent-chat-container');
    const chatHeader = chatContainer?.querySelector('.chat-header') as HTMLElement;
    
    if (!chatContainer || !chatHeader) return;
    
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;
    
    // 鼠标按下事件 - 开始拖拽
    chatHeader.addEventListener('mousedown', (e) => {
      // 如果点击的是关闭按钮，则不触发拖拽
      if ((e.target as HTMLElement).closest('#close-chat-btn')) {
        return;
      }
      
      isDragging = true;
      
      // 获取鼠标相对于聊天容器的偏移量
      const rect = chatContainer.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      
      // 添加拖拽中样式
      document.body.classList.add('dragging');
      
      // 提高聊天容器的z-index，确保在拖拽过程中在最上层
      const originalZIndex = chatContainer.style.zIndex;
      chatContainer.style.zIndex = '1001';
      
      // 鼠标移动事件 - 拖拽过程
      const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;
        
        // 计算新的位置，确保聊天容器不会超出视口
        const newLeft = Math.max(0, Math.min(window.innerWidth - chatContainer.offsetWidth, e.clientX - offsetX));
        const newTop = Math.max(0, Math.min(window.innerHeight - chatContainer.offsetHeight, e.clientY - offsetY));
        
        // 设置新的位置（移除transform，改用left和top）
        chatContainer.style.transform = 'none';
        chatContainer.style.left = `${newLeft}px`;
        chatContainer.style.top = `${newTop}px`;
      };
      
      // 鼠标松开事件 - 结束拖拽
      const handleMouseUp = () => {
        isDragging = false;
        document.body.classList.remove('dragging');
        chatContainer.style.zIndex = originalZIndex;
        
        // 移除临时事件监听器
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
      
      // 添加临时事件监听器
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      // 防止文本选择
      e.preventDefault();
    });
  }
  
  // 当前选择的模型
  private currentModel: string = 'deepseek-14b';

  // AbortController实例，用于控制流式请求的中止
  private abortController: AbortController | null = null;

  // 从ollama获取模型列表
  private async loadModelsFromOllama(): Promise<void> {
    const modelOptionsContainer = document.querySelector('.model-options');
    if (!modelOptionsContainer) return;

    try {
      // 通过后端代理获取模型列表
      const apiUrl = settingsManager.dataSources.tianxunServer + '/ollama/models';
      
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      const models = data.models || [];

      if (models.length === 0) {
        modelOptionsContainer.innerHTML = '<div class="model-error">未找到可用模型</div>';
        return;
      }

      // 清空加载状态
      modelOptionsContainer.innerHTML = '';

      // 创建模型选项
      models.forEach((model: any, index: number) => {
        const modelOption = document.createElement('div');
        modelOption.className = 'model-option';
        modelOption.setAttribute('data-model', model.name);
        modelOption.textContent = model.name;

        // 默认选中第一个模型
        if (index === 0) {
          modelOption.classList.add('selected');
          this.currentModel = model.name;
        }

        // 添加点击事件
        modelOption.addEventListener('click', () => {
          const allOptions = modelOptionsContainer.querySelectorAll('.model-option');
          allOptions.forEach(opt => opt.classList.remove('selected'));
          modelOption.classList.add('selected');
          this.currentModel = model.name;
        });

        modelOptionsContainer.appendChild(modelOption);
      });
    } catch (error) {
      console.error('获取模型列表失败:', error);
      modelOptionsContainer.innerHTML = '<div class="model-error">加载模型列表失败</div>';
    }
  }

  // 发送问题并获取回复
  private sendQuestion(question: string): void {
    const chatMessages = document.getElementById('chat-messages');
    if (chatMessages) {
      const welcomeMessage = document.querySelector('.welcome-message') as HTMLElement;
      
      if (welcomeMessage) welcomeMessage.style.display = 'none';
      
      // 添加用户问题到聊天记录
      const userMessage = document.createElement('div');
      userMessage.className = 'message user-message';
      userMessage.textContent = question;
      chatMessages.appendChild(userMessage);
      
      // 添加加载状态
      const loadingMessage = document.createElement('div');
      loadingMessage.className = 'message agent-message message-loading';
      loadingMessage.innerHTML = `
        <span class="loading-dot"></span>
        <span class="loading-dot"></span>
        <span class="loading-dot"></span>
      `;
      chatMessages.appendChild(loadingMessage);
      
      // 滚动到底部
      chatMessages.scrollTop = chatMessages.scrollHeight;
      
      // 禁用发送按钮
      const sendButton = document.getElementById('send-question-btn');
      if (sendButton) {
        // sendButton.disabled = true;
        sendButton.classList.add('disabled');
      }
      
      // 调用实际的流式接口
      this.callStreamingApi(question, chatMessages, loadingMessage);
    }
  }

  // 停止流式响应
  private stopStreaming(): void {
    // 中止请求
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    
    // 从UI中移除停止按钮
    const stopButton = document.querySelector('.stop-streaming-btn');
    if (stopButton) {
      stopButton.remove();
    }
    
    // 恢复发送按钮的显示
    const sendButton = document.getElementById('send-question-btn');
    if (sendButton) {
      // sendButton.disabled = false;
      sendButton.classList.remove('disabled');
      sendButton.style.display = 'inline-block';
    }
  }

  // 调用流式API获取回复
  private callStreamingApi(question: string, chatMessages: HTMLElement, loadingMessage: HTMLElement): void {
    // 取消之前可能存在的请求
    if (this.abortController) {
      this.abortController.abort();
    }

    // 创建新的AbortController实例
    this.abortController = new AbortController();
    const signal = this.abortController.signal;

    // 流式接口地址
    const apiUrl:string = settingsManager.dataSources.tianxunServer + '/generate_stream_ollama';
    
    // 使用当前选择的模型名称
    const modelName = this.currentModel || 'deepseek-r1:14b-qwen-distill-fp16';

    // 请求参数
    const requestBody = {
      inputs: question,
      model_name: modelName
    };
    
    // 移除加载状态并创建思考过程和结果元素
    chatMessages.removeChild(loadingMessage);
    
    let thoughtContainer: HTMLElement;
    let thoughtContent: HTMLElement;
    let inThoughtProcess = true; // 标记是否在思考过程中
    
    // 创建CSS样式
    const style = document.createElement('style');
    style.textContent = `
      .loading-dots {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 40px;
      }
      .loading-dots span {
          animation: loading-dots 1.4s infinite ease-in-out both;
          display: inline-block;
          font-size: 20px;
          margin: 0 3px;
          color: #4A90E2;
        }
      .loading-dots span:nth-child(1) {
        animation-delay: -0.32s;
        background: linear-gradient(45deg, #4A90E2, #50E3C2);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
      }
      .loading-dots span:nth-child(2) {
        animation-delay: -0.16s;
        background: linear-gradient(45deg, #50E3C2, #F5A623);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
      }
      .loading-dots span:nth-child(3) {
        background: linear-gradient(45deg, #F5A623, #D0021B);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
      }
      @keyframes loading-dots {
          0%, 80%, 100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1.3);
          }
        }
      /* 思考过程容器美化样式 */
      .thought-process {
        background-color: #f8f9fa;
        border: 1px solid #e9ecef;
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 10px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      }
      .thought-label {
        font-weight: 600;
        color: #333;
        margin-bottom: 10px;
        font-size: 14px;
      }
      .thought-content {
        line-height: 1.6;
        color: #495057;
        font-size: 13px;
        white-space: pre-wrap;
        word-wrap: break-word;
      }
      /* 最终回答容器美化样式 */
      .final-result {
        background-color: #f0f7ff;
        border: 1px solid #d0e3ff;
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 10px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      }
      .result-label {
        font-weight: 600;
        color: #2c5aa0;
        margin-bottom: 10px;
        font-size: 14px;
      }
      .result-content {
        line-height: 1.6;
        color: #2c3e50;
        font-size: 13px;
        white-space: pre-wrap;
        word-wrap: break-word;
      }
    `;
    
    // 只对包含deepseek的模型创建思考过程容器
    if (modelName.toLowerCase().includes('deepseek')) {
      // 创建思考过程容器
      thoughtContainer = document.createElement('div');
      thoughtContainer.className = 'message agent-message thought-process';
      thoughtContainer.innerHTML = '<div class="thought-label">思考过程<span class="loading-dots"><span>.</span><span>.</span><span>.</span></span></div><div class="thought-content"></div>';
      thoughtContainer.appendChild(style);
      chatMessages.appendChild(thoughtContainer);
      
      // 获取思考过程内容容器
      thoughtContent = thoughtContainer.querySelector('.thought-content') as HTMLElement;
    } else {
      // 对于其他模型，不创建思考过程容器，直接设置为非思考过程状态
      inThoughtProcess = false;
      document.head.appendChild(style); // 将样式添加到文档头部
    }
    
    // 获取聊天输入区域
    const chatInputArea = document.querySelector('.chat-input-area');
    if (chatInputArea) {
      // 创建停止按钮
      const stopButton = document.createElement('button');
      stopButton.className = 'stop-streaming-btn';
      // 创建蓝色圆圈背景和红色停止按钮的组合
      stopButton.innerHTML = `
        <div style="
          background: #3498db;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            background: #e74c3c;
            width: 10px;
            height: 10px;
            border-radius: 2px;
          "></div>
        </div>
      `;
      stopButton.style.width = '32px';
      stopButton.style.height = '32px';
      stopButton.style.padding = '0';
      stopButton.style.background = 'transparent';
      stopButton.style.color = '#ffffff';
      stopButton.style.border = 'none';
      stopButton.style.borderRadius = '50%';
      stopButton.style.cursor = 'pointer';
      stopButton.style.display = 'flex';
      stopButton.style.alignItems = 'center';
      stopButton.style.justifyContent = 'center';
      stopButton.style.transition = 'all 0.3s ease';
      stopButton.style.outline = 'none';
      stopButton.style.display = 'none'; // 初始隐藏停止按钮
      
      /* 停止按钮禁用状态样式 */
      const stopButtonStyle = document.createElement('style');
      stopButtonStyle.textContent = `
        .stop-streaming-btn.disabled {
          cursor: not-allowed !important;
        }
        
        .stop-streaming-btn.disabled:hover {
          transform: none !important;
          box-shadow: none !important;
        }
        
        .stop-streaming-btn.disabled div {
          background: #cccccc !important;
        }
        
        .stop-streaming-btn.disabled div div {
          background: #aaaaaa !important;
        }
      `;
      document.head.appendChild(stopButtonStyle);
      
      // 停止按钮悬停效果
      stopButton.onmouseover = () => {
        const blueCircle = stopButton.querySelector('div');
        if (blueCircle) {
          blueCircle.style.background = '#2980b9'; // 深蓝色
        }
        stopButton.style.transform = 'translateY(-1px)';
        stopButton.style.boxShadow = '0 4px 12px rgba(52, 152, 219, 0.3)';
      };
      
      stopButton.onmouseout = () => {
        const blueCircle = stopButton.querySelector('div');
        if (blueCircle) {
          blueCircle.style.background = '#3498db'; // 蓝色
        }
        stopButton.style.transform = 'translateY(0)';
        stopButton.style.boxShadow = 'none';
      };
      
      // 添加停止按钮点击事件
      stopButton.addEventListener('click', () => {
        this.stopStreaming();
      });
      
      // 将停止按钮添加到聊天输入区域
      chatInputArea.appendChild(stopButton);
    }

    // 创建最终结果容器
    const resultContainer = document.createElement('div');
    resultContainer.className = 'message agent-message final-result';
    resultContainer.innerHTML = `
      <div class="result-content">
        <div class="loading-dots">
          <span class="loading-dot">.</span>
          <span class="loading-dot">.</span>
          <span class="loading-dot">.</span>
        </div>
      </div>
    `;
    
    // 添加loading-dots的动画样式以确保最终回复的loading正确显示
    const loadingStyle = document.createElement('style');
    loadingStyle.textContent = `
      /* 确保两种loading-dots都能正确显示 */
      .message.agent-message.final-result .loading-dots {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 40px;
      }
      .message.agent-message.final-result .loading-dots .loading-dot {
        font-size: 24px;
        font-weight: bold;
        background: linear-gradient(45deg, #4A90E2, #D0021B);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        animation: loading-dots 1.4s infinite ease-in-out both;
      }
      .message.agent-message.final-result .loading-dots .loading-dot:nth-child(1) {
        animation-delay: -0.32s;
        background: linear-gradient(45deg, #4A90E2, #50E3C2);
      }
      .message.agent-message.final-result .loading-dots .loading-dot:nth-child(2) {
        animation-delay: -0.16s;
        background: linear-gradient(45deg, #50E3C2, #F5A623);
      }
      .message.agent-message.final-result .loading-dots .loading-dot:nth-child(3) {
        background: linear-gradient(45deg, #F5A623, #D0021B);
      }
    `;
    document.head.appendChild(loadingStyle);
    resultContainer.style.display = inThoughtProcess ? 'none' : 'block'; // 根据是否在思考过程中决定是否显示
    chatMessages.appendChild(resultContainer);
    
    // 获取最终结果内容容器
    const resultContent = resultContainer.querySelector('.result-content') as HTMLElement;
    
    // 滚动到底部
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // 设置是否已收到第一条内容的标志
    let firstContentReceived = false;
    
    // 发送请求
    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody),
      signal: signal
    }).then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法获取响应流读取器');
      }

      const decoder = new TextDecoder();

      // 读取流数据
      function readStream() {
        reader?.read().then(({ done, value }) => {
          if (done) {
            return;
          }
          
          // 解码接收到的数据
          const chunk = decoder.decode(value, { stream: true });
          
          try {
            // 解析每一行数据
            const lines = chunk.split('\n');
            for (const line of lines) {
              if (line.trim()) {
                // 尝试解析JSON
                try {
                  // 检查是否有data:前缀并处理
                  let jsonData = line;
                  if (line.startsWith('data:')) {
                    jsonData = line.substring('data:'.length);
                  }
                  const dataObj = JSON.parse(jsonData);
                   
                  // 处理文本内容 - 从token.text中提取
                  if (dataObj.token && dataObj.token.text && typeof dataObj.token.text === 'string') {
                    let text = dataObj.token.text;
                    
                    // 检查是否是结束标记，如果是则不显示
                    if (text === '<｜end▁of▁sentence｜>') {
                      // 结束标记，处理结束逻辑
                      // 隐藏停止按钮并恢复发送按钮
                      if (firstContentReceived) {
                        // 移除停止按钮
                        const stopButton = document.querySelector('.stop-streaming-btn');
                        if (stopButton) {
                          stopButton.remove();
                        }
                        
                        // 恢复发送按钮的显示
                        const sendButton = document.getElementById('send-question-btn');
                        if (sendButton) {
                          sendButton.classList.remove('disabled');
                          sendButton.style.display = 'inline-block';
                        }
                      }
                      return;
                    }
                    
                    // 在收到第一条内容时隐藏发送按钮并显示停止按钮
                    if (!firstContentReceived && text !== '<｜end▁of▁sentence｜>') {
                      firstContentReceived = true;
                      
                      // 隐藏发送按钮
                      const sendButton = document.getElementById('send-question-btn');
                      if (sendButton) {
                        sendButton.style.display = 'none';
                      }
                      
                      // 显示停止按钮
                      const stopButton = document.querySelector('.stop-streaming-btn') as HTMLElement;
                      if (stopButton) {
                        stopButton.style.display = 'inline-block';
                      }
                      
                      // 移除最终回复div中的loading状态并清空容器
                      const loadingDots = resultContent.querySelector('.loading-dots');
                      if (loadingDots) {
                        loadingDots.remove();
                        // 清空resultContent，确保没有残留的空白
                        resultContent.innerHTML = '';
                      }
                    }
                    
                    // 只对包含deepseek的模型检查思考过程结束标记
                    if (modelName.toLowerCase().includes('deepseek') && inThoughtProcess && text.includes('</think>')) {
                      // 分割文本
                      const parts = text.split('</think>');
                        
                      // 隐藏loading图标
                      const loadingDots = thoughtContainer.querySelector('.loading-dots') as HTMLElement;
                      if (loadingDots) {
                        loadingDots.style.display = 'none';
                      }
                        
                      // 添加标记前的内容到思考过程（先移除所有换行符）
                      if (parts[0]) {
                        // 移除标记前内容中的所有换行符
                        thoughtContent.innerHTML += parts[0].replace(/\n/g, '');
                      }
                        
                      // 更新状态为最终回答
                      inThoughtProcess = false;
                        
                      // 显示最终回答模块
                      resultContainer.style.display = 'block';
                        
                      // 更严格地检查思考过程内容是否为空或只有空白字符
                      // 1. 获取纯文本内容（移除所有HTML标签）
                      const tempDiv = document.createElement('div');
                      tempDiv.innerHTML = thoughtContent.innerHTML;
                      const plainText = tempDiv.textContent || tempDiv.innerText || '';
                        
                      // 2. 检查是否有实际内容
                      const hasContent = plainText.trim() !== '';
                      if (!hasContent) {
                        // 如果没有实际内容，则隐藏思考过程模块
                        thoughtContainer.style.display = 'none';
                      }
                        
                      // 处理标记后的内容，移除所有开头的连续空白字符
                      if (parts[1]) {
                        let finalAnswerText = parts[1];
                        // 使用正则表达式移除字符串开头的所有空白字符（包括换行符、空格等）
                        finalAnswerText = finalAnswerText.replace(/^\s+/, '');
                        // 再替换剩余的换行符为<br>
                        finalAnswerText = finalAnswerText.replace(/\n/g, '<br>');
                        resultContent.innerHTML += finalAnswerText;
                      }
                    } else {
                      // 对于包含deepseek的模型，隐藏loading图标
                      if (modelName.toLowerCase().includes('deepseek')) {
                        const loadingDots = thoughtContainer.querySelector('.loading-dots') as HTMLElement;
                        if (loadingDots) {
                          loadingDots.style.display = 'none';
                        }
                      }
                        
                      // 根据模型类型和当前状态添加文本
                      if (modelName.toLowerCase().includes('deepseek') && inThoughtProcess) {
                        // 对于deepseek模型，思考过程中添加文本，替换换行符
                        thoughtContent.innerHTML += text.replace(/\n/g, '<br>');
                      } else {
                        // 显示最终回答模块（特别是对于qwen模型）
                        resultContainer.style.display = 'block';
                        // 对于qwen模型或非思考过程，直接添加到最终回答
                        resultContent.innerHTML += text.replace(/\n/g, '<br>');
                      }
                    }
                  }
                } catch (jsonError) {
                  // 如果JSON解析失败，可能是因为接收到了不完整的数据块
                  console.log('JSON解析错误:', jsonError);
                }
              }
            }
          } catch (error) {
            console.error('处理流数据时出错:', error);
          }
          
          // 滚动到底部
          chatMessages.scrollTop = chatMessages.scrollHeight;
          
          // 继续读取
          readStream();
        }).catch(error => {
          // 检查是否是AbortError（用户主动停止）
          if (error.name === 'AbortError') {
            console.log('用户主动停止了流式响应');
            resultContent.innerHTML += '<br><span style="color: #7f8c8d;">(响应已停止)</span>';
          } else {
            console.error('读取流时出错:', error);
            resultContent.innerHTML = '<span style="color: red;">获取回复时出错，请稍后再试。</span>';
          }
          chatMessages.scrollTop = chatMessages.scrollHeight;
        });
      }
      
      // 开始读取流
      readStream();
    }).catch(error => {
      // 检查是否是AbortError（用户主动停止）
      if (error.name === 'AbortError') {
        console.log('用户主动停止了流式请求');
        resultContent.innerHTML += '<br><span style="color: #7f8c8d;">(请求已停止)</span>';
      } else {
        console.error('发送请求时出错:', error);
        resultContent.innerHTML = `<span style="color: red;">发送请求失败：${error.message}</span>`;
      }
      chatMessages.scrollTop = chatMessages.scrollHeight;
    });
  }
  // 初始化插件
  init(): void {
    super.init();
  }
}
