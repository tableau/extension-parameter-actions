# Parameter Actions
With this extension you can simply click on a mark or multiple marks on a worksheet and update a parameter with those values. This allows you to update reference lines, calculations, filters and more with just one click of your mouse.

## How to use an Extension
Download the Parameter Actions [manifest file](https://extensiongallery.tableau.com/products/34). Open Tableau Desktop 2018.2 or higher, drag in the "Extension" object to a dashboard. Click "My Extensions" and find the manifest file (.trex) you downloaded above.

## Using the Extension
1. Select a pre-existing parameter for the extension to manipulate.
2. Choose a field to populate the parameter on selection.
3. Choose which worksheet(s) to listen to for selections.
4. Optional: Choose if you want keep the last selected values after deselection.
5. Optional: Choose if you want to allow multi-select mode and if so, your delimiter.

## How to install for local use
Make sure you have [Node.js](https://nodejs.org) and [Yarn](https://yarnpkg.com) installed. 
Clone or download and unzip this repository. Open the command line to the `extension-parameter-actions-master` folder and run:

`yarn` to install

`yarn start` to run

`yarn build` to build

## Support
If you have questions about the extension or found a bug please open a new [issue](https://github.com/tableau/extension-parameter-actions/issues).
