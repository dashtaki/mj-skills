import React from 'react';
import { Composition } from 'remotion';
import { DemoVideo } from './DemoVideo';
import timeline from './timeline.json';

// Add one <Composition> per feature video.
export const RemotionRoot: React.FC = () => (
  <Composition
    id="DemoVideo"
    component={DemoVideo}
    durationInFrames={timeline.duration}
    fps={timeline.fps}
    width={1920}
    height={1080}
  />
);
