import satelliteAlt from '@public/img/icons/satellite-alt.png';
import { KeepTrackPlugin } from '../KeepTrackPlugin';
import { keepTrackApi } from '@app/keepTrackApi';
import { getEl, showEl } from '@app/lib/get-el';
import { errorManagerInstance } from '@app/singletons/errorManager';
import { SoundNames } from '../sounds/sounds';
import { ToastMsgType, KeepTrackApiEvents } from '@app/interfaces';

export class ImportConstellationPlugin extends KeepTrackPlugin {
  readonly id = 'ImportConstellationPlugin';
  dependencies_ = [];
  bottomIconImg = satelliteAlt;
  bottomIconLabel = 'Import Constellation';
  bottomIconElementName = 'menu-import-constellation';
  sideMenuElementName = 'import-constellation-menu';
  sideMenuTitle = 'Import Constellation';

  // 设置页面HTML结构
  sideMenuElementHtml = keepTrackApi.html`
    <div id="import-constellation-menu" class="side-menu-parent start-hidden text-select">
      <div id="import-constellation-content" class="side-menu">
        <div class="row">
          <h5 class="center-align">Import Constellation</h5>
          <p class="col s12">Select a TXT file containing satellite TLE data to import a constellation.</p>
        </div>
        
        <div class="row">
          <div class="input-field col s12">
            <input type="file" id="tle-file-input" accept=".txt" style="display: none;" />
            <label for="tle-file-input" class="btn btn-ui waves-effect waves-light">
              <i class="material-icons left">file_upload</i> Select TLE File
            </label>
            <div id="selected-file-name" class="file-path-wrapper">
              <input class="file-path validate" type="text" placeholder="No file selected" readonly />
            </div>
          </div>
        </div>
        
        <div class="row">
          <div class="col s12">
            <div id="file-content-preview" class="file-preview-container start-hidden">
              <h6>File Content Preview:</h6>
              <pre id="file-content" class="file-content"></pre>
            </div>
          </div>
        </div>
        
        <div class="row">
          <div class="col s12 center-align">
            <button id="import-button" class="btn btn-ui waves-effect waves-light" disabled>
              <i class="material-icons left">import_export</i> Import Constellation
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // 添加CSS样式
  private addCss() {
    const style = document.createElement('style');

    style.textContent = `
      .file-preview-container {
        max-height: 300px;
        overflow-y: auto;
        background-color: #f5f5f5;
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
    `;
    document.head.appendChild(style);
  }

  // 处理文件选择
  private handleFileSelection(file: File) {
    const fileNameElement = getEl('selected-file-name')?.querySelector('input') as HTMLInputElement;

    if (fileNameElement) {
      fileNameElement.value = file.name;
    }

    // 读取文件内容并显示预览
    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target?.result as string;
      const previewElement = getEl('file-content') as HTMLElement;
      const previewContainer = getEl('file-content-preview') as HTMLElement;
      const importButton = getEl('import-button') as HTMLButtonElement;

      if (previewElement && previewContainer && importButton) {
        // 限制预览内容长度
        const maxPreviewLength = 1000;
        const previewContent = content.length > maxPreviewLength
          ? `${content.substring(0, maxPreviewLength)}\n... (file truncated for preview)`
          : content;

        previewElement.textContent = previewContent;
        showEl(previewContainer);
        importButton.disabled = false;
      }
    };
    reader.readAsText(file);
  }

  // 导入星座数据
  private importConstellation(fileContent: string) {
    try {
      // 解析TLE文件内容
      const lines = fileContent.trim().split('\n');

      // 检查是否是有效的TLE格式
      if (lines.length < 2 || !lines[0].startsWith('1') || !lines[1].startsWith('2')) {
        throw new Error('Invalid TLE file format. Please ensure the file contains valid TLE data.');
      }

      // 这里可以根据实际需求解析TLE数据

      // 目前只是简单地显示导入成功的消息
      keepTrackApi.getUiManager().toast('Constellation imported successfully!', 'success' as ToastMsgType, true);
      keepTrackApi.getSoundManager()?.play(SoundNames.SUCCESS);

      // 实际项目中，这里应该调用CatalogLoader或相关类来处理TLE数据的导入
      console.log('Importing constellation data with', Math.ceil(lines.length / 2), 'satellites');
    } catch (error) {
      errorManagerInstance.error(error as Error, 'ImportConstellationPlugin', 'Failed to import constellation');
      keepTrackApi.getUiManager().toast(`Failed to import constellation: ${(error as Error).message}`, 'error' as ToastMsgType, true);
    }
  }

  // 当底部图标被点击时的回调
  bottomIconCallback = () => {
    if (!this.isMenuButtonActive) {
      return;
    }
    // 使用标准方式打开侧边菜单
    const menu = getEl(this.sideMenuElementName);

    if (menu) {
      showEl(menu);
    }
    keepTrackApi.getSoundManager()?.play(SoundNames.CLICK);
  };

  // 添加JavaScript逻辑
  addJs(): void {
    super.addJs();

    // 添加CSS样式
    this.addCss();

    // 等待UI加载完成
    keepTrackApi.on(KeepTrackApiEvents.uiManagerFinal, () => {
      // 文件输入事件监听
      const fileInput = getEl('tle-file-input') as HTMLInputElement;
      const importButton = getEl('import-button') as HTMLButtonElement;

      if (fileInput && importButton) {
        fileInput.addEventListener('change', (e) => {
          const target = e.target as HTMLInputElement;

          if (target.files && target.files[0]) {
            this.handleFileSelection(target.files[0]);
          }
        });

        // 导入按钮点击事件
        importButton.addEventListener('click', () => {
          if (fileInput.files && fileInput.files[0]) {
            const reader = new FileReader();

            reader.onload = (e) => {
              const content = e.target?.result as string;

              this.importConstellation(content);
            };
            reader.readAsText(fileInput.files[0]);
          }
        });
      }
    });
  }

  // 初始化插件
  init(): void {
    super.init();
  }
}
