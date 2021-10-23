(() => {
  const canvasWidth = 20;
  let streaming = false;

  function newSvg(tag) {
    return document.createElementNS("http://www.w3.org/2000/svg", tag);
  }

  let video = document.getElementById('video');
  let canvas = document.createElement('canvas');
  let svg = document.getElementById('svg');

  navigator.mediaDevices.getUserMedia({video: true, audio: false})
  .then(stream => {
    video.srcObject = stream;
    video.play();
  })
  .catch(err => console.log("An error occurred: " + err));

  video.oncanplay = () => {
    if (!streaming) {
      let ratio = video.videoWidth / video.videoHeight;
      canvas.width = canvasWidth;
      canvas.height = canvasWidth / ratio;
      svg.setAttribute("viewBox", "0 0 " + canvas.width + " " + canvas.height);
      streaming = true;
      update();
      setInterval(() => update(), 1000);
    }
  };
  
  function update() {
    let context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    let data = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let map = [];
    for (let x = 0; x < canvas.width; x++) {
      map[x] = [];
      for (let y = 0; y < canvas.height; y++) {
        let i = (y * canvas.width + x) * 4;
        map[x][y] = data.slice(i, i + 4);
      }
    }

    svg.innerHTML = "";
    for (let x = 0; x < canvas.width; x++) {
      for (let y = 0; y < canvas.height; y++) {
        let circle = newSvg("circle");
        circle.setAttribute("r", 0.4);
        circle.setAttribute("cx", x + 0.5);
        circle.setAttribute("cy", y + 0.5);
        circle.setAttribute("fill", "rgb(" + map[x][y][0] + "," + map[x][y][1] + "," + map[x][y][2] + ")");
        svg.appendChild(circle);
      }
    }
  }

  function toggleFullScreen() {
    if (!fscreen.fullscreenElement) {
        fscreen.requestFullscreen(document.documentElement);
    } else {
      if (fscreen.exitFullscreen) {
        fscreen.exitFullscreen();
      }
    }
  }

  svg.onclick = () => toggleFullScreen();
})();
