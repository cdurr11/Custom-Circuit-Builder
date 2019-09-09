import {solveLinearSystem, AffineExpression} from "./linearsystem.js";
// import {} from "./linearsystem.js";
// var AffineExpression = require("linearsystem.js")(AffineExpression)
import Resistor from "./Resistor.js";
import Wire from "./Wire.js";
import VoltageSource from "./VoltageSource.js";
class CircuitMechanics {
  constructor (connections, batteryConnections, start) {
    this.connectionTypes = connections
    this.batteryConnections = batteryConnections;
    this.start = start;
    // console.log("connections",this.connections);
    // console.log("connectionTypes",this.connectionTypes);

    // console.log(this.simulateCircuit());
  }

  voltageVariable(node) {
    return 'v[' + node + ']';
  }

  nodeToStr(n) {
    return n[0] + "," + n[1];
  }
  createNodesAndPlacedObjects(){
    let mapping = this.connectionTypes;
    let used = new Set();
    let placedObjects = []
    let nodes = []

    // Put all the distinct nodes in a hashtable.
    for (var key in mapping) {
      let act_arr = key.split(",");
      let nodeStr = act_arr[0].toString();
      let newNodeStr = act_arr[1].toString();
      let reversed = act_arr[1]+ "," + act_arr[0];
        if (used.has(reversed)){
          continue;
        }
        placedObjects.push(mapping[key])
        if (!nodes[nodeStr]) {
          nodes[nodeStr] = [];
        }
        if (!nodes[newNodeStr]) {
          nodes[newNodeStr] = [];
        }

        used.add(key);
        nodes[nodeStr].push(mapping[key]);
        nodes[newNodeStr].push(mapping[key]);
    }
    return [placedObjects, nodes];
  }

  createCurrentAndOrientations(nodes, placedObjects){
    var system = [];
    for (var nstr in nodes) {

      var orientations = [];
      var currents = [];
      // Enumerate all placed objects that touch the node.
      for (var objIndex in nodes[nstr]) {
        var obj = nodes[nstr][objIndex];
        // console.log("OBJ",obj);
        // Use the index of the object in placedObjects to uniquely name the
        // associated current variable.
        var objectId = placedObjects.indexOf(obj);
        if (objectId > -1) {
          // Determine the orientation of the current into this object.
          orientations.push((nstr == obj.getNodes()[0]) ? 1 : -1);
          currents.push('i[' + objectId + ']');
        }
      }
      // sum_currents = 0 when orientations are respected
      system.push(new AffineExpression(orientations, currents, 0));
    }
    return system;
  }

  writeVoltageExpressions (nodes, placedObjects, system) {
    for (var objectId1 in placedObjects) {
      var obj = placedObjects[objectId1];
      nodes = obj.getNodes();

      var node1name = this.voltageVariable(nodes[0]);
      var node2name = this.voltageVariable(nodes[1]);
      if (obj instanceof Resistor) {
        var currentname = 'i[' + objectId1 + ']';
        // V1 - V2 - R i == 0
        system.push(
          new AffineExpression([1, -1, -obj.getValue()],
                               [node1name, node2name, currentname],
                               0));
      } else if (obj instanceof Wire) {
        // V1 == V2
        system.push(new AffineExpression([1, -1], [node1name, node2name], 0));
      } else if (obj instanceof VoltageSource) {
        // V1 - V2 == V_s
        system.push(new AffineExpression([1, -1],
                                         [node1name, node2name],
                                         obj.getValue()));
      }
    }
    return system
  }

  simulateCircuit() {
    let [placedObjects, nodes] = this.createNodesAndPlacedObjects()
    var system = this.createCurrentAndOrientations(nodes,placedObjects);
    // Write a voltage equation on each element.
    var finalSystem = this.writeVoltageExpressions(nodes, placedObjects, system);
    var blackLeadVoltageName = this.voltageVariable(parseInt(this.start.id));
    finalSystem.push(new AffineExpression([1], [blackLeadVoltageName], 0))
    var soln = solveLinearSystem(finalSystem);
    return soln;
  }

}

export default CircuitMechanics;
