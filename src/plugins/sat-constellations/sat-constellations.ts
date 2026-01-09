import { getEl, showEl, hideEl } from '@app/lib/get-el';
import { KeepTrackApiEvents, MenuMode, ToastMsgType } from '@app/interfaces';
import { keepTrackApi } from '@app/keepTrackApi';
import { GroupType } from '@app/singletons/object-group';
import { CatalogLoader } from '@app/static/catalog-loader';
import categoryPng from '@public/img/icons/category.png';
import { ClickDragOptions, KeepTrackPlugin } from '../KeepTrackPlugin';
import { SelectSatManager } from '../select-sat-manager/select-sat-manager';
import { settingsManager } from '../../settings/settings';

export class SatConstellations extends KeepTrackPlugin {
  readonly id = 'SatConstellations';
  dependencies_: string[] = [SelectSatManager.name];

  private readonly additionalConstellations_ = [] as {
    groupName: string;
    groupType: GroupType;
    groupValue: number[] | RegExp;
    groupSlug: string;
  }[];

  // 存储当前点击的星座ID
  private clickedConstellationId_: string | null = null;

  menuMode: MenuMode[] = [MenuMode.BASIC, MenuMode.ADVANCED, MenuMode.ALL];

  bottomIconImg = categoryPng;
  bottomIconElementName: string = 'menu-constellations';
  sideMenuElementName: string = 'constellations-menu';
  sideMenuElementHtml: string = keepTrackApi.html`
  <div id="constellations-menu" class="side-menu-parent text-select">
    <div id="constellation-menu" class="side-menu">
      <h5 class="center-align">Constellations</h5>
      <!-- 星座分类按钮 -->
      <div id="constellation-categories" class="side-menu-categories">
        <div class="categories-container">
          <div>
            <div id="category-1" class="category-header selected" data-category="1">
              <div class="category-header-content">
                <span class="category-title">导航星座</span>
                <div class="category-controls">
                  <span class="category-toggle">▼</span>
                </div>
                <div class="category-underline"></div>
              </div>
              <span class="category-add-icon" id="add-constellation-1">+</span>
            </div>
            <ul id="constellation-list-1" class="category-list">
            </ul>
          </div>
          <div>
            <div id="category-2" class="category-header" data-category="2">
              <div class="category-header-content">
                <span class="category-title">通信星座</span>
                <div class="category-controls">
                  <span class="category-toggle">▼</span>
                </div>
                <div class="category-underline"></div>
                </div>
              <span class="category-add-icon" id="add-constellation-2">+</span>
            </div>
            <ul id="constellation-list-2" class="category-list">
            </ul>
          </div>
          <div>
            <div id="category-3" class="category-header" data-category="3">
              <div class="category-header-content">
                <span class="category-title">对地观测星座</span>
                <div class="category-controls">
                  <span class="category-toggle">▼</span>
                </div>
                <div class="category-underline"></div>
              </div>
              <span class="category-add-icon" id="add-constellation-3">+</span>
            </div>
            <ul id="constellation-list-3" class="category-list">
            </ul>
          </div>
          <div>
            <div id="category-4" class="category-header" data-category="4">
              <div class="category-header-content">
                <span class="category-title">自定义星座</span>
                <div class="category-controls">
                  <span class="category-toggle">▼</span>
                </div>
                <div class="category-underline"></div>
              </div>
              <span class="category-add-icon" id="add-constellation-4">+</span>
            </div>
            <ul id="constellation-list-4" class="category-list">
            </ul>
          </div>
        </div>
      </div>
  </div>
    <!-- 星座导入模块 -->
    <div id="constellation-settings" class="side-menu-settings" style="display: none; position: absolute;left: 282px;">
      <div class="close-button-container" style="position: absolute; top: 10px; right: 10px; z-index: 10;">
        <div id="close-constellation-settings" class="btn btn-floating btn-small red" style="height: 24px; width: 24px; min-width: 24px; display: flex; align-items: center; justify-content: center;">
          <i class="material-icons" style="font-size: 16px;">close</i>
        </div>
      </div>
      <h5 class="center-align">星座导入</h5>
      <div class="divider"></div>
      
      <!-- TLE文件导入功能 -->
      <div class="row">
        <div class="col s12 import-tip">选择包含卫星TLE数据的.json文件以导入星座。</div>
      </div>
      
      <div class="row">
        <div class="col s12">
          <div class="row" style="margin-bottom: 5px;">
            <div class="col s6">
              <input type="file" id="sat-con-tle-file-input" accept=".txt" style="display: none;" />
              <label for="sat-con-tle-file-input" class="btn btn-ui waves-effect waves-light" 
                style="width: 100%; padding: 0 12px; min-height: 36px; display: flex; align-items: center; justify-content: center; line-height: 36px; white-space: nowrap;">
                <i class="material-icons left" style="font-size: 16px; margin-right: 4px; vertical-align: middle;">file_upload</i> 选择
              </label>
            </div>
            <div class="col s6">
              <button id="sat-con-import-button" class="btn btn-small btn-ui waves-effect waves-light" disabled style="width: 100%; padding-left: 5px; padding-right: 5px;">
                <i class="material-icons left" style="font-size: 16px; margin-right: 2px;">import_export</i> 导入
              </button>
            </div>
          </div>
          <div id="sat-con-selected-file-name" class="file-path-wrapper" style="margin-top: 5px;">
            <div id="sat-con-file-name-display" class="file-name-display" 
              style="color: black; word-wrap: break-word; white-space: normal; height: auto; padding: 8px; background-color: #f5f5f5; border-radius: 2px;">未选择文件</div>
          </div>
        </div>
      </div>
      
      <div class="row">
        <div class="col s12">
          <div id="sat-con-file-content-preview" class="file-preview-container start-hidden">
            <h6>文件内容预览：</h6>
            <pre id="sat-con-file-content" class="file-content"></pre>
          </div>
        </div>
      </div>
    </div>
  </div>
  `;

  dragOptions: ClickDragOptions = {
    isDraggable: true,
  };
  selectedCategory: number | number[];

  addHtml(): void {
    super.addHtml();

    keepTrackApi.on(
      KeepTrackApiEvents.uiManagerFinal,
      () => {
        // Add additional constellations
        getEl('constellations-menu')!.querySelector('ul')!.insertAdjacentHTML(
          'beforeend',
          this.additionalConstellations_
            .map((constellation) => `<li class="menu-selectable" data-group="${constellation.groupSlug}">${constellation.groupName}</li>`)
            .join(''),
        );

        getEl('constellation-menu')!
          .querySelectorAll('li')
          .forEach((element) => {
            element.addEventListener('click', (evt: Event) => {
              this.constellationMenuClick_((evt.target as HTMLElement).dataset.group!);
            });
          });
      },
    );
  }

  // 添加JavaScript逻辑
  addJs(): void {
    super.addJs();
    // 添加CSS样式
    this.addCss();

    // 等待UI加载完成
    keepTrackApi.on(KeepTrackApiEvents.uiManagerFinal, async () => {
      // 设置文件输入事件监听
      this.setupFileInput();
      
      // 设置分类按钮事件监听
      this.setupCategoryButtons();
      
      // 设置增加图标点击事件
      this.setupAddConstellationIcons();

      // 在页面加载时调用fetchConstellations获取数据并缓存
      await this.initAndCacheConstellationsData();
    });
  }
  
  // 存储当前选中的星座类型
  private currentConstellationType: number = 1;

  /**
   * 设置增加图标的点击事件，点击后显示星座导入模块
   */
  private setupAddConstellationIcons() {
    // 获取所有增加图标
    const addIcons = document.querySelectorAll('.category-add-icon');
    const importModule = document.getElementById('constellation-settings');
    
    // 为每个增加图标添加点击事件
    addIcons.forEach((icon) => {
      icon.addEventListener('click', (evt) => {
        // 阻止事件冒泡，避免触发分类标题的展开/折叠
        evt.stopPropagation();
        
        // 移除所有图标的active类，然后为当前点击的图标添加active类
        addIcons.forEach((i) => i.classList.remove('active'));
        icon.classList.add('active');
        
        if (importModule) {
          // 显示导入模块
          importModule.style.display = 'block';
          
          // 根据点击的图标ID确定星座类型
          const iconId = icon.id;
          let categoryTitle = '星座导入';
          
          if (iconId === 'add-constellation-1') {
            categoryTitle = '导航星座导入';
            this.currentConstellationType = 1;
          } else if (iconId === 'add-constellation-2') {
            categoryTitle = '通信星座导入';
            this.currentConstellationType = 2;
          } else if (iconId === 'add-constellation-3') {
            categoryTitle = '对地观测星座导入';
            this.currentConstellationType = 3;
          } else if (iconId === 'add-constellation-4') {
            categoryTitle = '自定义星座导入';
            this.currentConstellationType = 4;
          }
          
          // 更新导入模块的标题
          const importTitle = importModule.querySelector('h5.center-align');
          if (importTitle) {
            importTitle.textContent = categoryTitle;
          }
        }
      });
    });
  }
  
  /**
   * 设置分类标题的事件监听
   */
  private setupCategoryButtons() {
    // 获取所有分类标题
    const categoryHeaders = document.querySelectorAll('.category-header');
    // 存储当前选中的分类 - 使用数组存储所有分类ID
    this.selectedCategory = [];
    
    // 初始加载时让所有分类都展开
    categoryHeaders.forEach((header) => {
      header.classList.add('selected');
      
      // 将分类ID添加到selectedCategory数组中
      const categoryId = parseInt(header.id.replace('category-', '') || '0');
      if (categoryId > 0 && (Array.isArray(this.selectedCategory) ? this.selectedCategory.includes(categoryId) : this.selectedCategory === categoryId)) {
        if (!Array.isArray(this.selectedCategory)) {
          this.selectedCategory = [this.selectedCategory];
        }
        this.selectedCategory.push(categoryId);
      }
      
      // 确保对应的星座列表可见
      const categoryListId = header.id.replace('category-', 'constellation-list-');
      const categoryList = document.getElementById(categoryListId);
      if (categoryList) {
        categoryList.style.display = 'block';
      }
    });
    
    // 为每个标题添加点击事件
    categoryHeaders.forEach((header) => {
      header.addEventListener('click', (evt) => {
        const target = evt.currentTarget as HTMLElement;
        const category = parseInt(target.dataset.category || '0');
        
        // 切换当前点击的分类的选中状态
        const isSelected = target.classList.contains('selected');
        
        // 如果当前选中的分类被点击，则取消选中
        if (isSelected) {
          target.classList.remove('selected');
          
          // 如果是数组类型，则从选中分类数组中移除
          if (Array.isArray(this.selectedCategory)) {
            const index = this.selectedCategory.indexOf(category);
            if (index > -1) {
              this.selectedCategory.splice(index, 1);
            }
          } else {
            // 保持兼容性
            this.selectedCategory = 0;
          }
        } else {
          // 选中当前点击的标题
          target.classList.add('selected');
          
          // 如果是首次选中，将selectedCategory改为数组类型
          if (this.selectedCategory === 0) {
            this.selectedCategory = [category];
          } else if (Array.isArray(this.selectedCategory)) {
            // 如果已经是数组，则添加到数组中
            if (!this.selectedCategory.includes(category)) {
              this.selectedCategory.push(category);
            }
          } else {
            // 兼容旧的单值情况
            this.selectedCategory = [this.selectedCategory, category];
          }
        }
      });
    });
  }

  /**
   * 初始化并从CatalogLoader获取星座数据
   * 在页面加载时自动调用，从全局缓存获取数据
   */
  private async initAndCacheConstellationsData() {
    try {
      // 显示加载状态
      const loadingElement = getEl('constellations-loading') as HTMLElement;
      if (loadingElement) {
        loadingElement.textContent = '加载星座数据中...';
      }

      // 先获取缓存数据
      let constellationsData = CatalogLoader.getCachedConstellations();
      
      // 创建用于显示的星座数据数组
      const displayConstellations: Array<{ name: string; id: string; constellation_type?: string }> = [];
      // 根据响应数据格式处理
      if (Array.isArray(constellationsData) && constellationsData.length > 0) {
          // 处理新格式: [{"constellation": "1", "constellation_name": "GPS"}, ...]
          constellationsData.forEach((item) => {
            displayConstellations.push({
              name: item.constellation_name,
              id: item.constellation,
              constellation_type: item.constellation_type
            });
          });
      }
      // 新增的星座展示到星座列表
      this.fetchDisplayConstellations(displayConstellations);
      
      // 清空加载状态
      if (loadingElement) {
        loadingElement.remove();
      }
    } catch (error) {
      // 显示错误状态
      const loadingElement = getEl('constellations-loading') as HTMLElement;
      if (loadingElement) {
        loadingElement.textContent = `加载失败: ${(error as Error).message}`;
        loadingElement.classList.add('error');
      }
      
      keepTrackApi.getUiManager().toast(`星座数据加载失败：${(error as Error).message}`, 'error' as ToastMsgType, true);
    }
  }

  /**
   * 根据获取的星座数据动态生成菜单
   * @param constellationsData 从API获取的星座数据
   */

  // 添加CSS样式
  private addCss() {
    const style = document.createElement('style');

    style.textContent = `
      .side-menu-settings {
        padding: 10px;
        background-color: #f5f5f5;
        border-radius: 4px;
        margin-top: 10px;
        color: #212121;
        min-height: 50px;
        /* 确保高度根据内容自适应 */
        height: auto;
      }

      .import-tip {
        margin-top: 10px;
      }
      .file-preview-container {
        /* 移除最大高度限制，允许内容完全显示 */
        max-height: none;
        overflow-y: auto;
        background-color: #e0e0e0;
        border-radius: 4px;
        padding: 10px;
        margin-top: 15px;
        color: #212121;
      }
      .file-content {
        white-space: pre-wrap;
        font-family: monospace;
        font-size: 12px;
        margin: 0;
      }
      .file-path-wrapper {
        color: #333 !important;
      }
      .material-icons.left {
        font-size: 1.2rem !important;
      }
      
      /* 星座分类区域样式 */
      .side-menu-categories {
        border-radius: 4px;
        padding: 10px;
      }
      
      /* 分类容器样式 */
      .categories-container {
        display: flex;
        justify-content: space-between;
        flex-direction: column;
        gap: 5px;
      }
      
      .side-menu-categories h6 {
        margin-top: 0;
        margin-bottom: 10px;
        font-size: 0.85rem;
        color: #333;
      }
      
      /* 分类标题样式 */
      .category-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        padding: 8px 0;
        cursor: pointer;
        position: relative;
        transition: all 0.3s ease;
      }
      
      /* 分类控制区域样式 */
      .category-controls {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      
      /* 增加图标样式 */
      .category-add-icon {
        color: #757575;
        font-size: 18px;
        font-weight: bold;
        cursor: pointer;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 2px solid #757575;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        margin-left: 20px;
      }
      
      .category-add-icon:hover {
        color: #2196f3;
        border-color: #2196f3;
      }
      
      .category-add-icon.active {
        color: #2196f3;
        border-color: #2196f3;
        background-color: rgba(33, 150, 243, 0.1);
      }
      
      /* 分类标题文本样式 */
      .category-title {
        font-size: 0.85rem;
        font-weight: 500;
        color: #f5f5f5;
      }
      
      /* 选中状态的标题文本 */
      .category-header.selected .category-title {
        color: #2196f3;
        font-weight: 600;
      }
      
      /* 分类切换图标样式 */
      .category-toggle {
        font-size: 0.65rem;
        transition: transform 0.3s ease;
        color: #757575;
      }
      
      /* 选中状态的切换图标 */
      .category-header.selected .category-toggle {
        color: #2196f3;
        transform: rotate(0deg);
      }
      
      /* 未选中状态的切换图标 */
      .category-header:not(.selected) .category-toggle {
        transform: rotate(-90deg);
      }

      .category-header-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: calc(100% - 40px);
      }
      
      /* 分类下划线样式 */
      .category-underline {
        position: absolute;
        bottom: 0;
        left: 0;
        height: 2px;
        background-color: #f5f5f5;
        width: calc(100% - 40px);
        transition: width 0.3s ease;
      }
      
      /* 选中状态的下划线 */
      .category-header.selected .category-underline {
          
        }
      }
      
      /* 分类下划线样式 */
      .category-underline {
        position: absolute;
        bottom: 0;
        left: 0;
        height: 2px;
        background-color: #f5f5f5;
        width: calc(100% - 40px);
        transition: width 0.3s ease;
      }
      
      /* 选中状态的下划线 */
      .category-header.selected .category-underline {
        background-color: #2196f3;
        width: calc(100% - 40px);
      }
      
      /* 分类列表样式 */
      .category-list {
        list-style: none;
        padding: 0;
        margin: 0;
        overflow: hidden;
        max-height: 500px; /* 足够大的值，确保所有内容都能显示 */
        transition: all 0.3s ease;
        width: calc(100% - 40px);
      }
      
      /* 未选中状态的分类列表 */
      .category-header:not(.selected) + .category-list {
        max-height: 0;
        margin-top: 0;
      }
      
      /* 选中状态的分类列表 */
      .category-header.selected + .category-list {
        margin-top: 5px;
      }

      .menu-selectable{
        text-align: left !important;
      }
    `;
    document.head.appendChild(style);
  }

  // 清空文件预览内容和重置文件输入
  private resetFilePreviewAndInput(fileInput: HTMLInputElement, importButton: HTMLButtonElement) {
    const fileNameElement = getEl('sat-con-file-name-display') as HTMLElement;
    const previewElement = getEl('sat-con-file-content') as HTMLElement;
    const previewContainer = getEl('sat-con-file-content-preview') as HTMLElement;
    
    if (fileNameElement) {
      fileNameElement.textContent = '';
    }
    
    if (previewElement) {
      previewElement.textContent = '';
    }
    
    if (previewContainer) {
      hideEl(previewContainer);
    }
    
    // 重置文件输入框
    if (fileInput) {
      fileInput.value = '';
    }
    
    // 禁用导入按钮
    if (importButton) {
      importButton.disabled = true;
    }
  }

  // 设置文件输入处理
  private setupFileInput() {
    // 文件输入事件监听 - 使用唯一ID避免与其他插件冲突
    const fileInput = getEl('sat-con-tle-file-input') as HTMLInputElement;
    const importButton = getEl('sat-con-import-button') as HTMLButtonElement;
    const closeButton = getEl('close-constellation-settings') as HTMLDivElement;
    const importModule = getEl('constellation-settings') as HTMLElement;

    if (fileInput && importButton) {
      fileInput.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement;

        if (target.files && target.files[0]) {
          this.handleFileSelection(target.files[0]);
        }
      });

      // 添加关闭按钮点击事件监听
      if (closeButton && importModule) {
        closeButton.addEventListener('click', () => {
          // 隐藏导入模块
          importModule.style.display = 'none';
          // 移除所有加号图标的active类
          const addIcons = document.querySelectorAll('.category-add-icon');
          addIcons.forEach((icon) => icon.classList.remove('active'));
          
          // 调用封装的方法清空文件预览内容和重置文件输入
          this.resetFilePreviewAndInput(fileInput, importButton);
        });
      }

      // 导入按钮点击事件
      importButton.addEventListener('click', async () => {
        if (fileInput.files && fileInput.files[0]) {
          try {
            // 获取constellation-menu元素
            const constellationMenu = getEl('constellation-menu');
            const constellationsMenu = getEl('constellations-menu');
            
            // 添加loading状态
            if (constellationsMenu && constellationMenu) {
              // 创建loading覆盖层
              const loadingOverlay = document.createElement('div');
              loadingOverlay.id = 'constellation-loading-overlay';
              loadingOverlay.style.position = 'absolute';
              loadingOverlay.style.top = '0';
              loadingOverlay.style.left = '0';
              loadingOverlay.style.width = '100%';
              loadingOverlay.style.height = '100%';
              loadingOverlay.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
              loadingOverlay.style.display = 'flex';
              loadingOverlay.style.alignItems = 'center';
              loadingOverlay.style.justifyContent = 'center';
              loadingOverlay.style.zIndex = '100';
              loadingOverlay.style.borderRadius = '4px';
              
              // 创建loading文本
              const loadingText = document.createElement('div');
              loadingText.className = 'menu-loading';
              loadingText.textContent = '加载星座数据中...';
              loadingText.style.color = '#000';
              loadingText.style.fontSize = '14px';
              loadingText.style.fontWeight = 'bold';
              
              // 添加到覆盖层
              loadingOverlay.appendChild(loadingText);
              
              // 添加到menu
              constellationMenu.style.position = 'relative';
              constellationsMenu.appendChild(loadingOverlay);
            }
            
            // 上传文件到接口
            const formData = new FormData();
            
            // 正确组织请求参数，添加file参数（文件类型）
            formData.append('file', fileInput.files[0]);
            
            // 添加星座类型参数
            formData.append('constellation_type', this.currentConstellationType.toString());
            
            // 发送文件上传请求
            const uploadResponse = await fetch(settingsManager.dataSources.tianxunServer + '/upload_constellation', {
              method: 'POST',
              body: formData,
            });

             if (!uploadResponse.ok) {
               throw new Error('文件上传失败');
             }

            // 显示上传成功提示
            keepTrackApi.getUiManager().toast('上传成功', 'success' as ToastMsgType, true);

            const constellationsDataResponse = await CatalogLoader.fetchAndCacheConstellations();

            // 创建用于显示的星座数据数组
            const displayConstellations: Array<{ name: string; id: string; constellation_type?: string; satelliteIds?: number[] }> = [];
            // 根据响应数据格式处理
            if (Array.isArray(constellationsDataResponse) && constellationsDataResponse.length > 0) {
                // 处理新格式: [{"constellation": "1", "constellation_name": "GPS"}, ...]
                constellationsDataResponse.forEach((item) => {
                  displayConstellations.push({
                    name: item.constellation_name,
                    id: item.constellation,
                    constellation_type: item.constellation_type
                  });
                });
            }
            
            // 新增的星座展示到星座列表
            this.fetchDisplayConstellations(displayConstellations);
            
            // 异步加载最新的星座数据并刷新显示
            try {
              await CatalogLoader.load();
              keepTrackApi.getUiManager().toast('星座数据已成功加载', 'success' as ToastMsgType, true);
               
              // 加载成功后，关闭星座导入模块并重置文件预览
              const fileInput = getEl('sat-con-tle-file-input') as HTMLInputElement;
              const importButton = getEl('sat-con-import-button') as HTMLButtonElement;
              const importModule = getEl('constellation-settings') as HTMLElement;
               
              // 隐藏导入模块
              if (importModule) {
                importModule.style.display = 'none';
              }
              
              // 移除所有加号图标的active类
              const addIcons = document.querySelectorAll('.category-add-icon');
              addIcons.forEach((icon) => icon.classList.remove('active'));
              
              // 调用方法清空文件预览内容和重置文件输入
              if (fileInput && importButton) {
                this.resetFilePreviewAndInput(fileInput, importButton);
              }
            } catch (loadError) {
              keepTrackApi.getUiManager().toast('星座数据加载失败，请刷新页面重试', 'error' as ToastMsgType, true);
              console.error('加载星座数据失败:', loadError);
            } finally {
              // 无论成功失败，都移除loading状态
              const loadingOverlay = getEl('constellation-loading-overlay');
              if (loadingOverlay) {
                loadingOverlay.remove();
              }
            }
          } catch (error) {
             keepTrackApi.getUiManager().toast('上传文件失败，请重试', 'error' as ToastMsgType, true);
             console.error('上传文件失败:', error);
             // 出错时也移除loading状态
             const loadingOverlay = getEl('constellation-loading-overlay');
             if (loadingOverlay) {
               loadingOverlay.remove();
             }
          }
        }
      });
    }
  }



  // 处理文件选择
  private handleFileSelection(file: File) {
    const fileNameElement = getEl('sat-con-file-name-display') as HTMLElement;

    if (fileNameElement) {
      fileNameElement.textContent = file.name;
    }

    // 读取文件内容并显示预览
    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target?.result as string;
      const previewElement = getEl('sat-con-file-content') as HTMLElement;
      const previewContainer = getEl('sat-con-file-content-preview') as HTMLElement;
      const importButton = getEl('sat-con-import-button') as HTMLButtonElement;

      if (previewElement && previewContainer && importButton) {
        // 显示完整文件内容
        const previewContent = content;

        previewElement.textContent = previewContent;
        showEl(previewContainer);
        importButton.disabled = false;
      }
    };
    reader.readAsText(file);
  }

  private fetchDisplayConstellations(processedConstellations: Array<{ name: string; id: string; constellation_type?: string }>) {
    
    // 将星座数据按constellation_type分类并添加到对应的分类列表中
    processedConstellations.forEach((constellation) => {
      // 根据constellation_type确定分类
      // 1代表导航星座，2代表通信星座，3代表对地观测星座，4代表自定义星座
      let category = '4'; // 默认分类为自定义星座
      if (constellation.constellation_type === '1') {
        category = '1'; // 导航星座
      } else if (constellation.constellation_type === '2') {
        category = '2'; // 通信星座
      } else if (constellation.constellation_type === '3') {
        category = '3'; // 对地观测星座
      } else if (constellation.constellation_type === '4') {
        category = '4'; // 自定义星座
      }

      // 获取对应的分类列表
      const constellationList = getEl(`constellation-list-${category}`);
      
      if (constellationList) {
        // 检查是否已存在相同ID的菜单项，避免重复添加
        const existingItem = constellationList.querySelector(`li[data-group="${constellation.id}"]`);

        if (!existingItem) {
          const menuItem = document.createElement('li');
          menuItem.className = 'menu-selectable';
          menuItem.setAttribute('data-group', constellation.id);
          
          // 创建星座名称和删除图标的容器
          const menuItemContent = document.createElement('div');
          menuItemContent.style.display = 'flex';
          menuItemContent.style.justifyContent = 'space-between';
          menuItemContent.style.alignItems = 'center';
          
          // 添加星座名称
          const nameSpan = document.createElement('span');
          nameSpan.textContent = constellation.name;
          
          // 添加删除图标
          const deleteIcon = document.createElement('span');
          deleteIcon.className = 'delete-constellation-icon';
          deleteIcon.textContent = '-';
          deleteIcon.style.color = '#757575';
          deleteIcon.style.cursor = 'pointer';
          deleteIcon.style.fontSize = '18px';
          deleteIcon.style.fontWeight = 'bold';
          deleteIcon.style.width = '20px';
          deleteIcon.style.height = '20px';
          deleteIcon.style.borderRadius = '50%';
          deleteIcon.style.border = '2px solid #757575';
          deleteIcon.style.display = 'flex';
          deleteIcon.style.alignItems = 'center';
          deleteIcon.style.justifyContent = 'center';
          deleteIcon.style.transition = 'all 0.3s ease';
          
          // 删除图标悬停效果
          deleteIcon.addEventListener('mouseover', () => {
            deleteIcon.style.color = '#f44336';
            deleteIcon.style.borderColor = '#f44336';
          });
          
          deleteIcon.addEventListener('mouseout', () => {
            deleteIcon.style.color = '#757575';
            deleteIcon.style.borderColor = '#757575';
          });
          
          // 删除图标点击事件
          deleteIcon.addEventListener('click', async (evt) => {
            evt.stopPropagation(); // 阻止事件冒泡到菜单项
            
            // 检查删除的星座ID是否与之前记录的点击的星座ID相同
            if (this.clickedConstellationId_ === constellation.id) {
              // 当前选中的星座不能删除，显示提示
              keepTrackApi.getUiManager().toast('当前选中的星座不能删除', ToastMsgType.caution, true);
              return; // 阻止删除操作
            }
            
            // 显示确认删除对话框
            if (confirm(`确定要删除星座 "${constellation.name}" 吗？`)) {
              // 这里调用删除星座接口
              await this.deleteConstellation_(constellation.id, constellation.name);
              
              // 重新调用星座获取接口获取最新数据
              try {
                // 显示加载状态
                const loadingElement = getEl('constellations-loading') as HTMLElement;
                if (loadingElement) {
                  loadingElement.textContent = '更新星座数据中...';
                }
                
                // 清除缓存并重新获取星座数据
                CatalogLoader.clearConstellationsCache();
                const constellationsDataResponse = await CatalogLoader.fetchAndCacheConstellations();
                
                // 创建用于显示的星座数据数组
                const displayConstellations: Array<{ name: string; id: string; constellation_type?: string }> = [];
                // 根据响应数据格式处理
                if (Array.isArray(constellationsDataResponse) && constellationsDataResponse.length > 0) {
                  // 处理格式: [{"constellation": "1", "constellation_name": "GPS"}, ...]
                  constellationsDataResponse.forEach((item) => {
                    displayConstellations.push({
                      name: item.constellation_name,
                      id: item.constellation,
                      constellation_type: item.constellation_type
                    });
                  });
                }
                
                // 清空所有分类列表
                for (let i = 1; i <= 4; i++) {
                  const list = getEl(`constellation-list-${i}`);
                  if (list) {
                    list.innerHTML = '';
                  }
                }
                
                // 重新展示星座列表
                this.fetchDisplayConstellations(displayConstellations);
                
                // 清空加载状态
                if (loadingElement) {
                  loadingElement.remove();
                }
              } catch (error) {
                console.error('更新星座数据失败:', error);
                keepTrackApi.getUiManager().toast(`更新星座列表失败：${(error as Error).message}`, 'error' as ToastMsgType, true);
              }
            }
          });
          
          // 组装菜单项
          menuItemContent.appendChild(nameSpan);
          menuItemContent.appendChild(deleteIcon);
          menuItem.appendChild(menuItemContent);
          
          // 菜单项点击事件
          menuItem.addEventListener('click', (evt: Event) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            if (evt.target instanceof HTMLElement && !evt.target.closest('.delete-constellation-icon')) {
              const constellationId = (evt.target as HTMLElement).closest('li')!.dataset.group!;
              // 记录当前点击的星座ID
              this.clickedConstellationId_ = constellationId;
              this.constellationMenuClick_(constellationId);
            }
          });
          
          constellationList.appendChild(menuItem);
        }
      }
    });
  }


  addConstellation(groupName: string, groupType: GroupType, groupValue: number[] | RegExp) {
    const groupSlug = groupName.replace(/\s+/gu, '-').toLowerCase();

    this.additionalConstellations_.push({ groupName, groupType, groupValue, groupSlug });
  }

  private async constellationMenuClick_(data: string) {
    try {
      // 使用传入的data参数（星座id）构建API请求URL
      const apiUrl = settingsManager.dataSources.tianxunServer + `/constellations_find/${data}`;
      
      // 发送API请求获取数据
      const response = await fetch(apiUrl);
      const result = await response.json();
      
      // 从响应中提取satellites字段（数组）
      const satellites = result.satellites || [];
      
      // 将卫星ID格式化为逗号分隔的字符串
      const satelliteIdsString = satellites.join(',');
      
      const uiManagerInstance = keepTrackApi.getUiManager();
      // 调用搜索方法，传入格式化后的卫星ID字符串
      uiManagerInstance.searchManager.doSearch(satelliteIdsString)
      if (settingsManager.isMobileModeEnabled) {
        uiManagerInstance.searchManager.closeSearch();
      }
      uiManagerInstance.hideSideMenus();
      // 打开所有图层，确保导入的星座能够显示
      keepTrackApi.getUiManager().openAllLayers();
    } catch (error) {
      console.error('获取星座数据失败:', error);
    }
  }
  
  /**
   * 删除星座的私有方法
   * @param constellationId 星座ID
   * @param constellationName 星座名称
   */
  private async deleteConstellation_(constellationId: string, constellationName: string) {
    try {
      // 构建删除星座的API请求URL
      const deleteUrl = settingsManager.dataSources.tianxunServer + `/constellations/'${constellationId}'`;
      
      // 发送删除请求
      const response = await fetch(deleteUrl, {
        method: 'delete',
        body: JSON.stringify({ con_id: constellationId }),
      });
      
      // 检查响应状态
      if (response.ok) {
        // 显示删除成功的提示
        keepTrackApi.getUiManager().toast(`星座 "${constellationName}" 删除成功`, 'success' as ToastMsgType, true);
        await CatalogLoader.load()
      } else {
        // 显示删除失败的提示
        keepTrackApi.getUiManager().toast(`星座 "${constellationName}" 删除失败`, 'error' as ToastMsgType, true);
      }
    } catch (error) {
      // 显示错误提示
      keepTrackApi.getUiManager().toast(`星座 "${constellationName}" 删除时发生错误`, 'error' as ToastMsgType, true);
    }
  }

  static groupSelected(groupName: string) {
    if (typeof groupName === 'undefined') {
      return;
    }
    const catalogManagerInstance = keepTrackApi.getCatalogManager();
    const groupManagerInstance = keepTrackApi.getGroupsManager();

    if (typeof groupManagerInstance.groupList[groupName] === 'undefined') {
      throw new Error(`Unknown group name: ${groupName}`);
    }

    const searchDOM = getEl('search');

    if (!searchDOM) {
      // If no searchDOM, there is no need to continue
      return;
    }

    groupManagerInstance.selectGroup(groupManagerInstance.groupList[groupName]);

    // Populate searchDOM with a search string separated by commas - minus the last one
    searchDOM.innerHTML = groupManagerInstance.groupList[groupName].ids
      .map((id) => {
        const sat = catalogManagerInstance.getSat(id);

        return sat ? sat.sccNum : null;
      })
      .filter((sccNum) => sccNum !== null)
      .join(',');

    // If SelectSatManager is enabled, deselect the selected sat
    keepTrackApi.getPlugin(SelectSatManager)?.selectSat(-1);

    const uiManagerInstance = keepTrackApi.getUiManager();

    const searchString = groupManagerInstance.groupList[groupName].ids
      .map((id) => {
        const sat = catalogManagerInstance.getSat(id);

        return sat ? sat.sccNum : null;
      })
      .filter((sccNum) => sccNum !== null)
      .join(',');

    uiManagerInstance.searchManager.doSearch(searchString);
    // Close Menus
    if (settingsManager.isMobileModeEnabled) {
      uiManagerInstance.searchManager.closeSearch();
    }
    uiManagerInstance.hideSideMenus();
      // 打开所有图层，确保导入的星座能够显示
    keepTrackApi.getUiManager().openAllLayers();
  }
}
