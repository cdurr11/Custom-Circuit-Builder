class Resistor {
  constructor (node1,node2, value){
    this.node1 = node1;
    this.node2 = node2;
    this.value = value;
    this.type = "resistor";
  }
  getNodes () {
    return [this.node1, this.node2]
  }
  getType () {
    return this.type
  }
  getValue () {
    return this.value;
  }
  setValue (value) {
    this.value = value
  }
}

export default Resistor;
