class Wire {
  constructor (node1,node2){
    this.node1 = node1
    this.node2 = node2
    this.type = "wire"
  }
  getNodes () {
    return [this.node1, this.node2]
  }
  getType () {
    return this.type
  }
}

export default Wire
