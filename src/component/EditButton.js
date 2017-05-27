import EditIcon from 'material-ui/svg-icons/image/edit'
import IconButton from 'material-ui/IconButton'
import React, { Component } from 'react'
import SaveIcon from 'material-ui/svg-icons/content/save'


class EditButton extends Component {
  render() {
    if (this.props.mode === 'edit') {
      return (
        <IconButton className='no-drag' tooltip="保存" tooltipPosition="bottom-left" onClick={this.props.saveHandler}><SaveIcon/></IconButton>
      )
    }
    else if (this.props.mode === 'normal') {
      return (
        <IconButton style={style} tooltip="编辑" tooltipPosition="bottom-left" onClick={this.props.editHandler}><EditIcon/></IconButton>
      )
    }
    else if (this.props.mode === 'lock') {
      return (<div></div>)
    }
  }
}


export default EditButton
