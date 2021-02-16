/*
Objective is to build a program that takes a `startingBlock` and `endingBlock` as arguments and counts the total number of births that happened during that range. Finally, use that information to find the Kitty (birth timestamp, generation and their genes) that gave birth to the most kitties.
*/

import React, { Component } from 'react';
import Web3 from 'web3';
import Navbar from './Nav';
import Main from './Main';
import './App.css';

const infuraProjectId = '494a5be2da0941a682ddaa9b49ba051a';
const CryptoKittiesAbi = require('../abis/CryptoKitties.json');
const CryptoKittiesAddress = '0x06012c8cf97bead5deae237070f9587f8e7a266d';
class App extends Component {
	async componentWillMount() {
		// load web3, account, and smart contract data
		await this.loadBlockchainData();
		await this.getBirths();
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

	// load smart contract data
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
	async getBirths() {
		let birthedKittiesArray;
		await this.state.cryptoKittiesContract.getPastEvents(
			'Birth',
			{ fromBlock: this.state.startingBlock, toBlock: this.state.endingBlock },
			(error, data) => {
				if (error) {
					console.error(error);
				}
				console.log('Birth event data:');
				console.log(data);
				birthedKittiesArray = data;
			}
		);
		// save the Birth() event data to an array
		this.setState({ birthedKittiesArray: birthedKittiesArray });
		console.log(this.state.birthedKittiesArray);
		// save the lendth of the `birthedKittiesArray` to state
		this.setState({ numberOfBirthedKitties: birthedKittiesArray.length });
		console.log(this.state.numberOfBirthedKitties);

		// search each result from `birthedKittiesArray` by returnValues.matronId
		// return the matron with most births (inclue birth timestamp, generation, & their genes)
	}

	constructor(props) {
		super(props);
		this.state = {
			account: null,
			cryptoKittiesContract: null,
			name: null,
			startingBlock: 11838307,
			endingBlock: 11845776,
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
					startingBlock={this.state.startingBlock}
					endingBlock={this.state.endingBlock}
				/>
			</div>
		);
	}
}

export default App;
