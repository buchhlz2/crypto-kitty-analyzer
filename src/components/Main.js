import React, { Component } from 'react';

class Main extends Component {
	render() {
		return (
			<div className='container-fluid mt-5'>
				<h3 className='text-center'>Metadata:</h3>
				<table>
					<tbody>
						<tr>
							<th>Contract Name</th>
							<th>Total Supply</th>
						</tr>
						<tr>
							<td>{this.props.name}</td>
							<td>{this.props.totalSupply}</td>
						</tr>
					</tbody>
				</table>
				<h3 className='text-center'>Query Data:</h3>
				<table>
					<tbody>
						<tr>
							<th>Start Block</th>
							<th>End Block</th>
							<th>Number of Kitties</th>
						</tr>
						<tr>
							<td>{this.props.startingBlock}</td>
							<td>{this.props.endingBlock}</td>
							<td>{this.props.numberOfBirthedKitties}</td>
						</tr>
					</tbody>
				</table>
			</div>
		);
	}
}

export default Main;
