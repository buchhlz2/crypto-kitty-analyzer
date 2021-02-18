import React, { Component } from 'react';

class QueryResults extends Component {
	render() {
		return (
			<div className='container-fluid mt-5'>
				<div className='row'>
					<div className='content mr-auto ml-auto'>
						<h3 className='text-center'>Results:</h3>
						<div className='table-responsive'>
							<table className='table'>
								<tbody>
									<tr>
										<th scope='col'>Start Block</th>
										<th scope='col'>End Block</th>
										<th scope='col'>Total Number of Births</th>
										<th scope='col'>Matron ID</th>
									</tr>
									<tr>
										<td>{this.props.fromBlock}</td>
										<td>{this.props.toBlock}</td>
										<td>{this.props.numberOfBirthedKitties}</td>
										<td>{this.props.matronWithMaxBirths}</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default QueryResults;
