import React, { Component } from 'react';
import Loading from './Loading.js';
import ProgressBar from './ProgressBar.js';

class QueryResults extends Component {
	render() {
		return (
			<div className='container-fluid mt-5'>
				<div className='row'>
					{this.props.awaitingBlockchainQueryResponse ? (
						<div className='container col-sm-12 mr-auto ml-auto'>
							<Loading />
							<br></br>
							{this.props.queryProgress > 0 ? (
								<ProgressBar queryProgress={this.props.queryProgress} />
							) : (
								''
							)}
						</div>
					) : this.props.queryError ? (
						<div className='container col-sm-12 mr-auto ml-auto'>
							<h6 className='text-muted text-danger text-center'>
								Please reduce your query's block range.
							</h6>
						</div>
					) : (
						<div className='content mr-auto ml-auto'>
							<div>
								<h3 className='text-center'>Results:</h3>

								<h4>General Info:</h4>
								<div className='table-responsive'>
									<table className='table'>
										<tbody>
											<tr>
												<th scope='col'>Starting Block</th>
												<th scope='col'>Ending Block</th>
												<th scope='col'>Total # of Births</th>
												<th scope='col'># Births by Max Matron</th>
											</tr>
											<tr>
												<td>{this.props.fromBlock}</td>
												<td>{this.props.toBlock}</td>
												<td>{this.props.numberOfBirthedKitties}</td>
												<td>
													{this.props.numberOfBirthedKitties === 0
														? 'N/A'
														: this.props.matronNumberOfBirthsDuringRange
														? this.props.matronNumberOfBirthsDuringRange
														: 'N/A - max number of births is shared by multiple matrons'}
												</td>
											</tr>
										</tbody>
									</table>
								</div>
								{this.props.matronId ? (
									<div>
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
															{// truncate matron genes BigNumber
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
										</div>
									</div>
								) : (
									''
								)}
							</div>
						</div>
					)}
				</div>
			</div>
		);
	}
}

export default QueryResults;
