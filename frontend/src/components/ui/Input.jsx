const Input = ({

    label,

    type = "text",

    name,

    value,

    onChange,

    placeholder,

    required = false

}) => {

    return (

        <div
            style={{
                marginBottom: "18px"
            }}
        >

            <label
                style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "600"
                }}
            >

                {label}

            </label>

            <input

                type={type}

                name={name}

                value={value}

                onChange={onChange}

                placeholder={placeholder}

                required={required}

            />

        </div>

    );

};

export default Input;