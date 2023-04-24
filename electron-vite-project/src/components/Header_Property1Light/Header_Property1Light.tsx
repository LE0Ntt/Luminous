import { memo } from 'react';
import type { FC } from 'react';

import resets from '../_resets.module.css';
import { BookmarksIcon } from './BookmarksIcon.js';
import { ButtonDarkmodeIcon } from './ButtonDarkmodeIcon.js';
import { Camera_indoorIcon } from './Camera_indoorIcon.js';
import classes from './Header_Property1Light.module.css';
import { SlideshowIcon } from './SlideshowIcon.js';
import { TuneIcon } from './TuneIcon.js';

interface Props {
  className?: string;
}
/* @figmaId 320:3744 */
export const Header_Property1Light: FC<Props> = memo(function Header_Property1Light(props = {}) {
  return (
    <div className={`${resets.storybrainResets} ${classes.root}`}>
      <div className={classes.header}></div>
      <div className={classes.upperSettings}>
        <div className={classes.luminous_Logo_black1}></div>
        <div className={classes.settings}>Settings</div>
        <div className={classes.help}>Help</div>
      </div>
      <div className={classes.buttonDarkmode}>
        <ButtonDarkmodeIcon className={classes.icon} />
      </div>
      <div className={classes.menu}>
        <button className={classes.buttonStudio}>
          <div className={classes.fill}></div>
          <div className={classes.studio}>Studio</div>
          <div className={classes.camera_indoor}>
            <Camera_indoorIcon className={classes.icon2} />
          </div>
        </button>
        <button className={classes.buttonControl}>
          <div className={classes.fill2}></div>
          <div className={classes.control}>Control</div>
          <div className={classes.tune}>
            <TuneIcon className={classes.icon3} />
          </div>
        </button>
        <button className={classes.buttonScenes}>
          <div className={classes.fill3}></div>
          <div className={classes.scenes}>Scenes</div>
          <div className={classes.bookmarks}>
            <BookmarksIcon className={classes.icon4} />
          </div>
        </button>
        <button className={classes.buttonShow}>
          <div className={classes.fill4}></div>
          <div className={classes.show}>Show</div>
          <div className={classes.slideshow}>
            <SlideshowIcon className={classes.icon5} />
          </div>
        </button>
      </div>
    </div>
  );
});
