function sliderGenerator (canvas) {

    var image;
    var ctx = canvas.getContext('2d'),
      width = 0;
      height = 0;

    var game = function () {
      width = 0;
      height = 0;
    };

    game.width = function (newWidth) {
      if (newWidth) { width = newWidth; }
      return newWidth ? this : width;
    };

    game.height = function (newHeight) {
      if (newHeight) { height = newHeight; }
      return newHeight ? this : height;
    };

    game.load = function (inputImage) {
      image = inputImage;
    }

    game.render = function () {
      ctx.drawImage(image, width, height);
    };

    //var image = new Image();
    //image.src = 'example.jpg';
    //image.onload = function () {
    //  ctx.drawImage(image, 500, 500);
    //};

    return game;
}
