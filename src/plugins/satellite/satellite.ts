import { KeepTrackPlugin } from '../KeepTrackPlugin';
import satelliteAlt from '@public/img/icons/satellite-alt.png';

import { KeepTrackApiEvents, MenuMode } from '@app/interfaces';
import { keepTrackApi } from '@app/keepTrackApi';
import { getEl } from '@app/lib/get-el';
import { settingsManager } from '@app/settings/settings';
import { SelectSatManager } from '../select-sat-manager/select-sat-manager';
import { SoundNames } from '../sounds/sounds';
import { TopMenu } from '../top-menu/top-menu';
import { SearchResultType } from '@app/singletons/search-manager';

interface SatelliteObject {
  id: number;
  name?: string;
  sccNum: number | string;
}

export class SatellitePlugin extends KeepTrackPlugin {
  readonly id = 'SatellitePlugin';
  dependencies_ = [TopMenu.name, SelectSatManager.name];
  bottomIconImg = satelliteAlt;
  menuMode: MenuMode[] = [MenuMode.ALL];
  // 防抖计时器
  private searchTimeout: number | null = null;
  // 防抖延迟时间（毫秒）
  private readonly DEBOUNCE_DELAY = 800;
  // 虚拟滚动相关属性
  private readonly ITEM_HEIGHT = 36; // 每个卫星项的高度（像素）
  private readonly BUFFER_SIZE = 20; // 缓冲区大小
  private cachedFilteredSats: SatelliteObject[] = [];// 缓存过滤后的卫星数据
  private resultCountElement: HTMLElement | null = null;
  sideMenuElementHtml = keepTrackApi.html`
    <div id="satellite" class="side-menu-parent start-hidden text-select">
      <div id="satellite-menu" class="side-menu">
        <div class="search-container">
          <input type="text" id="satellite-search" placeholder="搜索卫星..." class="search-input">
        </div>
        <div id="satellite-list-container" class="scrollable">
          <div id="satellite-result-count" class="result-count"></div>
          <ul id="satellite-list" style="transform: translateY(0px); position: relative;"></ul>
        </div>
      </div>
    </div>
    `;
  sideMenuElementName = 'satellite';

  addHtml() {
    super.addHtml();

    keepTrackApi.on(
      KeepTrackApiEvents.uiManagerFinal,
      () => {
        this.resultCountElement = getEl('satellite-result-count');
        this.updateSatelliteList();

        // 为搜索框添加防抖的事件监听器
        const searchInput = <HTMLInputElement>getEl('satellite-search');

        if (searchInput) {
          searchInput.addEventListener('input', (event) => {
            const searchTerm = (event.target as HTMLInputElement).value;

            this.debouncedSearch(searchTerm);
          });
        }

        // 为滚动容器添加滚动事件监听器
        const listContainer = getEl('satellite-list-container');

        if (listContainer) {
          listContainer.addEventListener('scroll', () => this.handleScroll_());
        }

        // 使用事件委托处理点击事件
        this.setupEventDelegation();
      },
    );
  }

  /**
   * 搜索防抖函数，避免频繁触发搜索
   */
  private debouncedSearch(searchTerm: string) {
    // 清除之前的计时器
    if (this.searchTimeout !== null) {
      clearTimeout(this.searchTimeout);
    }

    // 设置新的延迟执行
    this.searchTimeout = window.setTimeout(() => {
      this.updateSatelliteList(searchTerm);
    }, this.DEBOUNCE_DELAY);
  }

  /**
   * 处理滚动事件，实现虚拟滚动
   */
  private handleScroll_() {
    this.renderVisibleItems_();
  }

  /**
   * 更新卫星列表，可以根据搜索词过滤
   */
  private updateSatelliteList(searchTerm: string = '') {
    // 生成并缓存过滤后的卫星数据
    this.cachedFilteredSats = this.filterAndSortSatellites_(searchTerm);

    // 更新结果计数显示
    if (this.resultCountElement) {
      const totalSatsCount = keepTrackApi.getCatalogManager().getSats()?.length || 0;
      const resultsCount = this.cachedFilteredSats.length;

      const titleText = searchTerm.trim()
        ? `搜索结果: ${resultsCount} 个`
        : `所有卫星: ${totalSatsCount} 个`;

      this.resultCountElement.textContent = titleText;
    }

    // 重置滚动位置
    const listContainer = getEl('satellite-list-container');

    if (listContainer) {
      listContainer.scrollTop = 0;
    }

    // 渲染可见项
    this.renderVisibleItems_();
  }

  /**
   * 渲染可见区域的卫星项
   */
  private renderVisibleItems_() {
    const listElement = getEl('satellite-list');
    const listContainer = getEl('satellite-list-container');

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

      li.className = 'menu-selectable satellite-item';
      li.setAttribute('data-sat-id', sat.id.toString());
      li.textContent = sat.name || `未知卫星 (${sat.sccNum})`;
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
   * 设置事件委托，避免为每个卫星项单独添加事件监听器
   */
  private setupEventDelegation() {
    const listElement = getEl('satellite-list');

    if (listElement) {
      listElement.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;
        const satelliteItem = target.closest('li.satellite-item');

        if (satelliteItem) {
          keepTrackApi.getSoundManager()?.play(SoundNames.CLICK);
          const satId = parseInt(satelliteItem.getAttribute('data-sat-id') || '-1');

          if (!isNaN(satId)) {
            this.satelliteItemClick_(satId);
          }
        }
      });
    }
  }
   /**
    * 过滤和排序卫星数据
    */
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

  /**
   * 处理卫星项点击事件
   */
  private satelliteItemClick_(satId: number): void {
    const catalogManagerInstance = keepTrackApi.getCatalogManager();
    const uiManagerInstance = keepTrackApi.getUiManager();
    const selectSatManager = keepTrackApi.getPlugin(SelectSatManager);

    if (!selectSatManager) {
      return;
    }

    // 选中卫星
    selectSatManager.selectSat(satId);

    // 在搜索框中显示卫星信息
    const searchDOM = <HTMLInputElement>getEl('search');
    const sat = catalogManagerInstance.getSat(satId);

    if (searchDOM && sat) {
      searchDOM.value = sat.sccNum.toString();
      uiManagerInstance.searchManager.fillResultBox(
        [
          {
            id: satId,
            searchType: SearchResultType.STAR,
            strIndex: 0, // 默认索引位置
            patlen: 0,
          },
        ],
        catalogManagerInstance,
      );
    }

    // 如果在移动模式下，关闭菜单
    if (settingsManager.isMobileModeEnabled) {
      uiManagerInstance.searchManager.closeSearch();
    }
    uiManagerInstance.hideSideMenus();
  }

  /**
   * 添加必要的CSS样式
   */
  addJs() {
    super.addJs();

    // 添加滚动容器样式
    const styleSheet = document.createElement('style');

    styleSheet.textContent = `
      /* 确保侧菜单不显示滚动条 */
      #satellite-menu {
        overflow: hidden;
        height: 100%;
        display: flex;
        flex-direction: column;
      }
      
      /* 搜索容器样式 */
      .search-container {
        padding: 10px;
      }
      
      /* 滚动容器样式 - 只保留这一个滚动条 */
      #satellite-list-container {
        position: relative;
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
        margin: 0;
        padding: 0;
      }
      
      /* 隐藏滚动条但保留滚动功能（适用于WebKit浏览器） */
      #satellite-list-container::-webkit-scrollbar {
        display: none;
      }
      
      /* 隐藏滚动条但保留滚动功能（适用于IE、Edge和Firefox） */
      #satellite-list-container {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
      
      /* 卫星列表样式 */
      #satellite-list {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        list-style-type: none;
        margin: 0;
        padding: 0;
      }
      
      /* 卫星项样式 */
      .satellite-item {
        border-bottom: none;
        cursor: pointer;
        transition: background-color 0.2s;
      }
      
      .satellite-item:hover {
        background-color: #f5f5f5;
        color: #212121;
      }
      
      .satellite-item:active {
        background-color: #e0e0e0;
        color: #212121;
      }
      
      /* 结果计数样式 */
      .result-count {
        padding: 12px 16px;
        font-weight: bold;
        text-align: center;
      }
    `;

    document.head.appendChild(styleSheet);
  }
}
