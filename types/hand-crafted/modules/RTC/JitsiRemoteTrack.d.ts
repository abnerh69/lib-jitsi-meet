import JitsiTrack from './JitsiTrack';
import RTC from './RTC';
import JitsiConference from '../../JitsiConference';
import { MediaType } from '../../service/RTC/MediaType';
import { VideoType } from '../../service/RTC/VideoType';
import { SourceName } from '../../service/RTC/SignalingLayer';

export default class JitsiRemoteTrack extends JitsiTrack {
  constructor(rtc: RTC, conference: JitsiConference, ownerEndpointId: string, stream: MediaStream, track: MediaStreamTrack, mediaType: MediaType, videoType: VideoType, ssrc: number, muted: boolean, isP2P: boolean, sourceName: SourceName);
  setMute: ( value: boolean ) => void;
  isMuted: () => boolean;
  getParticipantId: () => string;
  isLocal: () => false;
  getSSRC: () => number;
  /**
   * Returns the tracks source name
   */
  getSourceName(): SourceName;
  toString: () => string;

  containerEvents: [ 'abort', 'canplay', 'canplaythrough', 'emptied', 'ended', 'error', 'loadeddata',
    'loadedmetadata', 'loadstart', 'pause', 'play', 'playing', 'ratechange', 'stalled', 'suspend',
    'waiting' ]; // TODO: this might be private
}