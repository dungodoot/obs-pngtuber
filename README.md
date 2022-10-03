
# OBS PNGtuber
This tools lets you create a simple 2D avatar that reacts when you speak — without opening another app. Customization of your avatar is done in a custom browser dock in OBS Studio.

## Installation
1. Make sure you have [OBS Studio version 28.0.0 or later](https://obsproject.com/download) installed. If you have an earlier version of OBS Studio installed, install the latest version of the obs-websocket plugin [here](https://github.com/obsproject/obs-websocket/releases/).
2. Under `Docks > Custom Browser Docks...`, add the URL below as a custom dock and click `Apply`.
```
https://dungodoot.github.io/obs-pngtuber/settings
```
3. Create a browser source with the URL:
```
https://dungodoot.github.io/obs-pngtuber/source
```
4. Under `Tools > obs-websocket` settings, click on `Show Connect Info` and take note of the server port and server password. **:warning: DO NOT SHOW THIS ON STREAM. :warning:**
5. Enter the server port and password in the custom dock.
6. Select your desired audio input device, images and voice activity threshold.

### Note
This tool does not work with Streamlabs Desktop or any other livestreaming program.
