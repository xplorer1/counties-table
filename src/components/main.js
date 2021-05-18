import React from 'react';
import NProgress from 'nprogress';
import store from "store";

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
            store.set("countries", countries);

            NProgress.done();

        } catch (error) {
            window.alert("There has been an error: ", error.message);
            console.log("error: ", error.message);
        }
    };

    searchCountryData = (e) => {

        let searchquery = e.target.value.toLowerCase();

        if(searchquery) {
            let newlist = store.get("countries").filter((el) => {
                return el.name.toLowerCase().includes(searchquery) || el.capital.toLowerCase().includes(searchquery) || 
                    el.demonym.toLowerCase().includes(searchquery) || el.subregion.toLowerCase().includes(searchquery); 
                    el.region.toLowerCase().includes(searchquery);
            })

            this.setState({countries: newlist});

        } else {
            this.setState({countries: store.get("countries")});
        }
    };

    render() {
        return (
            <article>
                <div className="table-wrapper">
                    <h2 className="w3-display w3-text-black">LIST OF COUNTRIES AND THIER META DATA</h2>

                    <div className="w3-half">
                        <label className="w3-text-black w3-margin">Seach the table below</label>
                        <input onChange={this.searchCountryData} className="w3-input w3-border w3-margin-left w3-margin-top w3-margin-bottom" type="search" placeholder="Search by country name, capital, native name, demonym, region, subregion..." />
                    </div>

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
