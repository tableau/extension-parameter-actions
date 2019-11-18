import * as React from 'react';
import './style.css';

/* tslint:disable:no-console */

declare global {
    interface Window { tableau: any; }
}

let dashboard: any;
let dataType: string;

interface State {
    configured: boolean,
    valid: boolean,
    mode: string,
}

// Switches base URL based on where extension is being hosted
const baseURL: string = window.location.origin.includes('localhost:3000') ? window.location.origin : '.';

class ParameterActions extends React.Component<any, State> {
    public readonly state: State = {
        configured: false,
        mode: 'authoring',
        valid: false,
    };

    public validate(settings: any) {
        const validws: any[] = [];
        const pset = settings.parameter;
        if (pset) {
            dashboard.findParameterAsync(settings.parameter).then((param: any) => {
                if (param && param.allowableValues.type === 'all') {
                    dataType = param.dataType;
                    const wsset = JSON.parse(settings.worksheets);
                    const fetchPromises: any[] = [];
                    const wsnames: any[] = [];
                    if (wsset) {
                        dashboard.worksheets.filter((ws: any) => {
                            if (wsset.find((l: any) => l.worksheet === ws.name && l.included)) {
                                return true;
                            } else {
                                return false;
                            }
                        }).forEach((worksheet: any) => {
                            if (worksheet) {
                                wsnames.push(worksheet.name);
                                fetchPromises.push(worksheet.getSummaryDataAsync());
                            }
                        });
                        Promise.all(fetchPromises).then(dataTables => {
                            for (const dt in dataTables) {
                                if (dataTables.hasOwnProperty(dt)) {
                                    for (const f of dataTables[dt].columns) {
                                        if (f.fieldName === settings.field && f.dataType === dataType) {
                                            validws.push(wsnames[dt]);
                                        }
                                    }
                                }
                            }
                            if (validws.length > 0) {
                                this.setState({ valid: true });
                                this.listen(validws);
                            }
                        });
                    }
                }
            });
        }
    }

    public listen(validws: any) {
        for (const worksheet of dashboard.worksheets) {
            worksheet.removeEventListener(window.tableau.TableauEventType.MarkSelectionChanged, this.getMarks);
        }

        for (const wsname of validws) {
            const worksheet = dashboard.worksheets.find((w: any) => w.name === wsname);
            // Load any current selections into parameter, this ensure selections still work if selection causes reload.
            worksheet.getSelectedMarksAsync().then((marks: any) => {
                this.updateParam(marks)
            });

            worksheet.addEventListener(window.tableau.TableauEventType.MarkSelectionChanged, this.getMarks);
        }
    }

    // public getMarks(selection: any) {
    public getMarks = (selection: any): void => {
        selection.getMarksAsync().then((marks: any) => {
            this.updateParam(marks)
        })
    }

    public updateParam(marks: any) {
        const settings = window.tableau.extensions.settings.getAll();
        let index: number = 0;
        let data: any[] = [];
        let output: string = '';
        for (const c of marks.data[0].columns) {
            if (c.fieldName === settings.field) {
                index = c.index;
            }
        }
        for (const d of marks.data[0].data) {
            data.push(d[index].value);
        }
        data = Array.from(new Set(data));
        if (settings.multiselect === 'true' && dataType === 'string') {
            output = data.join(settings.delimiter)
        } else {
            output = data[0];
        }
        if (settings.keepOnDeselect === 'true' && !output) {
            return;
        }
        if (settings.keepOnDeselect === 'false' && marks.data[0].data.length === 0) {
            switch (dataType) {
                case 'float':
                case 'int':
                    output = '0'
                    break;
                case 'string':
                    output = '';
                    break;
                case 'date':
                case 'date-time':
                    const date = new Date();
                    output = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
                    break;
                default:
                    output = '0';
            }
        }
        dashboard.findParameterAsync(settings.parameter).then((param: any) => {
            param.changeValueAsync(output);
        });
    }

    // Pops open the configure page
    public configure = (): void => {
        const popupUrl = `${baseURL}/config.html`;
        const payload = '';
        window.tableau.extensions.ui.displayDialogAsync(popupUrl, payload, { height: 420, width: 420 }).then(() => {
            const settings = window.tableau.extensions.settings.getAll();
            this.setState({ configured: true })
            this.validate(settings);
        }).catch((error: any) => {
            switch (error.errorCode) {
                case window.tableau.ErrorCodes.DialogClosedByUser:
                    const settings = window.tableau.extensions.settings.getAll();
                    if (settings.configured === 'true') {
                        this.setState({ configured: true })
                        this.validate(settings);
                    }
                    console.log('Dialog was closed by user.');
                    break;
                default:
                    console.error(error.message);
            }
        });
    }

    // Once we have mounted, we call to initialize
    public componentWillMount() {
        window.tableau.extensions.initializeAsync({ configure: this.configure }).then(() => {
            dashboard = window.tableau.extensions.dashboardContent.dashboard;
            this.setState({
                mode: window.tableau.extensions.environment.mode,
            });
            console.log(window.tableau.extensions.environment.mode);
            const settings = window.tableau.extensions.settings.getAll();
            if (settings.configured !== 'true') {
                this.configure();
            } else {
                this.setState({ configured: true })
                this.validate(settings);
            }
        });
    }

    public render() {
        let status = 'Looking for extension configuration.';
        let cogColor = 'rgba(0, 0, 0, 0.8)';
        if (this.state.configured && this.state.valid) {
            status = 'Extension is configured and valid. This cog will disappear in viewing mode.';
            cogColor = 'rgba(0, 0, 0, 0.8)';
        } else if (this.state.configured) {
            status = 'Extension is configured but not valid.';
            cogColor = '#C93A47';
        } else {
            status = 'Extension requires configuring';
            cogColor = '#C93A47';
        }
        return (
            <div className={'cog ' + this.state.mode}>
                <div style={{ color: cogColor }} title='This cog will not show in viewer mode.'>
                    <svg className="click" onClick={this.configure} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M24 13.616v-3.232c-1.651-.587-2.694-.752-3.219-2.019v-.001c-.527-1.271.1-2.134.847-3.707l-2.285-2.285c-1.561.742-2.433 1.375-3.707.847h-.001c-1.269-.526-1.435-1.576-2.019-3.219h-3.232c-.582 1.635-.749 2.692-2.019 3.219h-.001c-1.271.528-2.132-.098-3.707-.847l-2.285 2.285c.745 1.568 1.375 2.434.847 3.707-.527 1.271-1.584 1.438-3.219 2.02v3.232c1.632.58 2.692.749 3.219 2.019.53 1.282-.114 2.166-.847 3.707l2.285 2.286c1.562-.743 2.434-1.375 3.707-.847h.001c1.27.526 1.436 1.579 2.019 3.219h3.232c.582-1.636.75-2.69 2.027-3.222h.001c1.262-.524 2.12.101 3.698.851l2.285-2.286c-.744-1.563-1.375-2.433-.848-3.706.527-1.271 1.588-1.44 3.221-2.021zm-12 2.384c-2.209 0-4-1.791-4-4s1.791-4 4-4 4 1.791 4 4-1.791 4-4 4z" /></svg>
                </div>
                <div>
                    <p>{status}</p>
                </div>
            </div>
        );
    }
}

export default ParameterActions;
