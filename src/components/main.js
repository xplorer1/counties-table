import React from 'react';
import NProgress from 'nprogress';

class Main extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            countries: []
        }
    }

    fetchTableData = async () => {
        NProgress.inc();

        try {
            let url = "https://restcountries.eu/rest/v2/all";
            let response = await fetch(url);

            let countries = await response.json(); // read response body and parse as JSON

            this.setState({countries: countries});

            NProgress.done();

        } catch (error) {
            window.alert("There has been an error: ", error.message);
            console.log("error: ", error.message);
        }
    };

    render() {
        return (
            <article>
                <div className="table-wrapper">
                <h2 className="w3-display w3-text-black">LIST OF COUNTRIES AND THIER META DATA</h2>

                    <table className="fl-table">
                        <thead>
                            <tr>
                                <th>NAME</th>
                                <th>CAPITAL</th>
                                <th>POPULATION</th>
                                <th>NATIVENAME</th>
                                <th>NATIONAL FLAG</th>
                                <th>DEMONYM</th>
                                <th>REGION</th>
                                <th>SUBREGION</th>
                                <th>CALLING CODE</th>
                                <th>CURRENCY</th>
                                <th>PRIMARY LANGUAGE</th>
                                <th>NUMERIC CODE</th>
                                <th>ALPHA2CODE</th>
                            </tr>
                        </thead>

                        <tbody>

                            {
                                this.state.countries.map((data, idx) => {
                                    return (
                                        <tr key={idx}>
                                            <td>{data.name}</td>
                                            <td>{data.capital}</td>
                                            <td>{data.population}</td>
                                            <td>{data.nativeName}</td>
                                            <td className="iflag"><img src={data.flag} className="iflag w3-border" alt="Alps" /></td>
                                            <td>{data.demonym}</td>
                                            <td>{data.region}</td>
                                            <td>{data.subregion}</td>
                                            <td>{data.callingCodes[0]}</td>
                                            <td>{data.currencies[0] && data.currencies[0].name}</td>
                                            <td>{data.languages[0].name}</td>
                                            <td>{data.numericCode}</td>
                                            <td>{data.alpha3Code}</td>
                                        </tr>
                                    )
                                })
                            }

                        </tbody>

                    </table>
                </div>

            </article>
        );
    }

    componentWillMount() {
        this.fetchTableData();
    }
}

export default Main;
