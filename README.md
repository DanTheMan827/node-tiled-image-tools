# Tiled Image Tools
This is a promise-based library for encoding and decoding tiled images.

## Options
|Option        |Description|
|--------------|-----------|
|**Data**      |RGBA encoded data buffer|
|**Width**     |The image width, if encoding, you can specify a smaller width to crop to|
|**Height**    |The image height, if encoding, you can specify a smaller height to crop to|
|**cropWidth** |**Used when decoding**<br />The width to crop the output image to.
|**cropHeight**|**Used when decoding**<br /> The height to crop the output image to.
|**type**      |The encoding type, allowed values are:<br><br>rgb888<br>rgb565<br>bgr888<br>bgr565|

## Encoding
This example will read a PNG using the pngjs library and encode the image data.
```javascript
var fs = require('fs')
var tileTools = require('tiled-image-tools')
var PNG = require('pngjs').PNG

fs.createReadStream('./MyImage.png')
  .pipe(new PNG({}))
  .on('parsed', function () {
    tileUtils.convertToTiled({
      'data': this.data,     // Raw RGBA data from pngjs
      'width': this.width,   // The image width, you can also specify a smaller size if you want to crop
      'height': this.height, // The image height, you can also specify a smaller size if you want to crop
      'type': 'rgb565'       // We will encode to rgb565
    }).then(function (encoded) {
      /*
        encoded will be an object with the following keys:
        
        data: A buffer with the encoded data
        width: The encoded image width
        height: The encoded image height
        bgr: If the image is BGR encoded
        565: If the image is 565 encoded
      */
    }
  })
```

## Decoding
This example will take an RGB565 encoded image and decode it to RGBA
```javascript
var fs = require('fs')
var tileTools = require('tiled-image-tools')

fs.readFile('./RGB565Image.bin', function (data) {
  tileUtils.convertFromTiled({
    'data': data,    // The raw RGB565 data
    'width': 48,     // This must be provided when decoding
    'height': 48,    // This must be provided when decoding
    'type': 'rgb565' // We are decoding from rgb565
  }).then(function (decoded) {
    /*
      decoded will be an object with the following keys.
      
      data: A buffer with the decoded RGBA values
      width: The image width
      height: The image height
      
      It will also contain the options used to decode the image.
    */
  })
}
```

# Credits
Based on code by Marc Robledo<br>
http://usuaris.tinet.cat/mark/smdh_creator/