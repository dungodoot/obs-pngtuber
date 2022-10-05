import './settings.css';
import React, { useEffect, useState } from 'react';
import { Slider } from '@mui/material';
import OBSWebSocket, {EventSubscription} from 'obs-websocket-js';

const ThresholdSlider = () => {
  const [value, setValue] = useState(-35);

  const handleChange = (e, newValue) => {
    setValue(newValue);
    localStorage.setItem('threshold', newValue)
  };

  return (
    <div className='ThresholdSlider MenuItem'>
      <p>Activation Threshold</p>
      <Slider
        aria-label='Volume threshold'
        value={parseFloat(localStorage.threshold)}
        step={0.5}
        min={-60}
        max={0}
        onChange={handleChange}
      />
    </div>
  );
};

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

function Settings() {
  const [inputNames, setInputNames] = useState('[]');
  const obs = new OBSWebSocket();

  function Config() {
    const [value, setValue] = useState(false);
  
    function ConfigButton() {
      const handleClick = (e) => {
        setValue(!value);
        console.log(value);
      }
    
      return (
        <div
          className='ConfigButton'
          onClick={handleClick}
        >
          <img src={process.env.PUBLIC_URL + (value ? '/close-line.svg' : '/settings-3-fill.svg')} />
        </div>
      )
    }
  
    return (
      <div className='Config'>
        <div
          className='ConfigScreen'
          style={value ? {} : {visibility: 'hidden', opacity: 0, transform: 'scale(1.2)'}}
        >
          <ServerPortInput />
          <ServerPasswordInput />
        </div>
        <ConfigButton />
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
      <div className='SettingsScreen'>
        <InputSelect
          inputNames={JSON.parse(inputNames)}
        />
        <ThresholdSlider />
        <ImageUpload 
          imageType='speaking'
        />
        <ImageUpload
          imageType='inactive'
        />
      </div>
      <Config />
    </div>
  )
}

export default Settings;