[![As-Is](https://img.shields.io/badge/Support%20Level-As--Is-e8762c.svg)](https://www.tableau.com/support-levels-it-and-developer-tools)

# Parameter Actions
With this extension you can simply click on a mark or multiple marks on a worksheet and update a parameter with those values. This allows you to update reference lines, calculations, filters and more with just one click of your mouse.

## Using the Extension from Tableau Exchange (Recommended)
See the Tableau Help topic [Use Dashboard Extensions](https://help.tableau.com/current/pro/desktop/en-us/dashboard_extensions.htm) for directions. When presented with the list of available Dashboard Extensions, search for Parameter Actions to find and install this one.

### Using the Extension
1. Select a pre-existing parameter for the extension to manipulate.
2. Choose a field to populate the parameter on selection.
3. Choose which worksheet(s) to listen to for selections.
4. Optional: Choose if you want keep the last selected values after deselection.
5. Optional: Choose if you want to allow multi-select mode and if so, your delimiter.

## Download the Extension Code to Develop Locally
If you want to use a locally-built version of this extension or if you want to make any of your own changes, follow these steps:

1. Make sure you have [Node.js](https://nodejs.org) and [Yarn](https://yarnpkg.com) installed. 
2. Clone or download and unzip this repository. Open the command line to the `extension-parameter-actions-master` folder and run `yarn` to install the node modules.
3. Edit the `homepage` in the `package.json` file to the server where you are going to host the extension. For example:
```
"homepage": "http://localhost:8080",
```
4. In the command line run `yarn build` to build the extension with the new homepage. _Note, you can update the `package.json` file to just run `react-scripts build`, the rest is just to move the folders around. If you do this, look for the `build` folder in the next step._
5. Copy the files in `docs` to your web server at the path you specified in Step 3.
6. Update the existing or create a new manifest file (.trex) to point to the URL where you are hosting the extension with `/#/paramact` at the end. For example: `http://localhost:8080/#/paramact`. 

## Support
Tableau customers can contact the Tableau Support team for help.

For any local build or code related questions, please post to the [Issues](https://github.com/tableau/extension-parameter-actions/issues) tab here for community support.
