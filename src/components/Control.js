import { useEffect } from "react";
import { createPortal } from "react-dom";

const Control = (props) => {
    const mount = document.getElementById(props.element);
    mount.innerHTML = '';
    const el = document.createElement('div');
    
    useEffect(() => {
        mount.appendChild(el);
    }, [el, mount]);
    return createPortal(props.children, el);
}

export default Control;