
import React from 'react'
import classes from './Security.module.css'
import { Focusable } from 'react-js-spatial-navigation';


const security = (props) => props.security.map((sec, idx) => {

    let activeLine;

    if (sec.active){
        activeLine = <hr/>;
    }


    return (
        <Focusable className={classes.Item} key={sec.id}
            onClickEnter={(event) => props.enterClicked(event, sec.id)}
            onFocus={(event) => props.focusHandler(event)}>
            <img src={process.env.PUBLIC_URL + '/' + sec.icon + '.svg'} alt='security_icon'/>
            <p>{sec.name}</p>
            {activeLine}
        </Focusable>
    )
})

export default security;