import React from 'react';
import { Focusable } from 'react-js-spatial-navigation';
import './Tabs.css';

const tabs = (props) => {
    return(
        props.homes.map((home, idx) => {
            return(
              <Focusable className={props.homeId === idx ? "Tab Active" : "Tab"} key={idx}
                         onClickEnter={() => props.homeHandler(idx)} onFocus={(event) => props.focusHandler(event)} onKeyUp={(event) => props.hideMenu(event)}>
                <p>{home.name}</p>
              </Focusable>
            )
          })
    )
}

export default tabs;