const axios = require("axios");

const deliveryGeolocationData = async (address, req, res, ) => {
    let deliveryAddress;
    axios.get("https://maps.googleapis.com/maps/api/geocode/json", {
        params: {
            address: address,
            key: 'AIzaSyAQzrdUa8ws7G3WeEWdRBO6QxVjBP10gg8',
        },
        })
        .then(function (response) {
        deliveryAddress = response.data.results[0].geometry.location;
        console.log(deliveryAddress)
        })
};

const pickupGeolocationData = async (address, req, res, ) => {
    let pickupAddress;
    axios.get("https://maps.googleapis.com/maps/api/geocode/json", {
        params: {
            address: address,
            key: 'AIzaSyAQzrdUa8ws7G3WeEWdRBO6QxVjBP10gg8',
        },
        })
        .then(function (response) {
        pickupAddress = response.data.results[0].geometry.location;
        console.log(pickupAddress)
        })
};

module.exports = { deliveryGeolocationData, pickupGeolocationData};
