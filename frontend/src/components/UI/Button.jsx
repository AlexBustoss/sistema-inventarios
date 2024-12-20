import React from 'react';
import PropTypes from 'prop-types';
import '../../styles/global.css';

const Button = ({ children, type = 'button', disabled }) => {
    return (
        <button 
            type={type} 
            className={`button ${disabled ? 'button-disabled' : ''}`}
            disabled={disabled}
        >
            {children}
        </button>
    );
};

Button.propTypes = {
    children: PropTypes.node.isRequired,
    type: PropTypes.oneOf(['button', 'submit']),
    disabled: PropTypes.bool,
};

export default Button;
