import './source.css'
import React, { useEffect, useState } from 'react';
import OBSWebSocket, {EventSubscription} from 'obs-websocket-js';

function Source() {
  const [speaking, setSpeaking] = useState(false);
  const [animating, setAnimating] = useState(false);
  const obs = new OBSWebSocket();

  function onInput(e) {
    for (const input in e.inputs) {
      if (localStorage.input == e.inputs[input].inputName) {
        if (20*Math.log10(e.inputs[input].inputLevelsMul[0][0]) + 60 > localStorage['threshold']) {
          setSpeaking(true);
        } else {
          setSpeaking(false);
        }
      }
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      (async () => {
        try {
          const {
            obsWebSocketVersion,
            negotiatedRpcVersion
          } = await obs.connect(`ws://127.0.0.1:${localStorage.serverPort}`, `${localStorage.serverPassword}`, {
            eventSubscriptions: EventSubscription.InputVolumeMeters, rpcVersion: 1
          });
          clearInterval(interval);
          console.log(`Connected to server ${obsWebSocketVersion} (using RPC ${negotiatedRpcVersion})`);
          obs.on('InputVolumeMeters', onInput);
        } catch (error) {
          console.error('Failed to connect', error.code, error.message);
        }
      })();
    }, 1000);
  }, []);

  return (
    <div className="Source">
      <div
        className={((speaking || animating) ? 'speaking avatar' : 'inactive avatar') + (localStorage.bounce == 'true' ? ' bounce' : '')}
        onAnimationStart={() => setAnimating(true)}
        onAnimationEnd={() => setAnimating(false)}
      >
        <img src={speaking ? localStorage.speakImage : localStorage.inactiveImage} />
        </div>
    </div>
  )
}

export default Source;