import React from 'react'
import './App.css'
import CircuitMechanics from './CircuitMechanics.js'
import Node from './Node.js';
import Resistor from "./Resistor.js";
import Wire from "./Wire.js";
import VoltageSource from "./VoltageSource.js";


class CanvasComponent extends React.Component {
    constructor(props) {
      super(props);
      //feeds into circuit mechanics so we can tell where the battery in
      //the circuit is
      this.batteryConnections;
      //Fed from App.js, tells us which buttons are toggled.
      this.toggled = {wire:false,
                      resistor:false,
                      battery:false,
                      inductor:false,
                      capacitor: false}

      //read this in from the JSON file Eventually
      this.nodeData = {radius: 10,
                       nodeRows: 4,
                       nodeCols: 7,
                       totalNodes: 28,
                       xRows: [],
                       yRows: []}
      let init = this.initializeNodes();
      //circles maps node id number to node obj. Doesn't really do much now
      // will probably remove in the future
      this.circles = init[0];
      this.nodeLocations = init[1];
      //click zones are the regions between zones that signify you have clicked
      //on one of the circuit components.
      this.clickZones = this.createZones();
      this.state = {validStart: false,
                    dragging:false,
                    mouseDown:false,
                    nodeClicked:null,
                    toggled:{},
                    valid:false,
                    selectedNodes:[],
                    awaitingUpdate: null,
                    applyClicked: false};
      //this stores all of the connections
      this.connections = {};
  }

   isIntersect(circleX, circleY, clickX, clickY) {
     /*
     * Determines if we have clicked inside one of the nodes
     * @param {Int} circleX - x coordinate of the center of the circle
     * @param {Int} circleY - y coordinate of the center of the circle
     * @param {Int} clickX - x coordinate of the center of the circle
     * @param {Int} clickY - y coordinate of the center of the circle
     * @return {Array} array of [circleX,circleY]
     */
     if (Math.sqrt((clickX-circleX) ** 2 + (clickY - circleY) ** 2) < this.nodeData.radius) {
       return [circleX, circleY];
     }
   }
   getNodesFromString (strArr) {
     /*
     * Utility function that get the nodes that are used in a connection
     * This is necessary because this.connections maps in the format :
     *    "1,2" : "W" - designating a connection between 1 - 2 connected by a wire
     * @param {String} strArr - The array string used in this.connections
     * @return {Array} Array of the numerical values that were passed in as a String
     */
     let splitArr = strArr.split(",");
     return [parseInt(splitArr[0]),parseInt(splitArr[1])];
   }
   initializeNodes () {
     /*
     * Initialization function that creates all of the node objects
     * @return {Array} index 0 is a map of form nodeID : NodeObject
                       index 1 is a map of form pixelLocation : NodeObject
     */
     let circles = {};
     let nodeLocations = {};
     for (let j = 1; j <= this.nodeData.nodeRows; j++){
       for (let i = 1; i<= this.nodeData.nodeCols; i++) {
         circles[(j - 1) * this.nodeData.nodeCols + i] = new Node(i * 100, j * 100, ((j - 1) * this.nodeData.nodeCols) + i, this.nodeData);
         let data = [i*100,j*100].toString();
         nodeLocations[data] = circles[(j - 1) * this.nodeData.nodeCols + i];

       }
     }
     return [circles, nodeLocations];
    }

   doErase(xClick, yClick, zone, node1, node2) {
     /*
     * Removes and erases the component in this.connections
     * @param {Int} xClick - x value of location clicked on the canvas
     * @param {Int} yClick - y value of location clicked on the canvas
     * @param {Array} zone - The zone that was clicked in
     * @param {Node} node1 - one of the nodes that bound the zone
     * @param {Node} node2 - the other node that bounds the zone
     */
     let nodeStr = [node1.id,node2.id].toString();
     let revNodeStr = [node2.id,node1.id].toString();
         if (nodeStr in this.connections) {
           delete this.connections[nodeStr];
         }
         if (revNodeStr in this.connections){
           delete this.connections[revNodeStr];
         }
       }


    getClickZoneNodes (clickX, clickY) {
      /**
      * Determine what zone was clicked
      * @param {Int} clickX - The x value of the mouse click location
      * @param {Int} clickY - The y value of the mouse click location
      * @return {Array} The selected zone with format :
      *     [zone, node1, node2]
      */
      let selectedZone = this.clickZones.find(function(zone){
        if (clickX >= zone[0][0] && clickX <= zone[0][1]) {
          if (clickY >= zone[0][2] && clickY <= zone[0][3]) {
            return zone;
          }
        }
      });
      return selectedZone;
    }
    createZones() {
      /**
      * Create the zones that are used to designate whether someone has clicked
      * between nodes, for example erasing a connection
      * @return {Array} Returns an array of the format :
      *     [zone, node1, node2]
      * where zone is defined as :
      *     [left bound, right bound, top bound, bottom bound]
      * and node1 and node2 are the nodes that bound the connections on each
      * side
      */
      let set1 = new Set([7,14,21,28]);
      let set2 = new Set([22,23,24,25,26,27,28]);
      let finalArray = [];
      var zone1;
      var zone2;
      for (let vert = 100; vert <= 700; vert += 100) {
       for (let horz = 100; horz <= 400; horz += 100) {
         //***FORMAT FOR ZONES***
         //[left bound, right bound, top bound, bottom bound], node1, node2
         //Create horizontal zones
         if (vert !== 700) {
           let zone1 = [vert + 5, vert + 95, horz - 10, horz + 10];
           let pivotNode = this.nodeLocations[[vert,horz].toString()];
           let rightNode = this.nodeLocations[[vert + 100, horz].toString()];
           finalArray.push([zone1, pivotNode, rightNode,0]);
          }
         if (horz !== 400) {
           let zone2 = [vert - 10, vert + 10, horz + 5, horz + 95];
           let pivotNode = this.nodeLocations[[vert,horz].toString()];
           let bottomNode = this.nodeLocations[[vert,horz + 100].toString()];
           finalArray.push([zone2, pivotNode, bottomNode,1]);
         }
       }
      }

        return finalArray;
      }
    getClickedNodes (canvasClickX, canvasClickY) {
      /*
      * determines what node was clicked on
      * @param {Int} canvasClickX - the location on the canvas that was clicked
      * @param {Int} canvasClickY - the location on the canvas that was clicked
      * @return {Node} The node object that was clicked
      */
      let clickedNode = Object.values(this.circles).find(function(node) {
        if (this.isIntersect(node.getX(), node.getY(), canvasClickX, canvasClickY)) {
         return node;
       }}, this);
       return clickedNode;
    }

    updateClickedState(canvasClickX, canvasClickY) {
      let clickedNode = this.getClickedNodes(canvasClickX, canvasClickY);
      if (typeof clickedNode !== 'undefined') {
         this.setState({nodeClicked : clickedNode,
                               valid : true});

         this.setState({validStart:true})
       }

       else {
         this.setState({nodeClicked: null,
                        validStart:false});
       }
    }
    updateValueFromInput() {

    }
    handleMouseDown(e) {
      /*
      * Event handler for mouse down.  Updates state and calls the erase
      * if erase selected
      * @param {Event} e - Event passed from browser
      */
      // console.log(this.connections);
      this.setState({selectedNodes:[]})
      // console.log(this.props.consoleData);
      this.setState({dragging : true});
      let [canvasClickX, canvasClickY] = this.getBoundingValues(e);

      if (this.props.toggle.erase) {
        let zone = this.getClickZoneNodes(canvasClickX, canvasClickY);
        if (!Array.isArray(zone) || !zone.length) {
            // array does not exist, is not an array, or is empty
            return;
        }
        let node1 = zone[1];
        let node2 = zone[2];
        this.doErase(canvasClickX, canvasClickY, zone, node1, node2);
        return;
        }
      if (this.props.toggle.on) {
        let solution_zone = this.getClickZoneNodes(canvasClickX, canvasClickY);
        if (!Array.isArray(solution_zone) || !solution_zone.length) {
            // array does not exist, is not an array, or is empty
            return;
        }
        this.solveCircuit(solution_zone[1],solution_zone[2]);
        // this.props.toggle.on = false;
      }

      if (this.props.toggle.selector) {
        // console.log("IN HERE");
        let selected = this.getClickZoneNodes(canvasClickX, canvasClickY);
        // console.log(selected);
        if (typeof selected !== 'undefined') {
          let [zone, node1, node2] = selected;
          // console.log(node1)
          let stringNodes = [node1.id,node2.id].toString();
          if (stringNodes in this.connections) {
            this.setState({selectedNodes:[node1,node2]});
            if (this.connections[stringNodes] instanceof Resistor) {
              this.props.selectedDataCallBack(3,this.connections[stringNodes]);
              //wait for update
              // this.setState({awaitingUpdate: stringNodes});
            }
            if (this.connections[stringNodes] instanceof VoltageSource) {
              this.props.selectedDataCallBack(4,this.connections[stringNodes]);
            //1 - New Resistor, 2 - New VoltageSource, 6 - New Wire,
            //3 - Change Resistance, 4 - Change Voltage, 5 - Solve
          }
        }
      }
    }
      this.updateClickedState(canvasClickX, canvasClickY);
    }
    getBoundingValues(e) {
      /*
      * Utility function that Gets the in the actual app of where was clicked
      * @param {Event} e - The event from the browser
      * @return {Array} - returns an array with the first index giving the
      * x value and the second value giving the y value
      */
      const canvasRect = this.refs.canvas.getBoundingClientRect();
      const canvasVerticalOffset = canvasRect.top;
      const canvasHorizontalOffset = canvasRect.left;
      let canvasX = e.pageX - canvasHorizontalOffset;
      let canvasY = e.pageY - canvasVerticalOffset;
      return [canvasX,canvasY];
    }

    isValidConnection(raisedNode) {
      let set1 = new Set([7,14,21]);
      let initialNode = this.state.nodeClicked;
      if ( Math.abs(raisedNode.id - initialNode.id) === 7) {
        return true;
      }
      if (raisedNode.id === initialNode.id + 1 && !set1.has(initialNode.id)) {
        return true;
      }
      if (raisedNode.id + 1 === initialNode.id && !set1.has(raisedNode.id)) {
        return true;
      }
      return false;
    }
    addComponents(connectedCircle){
      /*
      * Adds the components to this.connection so that they can be rendered
      * @param {Int} canvasX - the location on the canvas that was clicked
      * @param {Int} canvasY - the location on the canvas that was clicked
      */

        let consoleData = this.props.consoleData;
        if (typeof connectedCircle !== 'undefined') {
          var obj;
          if (this.props.toggle.wire) {
            obj = new Wire(connectedCircle.id,this.state.nodeClicked.id,1);
            this.props.selectedDataCallBack(6,obj);
          }
          if (this.props.toggle.battery) {
            // console.log("ConsoleData", consoleData);
            if (consoleData !== "" && parseInt(consoleData) > 0) {
              obj = new VoltageSource(connectedCircle.id,this.state.nodeClicked.id,parseInt(consoleData));
              this.props.selectedDataCallBack(2,obj);
              this.batteryConnections = [this.state.nodeClicked, connectedCircle].toString();
            }
            else {
              alert("Input a value for the Voltage Source");
            }
          }

          if (this.props.toggle.resistor) {
            // console.log(consoleData);
            if (consoleData !== "" && parseInt(consoleData) > 0) {
              obj = new Resistor(connectedCircle.id,this.state.nodeClicked.id,parseInt(consoleData));
              this.props.selectedDataCallBack(1,obj);
            }
            else {
              alert("Input a positive value for the Resistor");
            }
          }
          this.connections[[connectedCircle.id, this.state.nodeClicked.id].toString()] = obj;
          this.connections[[this.state.nodeClicked.id, connectedCircle.id].toString()] = obj;
        }
      }

    handleMouseUp(e) {
      /*
      * Event handler that handles when the primary mouse key is lifted up.
      * Erasing components, drawing components, and solving the circuit are
      * called from here
      * @param {Event} e - Event passed in from the browser
      */
      let [canvasRaiseX, canvasRaiseY] = this.getBoundingValues(e)
      this.setState({valid:false});
      if (this.state.validStart){
        if (this.state.dragging){
          let connectedNode = this.getClickedNodes(canvasRaiseX, canvasRaiseY);
          if (typeof connectedNode !== 'undefined') {
            if (this.isValidConnection(connectedNode)) {
              this.addComponents(connectedNode);
            }
          }
        }
      }
        this.setState({dragging:false});
        this.redrawCanvasWithoutIndicator();
    }

    handleMouseMove(e) {
      /*
      * Event handler that handles when the mouse is moving
      * drawing the dragging indicator is called from here
      * @param {Event} e - Event passed in from the browser
      */
      if (this.state.dragging) {
        if (this.state.valid) {
          let [canvasClickX, canvasClickY] = this.getBoundingValues(e);
          let mousedOverNode = this.getClickedNodes(canvasClickX, canvasClickY)
          if (typeof mousedOverNode !== 'undefined') {
            if (this.isValidConnection(mousedOverNode)) {
              this.redrawCanvasWithIndicator(canvasClickX, canvasClickY, mousedOverNode);
            }
          }
          else {
            this.redrawCanvasWithIndicator(canvasClickX, canvasClickY);
          }
        }
      }
    }
    componentWillReceiveProps(nextProps) {
      if (this.props !== nextProps) {
        if (this.state.selectedNodes.length !== 0) {
          if (nextProps.applyClicked) {
          // console.log("UPDATED VALUE", nextProps.updatedValue);
          let idString = [this.state.selectedNodes[0].id,this.state.selectedNodes[1].id];
          // console.log(this.state.selectedNodes.toString());
          this.connections[idString].setValue(parseInt(nextProps.updatedValue));
          // this.setState({awaitingUpdate: null})
          this.setState({selectedNodes: []});
          this.props.applied();
          this.redrawCanvasWithoutIndicator();
          }
        }
      }
    }

    drawResistor(node1, node2) {
      /*
      * Draws the resistor on the canvas
      * @param {Node} node1 - One of the nodes that the resistor is attached to
      * @param {Node} node2 - The other node that the resistor is attached to
      */
      const ctx3 = this.refs.canvas.getContext('2d');
      ctx3.fillStyle = "#FF0000";
      ctx3.strokeStyle = "#FF0000"
      ctx3.lineWidth  = 10;

      if (node1.getX() < node2.getX() &&  node1.getY() === node2.getY()) {
        ctx3.fillRect(node1.getX(), node1.getY() - 5, 23, 10);
        ctx3.fillRect(node1.getX() + 78, node1.getY() - 5, 20, 10);
        ctx3.lineWidth = 10;
        ctx3.beginPath();
        ctx3.moveTo(node1.getX() + 20, node1.getY());
        ctx3.lineTo(node1.getX() + 30, node1.getY() - 10);
        ctx3.lineTo(node1.getX() + 40, node1.getY())
        ctx3.lineTo(node1.getX() + 50, node1.getY() - 10)
        ctx3.lineTo(node1.getX() + 60, node1.getY());
        ctx3.lineTo(node1.getX() + 70, node1.getY() - 10);
        ctx3.lineTo(node1.getX() + 82, node1.getY() + 2);
        ctx3.stroke();
      }

      if (node1.getX() > node2.getX() && node1.getY() === node2.getY()) {
        ctx3.fillRect(node1.getX(), node1.getY() - 5, -23, 10);
        ctx3.fillRect(node1.getX() - 78, node1.getY() - 5, -20, 10);
        ctx3.lineWidth = 10;
        ctx3.beginPath()
        ctx3.moveTo(node1.getX() - 20, node1.getY());
        ctx3.lineTo(node1.getX() - 30, node1.getY() - 10);
        ctx3.lineTo(node1.getX() - 40, node1.getY());
        ctx3.lineTo(node1.getX() - 50, node1.getY() - 10);
        ctx3.lineTo(node1.getX() - 60, node1.getY());
        ctx3.lineTo(node1.getX() - 70, node1.getY() -10);
        ctx3.lineTo(node1.getX() - 82, node1.getY() + 2);
        ctx3.stroke()
      }
      if (node1.getX() === node2.getX() && node1.getY() > node2.getY()) {
        ctx3.fillRect(node1.getX() - 5, node1.getY(), 10, -23);
        ctx3.fillRect(node1.getX() - 5, node1.getY() - 78, 10, -20);
        ctx3.lineWidth = 10;
        ctx3.beginPath()
        ctx3.moveTo(node1.getX(), node1.getY() - 20);
        ctx3.lineTo(node1.getX() - 10, node1.getY() - 30);
        ctx3.lineTo(node1.getX(), node1.getY() - 40);
        ctx3.lineTo(node1.getX() - 10, node1.getY() - 50);
        ctx3.lineTo(node1.getX(), node1.getY() - 60);
        ctx3.lineTo(node1.getX() - 10, node1.getY() - 70);
        ctx3.lineTo(node1.getX() + 2, node1.getY() -82);
        ctx3.stroke()
      }
      if (node1.getX() === node2.getX() && node1.getY() < node2.getY()) {
        ctx3.fillRect(node1.getX() - 5, node1.getY(), 10, 23);
        ctx3.fillRect(node1.getX() - 5, node1.getY() + 78, 10, 20);
        ctx3.beginPath();
        ctx3.moveTo(node1.getX(), node1.getY() + 20);
        ctx3.lineTo(node1.getX() - 10, node1.getY() + 30);
        ctx3.lineTo(node1.getX(), node1.getY() + 40);
        ctx3.lineTo(node1.getX() - 10, node1.getY() + 50);
        ctx3.lineTo(node1.getX(), node1.getY() + 60);
        ctx3.lineTo(node1.getX() - 10, node1.getY() + 70);
        ctx3.lineTo(node1.getX() + 2, node1.getY() + 82);
        ctx3.stroke();
      }
      this.redrawConnectionNodes();
    }
    drawBattery(node1, node2) {
      /*
      * Draws the battery on the canvas
      * @param {Node} node1 - One of the nodes that the battery is attached to
      * @param {Node} node2 - The other node that the battery is attached to
      */
      const ctx2 = this.refs.canvas.getContext('2d');

      ctx2.fillStyle = "#FF0000";
      if (node1.getX() < node2.getX() &&  node1.getY() === node2.getY()){
        ctx2.fillRect(node1.getX(), node1.getY() - 5, 40, 10);
        ctx2.fillRect(node1.getX() + 55, node1.getY() - 5, 50, 10);
        ctx2.fillStyle = "#000000";
        ctx2.fillRect(node1.getX() + 40, node1.getY() -15, 10, 30);
        ctx2.fillRect(node1.getX() + 55, node1.getY() - 25, 10, 50);
      }

      if (node1.getX() > node2.getX() && node1.getY() === node2.getY()) {
        ctx2.fillRect(node1.getX(), node1.getY() - 5, -40, 10);
        ctx2.fillRect(node1.getX() - 55, node1.getY() - 5, -50, 10);
        ctx2.fillStyle = "#000000";
        ctx2.fillRect(node1.getX() - 45, node1.getY() -15, 10, 30);
        ctx2.fillRect(node1.getX() - 60, node1.getY() - 25, 10, 50);
      }

      if (node1.getX() === node2.getX() && node1.getY() > node2.getY()) {
        ctx2.fillRect(node1.getX() - 5, node1.getY(), 10, -45);
        ctx2.fillRect(node1.getX() - 5, node1.getY() - 55, 10, -45);
        ctx2.fillStyle = "#000000";
        ctx2.fillRect(node1.getX() - 15, node1.getY() - 45, 30, 10);
        ctx2.fillRect(node1.getX() - 25, node1.getY() - 60, 50, 10);
      }

      if (node1.getX() === node2.getX() && node1.getY() <  node2.getY()) {
        ctx2.fillRect(node1.getX() - 5, node1.getY(), 10, 45);
        ctx2.fillRect(node1.getX() - 5, node1.getY() + 55, 10, 45);
        ctx2.fillStyle = "#000000";
        ctx2.fillRect(node1.getX() - 15, node1.getY() + 40, 30, 10);
        ctx2.fillRect(node1.getX() - 25, node1.getY() + 55, 50, 10);
      }

      this.redrawConnectionNodes();
    }

    drawConnection(node1, node2) {  
      /*
      * Draws the wire on the canvas
      * @param {Node} node1 - One of the nodes that the wire is attached to
      * @param {Node} node2 - The other node that the wire is attached to
      */
      const ctx2 = this.refs.canvas.getContext('2d');

      ctx2.fillStyle = "#FF0000";
      if (node1.getX() < node2.getX() &&  node1.getY() === node2.getY()){
        ctx2.fillRect(node1.getX(), node1.getY() - 5, 100, 10);
      }

      if (node1.getX() > node2.getX() && node1.getY() === node2.getY()) {
        ctx2.fillRect(node1.getX(), node1.getY() - 5, -100, 10);
      }

      if (node1.getX() === node2.getX() && node1.getY() > node2.getY()) {
        ctx2.fillRect(node1.getX() - 5, node1.getY(), 10, -100);
      }

      if (node1.getX() === node2.getX() && node1.getY() <  node2.getY()) {
        ctx2.fillRect(node1.getX() - 5, node1.getY(), 10, 100);
      }

      this.redrawConnectionNodes();
    }
    drawIndicator(x,y) {
      /*
      * Draws the indicator that appears when someone drags to indicate where
      * the new component will appear
      * @param {Int} x - the x value of the mouse
      * @param {Int} y - the y value of the mouse
      */
      const ctx9 = this.refs.canvas.getContext('2d');
      ctx9.strokeStyle = "#FD9595"
      ctx9.lineWidth = 10;
      ctx9.beginPath();
      ctx9.moveTo(this.state.nodeClicked.getX(), this.state.nodeClicked.getY());
      ctx9.lineTo(x, y);
      ctx9.stroke();
      this.redrawConnectionNodes();
    }
    drawClickedIndicator(node) {
      const ctx = this.refs.canvas.getContext('2d');
      ctx.fillStyle = '#FFFF00'
      ctx.beginPath();
      ctx.arc(node.getX(), node.getY(), 15, 0, 2 * Math.PI);
      ctx.fill();
    }
    redrawCanvasWithIndicator(x,y,mousedOverNode = null) {
      /*
      * Draws the canvas with the dragging indicator. Draws all of the
      * components that are in this.connections
      * @param {Int} x - the x value of the mouse
      * @param {Int} y - the y value of the mouse
      */
      let drawn = new Set();
      const ctx7 = this.refs.canvas.getContext('2d');
      ctx7.clearRect(0, 0, this.refs.canvas.width, this.refs.canvas.height);
      this.drawClickedIndicator(this.state.nodeClicked);
      if (!(mousedOverNode === null)){
        this.drawClickedIndicator(mousedOverNode);
      }
      for (var key in this.connections) {
        // console.log(key.split(","));
        if (!drawn.has(key)) {
          let nodes = this.getNodesFromString(key);
          let node1 = nodes[0];
          let node2 = nodes[1];
          if ( this.connections[key] instanceof Wire) {
                this.drawConnection(this.circles[node1], this.circles[node2]);
          }
          else if (this.connections[key] instanceof Resistor) {
            this.drawResistor(this.circles[node1], this.circles[node2]);
          }
          else if (this.connections[key] instanceof VoltageSource) {
            this.drawBattery(this.circles[node1], this.circles[node2]);
          }
          drawn.add(key);
          let reversed = [key.split(",").reverse()].toString();
          drawn.add(reversed);
        }
      }
        this.drawIndicator(x,y);
      }
      redrawCanvasWithoutIndicator(node1 = null, node2 = null){
        /*
        * Draws the canvas without the. Draws all of the components that are
        * in this.connections
        */
        const ctx8 = this.refs.canvas.getContext('2d');
        //clears the canvas completely
        ctx8.clearRect(0, 0, this.refs.canvas.width, this.refs.canvas.height);
        //drawn is a set that makes sure that when we draw the component
        //in this.connections["1,2"] we do not also draw this.connections["2,1"]
        let drawn = new Set();
        // console.log("this.state.selectedNodes",this.state.selectedNodes);
        if (this.state.selectedNodes.length !== 0) {
          this.drawClickedIndicator(this.state.selectedNodes[0]);
          this.drawClickedIndicator(this.state.selectedNodes[1]);
        }
        for (var key in this.connections) {
          if (!drawn.has(key)) {
            let nodes = this.getNodesFromString(key);
            let node1 = nodes[0];
            let node2 = nodes[1];
            if (this.connections[key] instanceof Wire) {
                  this.drawConnection(this.circles[node1], this.circles[node2]);
                }
            else if (this.connections[key] instanceof Resistor) {
              this.drawResistor(this.circles[node1], this.circles[node2]);
            }
            else if (this.connections[key] instanceof VoltageSource) {
              this.drawBattery(this.circles[node1], this.circles[node2]);
            }

          }
          //adds the keys that we just drew as well as the reverse so that we
          //do not draw both
          drawn.add(key);
          let reversed = [key.split(",").reverse()].toString();
          drawn.add(reversed);
        }

      this.redrawConnectionNodes();
    }

    drawConnectionNodes(ctx) {
      /*
      * Draws all of the circles (nodes)
      * @param ctx - canvas
      */
      for (let j = 1; j <= this.nodeData.nodeRows; j++){
        for (let i = 1; i<= this.nodeData.nodeCols; i++) {
          this.nodeData.xRows.push(i*100);
          this.nodeData.yRows.push(j*100);
          ctx.beginPath();
          ctx.arc(i*100, j*100, 10, 0, 2 * Math.PI);
          ctx.fill();
      }
    }
  }
    redrawConnectionNodes () {
      /*
      * Redraw the connections after some change was just made
      */
      const ctx3 = this.refs.canvas.getContext('2d');
      ctx3.fillStyle = '#000000'
      for (let j = 1; j <= this.nodeData.nodeRows; j++){
        for (let i = 1; i<= this.nodeData.nodeCols; i++) {
          ctx3.beginPath();
          ctx3.arc(i*100, j*100, 10, 0, 2 * Math.PI);
          ctx3.fill();
      }
    }
  }

    solveCircuit(node1,node2) {
      let circuit = new CircuitMechanics(this.connections, this.batteryConnections, node1);
      let solution = circuit.simulateCircuit();
      let node2Id = node2.id;
      let final_answer = solution["v["+node2Id+"]"];
      this.props.selectedDataCallBack(5,final_answer);

    }

    componentDidMount() {
        this.updateCanvas(this.refs.canvas);

    }
    updateCanvas(canvas) {
        const ctx = canvas.getContext('2d');
        //Draw initial circles
        this.drawConnectionNodes(ctx);
    }

    render() {
        return (
            <canvas onMouseMove = {(e) => this.handleMouseMove(e)} onMouseDown={(e) => this.handleMouseDown(e)} onMouseUp = {(e) => this.handleMouseUp(e)} id = "CircuitGrid" ref="canvas" width={800} height={500}/>
        );
    }
}

export default CanvasComponent;
