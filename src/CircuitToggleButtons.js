import React from 'react'
import './App.css'

class CircuitToggleButtons extends React.Component {
    constructor (props) {
      super(props);
      console.log("IN CTB");
    }
    //const { value } = this.props
    handleMouseClick() {
     console.log("HI");
    }

    render () {
      return (
       <div id = "CircuitToggleButtons" onClick={(e) => this.handleMouseClick(e)}>
         
       </div>
    );
  }
}

export default CircuitToggleButtons;
