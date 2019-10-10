import * as React from 'react';

import { Button, Checkbox, TextField } from '@tableau/tableau-ui';
import { Setting } from './Setting';

/* tslint:disable:no-console */

declare global {
    interface Window { tableau: any; }
}

let dashboard: any;

interface State {
    configured: boolean,
    dataType: string,
    delimiter: string,
    field: string,
    field_config: boolean,
    field_enabled: boolean,
    field_list: string[],
    keepOnDeselect: boolean,
    multiselect: boolean,
    param_config: boolean,
    param_enabled: boolean,
    param_list: string[],
    parameter: string,
    worksheets: any[],
    ws_config: boolean,
    ws_enabled: boolean,
    ws_list: string[],
}

const NoOpenInputParameters: string = 'No open input parameters!';

// Container for all configurations
class Configure extends React.Component<any, State> {
    public readonly state: State = {
        configured: false,
        dataType: 'string',
        delimiter: '|',
        field: '',
        field_config: false,
        field_enabled: false,
        field_list: [],
        keepOnDeselect: false,
        multiselect: false,
        param_config: false,
        param_enabled: false,
        param_list: [],
        parameter: '',
        worksheets: [],
        ws_config: false,
        ws_enabled: false,
        ws_list: [],
    };

    // Handles selection in parameter dropdown
    public paramChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        this.setState({ parameter: e.target.value });
    };

    // Handles selection in field dropdown
    public fieldChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        this.setState({ field: e.target.value });
    };

    // Handles change in multiselect checkbox
    public multiChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        this.setState({ multiselect: e.target.checked });
    };

    // Handles change in multiselect checkbox
    public deselectChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        this.setState({ keepOnDeselect: e.target.checked });
    };

    // Handles change in multiselect checkbox
    public delimiterChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        this.setState({ delimiter: e.target.value });
    };

    public handleCheckWrapper = (key: string): ((e: React.ChangeEvent<HTMLInputElement>) => void) => {
        return (e: React.ChangeEvent<HTMLInputElement>) => {
            const worksheets = this.state.worksheets;
            worksheets.find(ws => ws.key === key).included = e.target.checked;
            this.setState({ worksheets });
        };
    }

    // Tests if currently set Worksheet to pull filters from exists
    public testWSSettings() {
        const settings = window.tableau.extensions.settings.getAll();
        if (this.state.configured) {
            const wsSettings = JSON.parse(settings.worksheets);
            const fetchPromises: any[] = [];
            const wsnames: string[] = [];
            const wslist: any[] = [];
            dashboard.worksheets.forEach((worksheet: any) => {
                wsnames.push(worksheet.name);
                fetchPromises.push(worksheet.getSummaryDataAsync());
            });
            Promise.all(fetchPromises).then(dataTables => {
                for (const dt in dataTables) {
                    if (dataTables.hasOwnProperty(dt)) {
                        for (const f of dataTables[dt].columns) {
                            if (f.fieldName === this.state.field) {
                                let i = false;
                                if (wsSettings.find((ws: any) => ws.worksheet === wsnames[dt])) {
                                    i = wsSettings.find((ws: any) => ws.worksheet === wsnames[dt]).included
                                }
                                wslist.push({ key: dt, included: i, worksheet: wsnames[dt] });
                            }
                        }
                    }
                }
                this.setState({
                    worksheets: wslist,
                    ws_enabled: false,
                });
            });

        } else {
            this.populateWS();
        }
    }

    // Populates list of worksheets
    public populateWS() {
        const fetchPromises: any[] = [];
        const wsnames: string[] = [];
        const wslist: any[] = [];
        dashboard.worksheets.forEach((worksheet: any) => {
            wsnames.push(worksheet.name);
            fetchPromises.push(worksheet.getSummaryDataAsync());
        });
        Promise.all(fetchPromises).then(dataTables => {
            for (const dt in dataTables) {
                if (dataTables.hasOwnProperty(dt)) {
                    for (const f of dataTables[dt].columns) {
                        if (f.fieldName === this.state.field) {
                            wslist.push({ key: dt, included: true, worksheet: wsnames[dt] });
                        }
                    }
                }
            }
            this.setState({
                worksheets: wslist,
                ws_enabled: false,
            });
        });
    }

    // Clears which worksheet to use for filters
    public clearWS = (): void => {
        this.setState({
            configured: false,
            field_enabled: false,
            ws_config: false,
            ws_enabled: true,
        });
        this.populateWS();
    }

    // Tests if currently set Field to pull domain from exists
    public testFieldSettings() {
        const settings = window.tableau.extensions.settings.getAll();
        if (this.state.configured) {
            const fieldSetting = settings.field;
            let dataType: string;
            dashboard.findParameterAsync(this.state.parameter).then((param: any) => {
                dataType = param.dataType;
                this.setState({dataType});
            })
                .then(() => {
                    let field = false;
                    const fetchPromises: any[] = [];
                    dashboard.worksheets.forEach((worksheet: any) => {
                        fetchPromises.push(worksheet.getSummaryDataAsync());
                    });
                    Promise.all(fetchPromises).then(dataTables => {
                        for (const dt of dataTables) {
                            for (const f of dt.columns) {
                                if (f.fieldName === fieldSetting && f.dataType === dataType) {
                                    field = true;
                                    break;
                                }
                            }
                            if (field) { break; }
                        }
                        if (field) {
                            this.setState({
                                field: fieldSetting,
                                field_config: true,
                                field_enabled: false,
                            });
                            this.testWSSettings();
                        } else {
                            this.populateFieldList();
                        }
                    });
                });
        } else {
            this.populateFieldList();
        }
    }

    // Gets list of fields
    public populateFieldList() {
        let dataType: string;
        dashboard.findParameterAsync(this.state.parameter).then((param: any) => {
            dataType = param.dataType;
            this.setState({dataType});
        })
            .then(() => {
                const fetchPromises: any[] = [];
                const fields: any[] = [];
                dashboard.worksheets.forEach((worksheet: any) => {
                    fetchPromises.push(worksheet.getSummaryDataAsync());
                });
                Promise.all(fetchPromises).then(dataTables => {
                    for (const dt of dataTables) {
                        for (const f of dt.columns) {
                            if (f.dataType === dataType && f.fieldName !== 'Measure Names' && f.fieldName !== 'Measure Values') {
                                fields.push(f.fieldName);
                            }
                        }
                    }
                    const options: string[] = [];
                    for (const f of fields) {
                        options.push(f);
                    }
                    if (options.length > 0) {
                        this.setState({
                            field: options[0],
                            field_enabled: true,
                            field_list: options,
                        });
                    } else {
                        const field: string = `No ${dataType} fields in dashboard worksheets!`;
                        this.setState({
                            field,
                            field_enabled: false,
                            field_list: [field],
                        });
                    }
                });
            });
    }

    // Sets the field to pull values from for Data-Driven Parameter
    public setField = (): void => {
        if (this.state.field !== '') {
            this.setState({
                field_config: true,
                field_enabled: false,
            });
            this.testWSSettings();
        }
    }

    // Clears the field to pull values from for Data-Driven Parameter
    public clearField = (): void => {
        this.setState({
            configured: false,
            field_config: false,
            field_enabled: true,
            worksheets: [],
            ws_enabled: false,
        });
        this.populateFieldList();
    }

    // Tests if currently set Parameter exists and accepts all values
    public testParamSettings() {
        const settings = window.tableau.extensions.settings.getAll();
        if (this.state.configured) {
            const paramSetting = settings.parameter;
            dashboard.findParameterAsync(paramSetting).then((param: any) => {
                if (param && param.allowableValues.type === 'all') {
                    this.setState({
                        param_config: true,
                        param_enabled: false,
                        parameter: param.name,
                    });
                    this.testFieldSettings();
                } else {
                    this.populateParamList();
                }
            });
        } else {
            this.populateParamList();
        }
    }

    // Gets list of parameters in workbook and populates dropdown
    public populateParamList() {
        dashboard.getParametersAsync().then((params: any) => {
            const options: string[] = [];
            for (const p of params) {
                if (p.allowableValues.type === 'all') {
                    options.push(p.name);
                }
            }

            if (options.length > 0) {
                this.setState({
                    param_enabled: true,
                    param_list: options,
                    parameter: options[0],
                });
            } else {
                this.setState({
                    param_enabled: false,
                    param_list: [NoOpenInputParameters],
                    parameter: NoOpenInputParameters,
                });
            }
        });
    }

    // Sets which tableau parameter to update
    public setParam = (): void => {
        if (this.state.parameter !== '') {
            this.setState({
                param_config: true,
                param_enabled: false,
            });
            this.testFieldSettings();
        }
    }

    // Clear which tableau parameter to update
    public clearParam = (): void => {
        this.setState({
            dataType: 'string',
            field: '',
            field_enabled: false,
            param_config: false,
            param_enabled: true,
        });
        this.populateParamList();
    }

    // Saves settings and closes configure dialog with data source payload
    public submit = (): void => {
        window.tableau.extensions.settings.set('parameter', this.state.parameter);
        window.tableau.extensions.settings.set('delimiter', this.state.delimiter);
        window.tableau.extensions.settings.set('worksheets', JSON.stringify(this.state.worksheets));
        window.tableau.extensions.settings.set('field', this.state.field);
        window.tableau.extensions.settings.set('keepOnDeselect', JSON.stringify(this.state.keepOnDeselect));
        window.tableau.extensions.settings.set('multiselect', JSON.stringify(this.state.multiselect && this.state.dataType === 'string'));
        window.tableau.extensions.settings.set('configured', 'true');
        window.tableau.extensions.settings.saveAsync().then(() => {
            window.tableau.extensions.ui.closeDialog('true');
        });
    }

    // Clears settings and states
    public clearSettings = (): void => {
        this.setState({
            configured: false,
            dataType: 'string',
            field: '',
            field_config: false,
            field_enabled: false,
            field_list: [],
            multiselect: false,
            param_config: false,
            param_enabled: false,
            param_list: [],
            parameter: '',
            worksheets: [],
            ws_config: false,
            ws_enabled: false,
            ws_list: [],
        });
        this.populateParamList();
    }

    // Once we have mounted, we call to initialize
    public componentWillMount() {
        window.tableau.extensions.initializeDialogAsync().then(() => {
            dashboard = window.tableau.extensions.dashboardContent.dashboard;
            const settings = window.tableau.extensions.settings.getAll();
            if (settings.configured === 'true') {
                this.setState({
                    configured: true,
                    delimiter: settings.delimiter,
                    keepOnDeselect: settings.keepOnDeselect === 'true',
                    multiselect: settings.multiselect === 'true',
                })
                this.testParamSettings();
            } else {
                this.populateParamList();
            }
        });
    }

    public render() {
        return (
            <React.Fragment>
                <div className='container'>
                    <div>
                        <div className='header'>
                            Parameter Actions Configuration
                        <div className='tooltip'>
                                <svg xmlns='http://www.w3.org/2000/svg' id='Dialogs_x5F_Info' width='15' height='15' viewBox='0 0 15 15'>
                                    <rect id='Line' x='7' y='6' width='1' height='5' fillRule='evenodd' clipRule='evenodd' fill='#666766' />
                                    <rect id='Dot_2_' x='7' y='4' width='1' height='1' fillRule='evenodd' clipRule='evenodd' fill='#666766' />
                                    <path id='Circle' d='M7.5,1C3.9,1,1,3.9,1,7.5S3.9,14,7.5,14 S14,11.1,14,7.5S11.1,1,7.5,1z M7.5,13C4.5,13,2,10.5,2,7.5C2,4.5,4.5,2,7.5,2S13,4.5,13,7.5C13,10.5,10.5,13,7.5,13z' fillRule='evenodd' clipRule='evenodd' fill='#666766' />
                                </svg>
                                <span className='tooltiptext'>
                                    <p>Update a parameter's value based on worksheet selections.</p>
                                    <b>How to Use</b>
                                    <ol>
                                        <li>Select a pre-existing parameter for the extension to manipulate.</li>
                                        <li>Choose a field to populate the parameter on selection.</li>
                                        <li>Choose which worksheet(s) to listen to for selections.</li>
                                        <li><i>Optional: </i> Choose if you want keep the last selected values after deselection.</li>
                                        <li><i>Optional: </i> Choose if you want to allow multi-select mode and if so, your delimiter.</li>
                                    </ol>
                                </span>
                            </div>
                        </div>
                        <div className='title'>Configure Action</div>
                        <Setting selecting='parameter' onClick={this.setParam} onClear={this.clearParam} config={this.state.param_config} nextConfig={this.state.field_config} selected={this.state.parameter} enabled={this.state.param_enabled} list={this.state.param_list} onChange={this.paramChange} />
                        <Setting selecting='field' onClick={this.setField} onClear={this.clearField} config={this.state.field_config} nextConfig={this.state.ws_config} selected={this.state.field} enabled={this.state.field_enabled} list={this.state.field_list} onChange={this.fieldChange} />
                        <div className='select'>
                            <p>Select worksheets for the select action</p>
                            <div className='scrolly'>
                                {this.state.worksheets.map((option: any) => (
                                    <div className='scrollitem' key={option.key}>
                                        <Checkbox key={option.key} checked={option.included} children={option.worksheet} onChange={this.handleCheckWrapper(option.key)} />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <Checkbox checked={this.state.keepOnDeselect} onChange={this.deselectChange} children='Persist selections on deselect' style={{ marginLeft: '11px', marginTop: '12px', display: 'flex', alignItems: 'center' }} />
                        <Checkbox checked={this.state.multiselect && this.state.dataType === 'string'} onChange={this.multiChange} children='Allow multiple selections (string parameters only)' style={{ marginLeft: '11px', marginTop: '12px', display: 'flex', alignItems: 'center' }} disabled={this.state.dataType !== 'string'}/>
                        <div style={{ display: (this.state.multiselect  && this.state.dataType === 'string') ? 'flex' : 'none', alignItems: 'center', flex: 1, textAlign: 'right', marginLeft: '30px' }}>
                            <span children='Use this character as a separator:' style={{ marginRight: '5px' }} />
                            <TextField kind='line' onChange={this.delimiterChange} className='delimiter-text-field' value={this.state.delimiter} disabled={!this.state.multiselect  && this.state.dataType === 'string'} maxLength={1} style={{ marginBottom: 6, width: 20 }} />
                        </div>
                    </div>
                    <div className='footer'>
                        <div className='btncluster'>
                            <Button kind='outline' onClick={this.clearSettings} style={{ marginRight: 'auto' }}>Clear Settings</Button>
                            <Button kind='filledGreen' onClick={this.submit} disabled={this.state.worksheets.filter(ws => ws.included === true).length === 0} style={{ marginLeft: '12px' }}>OK</Button>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

export default Configure;