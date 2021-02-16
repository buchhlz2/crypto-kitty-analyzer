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
							<td>{this.props.fromBlock}</td>
							<td>{this.props.toBlock}</td>
							<td>{this.props.numberOfBirthedKitties}</td>
						</tr>
					</tbody>
				</table>
				<button
					className='text-secondary'
					onClick={async () => {
						let fromBlock = 11838307;
						let toBlock = 11845776;
						let birthedKittiesArray = await this.props.queryCryptoKitties(
							this.props.cryptoKittiesContract,
							fromBlock,
							toBlock
						);
						console.log(birthedKittiesArray);

						this.props.queryCryptoKittiesHandler([
							fromBlock,
							toBlock,
							birthedKittiesArray,
						]);
					}}
				>
					Query
				</button>
			</div>
		);
	}
}

export default Main;
