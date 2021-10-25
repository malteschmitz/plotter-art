(() => {
  const canvasWidth = 100;
  let streaming = false;

  function newSvg(tag) {
    return document.createElementNS("http://www.w3.org/2000/svg", tag);
  }

  let video = document.getElementById('video');
  let canvas = document.createElement('canvas');
  let svg = document.getElementById('svg');

  // attach webcam to video
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
      createLines();
      update();
      setInterval(() => update(), 100);
    }
  };

  function createLines() {
    svg.innerHTML = "";
    for (let y = 0; y < canvas.height; y++) {
      let path = newSvg("path");
      path.setAttribute("stroke", "black");
      path.setAttribute("stroke-width", "0.1");
      path.setAttribute("fill", "transparent");
      // path.setAttribute("d", `M 1,${y} L ${canvas.width},${y}`);
      svg.appendChild(path); 
    }
    console.log(svg.getElementsByTagName('path'));
  }
  
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

    let paths = svg.getElementsByTagName('path');
    for (let y = 0; y < canvas.height; y++) {
      let points = [];
      for (let x = 0; x < canvas.width; x++) {
        let [red, green, blue, alpha] = map[x][y];
        let brightness = 1 - (0.2126 * red / 255 + 0.7152 * green / 255 + 0.0722 * blue / 255);
        points.push([0.5 + x, 0.5 + y + 2.5 - 5*brightness]);
      }
      points = [[0, points[0][1]], [0, points[0][1]], ...points, points[points.length-1], [canvas.width, points[points.length-1][1]], [canvas.width, points[points.length-1][1]]];
      let cmPoints = catmullRom(points);
      paths[y].setAttribute("d", bezierre(points[1], cmPoints));
    }
  }

  function bezierre(start, points) {
    let d = `M ${start[0]} ${start[1]} `;
    for (let i = 0; i < points.length; i++) {
      let p = points[i];
      d += `C ${p[0][0]} ${p[0][1]}, ${p[1][0]} ${p[1][1]}, ${p[2][0]} ${p[2][1]} `;
    }
    return d;
  }

  function catmullRom(points) {
    let m = [];
    for (let i = 1; i < points.length - 1; i++) {
      m[i] = [
        (points[i][0]-points[i-1][0])/2 + (points[i+1][0]-points[i][0])/2,
        (points[i][1]-points[i-1][1])/2 + (points[i+1][1]-points[i][1])/2
        ];
    }
    let result = [];
    for (let i = 1; i < points.length - 2; i++) {
      result.push([
        [points[i][0] + m[i][0]/3, points[i][1] + m[i][1]/3],
        [points[i+1][0] - m[i+1][0]/3, points[i+1][1] - m[i+1][1]/3],
        points[i+1]
      ]);
    }
    return result;
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
