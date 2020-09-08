
import React from 'react'
import classes from './Blinds.module.css'
import { Focusable, FocusableSection } from 'react-js-spatial-navigation';
import Control from '../../Control';

const blinds = (props) => {
    const levels = [75, 50, 25, 10];

    const getMenu = () => {
        if (props.menuVisible){
            return(
                <Control element={"Modal-Menu"}>
                    <div className={classes.BlindsMenu + (props.showAlert ? ' show' : ' hide')} onKeyUp={(event) => props.hideMenu(event, props.item.id, props.room)}>
                        <h1 className={classes.Title}>{props.item.name}</h1>
                        <FocusableSection neighborUp='' neighborDown='' neighborLeft='' neighborRight='' className={classes.BtnWrap} sectionId='blinds-level'>
                            <Focusable className={classes.Btn + ' menu-active'} onClickEnter={() => props.levelClicked(props.item.id, props.room, 100)}>
                                <img className={classes.Icon} src={process.env.PUBLIC_URL + '/blinds_open.svg'} alt='icon'/>
                                <p>Up</p>
                            </Focusable>
                                {levels.map((level, idx) => {
                                    return (
                                        <Focusable className={classes.Level} key={idx} onClickEnter={() => props.levelClicked(props.item.id, props.room, level)}>
                                        <p>{level} %</p>
                                        </Focusable>
                                    )
                                })}
                            <Focusable className={classes.Btn} onClickEnter={() => props.levelClicked(props.item.id, props.room, 0)}>
                                <img className={classes.Icon} src={process.env.PUBLIC_URL + '/blinds_close.svg'} alt='icon'/>
                                <p>Down</p>
                            </Focusable>
                        </FocusableSection>
                    </div>
                </Control>
            )
        }
    }

    const getIcon = (level) => {
        if (level === 0) return 'close';
        if (level < 50) return '25';
        if (level < 75) return '50';
        if (level < 100) return '75';
        if (level === 100) return 'open';
    }

    const getState = (level, moving) => {
        if (moving) return <div className={classes.LdsRing}></div>;
        if (level === 100) return <p>Up</p>;
        if (level === 0) return <p>Down</p>;
        return <p>{level + ' %'}</p>;
    }

    return (
        <Focusable className={classes.Item} onClickEnter={(event) => props.showMenu(event, props.item)} onFocus={(event) => props.focusHandler(event)}>
            <div className={classes.Wrap}>
                <img className={classes.Icon} src={process.env.PUBLIC_URL + '/blinds_' + getIcon(props.item.position) + '.svg'} alt='icon' />
                <p className={classes.Name}>{props.item.name}</p>
                <div className={classes.State}>
                {getState(props.item.position, props.item.moving)}
                </div>
            </div>
            {getMenu()}
        </Focusable>
    )
}

export default blinds;