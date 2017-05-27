import React, { Component } from 'react'

import { white } from 'material-ui/styles/colors'
import AppBar from 'material-ui/AppBar'
import TextField from 'material-ui/TextField'

import EditButton  from './EditButton'
import PinButton   from './PinButton'


class TitleBar extends Component {
  render(){
    return(
      <AppBar title={this.props.getTitle()}
              showMenuIconButton={true}
              className='drag no-select'
              titleStyle={{fontSize:'20px'}}
              iconElementRight={<EditButton mode={this.props.mode} editHandler={this.props.editHandler} saveHandler={this.props.saveHandler}/>}
              iconElementLeft={<PinButton pinned={this.props.pinned} pinHandler={this.props.pinHandler}/>}
              iconStyleLeft={{marginRight: '0px'}}
              zDepth={0}
        />
    )
  }
}

export default TitleBar
