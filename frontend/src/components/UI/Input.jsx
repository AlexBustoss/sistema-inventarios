import React from 'react';
import PropTypes from 'prop-types';
import '../../styles/global.css';

const Input = ({ label, error, ...rest }) => {
    return (
        <div className="input-group">
            <label>{label}</label>
            <input className={`input-field ${error ? 'input-error' : ''}`} {...rest} />
            {error && <p className="input-error-message">{error}</p>}
        </div>
    );
};

Input.propTypes = {
    label: PropTypes.string.isRequired,
    error: PropTypes.string,
};

export default Input;
