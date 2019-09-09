import React from 'react'
import './App.css'

class Console extends React.Component {
    constructor (props) {
      super(props);
      this.state = {inputValue : "1",
                    outputValue : "",
                    code:null}
      this.numberSet = new Set(["1","2","3","4","5","6","7","8","9","0"])
    }

    handleChange(e) {
      const re = /^[0-9\b]+$/;
      if (e.target.value === '' || re.test(e.target.value )) {
            this.setState({inputValue: e.target.value})
      }
    }

    test(code, component){
      if (code === 3) {
        return "Old Value";
      }
    return "|V| ="
  }
    handleSubmit(e) {
      this.props.parentCallBack(this.state.inputValue);
      if (this.state.code === 3) {
        // console.log("Changed");
        this.setState({outputValue: "Resistance changed to " + this.state.inputValue});
        //set the code back to normal
        this.props.codeUpdate(0);
        this.props.updatedValue(this.state.inputValue);
        this.props.applyClicked();
      }
      if (this.state.code === 4) {
        this.setState({outputValue: "Voltage changed to " + this.state.inputValue});
        this.props.codeUpdate(0);
        this.props.updatedValue(this.state.inputValue);
        this.props.applyClicked();
      }


    }

    handleResistorChange (value) {
      this.setState({outputValue:"Current Resistance = " + value + " | Enter new value to change"});
    }

    handleVoltageSourceChange (value) {
      this.setState({outputValue:"Current Voltage = " + value + " | Enter new value to change"});
    }

    handleNewResistor (value) {
      this.setState({outputValue:"New resistor with resistance " + value + " placed"});
    }

    handleNewVoltageSource (value) {
      this.setState({outputValue:"New voltage source with voltage " + value + " placed"});
    }

    handleNewWire () {
      this.setState({outputValue:"New wire placed"});
    }

    handleSolution (value) {
      let final_value = Math.abs(parseInt(value)).toString()
      this.setState({outputValue:"|V| = " + final_value + "V"});
    }

    componentWillReceiveProps(nextProps) {
      if (this.props !== nextProps) {
        // console.log(nextProps);
        let code = nextProps.selectedCode;
        this.setState({code:code});
        let component = nextProps.selectedComponent;
        // console.log("Component", component);
        if (code === 3){
          // console.log("HEREEE!")
          this.handleResistorChange(component.getValue());
        }

        if (code === 4) {
          this.handleVoltageSourceChange(component.getValue());
        }
        if (code === 1) {
          this.handleNewResistor(component.getValue());
        }

        if (code === 2) {
          this.handleNewVoltageSource(component.getValue());
        }
        if (code === 6) {
          this.handleNewWire();
        }
        if (code === 5) {
          this.handleSolution(component);
        }
      }
    }
    render () {
      // console.log(this.state.outputValue);
      return (
        <div className = "console">
          <label id = "labelInline1"> Input </label>
          <div id = "namer">
            <div id="namer-input">
              <input unselectable = "on" type="text" value = {this.state.inputValue} maxLength={2} onChange = {(e) => this.handleChange(e)}></input>
            </div>
          </div>
          <input className = "submitButton" type="submit" value = {"APPLY"} onClick = {(e) => this.handleSubmit(e)}></input>
          <div id = "namer2">
            <div id="namer-input2">
              <input type="text" disabled="disabled" value = {this.state.outputValue}></input>
            </div>
          </div>
        </div>
    );
  }
}

export default Console;
