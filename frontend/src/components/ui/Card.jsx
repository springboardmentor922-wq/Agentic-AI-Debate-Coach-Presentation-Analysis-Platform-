const Card = ({

    title,

    children

}) => {

    return (

        <div className="card">

            {title && (

                <h3
                    style={{
                        marginBottom: "20px"
                    }}
                >

                    {title}

                </h3>

            )}

            {children}

        </div>

    );

};

export default Card;