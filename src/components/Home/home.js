import './home.css'

function Home() {
  return (
    <div className='Home'>
      <h1>OBS PNGtuber by Dungodoot</h1>
      <p>
        1. Make sure you have <a href='https://obsproject.com/download'>OBS Studio version 28.0.0 or later</a> installed. If you have an earlier version of OBS Studio installed, install the latest version of the obs-websocket plugin <a href='https://github.com/obsproject/obs-websocket/releases/'>here</a>.
      </p>
      <p>
        2. Under Docks &gt; Custom Browser Docks..., add the URL below as a custom dock and click Apply.
        <pre><code>
          https://dungodoot.github.io/obs-pngtuber/settings
        </code></pre>
      </p>
      <p>
        3. Create a browser source with the URL:
        <pre><code>
          https://dungodoot.github.io/obs-pngtuber/source
        </code></pre>
      </p>
      <p>
        4. Under Tools &gt; obs-websocket settings, click on Show Connect Info and take note of the server port and server password. ⚠️ DO NOT SHOW THIS ON STREAM. ⚠️
      </p>
      <p>
        5. Enter the server port and password in the custom dock.
      </p>
      <p>
        6. Select your desired audio input device, images and voice activity threshold.
      </p>
    </div>
  )
}

export default Home;