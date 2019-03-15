'use strict';
var fs = require("fs");
const commandLineArgs = require('command-line-args')
const commandLineUsage = require('command-line-usage')

//Mapping HTTP verbs to the prefix of function
var verbMap = {
    "get": "Get",
    "post": "Post",
    "put": "Put",
    "delete": "Delete",
    "options": "Options"
}
//Define host and schemes
var host = "api.refinitiv.com";
var schemes = ["https"];

//input = json input file; output = json output file
const optionDefinitions = [
    { name: 'help', alias: 'h', type: Boolean },
    { name: 'input', alias: 'i', type: String },
    { name: 'output', alias: 'o', type: String }
]
//Usage Help
const sections = [
    {
        header: 'EDP AutoRest JSON Modification',
        content: 'Modify JSON from EDP to support AutoRest'
    },
    {
        header: 'Options',
        optionList: [
            {
                name: 'input',
                typeLabel: '{underline file}',
                description: 'The JSON input file name.'
            },
            {
                name: 'output',
                typeLabel: '{underline file}',
                description: 'The JSON output file name.'
            },
            {
                name: 'help',
                description: 'Print this usage guide.'
            }
        ]
    }
]
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function addHost(jsonObject) {
    jsonObject.host = host;
}
function addSchemes(jsonObject) {
    jsonObject.schemes = schemes;
}
function addOperationId(jsonObject) {

    var jsonPath = jsonObject.paths;



    for (var exKey in jsonPath) {
        
        var url = exKey;
        //Split string with non-alphanumeric characters
        var splitURL = url.split(/[^A-Za-z]/);


        //Create function name from path
        var funcName = "";
        for (var i = 0; i < splitURL.length; i++) {
            if (splitURL[i]) {
                
                funcName = funcName + capitalizeFirstLetter(splitURL[i])
            }
        }
        //If operationId doesn't exist, set operationId with the function name
        for (var verb in verbMap) {
          
            if (jsonPath[exKey][verb]) {
                if (!jsonPath[exKey][verb].operationId)
                    jsonPath[exKey][verb].operationId = verbMap[verb] + funcName;
            }
        }

    }
}



const options = commandLineArgs(optionDefinitions)
const usage = commandLineUsage(sections)



const valid =
    options.help ||
    (
        /* all supplied files should exist and --log-level should be one from the list */
        options.input &&        
        options.output        
    )

console.log('Your options are', valid ? 'valid' : 'invalid')
if (valid) {
    var content = fs.readFileSync(options.input);
    var jsonContent = JSON.parse(content);

    addOperationId(jsonContent);
    addHost(jsonContent);
    addSchemes(jsonContent);

  
    fs.writeFile(options.output, JSON.stringify(jsonContent, null, 2), function (err) {
        if (err) {
            return console.log(err);
        }

        console.log("The file was saved!");
    });


} else {
    console.log(usage)
}

console.log('Press any key to exit');

process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.on('data', process.exit.bind(process, 0));
//console.log("\n *START* \n");
//var content = fs.readFileSync("alerts_v1.json");

