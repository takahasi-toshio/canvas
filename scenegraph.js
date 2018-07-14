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
