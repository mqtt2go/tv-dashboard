
import React from 'react';
import classes from './Switch.module.css'
import { Focusable } from 'react-js-spatial-navigation';

const swtch = (props) => {

    return(
        <Focusable
            className={classes.Item}
            key={props.item.id}
            onKeyUp={(event) => props.backHandler(event)}
            onClickEnter={(event) => props.stateClicked(event, props.item.id, props.room, props.item)}
            onFocus={(event) => props.focusHandler(event)}>
            <div className={classes.Wrap}>
                <img className={classes.Icon}
                    src={process.env.PUBLIC_URL + '/' + (props.item.type === 'light' ? 'bulb' : 'switch') + (props.item.state.toLowerCase() === 'off' ? '_off.svg' : '.svg')}
                    alt='icon' />
                <p className={classes.Name}>{props.item.name}</p>
                <p className={classes.Technology}>{props.item.technology}</p>
                <div className={classes.State}>
                    <p>{props.item.state  === 'on' ? 'On' : 'Off'}</p>
                </div>
            </div>
        </Focusable>
    )
}

export default swtch;