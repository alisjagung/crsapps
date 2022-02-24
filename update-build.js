const fs = require('fs');
const moment = require('moment');
require('moment-timezone');

const filePath = './package.json';
const pkgJsonFile = JSON.parse(fs.readFileSync(filePath).toString());

pkgJsonFile.buildDate = moment().tz('Asia/Jakarta').format();

fs.writeFileSync(filePath, JSON.stringify(pkgJsonFile, null, 2));

const jsonData = { buildDate : pkgJsonFile.buildDate, };
const jsonString = JSON.stringify(jsonData);

fs.writeFile('./meta.json', jsonString, 'utf8', function(error) 
{
    if(error)
    {
        console.log("An Error Occured while Saving Build DateTime to meta.json");
        return console.log(error);
    }
    else
    {
        console.log("Latest Build DateTime Updated in meta.json");
    }
});
