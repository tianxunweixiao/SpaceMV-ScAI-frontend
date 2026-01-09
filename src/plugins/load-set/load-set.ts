import { KeepTrackPlugin } from '../KeepTrackPlugin';
import satelliteAlt from '@public/img/icons/satellite-alt.png';

export class LoadSetPlugin extends KeepTrackPlugin {
  readonly id = 'LoadSetPlugin';
  dependencies_ = [];
  bottomIconImg = satelliteAlt;
}
