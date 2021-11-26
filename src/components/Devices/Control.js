import { useEffect } from "react";
import { createPortal } from "react-dom";

const Control = ({children}) => {

    const mount = document.getElementById("Modal-Menu");
    const el = document.createElement('div');

    useEffect(() => {
        mount.appendChild(el);
    }, [el, mount]);
    return createPortal(children, el);
}

export default Control;