(() => {
  let width = 320;
  let height = 0;
  let streaming = false;

  let video = document.getElementById('video');
  let canvas = document.getElementById('canvas');
  let photo = document.getElementById('photo');
  let startbutton = document.getElementById('startbutton');

  navigator.mediaDevices.getUserMedia({video: true, audio: false})
  .then(stream => {
    video.srcObject = stream;
    video.play();
  })
  .catch(err => console.log("An error occurred: " + err));

  video.oncanplay = () => {
    if (!streaming) {
      height = video.videoHeight / (video.videoWidth/width);
      video.setAttribute('width', width);
      video.setAttribute('height', height);
      canvas.setAttribute('width', width);
      canvas.setAttribute('height', height);
      streaming = true;
    }
  };

  startbutton.onclick = () => {
    takepicture();
    ev.preventDefault();
  };
  
  clearphoto();

  function clearphoto() {
    let context = canvas.getContext('2d');
    context.fillStyle = "#AAA";
    context.fillRect(0, 0, canvas.width, canvas.height);
    photo.src = canvas.toDataURL('image/png');
  }
  
  function takepicture() {
    let context = canvas.getContext('2d');
    if (width && height) {
      canvas.width = width;
      canvas.height = height;
      context.drawImage(video, 0, 0, width, height);
    
      photo.src = canvas.toDataURL('image/png');
    } else {
      clearphoto();
    }
  }
})();
