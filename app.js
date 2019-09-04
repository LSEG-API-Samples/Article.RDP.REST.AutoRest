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
    console.log("Set host to " + host);
    jsonObject.host = host;
}
function addSchemes(jsonObject) {
    console.log("Set schemes to " + schemes);
    jsonObject.schemes = schemes;
}
function handleObjectType(jsonObject) {
  
    var properties = jsonObject.properties;

    for (var property in properties) {
        if (typeof jsonObject.properties[property].type == "object") {
            jsonObject.properties[property].type = "string";
        }
        switch (jsonObject.properties[property].type) {
            case "object":
                handleObjectType(jsonObject.properties[property]);
                break;
            case "array":
                handleArrayType(jsonObject.properties[property]);
                break;
            default:
        }
    }
}
function handleArrayType(jsonObject) {           
    if (typeof jsonObject.items.type == "object") {   
        jsonObject.items.type= "string";
    }
    switch (jsonObject.items.type) {
        case "object":
            handleObjectType(jsonObject.items);
            break;
        case "array":
            handleArrayType(jsonObject.items);
            break;
        default:
    }    
}
function changeTypeArrayToString(jsonObject) {
    var definitions = jsonObject.definitions;
    for (var definition in definitions) {       
        var type = jsonObject.definitions[definition].type;        
        switch (type) {
            case "object":
                handleObjectType(jsonObject.definitions[definition]);
                break;
            case "array":
                handleArrayType(jsonObject.definitions[definition]);
                break;
            default:

        }
    }
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
                if (!jsonPath[exKey][verb].operationId) {
                    console.log("Set operationId: " + verbMap[verb] + funcName + " for " + verb + " of "+exKey);
                    jsonPath[exKey][verb].operationId = verbMap[verb] + funcName;
                }
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


if (valid) {
    var content = fs.readFileSync(options.input);
    var jsonContent = JSON.parse(content);

    addOperationId(jsonContent);
    addHost(jsonContent);
    addSchemes(jsonContent);
    changeTypeArrayToString(jsonContent);
  
    fs.writeFile(options.output, JSON.stringify(jsonContent, null, 2), function (err) {
        if (err) {
            return console.log(err);
        }

        console.log("The file was saved!");
    });


} else {
    console.log(usage)
}




