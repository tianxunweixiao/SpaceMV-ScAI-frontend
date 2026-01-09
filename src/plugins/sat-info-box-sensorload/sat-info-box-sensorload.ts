/* eslint-disable max-lines */
import { KeepTrackApiEvents } from '@app/interfaces';
import { keepTrackApi } from '@app/keepTrackApi';
import { KeepTrackPlugin } from '../KeepTrackPlugin';
import { SatInfoBox } from '../sat-info-box/sat-info-box';
import { getEl} from '@app/lib/get-el';
import { BaseObject, DetailedSatellite } from 'ootk';
import { SuccessModal } from '@app/singletons/SuccessModal';

const SECTIONS = {
  SENSORLOAD: 'sensorload-section',
};

export interface SatParam {
  sensor_type: number; 
  hha: number;
  vha: number;
  max_pa: number;
  min_pa: number;
  max_aa: number;
  min_aa: number;
  roll: number;
  pitch: number;
  yaw: number;
  Mobility: number;
  Band: number; 
}

export class SatInfoBoxSensorLoad extends KeepTrackPlugin {
  readonly id = 'SatInfoBoxSensorLoad';
  dependencies_: string[] = [SatInfoBox.name];
  
  addHtml(): void {
    super.addHtml();

    keepTrackApi.on(KeepTrackApiEvents.satInfoBoxInit, () => {
      keepTrackApi.getPlugin(SatInfoBox)!.addElement({ html: this.createSensorLoadSection(), order: 4 });
    });

    keepTrackApi.on(
      KeepTrackApiEvents.uiManagerFinal, this.addListeners_.bind(this)
    );
  }

  private createSensorLoadSection(): string {
      return keepTrackApi.html`
          <div id="${SECTIONS.SENSORLOAD}">
            <div style="display:none" id="hide_sat_sccNum"></div>
            <div class="sat-info-section-header">
              传感器载荷设置
              <span id="${SECTIONS.SENSORLOAD}-collapse" class="section-collapse material-icons">expand_less</span>
            </div>
            <div class="switch row">
              <label>
                <input id="sensor_optical" type="checkbox" checked/>
                <span class="lever"></span>
                光学
              </label>
              <label>
                <input id="sensor_sar" type="checkbox" />
                <span class="lever"></span>
                SAR
              </label>
            </div>
            <hr>
            <p>参数设置:</p>
            <div id="div_optical">
                <div class="sat-info-row">
                  <div class="sat-info-key">水平半张角(度):</div>
                  <div class="sat-info-value"><input type="text" id="horizontal_half_angle" value="30"></div>
                </div>
                <div class="sat-info-row">
                  <div class="sat-info-key">垂直半张角(度):</div>
                  <div class="sat-info-value"><input type="text" id="vertical_half_angle" value="30"></div>
                </div>
                <div class="sat-info-row">
                  <div class="sat-info-key">滚动角(度):</div>
                  <div class="sat-info-value"><input type="text" id="roll_angle1" value="30"></div>
                </div>
                <div class="sat-info-row">
                  <div class="sat-info-key">俯仰角(度):</div>
                  <div class="sat-info-value"><input type="text" id="pitch_angle1" value="30"></div>
                </div>
                <div class="sat-info-row">
                  <div class="sat-info-key">偏航角(度):</div>
                  <div class="sat-info-value"><input type="text" id="turn_angle1" value="30"></div>
                </div>
                <div class="sat-info-row">
                  <div class="sat-info-key">机动能力:</div>
                  <div class="sat-info-value"><input type="text" id="mobile_angle1" value="30"></div>
                </div>
                <p>谱段:</p>
                <div class="switch row">
                    <label>
                        <input id="spectral_band_optical" type="checkbox" checked/>
                        <span class="lever"></span>
                        全色
                    </label>
                    <label>
                        <input id="spectral_band_special" type="checkbox" />
                        <span class="lever"></span>
                        特定谱段
                    </label>
                    <label>
                        <input id="spectral_band_ir" type="checkbox" />
                        <span class="lever"></span>
                        红外
                    </label>
                </div>
            </div>
            <div id="div_sar" style="display:none">
                <div class="sat-info-row">
                    <div class="sat-info-key">最大俯仰角(度):</div>
                    <div class="sat-info-value"><input type="text" id="pitch_angle_max" value="90"></div>
                </div>
                <div class="sat-info-row">
                    <div class="sat-info-key">最小俯仰角(度):</div>
                    <div class="sat-info-value"><input type="text" id="pitch_angle_min" value="90"></div>
                </div>
                <div class="sat-info-row">
                    <div class="sat-info-key">最大方位角(度):</div>
                    <div class="sat-info-value"><input type="text" id="azimuth_angle_max" value="65"></div>
                </div>
                <div class="sat-info-row">
                    <div class="sat-info-key">最小方位角(度):</div>
                    <div class="sat-info-value"><input type="text" id="azimuth_angle_min" value="65"></div>
                </div>
                <div class="sat-info-row">
                  <div class="sat-info-key">滚动角(度):</div>
                  <div class="sat-info-value"><input type="text" id="roll_angle2" value="30"></div>
                </div>
                <div class="sat-info-row">
                  <div class="sat-info-key">俯仰角(度):</div>
                  <div class="sat-info-value"><input type="text" id="pitch_angle2" value="30"></div>
                </div>
                <div class="sat-info-row">
                  <div class="sat-info-key">偏航角(度):</div>
                  <div class="sat-info-value"><input type="text" id="turn_angle2" value="30"></div>
                </div>
                <div class="sat-info-row">
                  <div class="sat-info-key">机动能力:</div>
                  <div class="sat-info-value"><input type="text" id="mobile_angle2" value="30"></div>
                </div>
                <p>波段:</p>
                <div class="switch row">
                    <label>
                        <input id="band_X" type="checkbox" checked/>
                        <span class="lever"></span>
                        X
                    </label>
                    <label>
                        <input id="band_Ku" type="checkbox" />
                        <span class="lever"></span>
                        Ku
                    </label>
                    <label>
                        <input id="band_Ka" type="checkbox" />
                        <span class="lever"></span>
                        Ka
                    </label>
                </div>
            </div>
            <div class="sat-info-row">
              <button type="button" id="btn_sensorload_set">确定</button>
            </div>
          </div>
        `;
  }

  addJs(): void {
    super.addJs();

    keepTrackApi.on(KeepTrackApiEvents.selectSatData, this.updateSatInfo_.bind(this));
  }

  private updateSatInfo_(obj: BaseObject) {
    if (obj === null || typeof obj === 'undefined') {
      return;
    }

    if (obj.isSatellite()) {
      const sat = obj as DetailedSatellite;
      
      (<HTMLDivElement>getEl('hide_sat_sccNum')).innerHTML = `${sat.sccNum}`

      SatInfoBoxSensorLoad.getSatParamfromDB_(sat.sccNum);
    }      
  }

  private addListeners_() {
    getEl('sensor_optical')?.addEventListener('click', () => {this.ck_optical_checked();});
    getEl('sensor_sar')?.addEventListener('click', () => {this.ck_sar_checked();});   

    getEl('spectral_band_optical')?.addEventListener('click', () => {this.ck_band_optical_checked();});  
    getEl('spectral_band_special')?.addEventListener('click', () => {this.ck_band_special_checked();});  
    getEl('spectral_band_ir')?.addEventListener('click', () => {this.ck_band_ir_checked();});  

    getEl('band_X')?.addEventListener('click', () => {this.ck_band_X_checked();});  
    getEl('band_Ku')?.addEventListener('click', () => {this.ck_band_Ku_checked();});  
    getEl('band_Ka')?.addEventListener('click', () => {this.ck_band_Ka_checked();});  

    const setButton = getEl('btn_sensorload_set') as HTMLButtonElement;
    if(setButton){
      setButton.addEventListener('click', () => {
        let satellite_id:string = '';
        let sensor_type:number = 1;
        let hha:number = -1;
        let vha:number = -1;
        let max_pa:number = -1;
        let min_pa:number = -1;
        let max_aa:number = -1;
        let min_aa:number = -1;
        let roll:number = -1;
        let pitch:number = -1;
        let yaw:number = -1;
        let Mobility:number = -1;
        let Band:number = 1;
        
        satellite_id = (<HTMLDivElement>getEl('hide_sat_sccNum')).innerHTML;

        const satSensorlInput = getEl('sensor_optical') as HTMLInputElement;
        if(satSensorlInput.checked){
          sensor_type = 1

          hha = parseFloat((<HTMLInputElement>getEl('horizontal_half_angle')).value);
          vha = parseFloat((<HTMLInputElement>getEl('vertical_half_angle')).value)
          roll = parseFloat((<HTMLInputElement>getEl('roll_angle1')).value)
          pitch = parseFloat((<HTMLInputElement>getEl('pitch_angle1')).value)
          yaw = parseFloat((<HTMLInputElement>getEl('turn_angle1')).value)
          Mobility = parseFloat((<HTMLInputElement>getEl('mobile_angle1')).value)

          if((<HTMLInputElement>getEl('spectral_band_optical')).checked){
            Band = 1;
          }else if((<HTMLInputElement>getEl('spectral_band_special')).checked){
            Band = 2;
          }else if((<HTMLInputElement>getEl('spectral_band_ir')).checked){
            Band = 3;
          }
        }else{
          sensor_type = 2;

          max_pa = parseFloat((<HTMLInputElement>getEl('pitch_angle_max')).value);
          min_pa = parseFloat((<HTMLInputElement>getEl('pitch_angle_min')).value);
          max_aa = parseFloat((<HTMLInputElement>getEl('azimuth_angle_max')).value);
          min_aa = parseFloat((<HTMLInputElement>getEl('azimuth_angle_min')).value);
          roll = parseFloat((<HTMLInputElement>getEl('roll_angle2')).value);
          pitch = parseFloat((<HTMLInputElement>getEl('pitch_angle2')).value);
          yaw = parseFloat((<HTMLInputElement>getEl('turn_angle2')).value);
          Mobility = parseFloat((<HTMLInputElement>getEl('mobile_angle2')).value);

          if((<HTMLInputElement>getEl('band_X')).checked){
            Band = 1;
          }else if((<HTMLInputElement>getEl('band_Ku')).checked){
            Band = 2;
          }else if((<HTMLInputElement>getEl('band_Ka')).checked){
            Band = 3;
          }
        }

        const jsonString:string = JSON.stringify({
          "satellite_id": satellite_id,
          "sensor_type": sensor_type,
          "hha": hha,
          "vha": vha,
          "max_pa": max_pa,
          "min_pa": min_pa,
          "max_aa": max_aa,
          "min_aa": min_aa,
          "roll": roll,
          "pitch": pitch,
          "yaw": yaw,
          "Mobility": Mobility,
          "Band": Band
        })

        SatInfoBoxSensorLoad.saveParamToDB_(jsonString);
      });
    }
  }

  private static async saveParamToDB_(paramJsonStr: string):Promise<void> {
    const url:string = settingsManager.dataSources.tianxunServer + '/sensors';
    const response = await fetch(url, {
      method: 'POST',
      body: paramJsonStr,
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
      const responseData = await response.json();
      if(responseData.status == 'success'){
        console.log("save db----> ok!")
        const successModal = new SuccessModal();
        successModal.show("保存成功！");
      }
    }
  }

  private static async getSatParamfromDB_(sccNum: string): Promise<void> {
    const url:string = settingsManager.dataSources.tianxunServer + '/sensors_find/' + sccNum;
    await fetch(url)
    .then(response => response.json())
    .then(data => {
        console.log(data);      
        SatInfoBoxSensorLoad.parse(data as SatParam)
    })
    .catch(error => console.error('error:', error));
  }

  static async parse(statParam: SatParam): Promise<void> {
    console.log(statParam)

    if(statParam.sensor_type === 1){
      (<HTMLInputElement>getEl('sensor_optical')).checked = true;
      (<HTMLInputElement>getEl('sensor_sar')).checked = false;

      (<HTMLInputElement>getEl('horizontal_half_angle')).value = statParam.hha.toString();
      (<HTMLInputElement>getEl('vertical_half_angle')).value = statParam.vha.toString();
      (<HTMLInputElement>getEl('roll_angle1')).value = statParam.roll.toString();
      (<HTMLInputElement>getEl('pitch_angle1')).value = statParam.pitch.toString();
      (<HTMLInputElement>getEl('turn_angle1')).value = statParam.yaw.toString();
      (<HTMLInputElement>getEl('mobile_angle1')).value = statParam.Mobility.toString();

      if(statParam.Band === 1){
        (<HTMLInputElement>getEl('spectral_band_optical')).checked = true;
        (<HTMLInputElement>getEl('spectral_band_special')).checked = false;
        (<HTMLInputElement>getEl('spectral_band_ir')).checked = false;
      }else if(statParam.Band === 2){
        (<HTMLInputElement>getEl('spectral_band_optical')).checked = false;
        (<HTMLInputElement>getEl('spectral_band_special')).checked = true;
        (<HTMLInputElement>getEl('spectral_band_ir')).checked = false;
      }else{
        (<HTMLInputElement>getEl('spectral_band_optical')).checked = false;
        (<HTMLInputElement>getEl('spectral_band_special')).checked = false;
        (<HTMLInputElement>getEl('spectral_band_ir')).checked = true;
      }

      (<HTMLInputElement>getEl('div_optical')).style.display = 'block';
      (<HTMLInputElement>getEl('div_sar')).style.display = 'none';
    }else{
      (<HTMLInputElement>getEl('sensor_optical')).checked = false;
      (<HTMLInputElement>getEl('sensor_sar')).checked = true;

      (<HTMLInputElement>getEl('pitch_angle_max')).value = statParam.max_pa.toString();
      (<HTMLInputElement>getEl('pitch_angle_min')).value = statParam.min_pa.toString();
      (<HTMLInputElement>getEl('azimuth_angle_max')).value = statParam.max_aa.toString();
      (<HTMLInputElement>getEl('azimuth_angle_min')).value = statParam.min_aa.toString();
      (<HTMLInputElement>getEl('roll_angle2')).value = statParam.roll.toString();
      (<HTMLInputElement>getEl('pitch_angle2')).value = statParam.pitch.toString();
      (<HTMLInputElement>getEl('turn_angle2')).value = statParam.yaw.toString();
      (<HTMLInputElement>getEl('mobile_angle2')).value = statParam.Mobility.toString();

      if(statParam.Band === 1){
        (<HTMLInputElement>getEl('band_X')).checked = true;
        (<HTMLInputElement>getEl('band_Ku')).checked = false;
        (<HTMLInputElement>getEl('band_Ka')).checked = false;
      }else if(statParam.Band === 2){
        (<HTMLInputElement>getEl('band_X')).checked = false;
        (<HTMLInputElement>getEl('band_Ku')).checked = true;
        (<HTMLInputElement>getEl('band_Ka')).checked = false;
      }else{
        (<HTMLInputElement>getEl('band_X')).checked = false;
        (<HTMLInputElement>getEl('band_Ku')).checked = false;
        (<HTMLInputElement>getEl('band_Ka')).checked = true;
      }

      (<HTMLInputElement>getEl('div_optical')).style.display = 'none';
      (<HTMLInputElement>getEl('div_sar')).style.display = 'block';
    } 
  }

  ck_optical_checked() {
    (<HTMLInputElement>getEl('sensor_optical')).checked = true;
    (<HTMLInputElement>getEl('sensor_sar')).checked = false;

    (<HTMLInputElement>getEl('div_optical')).style.display = 'block';
    (<HTMLInputElement>getEl('div_sar')).style.display = 'none';
  }

  ck_sar_checked() {
    (<HTMLInputElement>getEl('sensor_optical')).checked = false;
    (<HTMLInputElement>getEl('sensor_sar')).checked = true;

    (<HTMLInputElement>getEl('div_optical')).style.display = 'none';
    (<HTMLInputElement>getEl('div_sar')).style.display = 'block';
  }

  ck_band_optical_checked() {
    (<HTMLInputElement>getEl('spectral_band_optical')).checked = true;
    (<HTMLInputElement>getEl('spectral_band_special')).checked = false;
    (<HTMLInputElement>getEl('spectral_band_ir')).checked = false;
  }

  ck_band_special_checked() {
    (<HTMLInputElement>getEl('spectral_band_optical')).checked = false;
    (<HTMLInputElement>getEl('spectral_band_special')).checked = true;
    (<HTMLInputElement>getEl('spectral_band_ir')).checked = false;
  }

  ck_band_ir_checked() {
    (<HTMLInputElement>getEl('spectral_band_optical')).checked = false;
    (<HTMLInputElement>getEl('spectral_band_special')).checked = false;
    (<HTMLInputElement>getEl('spectral_band_ir')).checked = true;
  }

  ck_band_X_checked() {
    (<HTMLInputElement>getEl('band_X')).checked = true;
    (<HTMLInputElement>getEl('band_Ku')).checked = false;
    (<HTMLInputElement>getEl('band_Ka')).checked = false;
  }

  ck_band_Ku_checked() {
    (<HTMLInputElement>getEl('band_X')).checked = false;
    (<HTMLInputElement>getEl('band_Ku')).checked = true;
    (<HTMLInputElement>getEl('band_Ka')).checked = false;
  }

  ck_band_Ka_checked() {
    (<HTMLInputElement>getEl('band_X')).checked = false;
    (<HTMLInputElement>getEl('band_Ku')).checked = false;
    (<HTMLInputElement>getEl('band_Ka')).checked = true;
  }
}
