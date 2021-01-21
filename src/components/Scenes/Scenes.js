
import React from 'react';
import classes from './Scenes.module.css'
import { Focusable } from 'react-js-spatial-navigation'


const scenes = (props) => props.scenes.map((scene, idx) => {

    let activeLine;

    if (scene.active){
        activeLine = <hr/>;
    }
    
    return(<Focusable className={classes.Item} key={scene.id}
                onKeyUp={(event) => props.sendBack(event)}
                onClickEnter={(event) => props.enterClicked(event, scene.id)}
                onFocus={(event) => props.focusHandler(event)}>
                <img src={process.env.PUBLIC_URL + '/' + scene.icon + '.svg'} alt='scene_icon'/>
                <p>{scene.name}</p>
                {activeLine}
            </Focusable>)
})


export default scenes;