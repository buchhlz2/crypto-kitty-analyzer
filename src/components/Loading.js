import React, { Component } from 'react';

class Loading extends Component {
	render() {
		return (
			<div className='row'>
				<div className='content mr-auto ml-auto'>
					<div className='spinner-border' role='status'>
						<span className='sr-only'>Loading...</span>
					</div>
				</div>
			</div>
		);
	}
}

export default Loading;
