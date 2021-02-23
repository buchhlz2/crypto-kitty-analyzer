import React, { Component } from 'react';
import Metadata from './Metadata.js';
import QueryForm from './QueryForm.js';
import QueryResults from './QueryResults.js';

class Main extends Component {
	render() {
		return (
			<div className='container-fluid mt-5'>
				<div className='row'>
					<main role='main' className='col-lg-12 ml-auto mr-auto' style={{ maxWidth: '500px' }}>
						<Metadata
							name={this.props.name}
							totalSupply={this.props.totalSupply}
							secondsPerBlock={this.props.secondsPerBlock}
							totalNumberCurrentlyPregnantKitties={this.props.totalNumberCurrentlyPregnantKitties}
							loadingMetadata={this.props.loadingMetadata}
						/>
						<QueryForm blockQueryRangeStateHandler={this.props.blockQueryRangeStateHandler} />
						{this.props.queryHasBeenFired ? (
							<QueryResults
								fromBlock={this.props.fromBlock}
								toBlock={this.props.toBlock}
								numberOfBirthedKitties={this.props.numberOfBirthedKitties}
								matronId={this.props.matronId}
								matronNumberOfBirthsDuringRange={this.props.matronNumberOfBirthsDuringRange}
								matronGenes={this.props.matronGenes}
								matronGeneration={this.props.matronGeneration}
								matronBirthTimestamp={this.props.matronBirthTimestamp}
								awaitingBlockchainQueryResponse={this.props.awaitingBlockchainQueryResponse}
								queryProgress={this.props.queryProgress}
							/>
						) : (
							''
						)}
					</main>
				</div>
			</div>
		);
	}
}

export default Main;
