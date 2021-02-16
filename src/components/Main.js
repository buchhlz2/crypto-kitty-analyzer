import React, { Component } from 'react';
import QueryForm from './QueryForm.js';
import QueryResults from './QueryResults.js';
class Main extends Component {
	render() {
		return (
			<div className='container-fluid mt-5'>
				<div className='row'>
					<main
						role='main'
						className='col-lg-12 ml-auto mr-auto'
						style={{ maxWidth: '500px' }}
					>
						<div className='row'>
							<div className='content mr-auto ml-auto'>
								<h3 className='text-center'>Metadata:</h3>
								<table>
									<tbody>
										<tr>
											<th>Contract Name</th>
											<th>Total Supply</th>
										</tr>
										<tr>
											<td>{this.props.name}</td>
											<td>
												{this.props.totalSupply}
											</td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>
						<QueryForm
							cryptoKittiesContract={this.props.cryptoKittiesContract}
							queryCryptoKitties={this.props.queryCryptoKitties}
							queryCryptoKittiesStateHandler={
								this.props.queryCryptoKittiesStateHandler
							}
						/>
						<QueryResults
							fromBlock={this.props.fromBlock}
							toBlock={this.props.toBlock}
							numberOfBirthedKitties={this.props.numberOfBirthedKitties}
						/>
					</main>
				</div>
			</div>
		);
	}
}

export default Main;
