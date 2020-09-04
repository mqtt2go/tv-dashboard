
import React from 'react';
import classes from './Cameras.module.css'
import { Focusable } from 'react-js-spatial-navigation'

const cameras = (props) => props.rooms.map((room) => {

    const getEnvironmet = () => room.devices.map((env, idx) => {
        let temp, hum;
        if (env.temperature !== undefined){
            temp = <div className={classes.Environment}>
                        <img src={process.env.PUBLIC_URL + '/temperature.svg'} alt='temp'/>
                        <p>{env.temperature}°</p>
                    </div>
        }
        if (env.humidity !== undefined){
            hum = <div className={classes.Environment}>
                        <img src={process.env.PUBLIC_URL + '/humidity.svg'} alt='humidity'/>
                        <p>{env.humidity}%</p>
                  </div>
        }
        return (
            <div className={classes.EnvWrap} key={idx}>
                {temp}
                {hum}
            </div>
        )
    })

    const evironment = getEnvironmet();

    return(
        <div className={classes.Wrap} key={room.id}>
            {
                room.devices.map((camera) => {

                    if (camera.type !== 'camera'){
                        return null;
                    }

                    const content = <div className={classes.ContWrap}>
                                        <img className={classes.Background} src={process.env.PUBLIC_URL + '/' + camera.image} alt='camera_icon'/>
                                        <div className={classes.Shadow}>
                                            <p className={classes.Name}>{camera.name}</p>
                                            {evironment}
                                        </div>
                                        <div className={classes.Movement}>
                                            <img className={classes.Background} src={process.env.PUBLIC_URL + '/dots.svg'} alt='dots'/>
                                            <p>{camera.message}</p>
                                        </div>
                                    </div>;

                
                    if(!props.focusable){
                        return(
                            <Focusable className={classes.Item} key={camera.id}>
                                {content}
                            </Focusable>
                        )
                    } else {
                        return(
                            <div className={classes.Item} key={camera.id}>
                                {content}
                            </div>
                        )
                    }

                })
            }
        </div>
    )
})

export default cameras;