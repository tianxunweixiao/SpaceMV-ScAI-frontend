import { KeepTrackApiEvents } from '@app/interfaces';
import { keepTrackApi } from '@app/keepTrackApi';
import { CameraType } from '../../singletons/camera';
import { getEl, hideEl } from '@app/lib/get-el';
import { adviceManagerInstance } from '@app/singletons/adviceManager';
import fullscreenPng from '@public/img/icons/fullscreen.png';
import helpPng from '@public/img/icons/help.png';
import layersPng from '@public/img/icons/layers.png';
import searchPng from '@public/img/icons/search.png';
import refreshPng from '@public/img/icons/refresh.png'
import soundOffPng from '@public/img/icons/sound-off.png';
import soundOnPng from '@public/img/icons/sound-on.png';
import zoomIconPng from '@public/img/icons/zoom-icon.png';
import userPng from '@public/img/icons/person.png';
import logoutPng from '@public/img/icons/external.png';
import { authService } from '../../auth/authService';

import { errorManagerInstance } from '../../singletons/errorManager';
import { KeepTrackPlugin } from '../KeepTrackPlugin';

export class TopMenu extends KeepTrackPlugin {
  readonly id = 'TopMenu';
  dependencies_ = [];
  static readonly SEARCH_RESULT_ID = 'search-results';

  addHtml() {
    super.addHtml();
    keepTrackApi.on(
      KeepTrackApiEvents.uiManagerInit,
      () => {
        getEl('keeptrack-header')?.insertAdjacentHTML(
          'beforeend',
          keepTrackApi.html`
            <nav>
              <div id="nav-wrapper" class="nav-wrapper" style="display: flex; justify-content: flex-end;">
                <ul id="nav-mobile2" class="right">
                  <li>
                    <a id="user-manual-btn" class="top-menu-icons" title="用户手册">
                      <div id="user-manual-icon" class="top-menu-icons">
                        <img src="" delayedsrc="${helpPng}" alt="" />
                      </div>
                    </a>
                  </li>
                  <li>
                    <a id="sound-btn" class="top-menu-icons" title="切换声音">
                      <div class="top-menu-icons bmenu-item-selected">
                        <img id="sound-icon"
                        src="" delayedsrc="${soundOnPng}" alt="" />
                      </div>
                    </a>
                  </li>
                  <li>
                    <a id="legend-menu" class="top-menu-icons" title="图层控制">
                      <div id="legend-icon" class="top-menu-icons">
                        <img src=${layersPng} alt="" />
                      </div>
                    </a>
                  </li>
                  <li>
                    <a id="tutorial-btn" class="top-menu-icons bmenu-item-disabled" style="display: none;">
                      <div id="tutorial-icon" class="top-menu-icons">
                        <img src=${helpPng} alt="" />
                      </div>
                    </a>
                  </li>
                  <li>
                    <a id="fullscreen-icon" class="top-menu-icons"><img src=${fullscreenPng} alt="" /></a>
                  </li>
                  <li>
                    <a id="zoom-earth-button" class="top-menu-icons" title="画布缩小">
                      <div id="zoom-icon" class="top-menu-icons">
                        <img id="zoom-icon"
                          src="" delayedsrc="${zoomIconPng}" alt="" />
                      </div>
                    </a>
                  </li>
                  <li>
                    <a id="search-icon" class="top-menu-icons" title="查找卫星">
                      <img
                        alt="search-icon"
                        src="" delayedsrc="${searchPng}"
                      />
                    </a>
                  </li>
                  <li>
                    <a id="refresh-icon" class="top-menu-icons" title="全局刷新">
                      <img
                        alt="refresh-icon"
                        src="" delayedsrc="${refreshPng}"
                      />
                    </a>
                  </li>
                  <li id="user-menu" style="display: none;position: relative;">
                    <a id="user-icon" class="top-menu-icons" title="用户菜单">
                      <img
                        alt="user-icon"
                        src="" delayedsrc="${userPng}"
                      />
                    </a>
                    <div id="user-dropdown" class="dropdown-content" style="display: none; background: var(--color-dark-background); border: 1px solid var(--color-dark-border); border-radius: 6px;">
                      <div id="user-info" class="user-info-section" style="padding: 12px 16px; border-bottom: 1px solid var(--color-dark-border); margin-bottom: 0;">
                        <div id="username-display" style="font-weight: 500; color: var(--colorWhite, #ffffff); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">用户名</div>
                        <div id="user-email" style="font-size: 0.85em; color: var(--color-dark-text-muted, #6b6b6b); margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">user@example.com</div>
                      </div>
                      <div id="logout-btn" class="logout-button" style="padding: 8px 16px; color: var(--colorWhite, #ffffff); transition: all 0.3s; border-radius: 4px; margin: 4px; background-color: transparent;">
                        <img src="" delayedsrc="${logoutPng}" style="width: 20px; height: 20px; margin-right: 8px; vertical-align: middle;" />
                        登出
                      </div>
                    </div>
                  </li>
                  <div id="search-holder" class="menu-item search-slide-up">
                    <input id="search" type="search" name="search" placeholder="Search.." required />
                  </div>
                </ul>
              </div>
            </nav>
            <style>
              .logout-button:hover {
                background-color: rgba(255, 107, 107, 0.1) !important;
                color: #ff6b6b !important;
              }
              .logout-button {
                cursor: pointer;
                display: flex;
                align-items: center;
              }
            </style>
          `,
        );

        // Advice only applies to things in the bottom menu
        if (settingsManager.isDisableBottomMenu) {
          keepTrackApi.on(
            KeepTrackApiEvents.uiManagerFinal,
            () => {
              hideEl('tutorial-btn');
            },
          );

          return;
        }

        keepTrackApi.containerRoot?.insertAdjacentHTML(
          'beforeend',
          keepTrackApi.html`
            <div id="help-outer-container" class="valign">
              <div id="help-screen" class="valign-wrapper">
                <div id="help-inner-container" class="valign">
                  <p>
                    <span id="help-header" class="logo-font">TITLE</span>
                  </p>
                  <span id="help-text">ADVICE</span>
                </div>
              </div>
            </div>
          `,
        );

        adviceManagerInstance.init();
      },
    );
  }

  addJs() {
    super.addJs();
    keepTrackApi.on(
      KeepTrackApiEvents.uiManagerFinal,
      () => {
        getEl('sound-btn')!.onclick = () => {
          const soundIcon = <HTMLImageElement>getEl('sound-icon');
          const soundManager = keepTrackApi.getSoundManager();

          if (!soundManager) {
            errorManagerInstance.warn('SoundManager is not enabled. Check your settings!');

            return;
          }

          if (!soundManager.isMute) {
            soundManager.isMute = true;
            soundIcon.src = soundOffPng;
            soundIcon.parentElement!.classList.remove('bmenu-item-selected');
            soundIcon.parentElement!.classList.add('bmenu-item-error');
          } else {
            soundManager.isMute = false;
            soundIcon.src = soundOnPng;
            soundIcon.parentElement!.classList.add('bmenu-item-selected');
            soundIcon.parentElement!.classList.remove('bmenu-item-error');
          }
        };

        // Zoom Earth Button
        getEl('zoom-earth-button')!.onclick = (event) => {
          event.stopPropagation();
          // 使用鼠标滚轮缩放逻辑来实现地球缩放效果
          const camera = keepTrackApi.getMainCamera();
          
          if (camera) {
            // 如果当前在卫星跟踪模式，退出该模式以确保正确显示地球
            if (camera.cameraType === CameraType.FIXED_TO_SAT) {
              camera.exitFixedToSat();
            }
            
            // 实现分阶段缩小效果
            // delta值为100表示缩小（远离地球），相当于鼠标滚轮向后滚动
            const totalSteps = 15; // 总步数
            const stepDelta = 250; // 每步的delta值
            const stepDelay = 20; // 每步之间的延迟（毫秒）
            
            let currentStep = 0;
            const stepZoom = () => {
              if (currentStep < totalSteps) {
                camera.zoomWheel(stepDelta);
                currentStep++;
                setTimeout(stepZoom, stepDelay);
              }
            };
            
            // 开始分阶段缩放
            stepZoom();
          } 
        };
        
        // Add click event for refresh button to refresh page without URL parameters
        getEl('refresh-icon')!.onclick = () => {
          // window.location.href = window.location.origin + window.location.pathname;
          window.location.href = '/';
        };

        // 用户菜单和登出按钮逻辑
        const userMenu = getEl('user-menu');
        const userIcon = getEl('user-icon');
        const userDropdown = getEl('user-dropdown');
        const logoutBtn = getEl('logout-btn');

        // 检查用户认证状态并显示/隐藏用户菜单
        function checkUserAuth() {
          if (authService.isAuthenticated()) {
            userMenu!.style.display = 'block';
            // 显示用户信息
            updateUserInfo();
          } else {
            userMenu!.style.display = 'none';
          }
        }

        // 更新用户信息显示
        function updateUserInfo() {
          const currentUser = authService.getCurrentUser();
          const usernameDisplay = getEl('username-display');
          const userEmail = getEl('user-email');
          
          if (currentUser && usernameDisplay && userEmail) {
            // 优先显示name，如果没有则使用email或username
            const displayName = currentUser.name || currentUser.email || '用户';
            const email = currentUser.email || '';
            
            usernameDisplay.textContent = displayName;
            userEmail.textContent = email;
          } else {
            // 尝试从localStorage直接获取，以防authService未正确初始化
            try {
              const savedUser = localStorage.getItem('user-info');
              if (savedUser) {
                const userData = JSON.parse(savedUser);
                if (usernameDisplay) usernameDisplay.textContent = userData.name || userData.username || '用户';
                if (userEmail) userEmail.textContent = userData.email || '';
              }
            } catch (error) {
              console.error('Failed to parse user data from localStorage:', error);
            }
          }
        }

        // 初始化时检查用户认证状态
        checkUserAuth();

        // 监听用户登录/登出事件
        keepTrackApi.on(KeepTrackApiEvents.userLogin, checkUserAuth);
        keepTrackApi.on(KeepTrackApiEvents.userLogout, checkUserAuth);

        // 用户图标点击事件
        userIcon!.onclick = (event) => {
          event.stopPropagation();
          // 确保userMenu可见的情况下才显示下拉菜单
          if (userMenu!.style.display !== 'none') {
            // 直接设置为'block'，并设置opacity为1，避免状态判断问题
            userDropdown!.style.display = 'block';
            userDropdown!.style.opacity = '1';
          }
        };

        // 登出按钮点击事件
        logoutBtn!.onclick = async (event) => {
          event.stopPropagation(); // 阻止事件冒泡
          
          // 创建确认对话框
          const overlay = document.createElement('div');
          overlay.className = 'logout-confirm-overlay';
          overlay.style.cssText = `
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
          `;
          
          const modal = document.createElement('div');
          modal.className = 'logout-confirm-modal';
          modal.style.cssText = `
            background-color: white;
            border-radius: 8px;
            padding: 24px;
            width: 400px;
            max-width: 90vw;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          `;
          
          const modalHeader = document.createElement('div');
          modalHeader.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
          `;
          
          const titleContainer = document.createElement('div');
          titleContainer.style.cssText = `
            display: flex;
            align-items: center;
            gap: 8px;
          `;
          
          const icon = document.createElement('span');
          icon.textContent = '⚠️';
          icon.style.fontSize = '24px';
          
          const title = document.createElement('h3');
          title.textContent = '确认退出登录?';
          title.style.margin = '0';
          title.style.color = '#333';
          
          titleContainer.appendChild(icon);
          titleContainer.appendChild(title);
          
          const closeBtn = document.createElement('button');
          closeBtn.textContent = '×';
          closeBtn.style.cssText = `
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #999;
            padding: 0;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
          `;
          
          closeBtn.onmouseover = () => {
            closeBtn.style.background = '#f0f0f0';
            closeBtn.style.color = '#666';
          };
          
          closeBtn.onmouseout = () => {
            closeBtn.style.background = 'none';
            closeBtn.style.color = '#999';
          };
          
          modalHeader.appendChild(titleContainer);
          modalHeader.appendChild(closeBtn);
          
          const message = document.createElement('p');
          message.textContent = '退出登录后，仍可继续登录此账号';
          message.style.color = '#666';
          message.style.marginBottom = '24px';
          
          const buttonContainer = document.createElement('div');
          buttonContainer.style.cssText = `
            display: flex;
            justify-content: flex-end;
            gap: 12px;
          `;
          
          const cancelBtn = document.createElement('button');
          cancelBtn.textContent = '取消';
          cancelBtn.style.cssText = `
            padding: 8px 20px;
            border: 1px solid #d9d9d9;
            border-radius: 4px;
            background: white;
            color: #666;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.3s;
          `;
          
          cancelBtn.onmouseover = () => {
            cancelBtn.style.borderColor = '#40a9ff';
            cancelBtn.style.color = '#40a9ff';
          };
          
          cancelBtn.onmouseout = () => {
            cancelBtn.style.borderColor = '#d9d9d9';
            cancelBtn.style.color = '#666';
          };
          
          const logoutConfirmBtn = document.createElement('button');
          logoutConfirmBtn.textContent = '退出登录';
          logoutConfirmBtn.style.cssText = `
            padding: 8px 20px;
            border: none;
            border-radius: 4px;
            background: #1890ff;
            color: white;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.3s;
          `;
          
          logoutConfirmBtn.onmouseover = () => {
            logoutConfirmBtn.style.background = '#40a9ff';
          };
          
          logoutConfirmBtn.onmouseout = () => {
            logoutConfirmBtn.style.background = '#1890ff';
          };
          
          buttonContainer.appendChild(cancelBtn);
          buttonContainer.appendChild(logoutConfirmBtn);
          
          modal.appendChild(modalHeader);
          modal.appendChild(message);
          modal.appendChild(buttonContainer);
          overlay.appendChild(modal);
          document.body.appendChild(overlay);
          
          // 关闭对话框的函数
          const closeDialog = () => {
            if (overlay.parentNode) {
              document.body.removeChild(overlay);
            }
          };
          
          // 绑定关闭事件
          closeBtn.onclick = closeDialog;
          cancelBtn.onclick = closeDialog;
          
          // 点击遮罩层关闭
          overlay.onclick = (e) => {
            if (e.target === overlay) {
              closeDialog();
            }
          };
          
          // 登出确认
          logoutConfirmBtn.onclick = async () => {
            closeDialog();
            await authService.logout();
          };
          
          // ESC键关闭
          const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
              closeDialog();
              document.removeEventListener('keydown', handleEsc);
            }
          };
          
          document.addEventListener('keydown', handleEsc);
          
          // 清理函数
          modal.onclick = (e) => e.stopPropagation();
        };

        // 点击页面其他地方关闭下拉菜单
        document.addEventListener('click', () => {
          userDropdown!.style.display = 'none';
          userDropdown!.style.opacity = '0'; // 同时恢复opacity
        });

        // 阻止下拉菜单点击事件冒泡
        userDropdown!.addEventListener('click', (event) => {
          event.stopPropagation();
        });

        // 用户手册按钮点击事件
        getEl('user-manual-btn')!.onclick = (event) => {
          event.stopPropagation();
          // 在新窗口中打开用户手册HTML页面
          window.open(import.meta.env.USER_MANUAL_URL, '_blank');
        };
      },
    );

    keepTrackApi.on(KeepTrackApiEvents.setSensor, this.updateSensorName.bind(this));
  }

  updateSensorName() {
    const sensorSelectedDom = getEl('sensor-selected', true);

    if (sensorSelectedDom) {
      const sensorTitle = keepTrackApi.getSensorManager()?.sensorTitle;

      // If this.sensorTitle is empty hide the div
      if (!sensorTitle || sensorTitle === '') {
        sensorSelectedDom.parentElement!.style.display = 'none';
      } else {
        sensorSelectedDom.innerText = sensorTitle;
        sensorSelectedDom.parentElement!.style.display = 'block';
      }
    }
  }
}
