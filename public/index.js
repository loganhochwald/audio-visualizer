// this is messy but I don't have a lot of time to fix this so it's all stuck in the .then() promise callback

// requesting audio then getting to business, getUserMedia() method defined on object from Web Audio API
navigator.mediaDevices.getUserMedia({ audio: true, video: false })
  .then((stream) => {
    // stream is the audio object

    // audio context is an audio-processing graph built from audio modules linked together,
    // each represented by an AudioNode
    const audioContext = new window.AudioContext();

    // the source of audio is from the microphone, which is the stream object passed in the
    // success callback
    const sourceNode = audioContext.createMediaStreamSource(stream);

    // analyser node analyses the audio data
    const analyserNode = audioContext.createAnalyser();

    // size of the Fast Fourier Transform (FFT), this is the default value but I want to make sure it works
    analyserNode.fftSize = 2048;

    // connect the source (microphone) to the analyzing node
    sourceNode.connect(analyserNode);

    // connect the analyser node to the destination of the audioContext constructor
    analyserNode.connect(audioContext.destination);

    // canvas element in the static HTML file is called so the drawing can occur, has id='visualizationCanvas'
    const canvas = document.getElementById('visualizationCanvas');

    // using 2D visualization from the Canvas API
    const canvasContext = canvas.getContext('2d');

    // Drawing loop to constantly read data
    const draw = () => {

      // frequency of bins returned by the FFT
      const bufferLength = analyserNode.frequencyBinCount;

      // contains the audio data,
      // determines whether an array includes a certain element, returning true or false as appropriate.
      const audioArray = new Uint8Array(bufferLength);

      // pre-made method fills the audioArray with the analysed data
      analyserNode.getByteTimeDomainData(audioArray);

      // clearing the wave context
      canvasContext.clearRect(0, 0, canvas.width, canvas.height);

      // background is grey colour
      canvasContext.fillStyle = "rgb(200, 200, 200)";

      // fills the rectangle with the grey colour
      canvasContext.fillRect(0, 0, canvas.width, canvas.height);


      // line style for the waveform
      canvasContext.lineWidth = 2; // 2 pixels
      canvasContext.strokeStyle = 'rgb(0, 0, 0)';

      // starting a new path
      canvasContext.beginPath();

/*
      Determine the width of each segment of the line to be drawn by dividing the canvas width by the
      array length (equal to the FrequencyBinCount, as defined earlier on), then define an x variable to
      define the position to move to for drawing each segment of the line.
*/
      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

/*
      Now we run through a loop, defining the position of a small segment of the wave for each point in the buffer
      at a certain height based on the data point value from the array, then moving the line across to the place
      where the next wave segment should be drawn
*/
      for (let i = 0; i < bufferLength; i++) {
        const v = audioArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          canvasContext.moveTo(x, y);
        } else {
          canvasContext.lineTo(x, y);
        }

        x += sliceWidth;
      }

      // finish the line in the middle of the right-hand side of the canvas, then draw the stroke we've defined
      canvasContext.lineTo(canvas.width, canvas.height / 2);
      canvasContext.stroke();

      // triggers the draw function again
      requestAnimationFrame(draw);
    }

    // Start the drawing loop
    draw();
  })
  .catch((error) => {
    console.log('No access :(', error);
  });
