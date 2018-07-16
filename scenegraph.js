class SceneNode {
  constructor() {
  }

  addChild(node) {
    if (!node || node.parentNode) {
      return false;
    }

    if (!this._childNodes) {
      this._childNodes = new Set;
    }

    this._childNodes.add(node);
    node.parentNode = this;

    let boundBox = node.boundBox;
    if (boundBox && !boundBox.isNull()) {
      if (!this._boundBox) {
        this._boundBox = new GeoBox;
      }
      this._boundBox.mergeBox(boundBox);
    }

    return true;
  }

  updateBoundBox() {
    delete this._boundBox;
    if (this._childNodes) {
      for (let node of this._childNodes) {
        node.updateBoundBox();
        let boundBox = node.boundBox;
        if (boundBox && !boundBox.isNull()) {
          if (!this._boundBox) {
            this._boundBox = new GeoBox;
          }
          this._boundBox.mergeBox(boundBox);
        }
      }
    }
  }

  get parentNode() {
    return this._parentNode;
  }

  set parentNode(node) {
    this._parentNode = node;
  }

  get boundBox() {
    return this._boundBox;
  }
}

class PathShape {
  constructor() {
  }

  moveTo(x, y) {
    this._pushUInt8(PathShape._MOVE_TO);
    this._pushFloat64(x);
    this._pushFloat64(y);
  }

  lineTo(x, y) {
    this._pushUInt8(PathShape._LINE_TO);
    this._pushFloat64(x);
    this._pushFloat64(y);
  }

  set lineWidth(width) {
    this._pushUInt8(PathShape._LINE_WIDTH);
    this._pushFloat64(width);
  }

  shrink_to_fit() {
    if (this._buffer) {
      if (this._buffer.byteLength > this._offset) {
        if (this._offset === 0) {
          delete this._buffer;
          delete this._dataView;
          delete this._offset;
        }
        else {
          this._buffer = this._buffer.slice(0, this._offset);
          this._dataView = new DataView(this._buffer);
        }
      }
    }
  }

  stroke(context, onePixelSize) {
    if (this._buffer) {
      context.beginPath();
      let x;
      let y;
      let lineWidth;
      let lastX = undefined;
      let lastY = undefined;
      for (let i = 0; i < this._offset;) {
        let op = this._dataView.getUint8(i);
        ++i;
        switch (op) {
          case PathShape._MOVE_TO:
            x = this._dataView.getFloat64(i);
            y = this._dataView.getFloat64(i + 8);
            context.moveTo(x, y);
            i += 8 + 8;
            break;
          case PathShape._LINE_TO:
            lastX = this._dataView.getFloat64(i);
            lastY = this._dataView.getFloat64(i + 8);
            context.lineTo(lastX, lastY);
            i += 8 + 8;
            break;
          case PathShape._LINE_WIDTH:
            if (lastX !== undefined) {
              context.stroke();
              context.beginPath();
              context.moveTo(lastX, lastY);
              lastX = undefined;
              lastY = undefined;
            }
            lineWidth = this._dataView.getFloat64(i);
            context.lineWidth = Math.max(lineWidth, onePixelSize);
            i += 8;
            break;
          default:
            return;
        }
      }
      if (lastX !== undefined) {
        context.stroke();
      }
    }
  }

  fill(context, fillRule) {
    if (this._buffer) {
      context.beginPath();
      let x;
      let y;
      for (let i = 0; i < this._offset;) {
        let op = this._dataView.getUint8(i);
        ++i;
        switch (op) {
          case PathShape._MOVE_TO:
            x = this._dataView.getFloat64(i);
            y = this._dataView.getFloat64(i + 8);
            context.moveTo(x, y);
            i += 8 + 8;
            break;
          case PathShape._LINE_TO:
            x = this._dataView.getFloat64(i);
            y = this._dataView.getFloat64(i + 8);
            context.lineTo(x, y);
            i += 8 + 8;
            break;
          case PathShape._LINE_WIDTH:
            // fillでは使わない
            i += 8;
            break;
          default:
            return;
        }
      }
      context.fill(fillRule);
    }
  }

  _pushUInt8(u8) {
    this._extend(1);
    this._dataView.setUint8(this._offset, u8);
    this._offset += 1;
  }

  _pushFloat64(f64) {
    this._extend(8);
    this._dataView.setFloat64(this._offset, f64);
    this._offset += 8;
  }

  _extend(byteLength) {
    if (!this._buffer) {
      this._buffer = new ArrayBuffer(Math.max(128, byteLength));
      this._dataView = new DataView(this._buffer);
      this._offset = 0;
    }

    if (this._offset + byteLength >= this._buffer.byteLength) {
      let buffer = new ArrayBuffer(Math.max(this._buffer.byteLength * 3 / 2, this._offset + byteLength));
      (new Uint8Array(buffer)).set(new Uint8Array(this._buffer));
      this._buffer = buffer;
      this._dataView = new DataView(this._buffer);
    }
  }
}

PathShape._MOVE_TO = 1;
PathShape._LINE_TO = 2;
PathShape._LINE_WIDTH = 3;