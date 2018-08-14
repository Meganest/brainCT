polyFillPerfNow();

// Canvas setup
var cv = document.getElementById('comparediv');
var context = cv.getContext('2d');
var canvasWidth = cv.width,
  canvasHeight = cv.height;
  
var reverseUint32 = function() {
  var s32 = new Uint32Array(4);
  var s8 = new Uint8Array(s32.buffer);
  var t32 = new Uint32Array(4);
  var t8 = new Uint8Array(t32.buffer);
  return function(x) {
    s32[0] = x;
    t8[0] = s8[3];
    t8[1] = s8[2];
    t8[2] = s8[1];
    t8[3] = s8[0];
    return t32[0];
  }
}();

var once = true;

function floodFill(context, x, y, color) {
  x = 0 | x;
  y = 0 | y;
  var w = context.canvas.width,
    h = context.canvas.height;
  var wm1 = w - 1;
  if (x < 0 || x >= w || y < 0 || y >= h) return;
  var imgData = context.getImageData(0, 0, w, h);
  var buffer32 = new Uint32Array(imgData.data.buffer);
  var pointStack = floodFill.pointStack;
  var stackLength = 0;
  var lx = x,
    li = (y * w + x);
  var rx = lx,
    ri = li;
  var sx = 0,
    si = 0;
  var floodPushed = false;
  var sign = 0;
  // get start color
  var startColor = buffer32[li];
  // get fill color as 32 bit rgba value
  context.fillStyle = color;
  color = context.fillStyle;
  color = parseInt(color.substring(1), 16);
  color = color << 8 | 0xFF;
  color = reverseUint32(color);
  //

  if (buffer32[li] == color) return;
  var guard = w * h;
  do {
    // seek left limit
    while (lx - 1 >= 0 && buffer32[li - 1] == startColor) {
      lx--;
      li--;
    };
    // seek right limit
    while ((rx + 1 != wm1) && buffer32[ri + 1] == startColor) {
      rx++;
      ri++;
    };
    // draw current h-line
    //    if (buffer32[li] == color) {
    //      console.log('??', li % w, 0 | (li / w));
    //    }

    if (buffer32[li] != color) {
      // fill current line.
      for (si = li; si <= ri; si++) {
        buffer32[si] = color;
      }

      // scan above then below to test if flood required, from lx to rx
      for (sign = -1; sign <= 1; sign += 2) {
        if ((sign < 0 && y == 0) || (sign > 0 && y == h - 1)) continue;
        si = li + sign * w;
        floodPushed = false;
        // iterate left to right
        for (sx = lx; sx <= rx; sx++, si++) {
          if (buffer32[si] == color) continue;

          if (!floodPushed) {
            if (buffer32[si] == startColor) {
              // start of a new flood line
              // --> push start of the line
              pointStack[stackLength++] = sx;
              floodPushed = true;
            }
          } else if (buffer32[si] != startColor) {
            // end of current flood line
            // --> push end of the line and y
            pointStack[stackLength++] = sx - 1;
            pointStack[stackLength++] = y + sign;
            floodPushed = false;
          }
        }
        if (floodPushed) {
          pointStack[stackLength++] = rx;
          pointStack[stackLength++] = y + sign;
        }
      }
    }


    if (stackLength) {
      y = pointStack[--stackLength];
      rx = pointStack[--stackLength];
      lx = pointStack[--stackLength];
      ri = y * w + rx;
      li = y * w + lx;
    } else break;
    // if (guard-- < 0) break; // to prevent infinite loop when debuging

  } while (true);
  context.putImageData(imgData, 0, 0);
}
floodFill.pointStack = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
floodFill.warmup = function() {
  var wucv = document.createElement('canvas');
  wucv.width = 2;
  wucv.height = 2;
  floodFill(wucv.getContext('2d'), 1, 1, '#111');
};
//floodFill.warmup();

var st = 0,
  ed = 0;
st = performance.now();

ed = performance.now();



function isLittleEndian() { //  TooTallNate / endianness.js.  
  // https://gist.github.com/TooTallNate/4750953
  var b = new ArrayBuffer(4);
  var a = new Uint32Array(b);
  var c = new Uint8Array(b);
  a[0] = 0xdeadbeef;
  if (c[0] == 0xef) return true;
  if (c[0] == 0xde) return false;
  throw new Error('unknown endianness');
}


function polyFillPerfNow() {
  window.performance = window.performance ? window.performance : {};
  window.performance.now = window.performance.now || window.performance.webkitNow || window.performance.msNow || window.performance.mozNow || Date.now;
};



cv.addEventListener('mousedown', handleClick);

function handleClick(e) {

  color = 'rgb(112, 128, 144)';
  var br = this.getBoundingClientRect();
  var x = e.clientX - br.left;
  var y = e.clientY - br.top;
  st = performance.now();
  //WilliamMaloneFill(x, y);
  floodFill(context, x, y, color);
  ed = performance.now();

}



var colorLayer = null;
var startR = 0,
  startG = 0,
  startB = 0;

var fillColorR = 230,
  fillColorG = 200,
  fillColorB = 50;

function WilliamMaloneFill(startX, startY) {

  colorLayer = context.getImageData(0, 0, canvasWidth, canvasHeight);

  pixelPos = (startY * canvasWidth + startX) * 4;

  startR = colorLayer.data[pixelPos];
  startG = colorLayer.data[pixelPos + 1];
  startB = colorLayer.data[pixelPos + 2];

  var pixelStack = [
    [startX, startY]
  ];
  var drawingBoundTop = 0;
  var guard = 10000;
  while (pixelStack.length) {
    if (guard-- < 0) break;
    var newPos, x, y, pixelPos, reachLeft, reachRight;
    newPos = pixelStack.pop();
    x = newPos[0];
    y = newPos[1];

    pixelPos = (y * canvasWidth + x) * 4;
    while (y-- >= drawingBoundTop && matchStartColor(pixelPos)) {
      pixelPos -= canvasWidth * 4;
    }
    pixelPos += canvasWidth * 4;
    ++y;
    reachLeft = false;
    reachRight = false;
    while (y++ < canvasHeight - 1 && matchStartColor(pixelPos)) {
      colorPixel(pixelPos);

      if (x > 0) {
        if (matchStartColor(pixelPos - 4)) {
          if (!reachLeft) {
            pixelStack.push([x - 1, y]);
            reachLeft = true;
          }
        } else if (reachLeft) {
          reachLeft = false;
        }
      }

      if (x < canvasWidth - 1) {
        if (matchStartColor(pixelPos + 4)) {
          if (!reachRight) {
            pixelStack.push([x + 1, y]);
            reachRight = true;
          }
        } else if (reachRight) {
          reachRight = false;
        }
      }

      pixelPos += canvasWidth * 4;
    }
  }
  context.putImageData(colorLayer, 0, 0);

}

function matchStartColor(pixelPos) {
  var r = colorLayer.data[pixelPos];
  var g = colorLayer.data[pixelPos + 1];
  var b = colorLayer.data[pixelPos + 2];

  return (r == startR && g == startG && b == startB);
}