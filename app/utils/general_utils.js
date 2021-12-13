let fs = require('fs');

module.exports = {
    readHtmlFile: async function(path, callback) {
        
        fs.readFile(path, {encoding: 'utf-8'}, function (err, html) {
            console.log('dir', __dirname)
            if (err) {
                //callback(err, null);
                return console.log(err)
            }
            else {
                // console.log(html)
                //callback(null, html);
                return html;
            }
        });
    },
}