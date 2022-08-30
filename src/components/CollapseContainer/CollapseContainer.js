import React from 'react';
import './collapse.scss';

export default function CollapseContainer(props) {
    const [collapsed, setCollapsed] = React.useState(false)
    const [height, setHeight] = React.useState(0)
    const heightRef = React.useRef(null)
    React.useEffect(() => {
        setHeight(heightRef.current.clientHeight)
    }, [heightRef])
    
    return (<div 
        ref={heightRef}
        className={'collapse-container'}
    >
        {...props.children}
    </div>)
}