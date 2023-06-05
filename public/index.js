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
    const waveformCanvas = document.getElementById('visualizationCanvas');

    // using 2D visualization from the Canvas API
    const waveformContext = waveformCanvas.getContext('2d');

    // canvas element for the frequency bar graph
    const frequencyCanvas = document.getElementById('frequencyCanvas');
    const frequencyContext = frequencyCanvas.getContext('2d');

    // Drawing loop to constantly read data
    const draw = () => {
      // frequency of bins returned by the FFT
      const bufferLength = analyserNode.frequencyBinCount;

      // contains the audio data,
      // determines whether an array includes a certain element, returning true or false as appropriate.
      const audioArray = new Uint8Array(bufferLength);

      // pre-made method fills the audioArray with the analysed data
      analyserNode.getByteTimeDomainData(audioArray);

      // clearing the waveform context
      waveformContext.clearRect(0, 0, waveformCanvas.width, waveformCanvas.height);

      // background is grey colour
      waveformContext.fillStyle = "rgb(200, 200, 200)";

      // fills the rectangle with the grey colour
      waveformContext.fillRect(0, 0, waveformCanvas.width, waveformCanvas.height);

      // line style for the waveform
      waveformContext.lineWidth = 2; // 2 pixels
      waveformContext.strokeStyle = 'rgb(0, 0, 0)';

      // starting a new path
      waveformContext.beginPath();

      /*
        Determine the width of each segment of the line to be drawn by dividing the canvas width by the
        array length (equal to the FrequencyBinCount, as defined earlier on), then define an x variable to
        define the position to move to for drawing each segment of the line.
      */
      const sliceWidth = waveformCanvas.width / bufferLength;
      let x = 0;

      /*
        Now we run through a loop, defining the position of a small segment of the wave for each point in the buffer
        at a certain height based on the data point value from the array, then moving the line across to the place
        where the next wave segment should be drawn
      */
      for (let i = 0; i < bufferLength; i++) {
        const v = audioArray[i] / 128.0;
        const y = (v * waveformCanvas.height) / 2;

        if (i === 0) {
          waveformContext.moveTo(x, y);
        } else {
          waveformContext.lineTo(x, y);
        }

        x += sliceWidth;
      }

      // finish the line in the middle of the right-hand side of the canvas, then draw the stroke we've defined
      waveformContext.lineTo(waveformCanvas.width, waveformCanvas.height / 2);
      waveformContext.stroke();

      // clear the frequency canvas
      frequencyContext.clearRect(0, 0, frequencyCanvas.width, frequencyCanvas.height);

      // background color for the frequency graph
      frequencyContext.fillStyle = "rgb(200, 200, 200)";
      frequencyContext.fillRect(0, 0, frequencyCanvas.width, frequencyCanvas.height);

      // number of frequency bars to be displayed
      const numBars = 100;

      // width and height of each bar
      const barWidth = frequencyCanvas.width / numBars;
      const barHeightMultiplier = frequencyCanvas.height / 256;

      // array to store frequency data
      const frequencyArray = new Uint8Array(analyserNode.frequencyBinCount);

      // get the frequency data
      analyserNode.getByteFrequencyData(frequencyArray);

      // loop to draw the frequency bars
      for (let i = 0; i < numBars; i++) {
        const frequencyValue = frequencyArray[Math.floor(i * (frequencyArray.length / numBars))];
        const barHeight = frequencyValue * barHeightMultiplier;

        // set color for the bar based on its height
        frequencyContext.fillStyle = `rgb(${frequencyValue}, 0, 0)`;

        // draw the bar
        frequencyContext.fillRect(i * barWidth, frequencyCanvas.height - barHeight, barWidth, barHeight);
      }

      // triggers the draw function again
      requestAnimationFrame(draw);
    };

    // Start the drawing loop
    draw();


  ///////////////////// BASS TUNER ///////////////////////

  // calculate the average frequency heard to get a more accurate reading
  const getAverageFrequency = (frequencyArray) => {
    const highestFrequencyIndex = frequencyArray.indexOf(Math.max(...frequencyArray));
    const binWidth = audioContext.sampleRate / analyserNode.fftSize;
    const averageFrequency = binWidth * highestFrequencyIndex;
    return averageFrequency;
  };

  // target frequencies for specific strings (in Hz)
  const stringEFrequency = [165, 211];
  const stringAFrequency = [211];
  const stringDFrequency = [141, 211];
  const stringGFrequency = [188];

  // is the current frequency within the tolerance range?
  // re-usable for all strings
  const testTolerance = (frequency, targetFrequencies) => {
    for (const targetFrequency of targetFrequencies) {
      const lowerBound = targetFrequency - 1;
      const upperBound = targetFrequency + 1;
      if (frequency >= lowerBound && frequency <= upperBound) {
        return true;
      }
    }
    return false;  }

  // display the frequency and if sharp/flat/in tune for all strings
  const displayTuningStats = (frequency) => {

    // making variables for the HTML id
    const frequencyReading = document.getElementById('frequency');
    const tuningE = document.getElementById('tuning-E');
    const tuningA = document.getElementById('tuning-A');
    const tuningD = document.getElementById('tuning-D');
    const tuningG = document.getElementById('tuning-G');

    // setting the frequency text content to the frequency with 2 decimal places (Hz)
    frequencyReading.textContent = `${frequency.toFixed(2)} Hz`;

    // re-useable function to display the status for the string if sharp or flat
    const allTuningStatus = (tuning, targetFrequency) => {
      if (testTolerance(frequency, targetFrequency)) {
        tuning.textContent = 'In Tune';
        tuning.style.color = 'green';
      } else if (frequency < targetFrequency) {
        tuning.textContent = 'Flat';
        tuning.style.color = 'red';
      } else {
        tuning.textContent = 'Sharp';
        tuning.style.color = 'red';
      }
    }

    // calling this function on all of the strings
    allTuningStatus(tuningE, stringEFrequency);
    allTuningStatus(tuningA, stringAFrequency);
    allTuningStatus(tuningD, stringDFrequency);
    allTuningStatus(tuningG, stringGFrequency);



  };

  // tuner loop
  const tuner = () => {
    const frequencyArray = new Uint8Array(analyserNode.frequencyBinCount);
    analyserNode.getByteFrequencyData(frequencyArray);
    const dominantFrequency = getAverageFrequency(frequencyArray);
    displayTuningStats(dominantFrequency);
    requestAnimationFrame(tuner);
  };

  // start the tuner loop
  tuner();


  })
  .catch((error) => {
    console.log('No access :(', error);
  });
