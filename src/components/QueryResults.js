import React, { Component } from 'react';

class QueryResults extends Component {
	render() {
		return (
			<div className='container-fluid mt-5'>
				<div className='row'>
					<div className='content mr-auto ml-auto'>
						<h3 className='text-center'>Results:</h3>

						<h4>Basic Information:</h4>
						<div className='table-responsive'>
							<table className='table'>
								<tbody>
									<tr>
										<th scope='col'>Start Block</th>
										<th scope='col'>End Block</th>
										<th scope='col'>Total # of Births</th>
										<th scope='col'># Births by Max Matron</th>
									</tr>
									<tr>
										<td>{this.props.fromBlock}</td>
										<td>{this.props.toBlock}</td>
										<td>{this.props.numberOfBirthedKitties}</td>
										<td>{this.props.matronNumberOfBirthsDuringRange}</td>
									</tr>
								</tbody>
							</table>
						</div>
						<h4>Matron with Max Births:</h4>
						<div className='table-responsive'>
							<table className='table'>
								<tbody>
									<tr>
										<th scope='col'>ID</th>
										<th scope='col'>Genes</th>
										<th scope='col'>Generation</th>
										<th scope='col'>Birth Timestamp</th>
									</tr>
									<tr>
										<td>{this.props.matronId}</td>
										<td id='matron-genes'>
											{// trucate matron genes BigNumber
											this.props.matronGenes
												? this.props.matronGenes.slice(0, 6) +
												  '...' +
												  this.props.matronGenes.slice(
														this.props.matronGenes.length - 4,
														this.props.matronGenes.length
												  )
												: ''}
										</td>
										<td>{this.props.matronGeneration}</td>
										<td>{this.props.matronBirthTimestamp}</td>
									</tr>
								</tbody>
							</table>
							<span
								className='d-inline-block'
								tabIndex='0'
								data-bs-toggle='tooltip'
								title='Disabled tooltip'
							></span>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default QueryResults;
