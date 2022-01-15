exports.getDeliveryCordinates = async (query) => {

       // converts latitude and longitude to formatted address
       axios
       .get("https://maps.googleapis.com/maps/api/geocode/json", {
       params: {
           address: (query),
           key: 'AIzaSyAQzrdUa8ws7G3WeEWdRBO6QxVjBP10gg8',
       },
       })
       .then(function (response) {
       deliveryAddress = response.data.results[0].geometry.location;
       console.log(generatedAddress)
       })
       .catch(function (error) {
       console.log(error);
       });
}

exports.getPickupCordinates = async (query) => {

    // converts latitude and longitude to formatted address
    axios
    .get("https://maps.googleapis.com/maps/api/geocode/json", {
    params: {
        address: (query),
        key: 'AIzaSyAQzrdUa8ws7G3WeEWdRBO6QxVjBP10gg8',
    },
    })
    .then(function (response) {
    deliveryAddress = response.data.results[0].geometry.location;
    console.log(generatedAddress)
    })
    .catch(function (error) {
    console.log(error);
    });
}