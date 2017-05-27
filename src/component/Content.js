import React, { Component } from 'react'
import muiThemeable from 'material-ui/styles/muiThemeable';
import {Card, CardText} from 'material-ui/Card'


class Content extends Component {
  render(){
    return (
      <div style={{backgroundColor: this.props.muiTheme.palette.primary1Color}}>
        <Card rounded={false} zDepth={0} style={{background: 'linear-gradient(120deg, rgba(255,255,255,0.2), rgba(255,255,255,0.3))'}}>
          <CardText>
            {this.props.getContent()}
          </CardText>
        </Card>
      </div>
    )
  }
}


export default muiThemeable()(Content);
