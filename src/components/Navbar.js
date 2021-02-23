/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { Component } from 'react';

class Navbar extends Component {
	render() {
		return (
			<nav className='navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow'>
				<a className='navbar-brand col-sm-3 col-md-2 mr-0' href='#' target='_blank' rel='noopener noreferrer'>
					CryptoKitties Analyzer
				</a>
				<ul className='navbar-nav'>
					<li className='nav-item text-nowrap mr-2 d-none d-sm-none d-sm-block'>
						{this.props.account == null ? (
							<button
								className='btn btn-secondary btn-sm'
								onClick={async () => {
									let account = await this.props.connectWallet();
									this.props.accountStateHandler(account);
								}}
							>
								Connect
							</button>
						) : (
							<small className='text-secondary'>{this.props.account}</small>
						)}
					</li>
				</ul>
			</nav>
		);
	}
}
export default Navbar;
