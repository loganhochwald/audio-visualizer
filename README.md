# audio-visualizer

# Introduction
Tune your bass accounting for its specific harmonics with your web browser's microphone and visualize the frequency input to determine the loudest and most prominent frequency.

# Frameworks/Libraries
I built this using vanilla Javascript, Express, Node, and two browser APIs: Web Audio and Canvas.

# IMPORTANT, READ BEFORE USING
This is built for my own bass's frequencies and accounting for my specific overtones, so if you clone this you'll have to determine what the strongest frequencies are when playing your bass's strings. Web Audio API also includes methods to allow for filtering of sound, if you plan to upgrade this.

# To Run
1. `npm install`
2. Start the server: `npm start`
3. Navigate to in your browser http://localhost:3000
4. Allow the browser to access your microphone. (Otherwise this is not going to work.)
5. Enjoy!
