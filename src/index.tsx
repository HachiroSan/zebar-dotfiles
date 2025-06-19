/* @refresh reload */
import './index.css';
import { render } from 'solid-js/web';
import { createStore } from 'solid-js/store';
import { createSignal } from 'solid-js';
import * as zebar from 'zebar';
// Modern minimalist icons from solid-icons
import { 
  HiSolidCpuChip,
  HiSolidCircleStack,
  HiSolidSpeakerWave,
  HiSolidSun,
  HiSolidMoon,
  HiSolidCloud,
  HiSolidBolt,
  HiSolidArrowsRightLeft,
  HiSolidArrowsUpDown,
  HiSolidBattery100,
  HiSolidBattery50,
  HiSolidBattery0,
  HiSolidSignal,  HiSolidExclamationTriangle,
  HiSolidPlay,
  HiSolidPause,
  HiSolidBackward,
  HiSolidForward,
  HiSolidCloudArrowDown,
  HiSolidEye,
  HiSolidMusicalNote,
  HiSolidSpeakerXMark
} from 'solid-icons/hi';
import { BsEthernet } from 'solid-icons/bs'
import { FiWifi } from 'solid-icons/fi'
import { FaSolidMemory } from 'solid-icons/fa'
import { FiCpu } from 'solid-icons/fi'
const providers = zebar.createProviderGroup({
  glazewm: { type: 'glazewm' },
  network: { type: 'network', refreshInterval: 500 }, // 0.5 second refresh for ultra-fast traffic monitoring
  cpu: { type: 'cpu' },
  battery: { type: 'battery' },
  memory: { type: 'memory' },  weather: { type: 'weather' },
  date: { type: 'date', formatting: 'EEE d MMM t' },
  audio: { type: 'audio' },
  media: { type: 'media' },
});

render(() => <App />, document.getElementById('root')!);

function App() {
  const [output, setOutput] = createStore(providers.outputMap);
  const [showDetailedNetwork, setShowDetailedNetwork] = createSignal(false);
  const [showDetailedMedia, setShowDetailedMedia] = createSignal(false);
  const [showDetailedWeather, setShowDetailedWeather] = createSignal(false);
  const [showVolumeDevices, setShowVolumeDevices] = createSignal(false);

  providers.onOutput(outputMap => setOutput(outputMap));
  // Get modern icon for network status
  const getNetworkIcon = (networkOutput: any) => {
    if (!networkOutput.defaultInterface) {
      return <HiSolidExclamationTriangle size={12} />;
    }
    
    switch (networkOutput.defaultInterface.type) {
      case 'ethernet':
        return <BsEthernet size={12} />;
      case 'wifi':
      case 'wireless':
        return <FiWifi size={12} />;
      default:
        return <HiSolidSignal size={12} />;
    }
  };

  // Format network traffic data
  const formatNetworkTraffic = (traffic: any) => {
    if (!traffic) return { down: '0 B/s', up: '0 B/s' };
    
    const formatBytes = (bytes: number) => {
      if (bytes < 1024) return `${bytes} B/s`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB/s`;
      if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB/s`;
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB/s`;
    };

    return {
      down: formatBytes(traffic.received?.bytes || 0),
      up: formatBytes(traffic.transmitted?.bytes || 0)
    };
  };

  // Get modern icon for battery level
  const getBatteryIcon = (batteryOutput: any) => {
    if (batteryOutput.chargePercent > 60) {
      return <HiSolidBattery100 size={12} />;
    } else if (batteryOutput.chargePercent > 20) {
      return <HiSolidBattery50 size={12} />;
    }
    return <HiSolidBattery0 size={12} />;
  };
  // Get modern icon for weather status with better variety
  const getWeatherIcon = (weatherOutput: any) => {
    switch (weatherOutput.status) {
      case 'clear_day':
        return <HiSolidSun size={12} style={{ color: '#f9e2af' }} />;
      case 'clear_night':
        return <HiSolidMoon size={12} style={{ color: '#cba6f7' }} />;
      case 'cloudy_day':
      case 'cloudy_night':
        return <HiSolidCloud size={12} style={{ color: '#9399b2' }} />;
      case 'light_rain_day':
      case 'light_rain_night':
        return <HiSolidCloudArrowDown size={12} style={{ color: '#89b4fa' }} />;
      case 'heavy_rain_day':
      case 'heavy_rain_night':
        return <HiSolidCloudArrowDown size={12} style={{ color: '#74c7ec' }} />;
      case 'snow_day':
      case 'snow_night':
        return <HiSolidCloud size={12} style={{ color: '#f5f5f5' }} />;
      case 'thunder_day':
      case 'thunder_night':
        return <HiSolidBolt size={12} style={{ color: '#f9e2af' }} />;
      case 'fog':
      case 'mist':
        return <HiSolidEye size={12} style={{ color: '#6c7086' }} />;
      default:
        return <HiSolidCloud size={12} style={{ color: '#cdd6f4' }} />;
    }
  };

  // Get weather description for detailed view
  const getWeatherDescription = (weatherOutput: any) => {
    const statusMap: Record<string, string> = {
      clear_day: 'Clear',
      clear_night: 'Clear',
      cloudy_day: 'Cloudy',
      cloudy_night: 'Cloudy',
      light_rain_day: 'Light Rain',
      light_rain_night: 'Light Rain',
      heavy_rain_day: 'Heavy Rain',
      heavy_rain_night: 'Heavy Rain',
      snow_day: 'Snow',
      snow_night: 'Snow',
      thunder_day: 'Thunderstorm',
      thunder_night: 'Thunderstorm',
      fog: 'Foggy',
      mist: 'Misty'
    };
    return statusMap[weatherOutput.status] || 'Unknown';
  };

  // Format media session info
  const formatMediaInfo = (session: any) => {
    if (!session) return null;
    
    const title = session.title || 'Unknown Track';
    const artist = session.artist || 'Unknown Artist';
    
    // Truncate long titles/artists for compact display
    const truncate = (str: string, length: number) => 
      str.length > length ? str.substring(0, length) + '...' : str;
    
    return {
      title: truncate(title, 25),
      artist: truncate(artist, 20),
      shortTitle: truncate(title, 15),
      shortArtist: truncate(artist, 12)
    };
  };

  // Media control handlers
  const handleMediaControl = async (action: string) => {
    if (!output.media) return;
    
    try {
      switch (action) {
        case 'play':
          await output.media.play();
          break;
        case 'pause':
          await output.media.pause();
          break;
        case 'toggle':
          await output.media.togglePlayPause();
          break;
        case 'next':
          await output.media.next();
          break;
        case 'previous':
          await output.media.previous();
          break;
      }
    } catch (error) {
      console.error('Media control error:', error);
    }
  };

  // Volume control helpers
  const handleVolumeControl = async (action: string, deviceId?: string, volume?: number) => {
    if (!output.audio) return;
    
    try {
      switch (action) {
        case 'setVolume':
          if (volume !== undefined) {
            await output.audio.setVolume(volume, deviceId ? { deviceId } : undefined);
          }
          break;
        case 'mute':
          await output.audio.setVolume(0, deviceId ? { deviceId } : undefined);
          break;        case 'volumeUp':
          const currentUp = deviceId ? 
            output.audio.playbackDevices.find((d: any) => d.deviceId === deviceId)?.volume || 0 :
            output.audio.defaultPlaybackDevice?.volume || 0;
          await output.audio.setVolume(Math.min(100, currentUp + 10), deviceId ? { deviceId } : undefined);
          break;
        case 'volumeDown':
          const currentDown = deviceId ? 
            output.audio.playbackDevices.find((d: any) => d.deviceId === deviceId)?.volume || 0 :
            output.audio.defaultPlaybackDevice?.volume || 0;
          await output.audio.setVolume(Math.max(0, currentDown - 10), deviceId ? { deviceId } : undefined);
          break;
      }
    } catch (error) {
      console.error('Volume control error:', error);
    }
  };

  // Get volume icon based on level
  const getVolumeIcon = (volume: number) => {
    if (volume === 0) return <HiSolidSpeakerXMark size={12} />;
    if (volume < 30) return <HiSolidSpeakerWave size={12} />;
    return <HiSolidSpeakerWave size={12} />;
  };
  // Format device name for display
  const formatDeviceName = (name: string) => {
    const truncate = (str: string, length: number) => 
      str.length > length ? str.substring(0, length) + '...' : str;
    
    // Remove common prefixes like "Speakers", "Headphones", etc.
    let cleanName = name
      .replace(/^Speakers\s*-?\s*/i, '')
      .replace(/^Headphones\s*-?\s*/i, '')
      .replace(/^Microphone\s*-?\s*/i, '')
      .replace(/^\(\s*/, '')
      .replace(/\s*\)$/, '');
    
    // If the cleaned name is empty or too short, use original
    if (cleanName.length < 3) {
      cleanName = name;
    }
    
    return truncate(cleanName, 20);
  };

  return (
    <div class="app">      <div class="left">
        {output.glazewm && (
          <div class="chip workspaces-chip">
            <div class="workspaces">
              {output.glazewm.currentWorkspaces?.map((workspace: any) => (
                <button
                  class={`workspace ${workspace.hasFocus ? 'focused' : ''} ${workspace.isDisplayed ? 'displayed' : ''}`}
                  onClick={() =>
                    output.glazewm.runCommand(
                      `focus --workspace ${workspace.name}`,
                    )
                  }
                >
                  {workspace.displayName ?? workspace.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div class="center">
        {output.date?.formatted}
      </div>

      <div class="right">
        {output.glazewm && (
          <>
            {output.glazewm.bindingModes?.map((bindingMode: any) => (
              <button
                class="binding-mode"
                onClick={() =>
                  output.glazewm.runCommand(
                    `wm-disable-binding-mode --name ${bindingMode.name}`,
                  )
                }
              >
                {bindingMode.displayName ?? bindingMode.name}
              </button>
            ))}

            <button
              class={`tiling-direction ${output.glazewm.tilingDirection === 'horizontal' ? 'horizontal' : 'vertical'}`}
              onClick={() =>
                output.glazewm.runCommand('toggle-tiling-direction')
              }
            >
              {output.glazewm.tilingDirection === 'horizontal' ? <HiSolidArrowsRightLeft size={12} /> : <HiSolidArrowsUpDown size={12} />}
            </button>
          </>
        )}

        {/* Compact system stats chip */}
        <div class="chip system-stats">
          {output.cpu && (
            <>
              <span class="icon"><FiCpu size={12} /></span>
              <span class={`text ${output.cpu.usage > 85 ? 'high-usage' : ''}`}>
                {Math.round(output.cpu.usage)}%
              </span>
            </>
          )}
          {output.memory && (
            <>
              <span class="separator">|</span>
              <span class="icon"><FaSolidMemory size={12} /></span>
              <span class="text">{Math.round(output.memory.usage)}%</span>
            </>
          )}
          {output.battery && (
            <>
              <span class="separator">|</span>
              {output.battery.isCharging && <span class="icon charging"><HiSolidBolt size={10} /></span>}
              <span class="icon">{getBatteryIcon(output.battery)}</span>              <span class="text">{Math.round(output.battery.chargePercent)}%</span>
            </>
          )}
        </div>

        {output.network && (
          <div 
            class="chip network-chip"
            onClick={() => setShowDetailedNetwork(!showDetailedNetwork())}
            style={{ cursor: 'pointer' }}
          >
            <span class="icon">{getNetworkIcon(output.network)}</span>
            {showDetailedNetwork() && output.network.defaultInterface ? (
              <>
                <span class="text network-interface">
                  {output.network.defaultInterface.friendlyName || output.network.defaultInterface.name || 'Unknown'}
                </span>
                {output.network.traffic && (
                  <>
                    <span class="separator">|</span>
                    <span class="icon traffic-down"><HiSolidArrowsUpDown size={10} /></span>
                    <span class="text traffic-text">
                      ↓{formatNetworkTraffic(output.network.traffic).down}
                    </span>
                    <span class="text traffic-text">
                      ↑{formatNetworkTraffic(output.network.traffic).up}
                    </span>
                  </>
                )}
              </>
            ) : (
              output.network.defaultInterface && (
                <span class="text network-status">
                  {output.network.defaultInterface.type === 'ethernet' ? 'ETH' : 'WiFi'}
                </span>
              )
            )}
          </div>
        )}        {output.weather && (
          <div 
            class="chip weather-chip"
            onClick={() => setShowDetailedWeather(!showDetailedWeather())}
            style={{ cursor: 'pointer' }}
          >
            <span class="icon">{getWeatherIcon(output.weather)}</span>
            {showDetailedWeather() ? (
              <>
                <span class="text weather-desc">
                  {getWeatherDescription(output.weather)}
                </span>
                <span class="separator">|</span>
                <span class="text weather-temp">
                  {Math.round(output.weather.celsiusTemp)}°C
                </span>
                {output.weather.windSpeed && (
                  <>
                    <span class="separator">|</span>
                    <span class="text weather-wind">
                      {Math.round(output.weather.windSpeed)} km/h
                    </span>
                  </>
                )}
              </>
            ) : (
              <span class="text weather-temp-compact">
                {Math.round(output.weather.celsiusTemp)}°
              </span>
            )}
          </div>
        )}        {output.media?.currentSession && (
          <div 
            class="chip media-chip"
            onClick={() => setShowDetailedMedia(!showDetailedMedia())}
            style={{ cursor: 'pointer' }}
          >
            <span class="icon">
              <HiSolidMusicalNote size={12} />
            </span>
            {showDetailedMedia() ? (
              <div class="media-detailed">
                <div class="media-info">
                  <span class="media-title">{formatMediaInfo(output.media.currentSession)?.title}</span>
                  <span class="media-artist">{formatMediaInfo(output.media.currentSession)?.artist}</span>
                </div>
                <div class="media-controls">
                  <button 
                    class="media-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMediaControl('previous');
                    }}
                  >
                    <HiSolidBackward size={10} />
                  </button>
                  <button 
                    class="media-btn media-btn-main"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMediaControl('toggle');
                    }}
                  >
                    {output.media.currentSession.isPlaying ? 
                      <HiSolidPause size={10} /> : 
                      <HiSolidPlay size={10} />
                    }
                  </button>
                  <button 
                    class="media-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMediaControl('next');
                    }}
                  >
                    <HiSolidForward size={10} />
                  </button>
                </div>
              </div>
            ) : (
              <div class="media-compact">
                <span class="text media-compact-text">
                  {formatMediaInfo(output.media.currentSession)?.shortTitle}
                </span>
                <span class="media-status">
                  {output.media.currentSession.isPlaying ? 
                    <HiSolidPlay size={8} /> : 
                    <HiSolidPause size={8} />
                  }
                </span>
              </div>
            )}
          </div>
        )}

        {output.audio?.defaultPlaybackDevice && (          <div 
            class="chip audio-chip"
            onClick={() => setShowVolumeDevices(!showVolumeDevices())}
            style={{ cursor: 'pointer' }}
          >            <span class="icon">
              {getVolumeIcon(output.audio.defaultPlaybackDevice.volume)}
            </span>            {showVolumeDevices() ? (
              <>
                <span class="text device-name">
                  {formatDeviceName(output.audio.defaultPlaybackDevice.name)}
                </span>
                <span class="separator">|</span>
                <div class="volume-controls-inline">
                  <button 
                    class="volume-btn-inline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVolumeControl('volumeDown');
                    }}
                  >
                    -
                  </button>
                  <span class="volume-level-inline">
                    {Math.round(output.audio.defaultPlaybackDevice.volume)}%
                  </span>
                  <button 
                    class="volume-btn-inline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVolumeControl('volumeUp');
                    }}
                  >
                    +
                  </button>
                </div>
              </>
            ) : (
              <span class="text">{Math.round(output.audio.defaultPlaybackDevice.volume)}%</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
