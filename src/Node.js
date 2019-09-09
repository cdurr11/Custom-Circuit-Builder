class Node {
  constructor(x, y, id, nodeData) {
    this.nodeData = nodeData
    this.x = x;
    this.y = y;
    this.coords = [this.x, this.y];
    this.id = id;
    this.canConnect = this.findConnections();
    this.nodeConnectionTypes = {};
    //stores id's of nodes
    // console.log(this.id)
    // console.log(this.canConnect);
    // console.log(this.coords)
    this.isConnected = [];
  }
  getX () {
    return this.x;
  }

  getY () {
    return this.y
  }
  getCoords () {
    return this.coords;
  }
  getPossibleConnections () {
    return this.canConnect;
  }

  getCurrentConnections () {
    return this.isConnected;
  }
  //will get all of the ids of nodes that this node can connect to.
  findConnections () {
    // console.log(this.id)
    // console.log(this.nodeData)
    var possibleConnections = [this.id + 1, this.id - 1, this.id - this.nodeData.nodeCols, this.id + this.nodeData.nodeCols];
    var finalConnection = [];
    let firstCond = true;
    let secondCond = true;
    let thirdCond = true;

    for (let i=0;i<possibleConnections.length;i++) {
      firstCond = (possibleConnections[i] > 0 && possibleConnections[i] <= this.nodeData.nodeRows * this.nodeData.nodeCols)
      if (this.id % this.nodeData.nodeCols === 0) {
        secondCond = possibleConnections[i] !== this.id + 1;
      }

      if (this.id % this.nodeData.nodeCols === 1) {
        thirdCond = possibleConnections[i] !== this.id - 1;
      }
      if (firstCond && secondCond && thirdCond) {
        finalConnection.push(possibleConnections[i]);
      }
    }
    return finalConnection;

  }

  addConnection (node, type) {
    this.isConnected.push(node.id);
    this.nodeConnectionTypes[node] = type;
  }

  deleteConnection (node) {
    this.isConnected = this.isConnected.filter(value => {return value !== node.id});
    }
  }

  export default Node;
