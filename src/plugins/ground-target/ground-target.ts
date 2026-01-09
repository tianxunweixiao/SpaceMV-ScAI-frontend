import { KeepTrackPlugin } from '../KeepTrackPlugin';
import satelliteAlt from '@public/img/icons/satellite-alt.png';

export class GroundTargetPlugin extends KeepTrackPlugin {
  readonly id = 'GroundTargetPlugin';
  dependencies_ = [];
  bottomIconImg = satelliteAlt;
}
