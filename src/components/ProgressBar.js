import React from 'react';

function ProgressBar(props) {
	const currentQueryProgress = props.queryProgress.toString();
	const divStyle = {
		width: currentQueryProgress + '%',
	};

	return (
		<div className='progress'>
			<div
				className='progress-bar progress-bar-striped progress-bar-animated'
				role='progressbar'
				style={divStyle}
				aria-valuenow={currentQueryProgress}
				aria-valuemin='0'
				aria-valuemax='100'
			>
				{`${Math.round(currentQueryProgress)}%`}
			</div>
		</div>
	);
}

export default ProgressBar;
