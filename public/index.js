// ask for audio permission using Web Audio API function

navigator.mediaDevices
  .getUserMedia({audio: true, video: false})
  .then((stream) => {
    console.log('we got access!');
  })
  .catch((error) => {
    console.log('no access :(');
  })
