import React, { Component } from 'react';
import Loading from './Loading.js';

class QueryResults extends Component {
	render() {
		return (
			<div className='container-fluid mt-5'>
				<div className='row'>
					<div className='content mr-auto ml-auto'>
						{this.props.awaitingBlockchainQueryResponse ? (
							<Loading />
						) : (
							<div>
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
												<td>
													{this.props.matronNumberOfBirthsDuringRange
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
															{// trucate matron genes BigNumber
															this.props.matronGenes
																? this.props.matronGenes ===
																  '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
																	? '0x00'
																	: this.props.matronGenes.slice(0, 6) +
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
						)}
					</div>
				</div>
			</div>
		);
	}
}

export default QueryResults;
