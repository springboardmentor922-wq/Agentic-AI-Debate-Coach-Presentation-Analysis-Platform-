function Panel({ title, children }) {

    return (

        <div className="panel">

            <h2>{title}</h2>

            <br />

            {children}

        </div>

    );

}

export default Panel;