import * as React from 'react';
import './home.css';

class Home extends React.Component<any, any> {
	public render() {
		return (
			<React.Fragment>
				<link rel='stylesheet' type='text/css' media='screen' href='home.css' />
				<div className='icontainer'>
					<div className='box'>
						<div className='left'>
							<h1 className='iheader'>Parameter Actions Extension</h1>
							<span className='tagline'>A Tableau extension that allows you to update parameter values from worksheet selections.</span>
						</div>
						<div className='right'>
							<h4 className='big'>What is it?</h4>
							<p>With this extension you can simply click on a mark or multiple marsk on a worksheet and update a parameter with those values.</p>
							<h4 className='big'>Using the Extension</h4>
							<ol>
								<li>Select a pre-existing parameter for the extension to manipulate.</li>
								<li>Choose a field to populate the parameter on selection.</li>
								<li>Choose which worksheet(s) to listen to for selections.</li>
								<li><i>Optional: </i> Choose if you want keep the last selected values after deselection.</li>
								<li><i>Optional: </i> Choose if you want to allow multi-select mode and if so, your delimiter.</li>
							</ol>
							<div className='gh'>
								Get this extension and more in the <a href='https://exchange.tableau.com/'>Tableau Exchange</a>.
								{/* <a href='https://github.com/tableau/extension-parameter-actions'>View on GitHub</a> */}
							</div>
						</div>
					</div>
				</div>
			</React.Fragment>
		);
	}
}

export default Home;