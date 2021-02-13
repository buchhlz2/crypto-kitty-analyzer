import React, { Component } from 'react';
import Web3 from 'web3';
import Navbar from './Nav';
import Main from './Main';
import './App.css';

class App extends Component {
	async componentWillMount() {
		// load web3, account, and smart contract data
		await this.loadWeb3();
		await this.loadBlockchainData();
	}

	// inject web3 into browser or check if it already exists (for legacy dapps)
	async loadWeb3() {
		if (window.ethereum) {
			window.web3 = new Web3(window.ethereum);
			await window.ethereum.enable();
		} else if (window.web3) {
			window.web3 = new Web3(window.web3.currentProvider);
		} else {
			window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!');
		}
	}

	// load account & smart contract data
	async loadBlockchainData() {
		const web3 = window.web3;

		// load accounts
		const accounts = await web3.eth.getAccounts();
		this.setState({ account: accounts[0] });

		// load smart contract
		const networkId = await web3.eth.net.getId();
		// uncomment the section below after updating <Contract> and <contract> with deployed smart contract inputs
		/* 
        const networkData = <Contract>.networks[networkId];
		if (networkData) {
			const <contract> = new web3.eth.Contract(<Contract>.abi, networkData.address);
			this.setState({ <contract> });
			
            // interact with contract

		} else {
			window.alert('<Contract> has not been deployed to the connected network.');
		}
        */
	}

	constructor(props) {
		super(props);
		this.state = {
			account: '',
		};
	}

	render() {
		return (
			<div>
				<Navbar account={this.state.account} />
				<Main />
			</div>
		);
	}
}

export default App;
