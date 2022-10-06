import './settings.css';
import React, { useEffect, useState } from 'react';
import OBSWebSocket, {EventSubscription} from 'obs-websocket-js';

function ThresholdSlider() {
  const [value, setValue] = useState(parseFloat(localStorage.threshold));

  const handleChange = (e) => {
    setValue(e.target.value);
    localStorage.setItem('threshold', e.target.value);
    console.log(e.target.value);
  }
  return (
    <div className='ThresholdSlider'>
      <div className='SliderWrapper'>
        <div className='SliderRail' />
        <div
          className='SliderTrack'
          style={{width: String(value) + '%'}}
        />
        <input
          type='range'
          value={parseFloat(localStorage.threshold)}
          step='0.5'
          onChange={handleChange}
        />
      </div>
    </div>
  )
}

function ThresholdSelect() {
  return (
    <div className='ThresholdSelect MenuItem'>
      <p>
        Activation Threshold
      </p>
      <ThresholdSlider />
    </div>
  )
}

function InputSelect ({inputNames}) {
  const [value, setValue] = useState('');
  const handleChange = (e) => {
    setValue(e.target.value);
    localStorage.setItem('input', e.target.value);
    console.log(`Audio input set to ${e.target.value}`);
  }
  return (
    <div className='InputSelect MenuItem'>
      <p>Audio Input</p>
      <select
        onChange={handleChange}
        value={localStorage.input}
      >
        {inputNames.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  )
}

const ImageUpload = ({imageType}) => {
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => {
        resolve(fileReader.result);
      };
      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  };

  const handleChange = async (e) => {
    const file = e.target.files[0];
    const base64 = await convertToBase64(file);
    if (imageType == 'speaking') {
      localStorage.setItem('speakImage', base64);
    } else if (imageType == 'inactive'){
      localStorage.setItem('inactiveImage', base64);
    }
  };

  return (
    <div className='ImageUpload MenuItem'>
      <p>{imageType == 'speaking' ? 'Speaking Image' : 'Inactive Image'}</p>
      <input type='file' id={imageType == 'speaking' ? 'speaking' : 'inactive'} onChange={(e) => handleChange(e)} title='a' />
    </div>
  )
}

function ServerPortInput() {
  const [value, setValue] = useState('');
  const handleChange = async (e) => {
    setValue(e.target.value);
    localStorage.setItem('serverPort', e.target.value);
  }

  return (
    <div className='ServerPortInput MenuItem'>
      <p>Server Port</p>
      <input
        type='number'
        value={localStorage.serverPort}
        onChange={handleChange}
      />
    </div>
  )
}

function ServerPasswordInput() {
  const [value, setValue] = useState('');
  const handleChange = async (e) => {
    setValue(e.target.value);
    localStorage.setItem('serverPassword', e.target.value);
  }

  return (
    <div className='ServerPasswordInput MenuItem'>
      <p>Server Password</p>
      <input
        type='password'
        value={localStorage.serverPassword}
        onChange={handleChange}
      />
    </div>
  )
}

function Config({isConfigOpen}) {
  return (
    <div className={isConfigOpen ? 'Config' : 'Config hidden'}>
      <ServerPortInput />
      <ServerPasswordInput />
    </div>
  )
}

function Settings() {
  const [inputNames, setInputNames] = useState('[]');
  const [isConfigOpen, setConfigOpen] = useState(false);
  const obs = new OBSWebSocket();

  function ConfigButton() {
    const handleClick = (e) => {
      setConfigOpen(!isConfigOpen);
    }
  
    return (
      <div
        className='ConfigButton'
        onClick={handleClick}
      >
        <img src={process.env.PUBLIC_URL + (isConfigOpen ? '/close-line.svg' : '/settings-3-fill.svg')} />
      </div>
    )
  }

  async function updateInputs(e) {
    console.log(e);
    const inputList = await obs.call('GetInputList', {inputKind: 'coreaudio_input_capture'});
    var inputNames = [];
    for (const input in inputList.inputs) {
      inputNames.push(inputList.inputs[input].inputName);
    }
    setInputNames(JSON.stringify(inputNames));
  }

  async function updateInputName(e) {
    updateInputs(e);
    if (e.oldInputName == localStorage.input) {
      localStorage.setItem('input', e.inputName);
      console.log(`Input renamed from ${e.oldInputName} to ${e.inputName}`);
    }
  }

  useEffect(() => {
    (async function connectOBS() {
      try {
        const {
          obsWebSocketVersion,
          negotiatedRpcVersion
        } = await obs.connect(`ws://127.0.0.1:${localStorage.serverPort}`, `${localStorage.serverPassword}`, {
          eventSubscriptions: EventSubscription.Inputs,
          rpcVersion: 1
        });
        console.log(`Connected to server ${obsWebSocketVersion} (using RPC ${negotiatedRpcVersion})`);
        obs.on('InputCreated', updateInputs);
        obs.on('InputRemoved', updateInputs);
        obs.on('InputNameChanged', updateInputName);

        const inputList = await obs.call('GetInputList', {inputKind: 'coreaudio_input_capture'});
        var inputNames = [];
        for (const input in inputList.inputs) {
          inputNames.push(inputList.inputs[input].inputName);
        }
        setInputNames(JSON.stringify(inputNames));
      } catch (error) {
        console.error('Failed to connect', error.code, error.message);
        const interval = setInterval(() => {
          connectOBS();
          clearInterval(interval);
        }, 1000);
      }
    })();
  }, []);
  
  return (
    <div className='Settings'>
      <div
        className={isConfigOpen ? 'SettingsScreen hidden' : 'SettingsScreen'}
      >
        <InputSelect
          inputNames={JSON.parse(inputNames)}
        />
        <ThresholdSelect />
        <ImageUpload 
          imageType='speaking'
        />
        <ImageUpload
          imageType='inactive'
        />
      </div>
      <Config
        isConfigOpen={isConfigOpen}
      />
      <ConfigButton />
    </div>
  )
}

export default Settings;