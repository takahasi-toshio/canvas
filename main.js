function onWindowResize(firstTime) {
  let canvas = document.getElementById('canvas');
  let canvas_container = document.getElementById('canvas_container');
  if (canvas && canvas_container) {
    let width = canvas_container.clientWidth;
    let height = canvas_container.clientHeight;
    if (firstTime || (width !== canvas.width) || (height !== canvas.height)) {
      canvas.width = width;
      canvas.height = height;
      onCanvasResize();
    }
  }
}

function onCanvasResize() {
  let canvas = document.getElementById('canvas');
  if (canvas) {
    let width = canvas.width;
    let height = canvas.height;
    let context = canvas.getContext('2d');
    if (context) {
      let viewArea = new GeoBox(-1500, -500, 12340, 34550);
      let onePixelSize = setTransform(context, width, height, viewArea);
      context.lineWidth = onePixelSize;
      context.strokeStyle = "red";
      context.lineCap = "round";
      context.fillStyle = "green";
      //context.strokeRect(-1400, -400, 5000, 20000);
      let shape = new PathShape;
      shape.moveTo(-1400, -400);
      shape.lineTo(-1400, 20000);
      shape.lineTo(5000, 20000);
      shape.lineTo(5000, -400);
      shape.lineTo(-1400, -400);
      shape.moveTo(-1200, -200);
      shape.lineTo(-1200, 10000);
      shape.lineTo(4000, 10000);
      shape.lineTo(4000, -200);
      shape.lineTo(-1200, -200);
      shape.shrink_to_fit();
      shape.fill(context, "evenodd");
      shape.stroke(context, onePixelSize);
    }
  }
}

function setTransform(context, width, height, viewArea) {
  context.setTransform(1, 0, 0, 1, 0, 0);

  if ((width === 0) || (viewArea.width === 0)) {
    return 1;
  }

  const canvas_aspect = height / width;
  const viewArea_aspect = viewArea.height / viewArea.width;

  let scale;
  if (viewArea_aspect > canvas_aspect) {
    scale = height / viewArea.height;
  }
  else {
    scale = width / viewArea.width;
  }

  if (scale === 0) {
    return 1;
  }

  context.scale(scale, -scale);
  context.translate((width / scale - viewArea.width) / 2 - viewArea.minX, (height / scale - viewArea.height) / 2 - height / scale - viewArea.minY);

  return 1 / scale;
}

document.addEventListener('DOMContentLoaded', function () {
  window.addEventListener('resize', onWindowResize);
  onWindowResize(true);
});
