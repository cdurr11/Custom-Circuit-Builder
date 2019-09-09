import CanvasComponent from "./CircuitGrid.js";
import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import CircuitMechanics from './CircuitMechanics.js';
import Console from './Console.js'
{/*import MenuBar from "./MenuBar.js";*/}
{/*import CircuitToggleButtons from './CircuitToggleButtons.js'*/}


class App extends Component {
  constructor(props) {
    super(props)
    this.state = {toggled: {
      wire:false,
      resistor:false,
      battery:false,
      inductor:false,
      selector: false,
      on : false
    },
    consoleData : "1",
    selectedCodeType: null,
    selectedComponent: null,
    updatedValue:null,
    applyClicked: false,
  }
  this.callBackFromConsole = this.callBackFromConsole.bind(this);
  this.callBackSelectedData = this.callBackSelectedData.bind(this);
  this.codeUpdateCallback = this.codeUpdateCallback.bind(this);
  this.consoleUpdatedValueCallBack = this.consoleUpdatedValueCallBack.bind(this);
  this.applyClickedCallBack = this.applyClickedCallBack.bind(this);
  this.appliedCallBack = this.appliedCallBack.bind(this);
  }
  handleClickWire (e) {
    var toggled1 = {wire:true,
    resistor:false,
    battery:false,
    inductor:false,
    selector: false,
    erase: false,
    on: false}
    this.setState({ toggled: toggled1 });

  }
  handleClickBattery () {
    var toggled1 = {wire:false,
    resistor:false,
    battery:true,
    inductor:false,
    selector: false,
    erase: false,
    on: false}
    this.setState({ toggled: toggled1 });
  }
  handleClickSelector () {
    var toggled1 = {wire:false,
    resistor:false,
    battery:false,
    inductor:false,
    selector: true,
    erase: false,
    on: false}
    this.setState({ toggled: toggled1 });
  }

  handleClickResistor () {
    var toggled1 = {wire:false,
    resistor:true,
    battery:false,
    inductor:false,
    selector: false,
    erase: false,
    on: false}
    this.setState({ toggled: toggled1 });
  }

  handleClickInductor () {
    var toggled1 = {wire:false,
    resistor:false,
    battery:false,
    inductor:true,
    selector: false,
    erase: false,
    on: false}
    this.setState({ toggled: toggled1 });
  }

  handleClickErase () {
    var toggled1 = {wire:false,
    resistor:false,
    battery:false,
    inductor:false,
    selector: false,
    erase: true,
    on: false}
    this.setState({toggled: toggled1});
  }

  handleClickOn() {
    var toggled1 = {wire:false,
    resistor:false,
    battery:false,
    inductor:false,
    selector: false,
    erase: false,
    on: true}
    this.setState({toggled: toggled1});
    }


  appliedCallBack() {
    this.setState({applyClicked: false});
  }
  applyClickedCallBack () {
    this.setState({applyClicked: true});
  }
  consoleUpdatedValueCallBack (value) {
    this.setState({updatedValue: value});
  }
  codeUpdateCallback (code) {
    // console.log("updating code!");
    this.setState({selectedCodeType:code});
  }
  callBackFromConsole (dataFromConsole) {
    this.setState({consoleData: dataFromConsole})
    // this.setState(prevState => {return {consoleData: dataFromConsole}});
    // console.log(dataFromConsole);
  }
  callBackSelectedData (codeType, component) {
    // console.log(codeType);
    // console.log(component);
    this.setState({selectedCodeType: codeType});
    this.setState({selectedComponent: component});
  }
  render() {
    // console.log(this.state);
    return (
      <div className = "canvasWrapper">
        <div id = "MenuBar">
          <label className="labl" onClick={this.handleClickWire.bind(this)}>
            <input type="radio" name="radioname" value = "1" />
            <div className = "CircuitToggleButtons">
              <img src = {require("./wire.png")}></img>
            </div>
          </label>
          <label className="labl">
              <input type="radio" name="radioname" value = "2" onClick={this.handleClickBattery.bind(this)}/>
              <div className = "CircuitToggleButtons">
                <img src = {require("./battery.png")}></img>
              </div>
          </label>
          <label className="labl">
            <input type="radio" name="radioname" value = "3" onClick = {this.handleClickResistor.bind(this)}/>
            <div className = "CircuitToggleButtons">
              <img src = {require("./resistor.png")}></img>
            </div>
          </label>
          <label className="labl" onClick={this.handleClickSelector.bind(this)}>
              <input type="radio" name="radioname" value = "4"/>
              <div className = "CircuitToggleButtons">
                <img id = "resize" src = {require("./mouse.png")}></img>
              </div>
          </label>
          <label className="labl">
            <input type="radio" name="radioname" value = "5" onClick = {this.handleClickOn.bind(this)}/>
            <div className = "CircuitToggleButtons">
              <img src = {require("./voltometer.png")}></img>
            </div>
          </label>
          <label className="labl">
              <input type="radio" name="radioname" value = "6" onClick = {this.handleClickErase.bind(this)}/>
              <div className = "CircuitToggleButtons">
                <img src = {require("./eraser.png")}></img>
              </div>
          </label>
        </div>
        <CanvasComponent applied = {this.appliedCallBack} applyClicked = {this.state.applyClicked} updatedValue = {this.state.updatedValue} selectedDataCallBack = {this.callBackSelectedData} consoleData = {this.state.consoleData} toggle = {this.state.toggled}></CanvasComponent>
        <Console applyClicked = {this.applyClickedCallBack} updatedValue = {this.consoleUpdatedValueCallBack} codeUpdate = {this.codeUpdateCallback} selectedCode = {this.state.selectedCodeType} selectedComponent = {this.state.selectedComponent} parentCallBack = {this.callBackFromConsole}></Console>
      </div>
    );
  }
}
export default App;
