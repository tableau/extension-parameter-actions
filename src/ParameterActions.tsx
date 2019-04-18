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
                                return ws
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
        for (const ws of dashboard.worksheets) {
            ws.removeEventListener(window.tableau.TableauEventType.MarkSelectionChanged, this.updateParam);
        }

        for (const ws of validws) {
            dashboard.worksheets.find((w: any) => w.name === ws).addEventListener(window.tableau.TableauEventType.MarkSelectionChanged, this.updateParam);
        }
    }

    public updateParam(selection: any) {
        const settings = window.tableau.extensions.settings.getAll();
        selection.getMarksAsync().then((marks: any) => {
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
                        const date = new Date;
                        output = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
                        break;
                    default:
                        output = '0';
                }
            }
            dashboard.findParameterAsync(settings.parameter).then((param: any) => {
                param.changeValueAsync(output);
            });
        })
    }

    // Pops open the configure page
    public configure = (): void => {
        const popupUrl = (window.location.origin.includes('localhost')) ? `${window.location.origin}/#/config` : `${window.location.origin}/extension-parameter-actions/#/config`;
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
                    <svg className='svg-inline--fa fa-cog fa-w-16 fa-2x click' onClick={this.configure} aria-labelledby='svg-inline--fa-title-1' data-prefix='fas' data-icon='cog' role='img' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512' data-fa-i2svg='true'>
                        <path fill='currentColor' d='M444.788 291.1l42.616 24.599c4.867 2.809 7.126 8.618 5.459 13.985-11.07 35.642-29.97 67.842-54.689 94.586a12.016 12.016 0 0 1-14.832 2.254l-42.584-24.595a191.577 191.577 0 0 1-60.759 35.13v49.182a12.01 12.01 0 0 1-9.377 11.718c-34.956 7.85-72.499 8.256-109.219.007-5.49-1.233-9.403-6.096-9.403-11.723v-49.184a191.555 191.555 0 0 1-60.759-35.13l-42.584 24.595a12.016 12.016 0 0 1-14.832-2.254c-24.718-26.744-43.619-58.944-54.689-94.586-1.667-5.366.592-11.175 5.459-13.985L67.212 291.1a193.48 193.48 0 0 1 0-70.199l-42.616-24.599c-4.867-2.809-7.126-8.618-5.459-13.985 11.07-35.642 29.97-67.842 54.689-94.586a12.016 12.016 0 0 1 14.832-2.254l42.584 24.595a191.577 191.577 0 0 1 60.759-35.13V25.759a12.01 12.01 0 0 1 9.377-11.718c34.956-7.85 72.499-8.256 109.219-.007 5.49 1.233 9.403 6.096 9.403 11.723v49.184a191.555 191.555 0 0 1 60.759 35.13l42.584-24.595a12.016 12.016 0 0 1 14.832 2.254c24.718 26.744 43.619 58.944 54.689 94.586 1.667 5.366-.592 11.175-5.459 13.985L444.788 220.9a193.485 193.485 0 0 1 0 70.2zM336 256c0-44.112-35.888-80-80-80s-80 35.888-80 80 35.888 80 80 80 80-35.888 80-80z' />
                    </svg>
                </div>
                <div>
                    <p>{status}</p>
                </div>
            </div>
        );
    }
}

export default ParameterActions;