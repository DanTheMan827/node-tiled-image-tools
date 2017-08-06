/*
  Based on code by Marc Robledo
  http://usuaris.tinet.cat/mark/smdh_creator/
*/
const TILE_ORDER = [
  0, 1, 8, 9, 2, 3, 10, 11, 16, 17, 24, 25, 18, 19, 26, 27, 4, 5, 12, 13, 6, 7,
  14, 15, 20, 21, 28, 29, 22, 23, 30, 31, 32, 33, 40, 41, 34, 35, 42, 43, 48,
  49, 56, 57, 50, 51, 58, 59, 36, 37, 44, 45, 38, 39, 46, 47, 52, 53, 60, 61,
  54, 55, 62, 63
]

function getRGBAPixel (data, x, y) {
  var offset = ((y * data['width']) + x) * 4
  return [
    data['data'][offset],
    data['data'][offset + 1],
    data['data'][offset + 2],
    data['data'][offset + 3]
  ]
}

exports.convertToTiled = function (data) {
  return new Promise(function (resolve, reject) {
    switch (data.type) {
      case 'rgb565':
        data['565'] = true
        data['bgr'] = false
        break

      case 'rgb888':
        data['565'] = false
        data['bgr'] = false
        break

      case 'bgr565':
        data['565'] = true
        data['bgr'] = true
        break

      case 'bgr888':
        data['565'] = false
        data['bgr'] = true
        break

      default: reject('Unsupported type: ' + data.type)
    }
    var i = 0
    var bufferSize = (data['width'] * data['height']) * (data['565'] ? 2 : 3)
    var tiledData = Buffer.alloc(bufferSize)
    for (var tileY = 0; tileY < data['height']; tileY += 8) {
      for (var tileX = 0; tileX < data['width']; tileX += 8) {
        for (var k = 0; k < 8 * 8; k++) {
          var x = TILE_ORDER[k] & 0x7
          var y = TILE_ORDER[k] >> 3

          var pixelData = getRGBAPixel(data, x + tileX, y + tileY)
          var r = pixelData[0] >> (data['565'] ? 3 : 0)
          var g = pixelData[1] >> (data['565'] ? 2 : 0)
          var b = pixelData[2] >> (data['565'] ? 3 : 0)

          if (data['565']) {
            var colorData = (
              data['bgr']
              ? ((b << 11) | (g << 5) | r)
              : ((r << 11) | (g << 5) | b)
            )

            tiledData[i++] = (colorData & 0x00ff)
            tiledData[i++] = (colorData & 0xff00) >> 8
          } else {
            tiledData[i++] = (data['bgr'] ? b : r)
            tiledData[i++] = g
            tiledData[i++] = (data['bgr'] ? r : b)
          }
        }
      }
    }
    resolve({
      'data': tiledData,
      'width': data['width'],
      'height': data['height'],
      'type': data['type']
    })
  })
}

exports.convertFromTiled = function (data) {
  return new Promise(function (resolve, reject) {
    data['cropHeight'] = data['cropHeight'] || data['height']
    data['cropWidth'] = data['cropWidth'] || data['width']

    switch (data.type) {
      case 'rgb565':
        data['565'] = true
        data['bgr'] = false
        break

      case 'rgb888':
        data['565'] = false
        data['bgr'] = false
        break

      case 'bgr565':
        data['565'] = true
        data['bgr'] = true
        break

      case 'bgr888':
        data['565'] = false
        data['bgr'] = true
        break

      default: reject('Unsupported type: ' + data.type)
    }

    var rgbaData = Buffer.alloc((data['cropWidth'] * data['cropHeight']) * 4)
    var i = 0

    for (var tileY = 0; tileY < data['height']; tileY += 8) {
      for (var tileX = 0; tileX < data['width']; tileX += 8) {
        for (var k = 0; k < 8 * 8; k++) {
          var x = TILE_ORDER[k] & 0x7
          var y = TILE_ORDER[k] >> 3

          var r
          var g
          var b

          if (data['565']) {
            var color = data['data'][i++] | (data['data'][i++] << 8)
            r = ((color >> 11) & 0x1f) << 3
            g = ((color >> 5) & 0x3f) << 2
            b = (color & 0x1f) << 3
          } else {
            r = data['data'][i++]
            g = data['data'][i++]
            b = data['data'][i++]
          }
          if ((y + tileY) < data['cropHeight'] && (x + tileX) < data['cropWidth']) {
            var offset = (((y + tileY) * data['cropWidth']) + (x + tileX)) * 4

            rgbaData[offset] = (data['bgr'] ? b : r)
            rgbaData[offset + 1] = g
            rgbaData[offset + 2] = (data['bgr'] ? r : b)
            rgbaData[offset + 3] = 255
          }
        }
      }
    }

    resolve({
      'data': rgbaData,
      'width': data['cropWidth'],
      'height': data['cropHeight'],
      'type': data['type']
    })
  })
}

module.export = exports
