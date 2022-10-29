import './settings.css';
import './slider.css';
import React, { useEffect, useState } from 'react';
import OBSWebSocket, {EventSubscription} from 'obs-websocket-js';
import { MdFace, MdAnimation, MdHandyman, MdMic } from "react-icons/md";

function ThresholdSlider({volume}) {
  const [value, setValue] = useState(parseFloat(localStorage.threshold));

  const handleChange = (e) => {
    setValue(e.target.value);
    localStorage.setItem('threshold', e.target.value);
    console.log(e.target.value);
  }
  return (
    <div className='ThresholdSlider'>
      <div className='SliderWrapper'>
        <div className='SliderRail'>
          <div
            className='SliderTrack'
            style={{width: String(value) + '%'}}
          />
          <div className='VolumeIndicatorContainer'>
            <div
              className='VolumeIndicator'
              style={{left: String(volume) + '%'}}
            />
          </div>
        </div>
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

function ThresholdSelect({volume}) {
  return (
    <div className='ThresholdSelect MenuItem'>
      <p>
        Activation Threshold
      </p>
      <ThresholdSlider
        volume={volume}
      />
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

function MicSettings () {
  const [volume, setVolume] = useState(0);
  const [inputNames, setInputNames] = useState('[]');
  const obs = new OBSWebSocket();

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

  function onInput(e) {
    for (const input in e.inputs) {
      if (localStorage.input == e.inputs[input].inputName) {
        const vol = 20*Math.log10(e.inputs[input].inputLevelsMul[0][0]) + 60;
        setVolume(vol > 0 ? vol : 0);
      }
    }
  }

  useEffect(() => {
    (async function connectOBS() {
      try {
        const {
          obsWebSocketVersion,
          negotiatedRpcVersion
        } = await obs.connect(`ws://127.0.0.1:${localStorage.serverPort}`, `${localStorage.serverPassword}`, {
          eventSubscriptions: EventSubscription.Inputs | EventSubscription.InputVolumeMeters,
          rpcVersion: 1
        });
        console.log(`Connected to server ${obsWebSocketVersion} (using RPC ${negotiatedRpcVersion})`);
        obs.on('InputCreated', updateInputs);
        obs.on('InputRemoved', updateInputs);
        obs.on('InputNameChanged', updateInputName);
        obs.on('InputVolumeMeters', onInput);

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
    <div className='MicSettings'>
      <InputSelect
        inputNames={JSON.parse(inputNames)}
      />
      <ThresholdSelect
        volume={volume}
      />
    </div>
  )
}

const ImageUpload = ({imageType}) => {
  const [image, setImage] = useState(imageType == 'speaking' ? localStorage.speakImage : localStorage.inactiveImage);

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
    setImage(base64);
  };

  return (
    <div className='ImageUpload MenuItem'>
      <p>{imageType == 'speaking' ? 'Speaking Image' : 'Inactive Image'}</p>
      <label for={imageType == 'speaking' ? 'speaking' : 'inactive'}>
        <div className='ImageWrapper'>
          <img
            src={imageType == 'speaking' ? localStorage.speakImage : localStorage.inactiveImage}
          />
        </div>
      </label>
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

function ImageSelectTab({openMenu}) {
  if (openMenu == 1) {
    var isOpen = true;
  }
  return (
    <div className={isOpen ? 'ImageSelectTab SettingsTab' : 'ImageSelectTab SettingsTab hidden'}>
      <h1>Image Select</h1>
      <ImageUpload 
        imageType='speaking'
      />
      <ImageUpload
        imageType='inactive'
      />
    </div>
  )
}

function AnimationTab({openMenu}) {
  if (openMenu == 2) {
    var isOpen = true;
  }

  const handleChange = (e) => {
    localStorage.setItem('bounce', e.target.checked);
  }

  const handleChangeDarken = (e) => {
    localStorage.setItem('darken', e.target.checked);
  }

  return (
    <div className={isOpen ? 'AnimationTab SettingsTab' : 'AnimationTab SettingsTab hidden'}>
      <h1>Animation</h1>
      <div className='MenuItem'>
        <p>Bounce</p>
        <input
          type='checkbox'
          onChange={handleChange}
        />
      </div>
      <div className='MenuItem'>
        <p>Darken</p>
        <input
          type='checkbox'
          onChange={handleChangeDarken}
        />
      </div>
    </div>
  )
}

function ConfigTab({openMenu}) {
  if (openMenu == 4) {
    var isOpen = true;
  }
  return (
    <div className={isOpen ? 'ConfigTab SettingsTab' : 'ConfigTab SettingsTab hidden'}>
      <h1>Connection Settings</h1>
      <ServerPortInput />
      <ServerPasswordInput />
    </div>
  )
}

function TabButton({onClick, children}) {
  return (
    <div
      className='Button'
      onClick={onClick}
    >
      {children}
    </div>
  )
}

function NavBar({openHome, openConfig, openImageSelect, openAnimation}) {
  return (
    <div className='NavBar'>
      <TabButton onClick={openHome}>
        <MdMic />
      </TabButton>

      <TabButton onClick={openImageSelect}>
        <MdFace />
      </TabButton>

      <TabButton onClick={openAnimation}>
        <MdAnimation />
      </TabButton>

      <TabButton onClick={openConfig}>
        <MdHandyman />
      </TabButton>
    </div>
  )
}

function Settings() {
  const [openMenu, setOpenMenu] = useState(0);
  // 0 - home
  // 1 - image select
  // 2 - animation
  // 4 - config


  const openHome = () => {
    setOpenMenu(0);
  }

  const openConfig = () => {
    setOpenMenu(4);
  }

  const openImageSelect = () => {
    setOpenMenu(1);
  }

  const openAnimation = () => {
    setOpenMenu(2);
  }
  
  return (
    <div className='Settings'>
      <NavBar
        openHome={openHome}
        openConfig={openConfig}
        openImageSelect={openImageSelect}
        openAnimation={openAnimation}
      />
      <div className='SettingsContainer'>
        <div
          className={openMenu == 0 ? 'HomeTab SettingsTab' : 'HomeTab SettingsTab hidden'}
        >
          <h1>Input Settings</h1>
          <MicSettings />
        </div>
        <ConfigTab openMenu={openMenu}/>
        <ImageSelectTab openMenu={openMenu}/>
        <AnimationTab openMenu={openMenu}/>
      </div>
    </div>
  )
}

export default Settings;