import {ImgWarper} from "./ImgWarper";

export class Warper{
  constructor(canvas, img, imgData, optGridSize, optAlpha){
    this.alpha = optAlpha || 1;
    this.gridSize = optGridSize || 20;
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    var source = img;
    this.width = source.width;
    this.height = source.height;
    this.imgData = imgData.data;
    canvas.width = source.width;
    canvas.height = source.height;
    this.bilinearInterpolation =
      new ImgWarper.BilinearInterpolation(this.width, this.height, canvas);

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.putImageData(imgData, 0, 0);
    console.log('drawn');

    this.grid = [];
    let a,b,c,d;

    for (var i = 0; i < this.width ; i += this.gridSize) {
      for (var j = 0; j < this.height ; j += this.gridSize) {
        a = new ImgWarper.Point(i,j);
        b = new ImgWarper.Point(i + this.gridSize, j);
        c = new ImgWarper.Point(i + this.gridSize, j + this.gridSize);
        d = new ImgWarper.Point(i, j + this.gridSize);
        this.grid.push([a, b, c, d]);
      }
    }
  }
  warp(fromPoints, toPoints){
    var t0 = (new Date()).getTime();
    var deformation =
      new ImgWarper.AffineDeformation(toPoints, fromPoints, this.alpha);
    var transformedGrid = [];
    for (var i = 0; i < this.grid.length; ++i) {
      transformedGrid[i] = [
        deformation.pointMover(this.grid[i][0]),
        deformation.pointMover(this.grid[i][1]),
        deformation.pointMover(this.grid[i][2]),
        deformation.pointMover(this.grid[i][3])];
    }
    var t1 = (new Date()).getTime();
    var newImg = this.bilinearInterpolation
      .generate(this.imgData, this.grid, transformedGrid);
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.putImageData(newImg, 0, 0);
    var t2 = (new Date()).getTime();
    document.getElementById('fps').innerHTML =
      'Deform: ' + (t1 - t0) + 'ms; interpolation: ' + (t2 - t1) + 'ms';
    if (document.getElementById('show-grid').checked) {
      this.drawGrid(fromPoints, toPoints);
    }
  }
}