# Script to add operationId fields to the swagger JSON file

For a fulll document, please refer to [How to use AutoRest with EDP](doc/README.MD).

AutoRest supports both swagger JSON and YAML files and the EDP website can provide swagger files in JSON format. However, if you use this JSON file with AutoRest, it will show the following errors.

```
FATAL: OperationId is required for all operations. Please add it for 'get' operation of '/authorize' path.
FATAL: AutoRest.Core.Logging.CodeGenerationException: OperationId is required for all operations. Please add it for 'get' operation of '/authorize' path.
``` 

AutoRest uses operationId to determine the method name for a given API but the swagger files from EDP may not have this field. Refer to the [OpenAPI Specification](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md), the operationId is a field under an operation object. It is a unique string used to identify the operation. The id MUST be unique among all operations described in the API. The operationId can be manually added to the swagger JSON file under the operation object, as shown below.

```
   "paths": {
        "/authorize": {
            "get": {
                "operationId": "GetAuthorize",				
                "description": "Used to authentify inside an application where keeping a \"client secret\" secret is not possible (a web app, for an example). Shove a IPDP cookie in your headers for now.",
                "summary": "Used to get a token for implicit grant.",
...
```
In the above text, the **operationId** of the get operation of the **/authorize** path is **GetAuthorize**. Instead of manually adding the operationId field, we have implemented a simple Node.js script to add the operationId field to the EDP swagger JSON file. To install and use the script, please follow these steps.

1) **Clone the project from GitHub**

The following Git command clones the project repository into a new directory. The Git command can be downloaded from [the Git download website](https://git-scm.com/downloads).

```
git clone https://github.com/TR-API-Samples/Article.EDP.REST.AutoRest
```
Then, change the directory to **Article.EDP.REST.AutoRest**

2) **Build the project**

Node.js is required when building the project. It can be downloaded from [the Node.js website](https://nodejs.org/en/)

After installing Node.js, run the following command to download the script's dependencies which are **command-line-args** and **command-line-usage** libraries.

```
npm install
```

3) **Run the script**

The script accepts the following two parameters.

|Parameter Name|Type|Description|
|--------------|----|-----------|
|--input|String|The input JSON file downloaded from the EDP website|
|--output|String|The output JSON file after adding the operationId field|

Moreover, the script also adds the host and schemes fields.
```
node app.js --input auth_oauth2_beta1.json --output auth_oauth2_mod.json
```

The script will create a modified JSON file. It contains the added **operationId**, **host**, and **schemes** fields. The **operationId** will be generated from the **operation** and **path** field, such as **GetAuthorize**, **PostRevoke**, and **PostToken**.
