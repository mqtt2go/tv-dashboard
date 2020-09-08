import React from 'react';
import classes from './Socket.module.css';
import { Focusable } from 'react-js-spatial-navigation';

const socket = (props) => {

    const getVariable = (item, label, integer = true) => {
        if (item !== undefined){
            return(
                <div>
                    <p className={classes.Value}>{integer ? Math.round(item) : (item).toFixed(3)}</p>
                    <p className={classes.VarName}>{label}</p>
                </div>
            )
        }
    }

    return(
        <Focusable
            className={classes.Item}
            key={props.item.id}
            onFocus={(event) => props.focusHandler(event)}
            onClickEnter={(event) => props.stateClicked(event, props.item.id, props.room, props.item)}>
            <div className={classes.Wrap}>
            <img className={classes.Icon}
                    src={process.env.PUBLIC_URL + '/' + (props.item.type === 'light' ? 'bulb' : 'switch') + (props.item.state.toLowerCase() === 'off' ? '_off.svg' : '.svg')}
                    alt='icon' />
            <div className={classes.MidWrap}>
                <div className={classes.NameWrap}>
                    <p className={classes.Name}>{props.item.name}</p>
                    <p className={classes.Technology}>{props.item.technology}</p>
                </div>
                <div className={classes.Values}>
                    {getVariable(props.item.voltage, 'Voltage (V)')}
                    {getVariable(props.item.current, 'Current (A)', false)}
                    {getVariable(props.item.consumption, 'Power (W)')}
                    {getVariable(props.item.temperature, 'Temperature (C)')}
                </div>
            </div>
            <div className={classes.State}>
                <p>{props.item.state  === 'on' ? 'On' : 'Off'}</p>
            </div>
            </div>
        </Focusable>
    )
}
export default socket;
