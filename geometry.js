class GeoFigure {
}

class GeoBox extends GeoFigure {
  constructor() {
    super();
    for (let i = 0; i + 1 < arguments.length; i += 2) {
      this.mergePoint(arguments[i], arguments[i + 1]);
    }
  }

  mergePoint(x, y) {
    if (this.isNull()) {
      this._minx = x;
      this._miny = y;
      this._maxx = x;
      this._maxy = y;
    }
    else {
      if (x < this._minx) {
        this._minx = x;
      }
      else if (x > this._maxx) {
        this._maxx = x;
      }

      if (y < this._miny) {
        this._miny = y;
      }
      else if (y > this._maxy) {
        this._maxy = y;
      }
    }
  }

  mergeBox(box) {
    if (box && !box.isNull()) {
      this.mergePoint(box.minX, box.minY);
      this.mergePoint(box.maxX, box.maxY);
    }
  }

  get minX() {
    return this._minx;
  }

  get maxX() {
    return this._maxx;
  }

  get minY() {
    return this._miny;
  }

  get maxY() {
    return this._maxy;
  }

  get width() {
    return this.isNull() ? undefined : this._maxx - this._minx;
  }

  get height() {
    return this.isNull() ? undefined : this._maxy - this._miny;
  }

  isNull() {
    return this._minx === undefined;
  }
}
