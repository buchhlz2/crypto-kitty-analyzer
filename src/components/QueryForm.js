import React, { Component } from 'react';

class QueryForm extends Component {
	render() {
		return (
			<div className='container-fluid mt-5'>
				<div className='row'>
					<div className='content mr-auto ml-auto'>
						<h3 className='text-center'>Query Form:</h3>
						<form
							onSubmit={async (event) => {
								event.preventDefault();
								const fromBlock = this.fromBlock.value;
								const toBlock = this.toBlock.value;
								let birthedKittiesArray = await this.props.queryCryptoKitties(
									this.props.cryptoKittiesContract,
									fromBlock,
									toBlock
								);

								this.props.queryCryptoKittiesStateHandler([fromBlock, toBlock, birthedKittiesArray]);
							}}
						>
							<div className='form-row'>
								<div className='form-group col-md-6'>
									<label htmlFor='fromBlock'>Starting Block</label>
									<input
										className='form-control'
										id='fromBlock'
										type='text'
										ref={(input) => {
											this.fromBlock = input;
										}}
										placeholder='Starting block...'
										required
									/>
								</div>
								<div className='form-group col-md-6'>
									<label htmlFor='toBlock'>Ending Block</label>
									<input
										className='form-control'
										id='toBlock'
										type='text'
										ref={(input) => {
											this.toBlock = input;
										}}
										placeholder='Ending block...'
										required
									/>
								</div>
							</div>
							<div className='form-row'>
								<div className='form-group col text-center'>
									<button type='submit' className='btn btn-primary'>
										Query
									</button>
								</div>
							</div>
						</form>
					</div>
				</div>
			</div>
		);
	}
}

export default QueryForm;
