import React, { Component } from 'react';
import Loading from './Loading.js';

class Metadata extends Component {
	render() {
		return (
			<div className='container-fluid mt-5'>
				<div className='row'>
					<div className='content mr-auto ml-auto'>
						<h3 className='text-center'>Metadata:</h3>
						{this.props.loadingMetadata ? (
							<Loading />
						) : (
							<div className='table-responsive'>
								<table className='table'>
									<tbody>
										<tr>
											<th scope='col'>Contract Name</th>
											<th scope='col'>Total Supply</th>
											<th scope='col'>Seconds per Block</th>
											<th scope='col'># Kitties Currently Pregnant</th>
										</tr>
										<tr>
											<td>{this.props.name}</td>
											<td>{this.props.totalSupply}</td>
											<td>{this.props.secondsPerBlock}</td>
											<td>{this.props.totalNumberCurrentlyPregnantKitties}</td>
										</tr>
									</tbody>
								</table>
							</div>
						)}
					</div>
				</div>
			</div>
		);
	}
}

export default Metadata;
