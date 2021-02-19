/*
    Objective is to build a program that takes a `startingBlock` and `endingBlock` as arguments 
    and counts the total number of births that happened during that range. Finally, use that 
    information to find the Kitty (birth timestamp, generation and their genes) that gave birth 
    to the most kitties.
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
		await this.checkIfAccountConnected();
		await this.loadBlockchainData();
	}

	// check if user wallet has already authorized app before
	async checkIfAccountConnected() {
		let web3;
		if (window.ethereum) {
			web3 = new Web3(window.ethereum);
		} else if (window.web3) {
			web3 = new Web3(window.web3.currentProvider);
		} else {
			window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!');
		}
		// load accounts
		const accounts = await web3.eth.getAccounts();
		if (accounts) {
			this.setState({ account: accounts[0] });
		}
	}

	// load user wallet when user clicks `Connect` button in Navbar
	// instantiate web3 using window.ethereum or check if it already exists (for legacy dapps)
	async loadAccount() {
		let web3;
		if (window.ethereum) {
			web3 = new Web3(window.ethereum);
			await window.ethereum.enable();
		} else if (window.web3) {
			web3 = new Web3(window.web3.currentProvider);
		} else {
			window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!');
		}
		// load accounts
		const accounts = await web3.eth.getAccounts();
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

	// query Eth mainnet for event `Birth()` using user-specfied startingBlock and endingBlock
	// @dev must create pagination-type feature since Infura does not allow more than 10000 query results
	/*
        DESIGN
        Based on sample event history, every ~10k blocks should have less then 10k events returned.
        Thus, the query should first at least attempt if the event data can be returned. If the '10000 results'
        error is thrown via Infura, then you must iterate by every 10k blocks, starting at `fromBlock` and ending 
        at `toBlock` -- each iteration should add to the `birthedKittiesArray`.
        
        Once the querying is complete, then all calculated data must be, well, calculated -- this will require
         some refactoring of `queryCryptoKitties`, its state handler, and a separate a new function for calculations.
    */
	// @dev This makes no sense -- the `else` block is identical to the `if` block...but returns empty results
	// Namely, if the `else` block direcly calls `fromBlock` & `toBlock`, it will work
	// However, it fails when using `currentFromBlock` & `currentToBlock`, as the code is currently shown
	// ...event though `currentFromBlock` & `currentToBlock` arent assigned same values as `fromBlock` & `toBlock`
	// The goal for the `else` block is to chunk a range from `fromBlock` to `toBlock` by 10k blocks and iterate
	getChunkSize(fromBlock, toBlock) {
		let differenceBetweenBlocks = Math.round((toBlock - fromBlock) / 2);
		if (differenceBetweenBlocks < 10000) {
			return differenceBetweenBlocks;
		} else {
			return this.getChunkSize(fromBlock, fromBlock + differenceBetweenBlocks);
		}
	}

	chunkQueryBlockRange(fromBlock, toBlock) {
		const chunkSize = this.getChunkSize(fromBlock, toBlock);
		let currentFromBlock = fromBlock;
		let nextBlock = currentFromBlock + chunkSize;
		let newQueryBlockRanges = [];
		while (toBlock - (nextBlock + 1) > chunkSize) {
			newQueryBlockRanges.push([currentFromBlock, nextBlock]);
			currentFromBlock = nextBlock + 1;
			nextBlock = currentFromBlock + chunkSize;
		}
		let endOfArrayBlockNumber = newQueryBlockRanges[newQueryBlockRanges.length - 1][1];
		endOfArrayBlockNumber += 1;
		newQueryBlockRanges.push(
			[endOfArrayBlockNumber, endOfArrayBlockNumber + chunkSize],
			[endOfArrayBlockNumber + chunkSize + 1, toBlock]
		);

		return newQueryBlockRanges;
	}

	async queryCryptoKitties(fromBlock, toBlock) {
		const birthedKittiesArray = await this.state.cryptoKittiesContract.getPastEvents(
			'Birth',
			{ fromBlock, toBlock },
			async (error, events) => {
				if (!error) {
					console.log('Birth event data:');
					console.log(events);
					let eventData = await events;
					return eventData;
				} else if (
					error.message === 'Node error: {"code":-32005,"message":"query returned more than 10000 results"}'
				) {
					// Infura query limit of 10k results
					// build an array chunked block ranges; then, loop & call `getPastEvents` in smaller groups
					// @dev need to iterate -- testing the first entry to make sure the logic works
					const blockRanges = this.chunkQueryBlockRange(fromBlock, toBlock);
					console.log(blockRanges);
					await this.state.cryptoKittiesContract.getPastEvents(
						'Birth',
						{
							fromBlock: blockRanges[0][0],
							toBlock: blockRanges[0][1],
						},
						async (error, events) => {
							if (error) {
								console.erorr(error);
							}
							console.log('Birth event data:');
							console.log(events);
							let eventData = await events;
							return eventData;
						}
					);
				} else {
					console.log(error);
				}
			}
		);

		// save the Birth() event data to state
		this.setStateAsync({ birthedKittiesArray: [...birthedKittiesArray] });
		this.setStateAsync({ numberOfBirthedKitties: birthedKittiesArray.length });
		this.calculateMatronWithMaxBirths();
	}

	// update state based on user input of `fromBlock` & `toBlock` from form; then, query CryptoKitties
	blockQueryRangeStateHandler = async ([fromBlock, toBlock]) => {
		// save fromBlock, toBlock, and Birth() event data to an array
		if ((await fromBlock) && (await toBlock)) {
			this.setState({ fromBlock });
			this.setState({ toBlock });
		}

		this.queryCryptoKitties(fromBlock, toBlock);
	};

	// search each result from `birthedKittiesArray` by returnValues.matronId
	// return the matron with most births (inclue birth timestamp, generation, & their genes)
	// @dev pausing develpment on this -- must fix query limit size when calling Infura
	async calculateMatronWithMaxBirths() {
		const mapMatronToNumberOfBirths = {};
		// const birthedKittiesArray = this.state.birthedKittiesArray;
		const birthedKittiesArray = [
			{ returnValues: { matronId: { _hex: 0x1c3b68 } } },
			{ returnValues: { matronId: { _hex: 0x1c3b68 } } },
			{ returnValues: { matronId: { _hex: 0x1c3b67 } } },
		];
		for (let i = 0; i < birthedKittiesArray.length; i++) {
			let matronId = birthedKittiesArray[i].returnValues.matronId._hex;
			if (!mapMatronToNumberOfBirths[matronId]) {
				mapMatronToNumberOfBirths[matronId] = 1;
			} else {
				mapMatronToNumberOfBirths[matronId] += 1;
			}
		}

		if (Object.keys(mapMatronToNumberOfBirths).length === 0) {
			return;
		}

		const matronIdWithMaxBirths = Object.keys(mapMatronToNumberOfBirths).reduce(
			(a, b) => (mapMatronToNumberOfBirths[a] > mapMatronToNumberOfBirths[b] ? a : b),
			null
		);
		const maxBirths = mapMatronToNumberOfBirths[matronIdWithMaxBirths];
		const removeMaxMatronFromMapping = mapMatronToNumberOfBirths;
		delete removeMaxMatronFromMapping[matronIdWithMaxBirths];
		const checkIfMaxBirthsIsDupe = Object.values(removeMaxMatronFromMapping).find(
			(numBirths) => numBirths >= maxBirths
		);

		if (checkIfMaxBirthsIsDupe === undefined) {
			console.log('Matron w/ max births:');
			console.log(matronIdWithMaxBirths);
			const matronWithMaxBirthsData = await this.state.cryptoKittiesContract.methods
				.getKitty(matronIdWithMaxBirths)
				.call();
			const matronGenes = matronWithMaxBirthsData.genes._hex;
			const matronGeneration = parseInt(Number(matronWithMaxBirthsData.generation._hex), 10);
			let matronBirthTimestamp = parseInt(Number(matronWithMaxBirthsData.birthTime._hex), 10);
			matronBirthTimestamp = new Date(matronBirthTimestamp * 1000).toISOString();

			this.setState({ matronId: matronIdWithMaxBirths });
			this.setState({ matronNumberOfBirthsDuringRange: maxBirths });
			this.setState({ matronGenes });
			this.setState({ matronGeneration });
			this.setState({ matronBirthTimestamp });
		} else {
			console.log('Multiple matrons have max number of births');
			this.setState({ matronId: 'N/A' });
		}
	}

	constructor(props) {
		super(props);
		this.state = {
			loading: false,
			account: null,
			cryptoKittiesContract: null,
			name: null,
			fromBlock: null,
			toBlock: null,
			birthedKittiesArray: [],
			numberOfBirthedKitties: null,
			matronId: null,
			matronNumberOfBirthsDuringRange: null,
			matronGenes: null,
			matronGeneration: null,
			matronBirthTimestamp: null,
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
					blockQueryRangeStateHandler={this.blockQueryRangeStateHandler}
					matronId={this.state.matronId}
					matronNumberOfBirthsDuringRange={this.state.matronNumberOfBirthsDuringRange}
					matronGenes={this.state.matronGenes}
					matronGeneration={this.state.matronGeneration}
					matronBirthTimestamp={this.state.matronBirthTimestamp}
				/>
			</div>
		);
	}
}

export default App;
