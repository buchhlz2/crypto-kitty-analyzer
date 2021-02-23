import React, { Component } from 'react';

class QueryForm extends Component {
	constructor(props) {
		super(props);
		this.state = {
			fromBlockIsInvalid: false,
			toBlockIsInvalid: false,
		};
	}

	render() {
		return (
			<div className='container-fluid mt-5'>
				<div className='row'>
					<div className='content mr-auto ml-auto'>
						<h3 className='text-center'>Query Form:</h3>
						<form
							onSubmit={(event) => {
								event.preventDefault();
								this.setState({ fromBlockIsInvalid: false });
								this.setState({ toBlockIsInvalid: false });
								// check that `fromBlock` is a number, non-negative, and >= 0
								let fromBlockIsInvalid =
									isNaN(this.fromBlock.value) || parseInt(this.fromBlock.value) < 0 ? true : false;
								// check that `toBlock` is a number, non-negative, and >= 1
								let toBlockIsInvalid =
									isNaN(this.toBlock.value) || parseInt(this.toBlock.value) < 1 ? true : false;

								// if one of the user inputs is invalid, update state and display error html
								if (fromBlockIsInvalid || toBlockIsInvalid) {
									this.setState({ fromBlockIsInvalid });
									this.setState({ toBlockIsInvalid });
								} else {
									// else, take user's input, convert to number, and update state
									const fromBlock = parseInt(this.fromBlock.value);
									const toBlock = parseInt(this.toBlock.value);

									this.props.blockQueryStateHandler([fromBlock, toBlock]);
								}
							}}
						>
							<div className='form-row mb-2'>
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
									{this.state.fromBlockIsInvalid ? (
										<small className='text-muted text-danger'>
											Must be a number greater than or equal to 0.
										</small>
									) : (
										''
									)}
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
									{this.state.toBlockIsInvalid ? (
										<small className='text-muted text-danger'>
											Must be a number greater than or equal to 1.
										</small>
									) : (
										''
									)}
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
