# Parameter Actions
A Tableau extension that allows you to update parameter values from worksheet selections.

## How to use an Extension
Download the Parameter Actions [manifest file](https://extensiongallery.tableau.com/products/34). Open Tableau Desktop 2018.2 or higher, drag in the "Extension" object to a dashboard. Click "My Extensions" and find the manifest file (.trex) you downloaded above.

## Using the Extension
1. Select a pre-existing parameter for the extension to manipulate.
2. Choose a field to populate the parameter on selection.
3. Choose which worksheet(s) to listen to for selections.
4. Optional: Choose if you want keep the last selected values after deselection.
5. Optional: Choose if you want to allow multi-select mode and if so, your delimiter.

## Open Source Discrepancy Notice
The source code found in this repository uses the Tableau UI components library. However, due to a bug in the current version of Qt used in Tableau Desktop, html selects do not allow for mouse selection on Mac and instead require the keyboard for selections. Because of this we will be using an alternative div dropdown in the production bundle until we are able to upgrade Qt.