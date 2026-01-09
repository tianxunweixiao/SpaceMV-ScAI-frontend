import { KeepTrackPlugin } from '../KeepTrackPlugin';
import satelliteAlt from '@public/img/icons/constellation-decline-simulation.png';
import infoIcon from '@public/img/icons/info2.png';
import { keepTrackApi } from '@app/keepTrackApi';
import { getEl, showEl } from '@app/lib/get-el';
import { ToastMsgType, KeepTrackApiEvents } from '@app/interfaces';
import { CatalogLoader, Constellation } from '@app/static/catalog-loader';
import { showModal} from '@app/singletons/popup-modal';
import { SuccessModal } from '@app/singletons/SuccessModal';
interface SatelliteObject {
  id: number;
  name?: string;
  sccNum: number | string;
}

export class ConstellationDeclineSimulationPlugin extends KeepTrackPlugin {
  readonly id = 'ConstellationDeclineSimulationPlugin';
  private readonly ITEM_HEIGHT = 36; // 每个卫星项的高度（像素）
  private readonly BUFFER_SIZE = 20; // 缓冲区大小
  private cachedFilteredSats: SatelliteObject[] = [];// 缓存过滤后的卫星数据
  private searchTimeout: number | null = null;
  private readonly DEBOUNCE_DELAY = 800;

  dependencies_ = [];
  bottomIconImg = satelliteAlt;

  sideMenuElementName = 'decline-simulation-main';
  sideMenuTitle = '覆盖性分析';

  sideMenuElementHtml = keepTrackApi.html`
    <div id="decline-simulation-main" class="side-menu-parent start-hidden text-select">
      <div id="decline-simulation-content" class="side-menu">
        <div class="row">
          <span>仿真级别:</span>
          <div class="switch import_btn_row">
            <label>
              <input id="sat_singel" type="checkbox" checked/>
              <span class="lever"></span>
              单星
              </label>
            <label>
              <input id="sat_constellation" type="checkbox" />
              <span class="lever"></span>
              星座
            </label>
          </div>
        </div>
        <div class="import_btn_row">
          <button id="sat-select-button" class="btn btn-ui waves-effect waves-light">
              <i class="material-icons left">import_export</i> 载荷选择
          </button>          
        </div>          
        <div style="margin-top:15px;margin-bottom:15px">
          <div>
          已选择<span id="select_category">卫星</span>:<span id="select_name" style="margin-left:3px;"></span>
          </div>
          <div>
            <span id="select_id" style="display:none"></span>
            <span id="select_type" style="display:none"></span>
          </div>
        </div>
        <hr>
        <div class="row">
          <span>仿真参数设置:</span>
          <div class="sat-info-row">
            <div class="parameter-key">起始时间(UTC):</div>
            <div class="parameter-value"><input type="text" id="start_time" value="20250913040000"></div>
          </div>
          <div class="sat-info-row">
            <div class="parameter-key">结束时间(UTC):</div>
            <div class="parameter-value"><input type="text" id="end_time" value="20250913042000"></div>
          </div>
          <div class="sat-info-row">
            <div class="parameter-key">步长(s):</div>
            <div class="parameter-value"><input type="text" id="step_length" value="10"></div>
          </div>
        </div>
        <hr>
        <div class="row">
          <span>地面目标可观测性分析:</span>
          <div class="sat-info-row">
            <div class="parameter-key">点目标<br/>
            (经度 纬度):
            </div>
            <div class="parameter-value"><input type="text" id="target_dot" value="123 41"></div>
          </div>
          <div class="sat-info-row">
            <div class="parameter-key">线目标<br/>
            (经度 纬度):</div>
            <div class="parameter-value"><input type="text" id="target_line" value="123 31|127 31"></div>
          </div>
          <div class="sat-info-row">
            <div class="parameter-key">面目标<br/>
            (经度 纬度):</div>
            <div class="parameter-value"><input type="text" id="target_plane" value="123 34|134 41|127 37"></div>
          </div>
        </div>
        <hr>
        <div class="algorithm-model-section">
          <div class="algorithm-model-header">
            <span>算法模型:</span>
          </div>
          <div class="algorithm-model-options">
            <!-- 带边框的选项容器 -->
            <div class="algorithm-options-container">
              <!-- 第三方工具选项 -->
              <div id="third-party-algorithm-container" class="algorithm-option-wrapper" style="display: block;">
                <span id="third-party-algorithm-text" class="algorithm-option-text">STK</span>
              </div>
            </div>
            
            <!-- 选中状态显示 -->
            <div id="algorithm-selection-status" class="algorithm-selection-status" style="margin-top: 10px; margin-bottom: 10px; color: #00ccff; display: block;">
              已选择STK
            </div>
          </div>
        </div>

        <hr>
        <div class="row btn_center">
          <button type="button" id="btn_caculate">开始计算</button>
        </div>
      </div>
    </div>
    <div id="sat-sel-content" class="sat-select-content start-hidden">
       <div id="satellite-menu" class="sat_side-menu">
        <div>
          <button type="button" id="select_btn_close" class="modal-close-btn sat-close-btn">×</button>
        </div>      
        <div class="search-container" id="search-div">
          <input type="text" id="decline_sat-search" placeholder="搜索卫星..." class="search-input">
        </div>
        <div id="decline_sat-list-container" class="scrollable">
          <ul id="decline_sat-list" style="transform: translateY(0px); position: relative;"></ul>
        </div>
      </div>
    </div>
    
    <div id="caculate-process">
      <div class="caculate-process-header">
        <button id="caculate-process-close-btn" class="modal-close-btn">×</button>
      </div>
      <div id="caculate-process-content" class="caculate-process-content">
        <!-- 计算内容将在这里动态添加 -->
      </div>
    </div>
    `;

  private clearSelectedContent() {
    const spanNameEle = <HTMLSpanElement>getEl('select_name');
    const spanIdEle = <HTMLSpanElement>getEl('select_id');
    const spanTypeEle = <HTMLSpanElement>getEl('select_type');
    spanNameEle.innerHTML = '';
    spanIdEle.innerHTML = '';
    spanTypeEle.innerHTML = '';
  }

  addHtml() {
    super.addHtml();

    keepTrackApi.on(KeepTrackApiEvents.uiManagerFinal, () => {
      // 文件输入事件监听
      const selectButton = getEl('sat-select-button') as HTMLButtonElement;
      const selectDiv = getEl('sat-sel-content') as HTMLDivElement;
      const satSingelInput = getEl('sat_singel') as HTMLInputElement;
      const satConstellationlInput = getEl('sat_constellation') as HTMLInputElement;
      const satCaculateInput = getEl('btn_caculate') as HTMLButtonElement;
      const satSelectCloseBtn = getEl('select_btn_close') as HTMLButtonElement;
      const caculateProcessCloseBtn = getEl('caculate-process-close-btn') as HTMLButtonElement;
      const caculateProcessDiv = getEl('caculate-process') as HTMLDivElement;
    
      if (selectButton) {
        // 载荷选择按钮点击事件
        selectButton.addEventListener('click', () => {
          // 检查计算过程div是否显示，如果是则隐藏它
          const processDiv = getEl('caculate-process') as HTMLDivElement;
          if (processDiv && processDiv.style.display === 'block') {
            processDiv.style.display = 'none';
          }
          
          if(satSingelInput.checked){
            this.updateSatelliteList();
          }else{
            this.updateConstellationList();
          }  
          selectDiv.style.display = 'block';      
        });
      }

      if(satSingelInput && satConstellationlInput){
        satSingelInput.addEventListener('click', () => {
          satSingelInput.checked = true;
          satConstellationlInput.checked = false;

          const spanCateEle = <HTMLSpanElement>getEl('select_category');
          spanCateEle.innerHTML = '卫星';
        
          this.clearSelectedContent()
        });

        satConstellationlInput.addEventListener('click', () => {
          satSingelInput.checked = false;
          satConstellationlInput.checked = true;

          const spanCateEle = <HTMLSpanElement>getEl('select_category');
          spanCateEle.innerHTML = '星座';

          this.clearSelectedContent()
        });

        satCaculateInput.addEventListener('click', () => {
          // 检查是否已选择载荷
          const selectType = (<HTMLSpanElement>getEl('select_type')).innerHTML;
          const selectId = (<HTMLSpanElement>getEl('select_id')).innerHTML;
          
          // 如果没有选择载荷，显示提示并阻止计算
          if (!selectType || !selectId) {
            keepTrackApi.getUiManager().toast('请先选择载荷', ToastMsgType.caution);
            return;
          }
          
          // 检查是否选择了第三方STK工具
          
          this.caculate_btn_event();
        });

        satSelectCloseBtn.addEventListener('click', () => {
          selectDiv.style.display = 'none'; 
        });
      }
      
      // 添加计算过程关闭按钮的点击事件
      if (caculateProcessCloseBtn && caculateProcessDiv) {
        caculateProcessCloseBtn.addEventListener('click', () => {
          caculateProcessDiv.style.display = 'none';
        });
      }      
    });   
  }

  // 添加CSS样式
  private addCss() {
    const style = document.createElement('style');

    style.textContent = `
      .parameter-value {
        display: inline-block;
        margin-left: 5px;
      }

      .parameter-key {
        display: inline-block;
        font-size: 12px;
        width: 20px
        color: white;
        float: left;
      }

      .btn_center {
        text-align: center;
      }

      .import_btn_row {
        text-align: center;
        margin-top: 10px;
      }
        
      .sat-select-content {
        position: absolute;
        width: 280px;
        height:700px;
        left:285px;
        z-index:1000
      }
      
      /* 带边框的选项容器 */
      .algorithm-options-container {
        border: 1px solid #555;
        border-radius: 3px;
        margin-bottom: 10px;
      }
      
      /* 选项包装器 */
      .algorithm-option-wrapper {
        width: 100%;
      }
      
      /* 选项文本样式 */
      .algorithm-option-text {
        display: flex;
        align-items: center;
        justify-content: space-between;
        color: white;
        font-size: 12px;
        padding: 6px 10px;
        border-radius: 3px;
        cursor: pointer;
        transition: background-color 0.2s;
        position: relative;
      }
      
      /* 选项hover效果 */
      .algorithm-option-text:hover {
        background-color: #00ccff;
        color: black;
      }
      
      /* 选项点击效果 */
      .algorithm-option-text:active {
        background-color: #00aacc;
        color: black;
      }
      
      /* 算法选中状态显示样式 */
      .algorithm-selection-status {
        font-size: 12px;
        color: #00ccff;
        margin-bottom: 10px;
        font-weight: normal;
      }
      
      /* 禁用选项样式 */
      .algorithm-option-text.disabled-option {
        opacity: 0.5;
        cursor: not-allowed;
      }
      
      .algorithm-option-text.disabled-option:hover {
        background-color: transparent;
        color: white;
      }
      
      .algorithm-option-text.disabled-option:active {
        background-color: transparent;
        color: white;
      }

      .deciline_sat-item {
        border-bottom: none;
        cursor: pointer;
        transition: background-color 0.2s;
      }

      .deciline_sat-item:hover {
        background-color: #f5f5f5;
        color: #212121;
      }
      
      .deciline_sat-item:active {
        background-color: #e0e0e0;
        color: #212121;
      }

      #decline_sat-list {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        list-style-type: none;
        margin: 0;
        padding: 0;
      }

      #decline_sat-list-container {
        position: relative;
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
        margin: 0;
        padding: 0;
      }

      .sat_side-menu {
        position: relative;
        height: 100%;
        border-width: 0px 5px 0px 0px;
        border-color: var(--color-dark-border);
        border-style: solid;
        background: var(--color-dark-background);
        color: white;
        width: 100%;
        top: 30px;
        bottom: 0px;
        overflow: auto;
        z-index: 100;
        padding: 0px 5px;
      }

      .sat-close-btn {
        float: right;
        margin-top: 10px;
      }
      
      /* 隐藏滚动条但保留滚动功能（适用于WebKit浏览器） */
      #decline_sat-list-container::-webkit-scrollbar {
        display: none;
      }
      
      /* 隐藏滚动条但保留滚动功能（适用于IE、Edge和Firefox） */
      #decline_sat-list-container {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
      
      /* 计算过程显示区域样式 */
      #caculate-process {
        position: fixed;
        top: 50%;
        left: 418px;
        transform: translate(-50%, -50%);
        width: 280px;
        max-width: 600px;
        height: 100%;
        background-color: rgba(153, 152, 152, 0.15);
        color: white;
        padding: 20px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        z-index: 10000;
        display: none;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
      }
      
      /* 计算过程头部容器 */
      .caculate-process-header {
        position: sticky;
        top: 0;
        display: flex;
        justify-content: flex-end;
        align-items: center;
        padding: 10px 0;
        z-index: 10;
      }
      
      /* 关闭按钮样式 */
      .modal-close-btn {
        background: rgba(255, 255, 255, 0.9);
        border: 2px solid white;
        border-radius: 50%;
        width: 26px;
        height: 26px;
        color: #212121;
        font-size: 20px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.2s ease;
        font-weight: bold;
        padding: 0;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      }
      
      .modal-close-btn:hover {
        background: rgba(255, 255, 255, 1);
      }

      #caculate-process-content {
        flex: 1;
        overflow-y: auto;
        padding-top: 10px;
        height: calc(100% - 50px);
      }
      
      /* 算法模型选择样式 */
      .algorithm-model-section {
        margin: 10px 0;
      }
      
      .algorithm-model-header {
        margin-bottom: 8px;
      }
      
      .algorithm-model-options {
        margin-left: 10px;
      }
      
      .algorithm-selection-container {
        margin-bottom: 10px;
      }
      
      .algorithm-category {
        margin-bottom: 10px;
      }
      
      .algorithm-category-name {
        display: inline-block;
        color: white;
        font-size: 14px;
      }
      
      .algorithm-select {
        background-color: #333;
        color: white;
        border: 1px solid #555;
        border-radius: 3px;
        padding: 4px 8px;
        font-size: 12px;
        outline: none;
      }
      
      .algorithm-select:focus {
        border-color: #00ccff;
      }
      
      .algorithm-select option {
        background-color: #333;
        color: white;
      }
      
      .algorithm-type-selection {
        padding-top: 10px;
      }
      
      .algorithm-type-selection label {
        color: white;
        font-size: 14px;
      }
      
      .algorithm-type-selection input[type="radio"] {
        transform: scale(0.8);
        margin-right: 6px;
      }
      
      /* 计算步骤样式 */
      #caculate-process div {
        margin-bottom: 8px;
        padding: 5px 0;
      }
      
      #caculate-process div:first-child {
        margin-top: 0;
      }
    `;
    document.head.appendChild(style);
  }

  bottomIconCallback = () => {
      if (!this.isMenuButtonActive) {
        return;
      }
      // 使用标准方式打开侧边菜单
      const menu = getEl(this.sideMenuElementName);
  
      if (menu) {
        showEl(menu);
      }
  };

  addJs(): void {
    super.addJs();

    // 添加CSS样式
    this.addCss();  
  }

  // 初始化插件
  init(): void {
    super.init();
  }

  private filterAndSortSatellites_(searchTerm: string): SatelliteObject[] {
    const sats = keepTrackApi.getCatalogManager().getSats() as SatelliteObject[] | null;

    if (!sats) {
      return [];
    }

    let filteredSats: SatelliteObject[] = [];
    const searchLower = searchTerm.trim().toLowerCase();

    if (searchLower === '') {
      filteredSats = sats;
    } else {
      for (let i = 0; i < sats.length; i++) {
        const sat = sats[i];
        const satName = (sat.name || '').toLowerCase();
        const sccNum = (sat.sccNum || '').toString().toLowerCase();

        if (satName.includes(searchLower) || sccNum.includes(searchLower)) {
          filteredSats.push(sat);
        }
      }
    }

    filteredSats.sort((a, b) => {
      const nameA = (a.name || '').toLowerCase();
      const nameB = (b.name || '').toLowerCase();

      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }

      return 0;
    });

    return filteredSats;
  }

  private renderVisibleItems_() {
    const listElement = getEl('decline_sat-list');
    const listContainer = getEl('decline_sat-list-container');

    if (!listElement || !listContainer) {
      return;
    }

    // 设置列表容器高度以创建滚动条
    listElement.style.height = `${this.cachedFilteredSats.length * this.ITEM_HEIGHT}px`;

    // 计算可见区域的起始和结束索引
    const scrollTop = listContainer.scrollTop;
    const containerHeight = listContainer.clientHeight;

    const startIndex = Math.max(0, Math.floor(scrollTop / this.ITEM_HEIGHT) - this.BUFFER_SIZE);
    const endIndex = Math.min(
      this.cachedFilteredSats.length,
      Math.ceil((scrollTop + containerHeight) / this.ITEM_HEIGHT) + this.BUFFER_SIZE,
    );

    // 创建DocumentFragment以优化DOM操作
    const fragment = document.createDocumentFragment();

    // 只渲染可见区域内的项
    for (let i = startIndex; i < endIndex; i++) {
      const sat = this.cachedFilteredSats[i];
      const li = document.createElement('li');

      li.className = 'menu-selectable deciline_sat-item';
      li.setAttribute('deciline_data-sat-id', sat.sccNum.toString());
      li.textContent = sat.name || `未知卫星 (${sat.sccNum})`;
      //console.log("----->" + sat.id.toString())
      //console.log("++++++>" + sat.sccNum)
      li.style.position = 'absolute';
      li.style.top = `${i * this.ITEM_HEIGHT}px`;
      li.style.height = `${this.ITEM_HEIGHT}px`;
      li.style.width = '100%';
      li.style.boxSizing = 'border-box';
      li.style.padding = '8px 16px';

      fragment.appendChild(li);
    }

    // 清空列表并添加新项
    listElement.innerHTML = '';
    listElement.appendChild(fragment);
  }

  /**
   * 更新卫星列表，可以根据搜索词过滤
   */
  private updateSatelliteList(searchTerm: string = '') {
    // 生成并缓存过滤后的卫星数据
    this.cachedFilteredSats = this.filterAndSortSatellites_(searchTerm);

    // 重置滚动位置
    const listContainer = <HTMLDivElement>getEl('decline_sat-list-container');
    if (!listContainer) {
      return;      
    }
    listContainer.scrollTop = 0;

    // 渲染可见项
    this.renderVisibleItems_(); 
            
    const searchInput = <HTMLInputElement>getEl('decline_sat-search');
    if (searchInput) {
        searchInput.addEventListener('input', (event) => {
          const searchTerm = (event.target as HTMLInputElement).value;

          this.debouncedSearch(searchTerm);
        });
    }

    listContainer.addEventListener('scroll', () => this.handleScroll_());

    this.setupEventDelegation();

    const searchDiv = getEl('search-div') as HTMLDivElement;
    searchDiv.style.display = 'block';
  }

  private updateConstellationList() {
    let constellationsData = CatalogLoader.getCachedConstellations() as Constellation[];
    const length = constellationsData.length;

    const listElement = getEl('decline_sat-list');
    const listContainer = getEl('decline_sat-list-container');

    if (!listElement || !listContainer) {
      return;
    }

    // 设置列表容器高度以创建滚动条
    listElement.style.height = `${length * this.ITEM_HEIGHT}px`;

    // 创建DocumentFragment以优化DOM操作
    const fragment = document.createDocumentFragment();

    let i = 0;
    constellationsData.forEach(obj => {
      const li = document.createElement('li');

      li.className = 'menu-selectable deciline_sat-item';
      li.setAttribute('constellation-id', obj.constellation);
      li.textContent = obj.constellation_name
      li.style.position = 'absolute';
      li.style.top = `${i * this.ITEM_HEIGHT}px`;
      li.style.height = `${this.ITEM_HEIGHT}px`;
      li.style.width = '100%';
      li.style.boxSizing = 'border-box';
      li.style.padding = '8px 16px';

      fragment.appendChild(li);
      i++;
    });

    // 清空列表并添加新项
    listElement.innerHTML = '';
    listElement.appendChild(fragment);

    this.setupConstellationEventDelegation();

    const searchDiv = getEl('search-div') as HTMLDivElement;
    searchDiv.style.display = 'none';
  }

  private handleScroll_() {
    this.renderVisibleItems_();
  }

  private debouncedSearch(searchTerm: string) {
    // 清除之前的计时器
    if (this.searchTimeout !== null) {
      clearTimeout(this.searchTimeout);
    }

    // 设置新的延迟执行s
    this.searchTimeout = window.setTimeout(() => {
      this.updateSatelliteList(searchTerm);
    }, this.DEBOUNCE_DELAY);
  }

  private satelliteItemClick_(satId: string, satName: string): void {  
    const spanNameEle = <HTMLSpanElement>getEl('select_name');
    const spanIdEle = <HTMLSpanElement>getEl('select_id');
    const spanTypeEle = <HTMLSpanElement>getEl('select_type');
    spanNameEle.innerHTML = satName;
    spanIdEle.innerHTML = satId;
    spanTypeEle.innerHTML = '1';
     
    //关闭菜单
    const selectDiv = getEl('sat-sel-content') as HTMLDivElement;
    selectDiv.style.display = 'none';
  }

  private setupEventDelegation() {
      const listElement = getEl('decline_sat-list');
  
      if (listElement) {
        listElement.addEventListener('click', (event) => {
          const target = event.target as HTMLElement;
          const satelliteItem = target.closest('li.deciline_sat-item');
  
          if (satelliteItem) {
            const satId = satelliteItem.getAttribute('deciline_data-sat-id');
            const satelliteName = satelliteItem.textContent;
  
            if (satId && satelliteName) {
              this.satelliteItemClick_(satId, satelliteName);
            }
          }
        });
      }
  }

  private constellationItemClick_(constellationId: number, constellationName: string): void {  
    if (constellationId && constellationName) {
      const spanNameEle = <HTMLSpanElement>getEl('select_name');
      const spanIdEle = <HTMLSpanElement>getEl('select_id');
      const spanTypeEle = <HTMLSpanElement>getEl('select_type');
      spanNameEle.innerHTML = constellationName;
      spanIdEle.innerHTML = constellationId.toString();
      spanTypeEle.innerHTML = '2';
    }
  
    //关闭菜单
    const selectDiv = getEl('sat-sel-content') as HTMLDivElement;
    selectDiv.style.display = 'none';
  }

  private setupConstellationEventDelegation() {
    const listElement = getEl('decline_sat-list');
  
    if (listElement) {
      listElement.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;
        const constellationItem = target.closest('li.deciline_sat-item');
  
        if (constellationItem) {
          const constellationId = parseInt(constellationItem.getAttribute('constellation-id') || '-1');
          const constellationName = constellationItem.textContent
  
          if (!isNaN(constellationId)) {
            this.constellationItemClick_(constellationId, constellationName || '');
          }
        }
      });
    }
  }   
  
  private caculate_btn_event() {
      // 显示计算过程div
      const processDiv = getEl('caculate-process') as HTMLDivElement;
      if (processDiv) {
        processDiv.style.display = 'block';
      }
      
      // 添加loading效果
      const mainDiv = getEl('decline-simulation-main');
      if (mainDiv) {
        // 创建loading元素
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'decline-simulation-loading';
        loadingDiv.style.position = 'absolute';
        loadingDiv.style.top = '0';
        loadingDiv.style.left = '0';
        loadingDiv.style.width = '100%';
        loadingDiv.style.height = '100%';
        loadingDiv.style.backgroundColor = 'rgba(26, 26, 26, 0.6)'; // 增加透明度，使参数设置可见
        loadingDiv.style.display = 'flex';
        loadingDiv.style.justifyContent = 'center';
        loadingDiv.style.alignItems = 'center';
        loadingDiv.style.zIndex = '1000';
        loadingDiv.style.fontSize = '16px';
        loadingDiv.style.color = '#ffffff';
        loadingDiv.style.borderRadius = '8px';
        
        // 创建更美观的loading动画
        loadingDiv.innerHTML = `
          <div style="text-align: center;">
            <div style="display: inline-flex; align-items: center; justify-content: center; width: 60px; height: 60px;">
              <div style="width: 40px; height: 40px; border: 3px solid rgba(255, 255, 255, 0.1); border-radius: 50%; border-top-color: #4CAF50; animation: spin 1s ease-in-out infinite;"></div>
              <div style="position: absolute; width: 30px; height: 30px; border: 3px solid rgba(255, 255, 255, 0.1); border-radius: 50%; border-top-color: #2196F3; animation: spin 1.5s ease-in-out infinite reverse;"></div>
            </div>
            <div style="margin-top: 15px; font-weight: 500; letter-spacing: 0.5px;">正在进行轨道计算...</div>
            <div style="margin-top: 5px; font-size: 12px; color: rgba(255, 255, 255, 0.7);">请稍候，处理完成后将自动显示结果</div>
          </div>
        `;
        
        // 添加CSS动画
        const style = document.createElement('style');
        style.textContent = `
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `;
        loadingDiv.appendChild(style);
        
        // 添加到主div
        mainDiv.appendChild(loadingDiv);
      }
      
      const selectType = (<HTMLSpanElement>getEl('select_type')).innerHTML;
      
      // 固定使用第三方工具（STK）
      const algorithmType = '2';
      const algorithmSubtype = 'stk';

      if(selectType === '1'){
        //单星仿真
        const selectId = (<HTMLSpanElement>getEl('select_id')).innerHTML;
        if(selectId){
          const startTime = (<HTMLInputElement>getEl('start_time')).value
          const endTime = (<HTMLInputElement>getEl('end_time')).value
          const stepLength = (<HTMLInputElement>getEl('step_length')).value
          const targetDot = (<HTMLInputElement>getEl('target_dot')).value
          const targetLine = (<HTMLInputElement>getEl('target_line')).value
          const targetPlane = (<HTMLInputElement>getEl('target_plane')).value

          const jsonString:string = JSON.stringify({
            "level": 0,
            "ID": selectId,
            "start_time": startTime,
            "end_time": endTime,
            "interval": stepLength,
            "area_data": targetPlane,
            "line_data": targetLine,
            "point_data": targetDot,
            "algorithm_type": algorithmType
          })

          ConstellationDeclineSimulationPlugin.caculate(jsonString);
        }
      }else{
        //星座仿真
        const selectId = (<HTMLSpanElement>getEl('select_id')).innerHTML;
        if(selectId){
          const startTime = (<HTMLInputElement>getEl('start_time')).value
          const endTime = (<HTMLInputElement>getEl('end_time')).value
          const stepLength = (<HTMLInputElement>getEl('step_length')).value
          const targetDot = (<HTMLInputElement>getEl('target_dot')).value
          const targetLine = (<HTMLInputElement>getEl('target_line')).value
          const targetPlane = (<HTMLInputElement>getEl('target_plane')).value

          const jsonString:string = JSON.stringify({
            "level": 1,
            "ID": selectId,
            "start_time": startTime,
            "end_time": endTime,
            "interval": stepLength,
            "area_data": targetPlane,
            "line_data": targetLine,
            "point_data": targetDot,
            "algorithm_type": algorithmType
          })

          ConstellationDeclineSimulationPlugin.caculate(jsonString);
        }
      }
  }

  private static async caculate(paramJsonStr: string) : Promise<void> {
      const url:string = settingsManager.dataSources.tianxunServer + '/simulation_stream';
      const response = await fetch(url, {
        method: 'POST',
        body: paramJsonStr,
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
          'Accept': 'text/event-stream'  // 接收事件流
        }
      });
  
      if (response.ok) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        const processDiv = getEl('caculate-process') as HTMLDivElement;
        let buffer = ''; // 用于累积数据块
        
        if (processDiv) {
          // 获取内容容器
          const contentContainer = getEl('caculate-process-content') as HTMLDivElement;
          if (contentContainer) {
            // 清除之前的内容
            contentContainer.innerHTML = '';
          }
          
          // 处理真正的流式响应
          if (reader) {
            while (true) {
              const { done, value } = await reader.read();
              
              if (done) {
                break;
              }
              
              // 解码接收到的数据
              buffer += decoder.decode(value, { stream: true });
              
              // 处理接收到的所有事件流消息
              let lineEndIndex;
              while ((lineEndIndex = buffer.indexOf('\n\n')) !== -1) {
                // 提取完整的消息
                const message = buffer.substring(0, lineEndIndex).trim();
                // 更新缓冲区，移除已处理的消息
                buffer = buffer.substring(lineEndIndex + 2);
                
                if (message.startsWith('data:')) {
                  // 提取data字段内容
                  const dataContent = message.substring(5).trim();
                  
                  if (dataContent.startsWith('__RESULT__:')) {
                    // 处理最终结果
                    try {
                      // 结束时的返回：
                      // “__RESULT__:{'url': '/maps/单星/1971-067 DEB_05384_20250924-154712/html/7acca74070df47828edae47f886495ec.html', 'message': 'success'}”
                      // 提取JSON部分
                      const resultJson = dataContent.substring(11); // 跳过'__RESULT__:'
                      let resultData;
                      // 替换单引号为双引号以符合JSON标准格式
                      const fixedJson = resultJson.replace(/'/g, '"');
                      resultData = JSON.parse(fixedJson);
                       
                      if (resultData.url) {
                        // 取消loading效果
                        const loadingDiv = getEl('decline-simulation-loading');
                        if (loadingDiv) {
                          loadingDiv.remove();
                        }

                        const tianxunUrl = new URL(settingsManager.dataSources.tianxunServer);
                        const resultUrl = `http://${tianxunUrl.hostname}:8501${resultData.url}`;
                        showModal(resultUrl, {
                          width: '1460px',
                          height: '1200px'
                        });
                        // // 在新页面打开结果URL
                        // window.open(resultUrl, '_blank', 
                        //   'width=1200,height=' + screen.height + ',left=' + (screen.width - 1200) + 
                        //   ',menubar=no,toolbar=no,location=yes,status=yes,scrollbars=yes');
                      }
                    } catch (e) {
                      console.error('解析最终结果失败:', e);
                    }
                  } else {
                    // 处理普通进度信息
                    try {
                      // 显示实际的计算步骤
                      const stepElement = document.createElement('div');
                      stepElement.textContent = `${dataContent}`;
                      stepElement.style.marginBottom = '5px';
                       
                      // 将步骤添加到内容容器中
                      const contentContainer = getEl('caculate-process-content') as HTMLDivElement;
                      if (contentContainer) {
                        contentContainer.appendChild(stepElement);
                        // 滚动到底部，确保最新步骤可见
                        contentContainer.scrollTop = contentContainer.scrollHeight;
                      }
                    } catch (e) {
                      console.error('显示进度信息失败:', e);
                    }
                  }
                }
              }
            }
          }
        }
      } else {
        const successModal = new SuccessModal();
        successModal.show('请求失败，请稍后重试');
      }
  }
}
