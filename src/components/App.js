/*
Objective is to build a program that takes a `startingBlock` and `endingBlock` as arguments and counts the total number of births that happened during that range. Finally, use that information to find the Kitty (birth timestamp, generation and their genes) that gave birth to the most kitties.
*/

import React, { Component } from 'react';
import Web3 from 'web3';
import Navbar from './Navbar';
import Main from './Main';
import './App.css';

const infuraProjectId = '494a5be2da0941a682ddaa9b49ba051a';
const CryptoKittiesAbi = require('../abis/CryptoKitties.json');
const CryptoKittiesAddress = '0x06012c8cf97bead5deae237070f9587f8e7a266d';
class App extends Component {
	async componentWillMount() {
		// load web3, account, and smart contract data
		await this.loadBlockchainData();
	}

	// inject web3 into browser or check if it already exists (for legacy dapps)
	async loadAccount() {
		if (window.ethereum) {
			window.web3 = new Web3(window.ethereum);
			await window.ethereum.enable();
		} else if (window.web3) {
			window.web3 = new Web3(window.web3.currentProvider);
		} else {
			window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!');
		}
		// load accounts
		const accounts = await window.web3.eth.getAccounts();
		return accounts[0];
	}

	accountStateHandler = async (account) => {
		this.setState({ account });
	};

	// instantiate smart contract & load metadata
	async loadBlockchainData() {
		const web3 = new Web3(`wss://mainnet.infura.io/ws/v3/${infuraProjectId}`);

		// load smart contract
		const cryptoKittiesContract = new web3.eth.Contract(CryptoKittiesAbi, CryptoKittiesAddress);
		this.setState({ cryptoKittiesContract });
		const name = await cryptoKittiesContract.methods.name().call();
		this.setState({ name });
		const totalSupply = await cryptoKittiesContract.methods.totalSupply().call();
		this.setState({ totalSupply: parseInt(totalSupply._hex) });
	}

	// query Eth mainnet for user-specfied startingBlock and endingBlock
	// looking for event `Birth()`
	// `fromBlock` and `toBlock` are currently set to static values over a ~24 hour period
	// @dev change this to user input and also update state
	async queryCryptoKitties(contract, fromBlock, toBlock) {
		let birthedKittiesArray;
		await contract.getPastEvents('Birth', { fromBlock, toBlock }, (error, data) => {
			if (error) {
				console.error(error);
			}
			console.log('Birth event data:');
			console.log(data);
			birthedKittiesArray = data;
		});
		// return the Birth() event data as an array
		return birthedKittiesArray;

		// search each result from `birthedKittiesArray` by returnValues.matronId
		// return the matron with most births (inclue birth timestamp, generation, & their genes)
	}

	queryCryptoKittiesHandler = async ([fromBlock, toBlock, birthedKittiesArray]) => {
		// save fromBlock and toBlock
		this.setState({ fromBlock });
		this.setState({ toBlock });
		// save the Birth() event data to an array
		this.setState({
			birthedKittiesArray,
		});
		// save the length of the `birthedKittiesArray` to state
		this.setState({
			numberOfBirthedKitties: birthedKittiesArray.length,
		});
	};

	constructor(props) {
		super(props);
		this.state = {
			account: null,
			cryptoKittiesContract: null,
			name: null,
			fromBlock: null,
			toBlock: null,
			birthedKittiesArray: null,
			numberOfBirthedKitties: null,
		};
	}

	render() {
		return (
			<div>
				<Navbar
					account={this.state.account}
					loadAccount={this.loadAccount}
					accountStateHandler={this.accountStateHandler}
				/>
				<Main
					cryptoKittiesContract={this.state.cryptoKittiesContract}
					name={this.state.name}
					totalSupply={this.state.totalSupply}
					birthedKittiesArray={this.state.birthedKittiesArray}
					numberOfBirthedKitties={this.state.numberOfBirthedKitties}
					fromBlock={this.state.fromBlock}
					toBlock={this.state.toBlock}
					queryCryptoKitties={this.queryCryptoKitties}
					queryCryptoKittiesHandler={this.queryCryptoKittiesHandler}
				/>
			</div>
		);
	}
}

export default App;
