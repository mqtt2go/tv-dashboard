import React from 'react'
import classes from './Security.module.css'
import { Focusable, FocusableSection } from 'react-js-spatial-navigation';
import Control from '../Control';


const alert = (props) => {

    const classes_arr = [classes.Item];

    const getMenu = () => {
        if (props.menuVisible){
            return(
                <Control element={"Modal-Menu"}>
                    <FocusableSection sectionId='alert-menu'
                                    neighborUp=''
                                    neighborDown=''
                                    neighborLeft=''
                                    neighborRight=''
                                    className={classes.AlertMenu + (props.showAlert ? ' show' : ' hide')}>
                        <h1 className={classes.Title}>Security Report</h1>
                        <Focusable className={classes.AlertPanel + ' menu-active'} onKeyDown={(event) => props.hideMenu(event)}>
                            {
                                props.alerts.map((alert, idx) => {
                                    return(
                                        <div className={classes.AlertRow} key={idx}>
                                            <img src={process.env.PUBLIC_URL + '/' + (alert.status === 'ok' ? 'all_ok.svg' : 'error.svg')} alt='alert icon'/>
                                            <p>{alert.message}</p>
                                        </div>
                                    )
                                })
                            }
                    </Focusable>
                    </FocusableSection>
                </Control>
            )
        }
    }

    const getIcon = () => {
        let icon = 'all_ok';
        props.alerts.forEach(alert => {
            if (alert.status !== 'ok'){
                icon = 'error_w';
                classes_arr.push(classes.Alert);
            }
        });
        return icon;
    }

    const getText = () => {
        let text = 'All OK';
        props.alerts.forEach(alert => {
            if (alert.status !== 'ok'){
                text = 'System Alert';
            }
        });
        return text;
    }

    const icon = getIcon();
    
    return (
        <Focusable className={classes_arr.join(' ')} onFocus={(event) => props.focusHandler(event)} onClickEnter={(event) => props.showMenu(event, 'alert')}>
            <img src={process.env.PUBLIC_URL + '/' + icon + '.svg'} alt='security_icon'/>
            <p>{getText()}</p>
            {getMenu()}
        </Focusable>
    )
}

export default alert;