// 编辑成功弹框组件
export class SuccessModal {
  private modalElement: HTMLDivElement;
  private messageElement: HTMLParagraphElement;
  private closeButton: HTMLButtonElement;
  private overlay: HTMLDivElement;
  
  constructor() {
    // 创建弹框元素
    this.modalElement = document.createElement('div');
    this.modalElement.id = 'success-modal';
    
    // 创建消息元素
    this.messageElement = document.createElement('p');
    this.messageElement.id = 'success-message';
    
    // 创建关闭按钮
    this.closeButton = document.createElement('button');
    this.closeButton.id = 'close-modal';
    this.closeButton.textContent = '确定';
    this.closeButton.addEventListener('click', () => this.close());
    
    // 创建半透明遮罩层
    this.overlay = document.createElement('div');
    this.overlay.id = 'modal-overlay';
    this.overlay.addEventListener('click', () => this.close());
    
    // 组装弹框
    this.modalElement.appendChild(this.messageElement);
    this.modalElement.appendChild(this.closeButton);
    
    // 添加样式
    this.applyStyles();
  }
  
  // 显示弹框
  public show(message: string = '信息编辑成功！'): void {
    this.messageElement.textContent = message;
    document.body.appendChild(this.overlay);
    document.body.appendChild(this.modalElement);
    
    // 添加动画效果
    setTimeout(() => {
      this.modalElement.style.opacity = '1';
      this.modalElement.style.transform = 'translate(-50%, -50%) scale(1)';
      this.overlay.style.opacity = '1';
    }, 10);
  }
  
  // 关闭弹框
  public close(): void {
    this.modalElement.style.opacity = '0';
    this.modalElement.style.transform = 'translate(-50%, -50%) scale(0.9)';
    this.overlay.style.opacity = '0';
    
    // 动画结束后移除元素
    setTimeout(() => {
      if (document.body.contains(this.modalElement)) {
        document.body.removeChild(this.modalElement);
      }
      if (document.body.contains(this.overlay)) {
        document.body.removeChild(this.overlay);
      }
    }, 300);
  }
  
  // 应用样式
  private applyStyles(): void {
    const style = document.createElement('style');
    style.textContent = `
      #modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 999;
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      
      #success-modal {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0.9);
        width: 300px;
        padding: 25px;
        background-color: white;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        text-align: center;
        opacity: 0;
        transition: all 0.3s ease;
      }
      
      #success-message {
        font-size: 18px;
        color: #333;
        margin-bottom: 20px;
        line-height: 1.5;
      }
      
      #close-modal {
        background-color: #4CAF50;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 16px;
        transition: background-color 0.3s;
      }
      
      #close-modal:hover {
        background-color: #45a049;
      }
      
      .success-icon {
        font-size: 48px;
        color: #4CAF50;
        margin-bottom: 15px;
      }
    `;
    document.head.appendChild(style);
  }
}

// 创建SVG成功图标
function createSuccessIcon(): SVGSVGElement {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("width", "48");
  svg.setAttribute("height", "48");
  svg.classList.add("success-icon");
  
  const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  circle.setAttribute("cx", "12");
  circle.setAttribute("cy", "12");
  circle.setAttribute("r", "10");
  circle.setAttribute("fill", "none");
  circle.setAttribute("stroke", "#4CAF50");
  circle.setAttribute("stroke-width", "2");
  
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", "M7 13l3 3 7-7");
  path.setAttribute("stroke", "#4CAF50");
  path.setAttribute("stroke-width", "2");
  path.setAttribute("fill", "none");
  path.setAttribute("stroke-linecap", "round");
  
  svg.appendChild(circle);
  svg.appendChild(path);
  return svg;
}

// 使用示例
document.addEventListener('DOMContentLoaded', () => {
  // 创建弹框实例
  const successModal = new SuccessModal();
  
  // 添加演示按钮
  const demoButton = document.createElement('button');
  demoButton.textContent = '测试编辑成功弹框';
  demoButton.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 10px 20px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
    z-index: 100;
  `;
  
  demoButton.addEventListener('click', () => {
    // 显示弹框
    successModal.show('用户信息已成功更新！');
  });
  
  document.body.appendChild(demoButton);
  
  // 在弹框中添加SVG图标
  const modal = document.getElementById('success-modal');
  if (modal) {
    const icon = createSuccessIcon();
    modal.insertBefore(icon, modal.firstChild);
  }
});