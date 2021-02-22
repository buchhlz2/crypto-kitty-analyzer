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
		this.setState({ loadingMetadata: true });
		const web3 = new Web3(`wss://mainnet.infura.io/ws/v3/${infuraProjectId}`);

		// load smart contract
		const cryptoKittiesContract = new web3.eth.Contract(CryptoKittiesAbi, CryptoKittiesAddress);
		this.setState({ cryptoKittiesContract });
		const name = await cryptoKittiesContract.methods.name().call();
		this.setState({ name });
		const totalSupply = await cryptoKittiesContract.methods.totalSupply().call();
		this.setState({ totalSupply: parseInt(totalSupply._hex) });
		const secondsPerBlock = await cryptoKittiesContract.methods.secondsPerBlock().call();
		this.setState({ secondsPerBlock: parseInt(secondsPerBlock._hex) });
		const totalNumberCurrentlyPregnantKitties = await cryptoKittiesContract.methods.pregnantKitties().call();
		this.setState({ totalNumberCurrentlyPregnantKitties: parseInt(totalNumberCurrentlyPregnantKitties._hex) });

		this.setState({ loadingMetadata: false });
	}

	// query Eth mainnet for event `Birth()` using user-specfied startingBlock and endingBlock
	// @dev must create pagination-type feature since Infura does not allow more than 10000 query results
	/*
        DESIGN
        Based on sample event history, every ~10k blocks should have less then 10k events returned.
        Thus, the query should first at least attempt if the event data can be returned. If the '10000 results'
        error is thrown via Infura, then you must iterate by every 10k blocks at most, starting at `fromBlock` and ending 
        at `toBlock` -- each iteration should add to the `birthedKittiesArray`.
    */
	// @dev Issue with the try / catch block in terms of updating state.
	// If no error thrown, then all is good. If when 'more than 10000 results' conditional hit,
	// the event results come after state is updated...thus, the data calculated is referencing an emptry
	// array instead of the eventual resolved array with event ddata. Must refactor to handle Promise properly.
	async queryCryptoKitties(fromBlock, toBlock) {
		const birthedKittiesArray = [];
		await this.state.cryptoKittiesContract.getPastEvents('Birth', { fromBlock, toBlock }, (error, events) => {
			if (!error) {
				console.log('Birth event data (1):');
				let eventData = events;
				console.log([...eventData]);
				birthedKittiesArray.push(...eventData);
			} else {
				throw error;
			}
			// error.message === 'Node error: {"code":-32005,"message":"query returned more than 10000 results"}'
		});

		return birthedKittiesArray;
	}

	// helper function to determine the how to chunk the block ranges (find first chunk value that is <= 10000)
	getChunkSize(fromBlock, toBlock) {
		let differenceBetweenBlocks = Math.round((toBlock - fromBlock) / 2);
		if (differenceBetweenBlocks < 10000) {
			return differenceBetweenBlocks;
		} else {
			return this.getChunkSize(fromBlock, fromBlock + differenceBetweenBlocks);
		}
	}

	// helper function creates block ranges that are of equal size for every sub-array, except the final range
	// this ensures the Infura error (`return limit exceeded 10000`) does not occur
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

	// update state based on user input of `fromBlock` & `toBlock` from form; then, query CryptoKitties
	blockQueryRangeStateHandler = async ([fromBlock, toBlock]) => {
		this.setState({ queryHasBeenFired: true });
		// save fromBlock, toBlock, and Birth() event data to an array
		this.setState({ awaitingBlockchainQueryResponse: true });
		if ((await fromBlock) && (await toBlock)) {
			this.setState({ fromBlock });
			this.setState({ toBlock });
		}

		try {
			const birthedKittiesArray = await this.queryCryptoKitties(fromBlock, toBlock);
			// save the Birth() event data to state
			this.setState({ birthedKittiesArray }, () => {
				console.log('birthedKittiesArray state updated (1):');
				console.log(birthedKittiesArray);
			});
			this.setState({
				numberOfBirthedKitties: birthedKittiesArray.length,
			});
			this.calculateMatronWithMaxBirths();
		} catch (error) {
			console.log('error in blockQueryRangeStateHandler');
			console.log(error);
			try {
				if (
					error.message === 'Node error: {"code":-32005,"message":"query returned more than 10000 results"}'
				) {
					const blockRanges = this.chunkQueryBlockRange(fromBlock, toBlock);
					console.log(blockRanges);
					const birthedKittiesArray = [];
					for (let i = 0; i < blockRanges.length; i++) {
						const kittiesDuringRange = await this.queryCryptoKitties(blockRanges[i][0], blockRanges[i][1]);
						birthedKittiesArray.push(...kittiesDuringRange);
					}
					// save the Birth() event data to state
					this.setState({ birthedKittiesArray }, () => {
						console.log('birthedKittiesArray state updated (2):');
						console.log(birthedKittiesArray);
					});
					this.setState({
						numberOfBirthedKitties: birthedKittiesArray.length,
					});
					this.calculateMatronWithMaxBirths();
				}
			} catch {
				console.log(error);
			}
		}
		this.setState({ awaitingBlockchainQueryResponse: false });
	};

	// search each result from `birthedKittiesArray` by returnValues.matronId
	// return the matron with most births (inclue birth timestamp, generation, & their genes)
	async calculateMatronWithMaxBirths() {
		const mapMatronToNumberOfBirths = {};
		const birthedKittiesArray = this.state.birthedKittiesArray;
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

			this.setState({
				matronNumberOfBirthsDuringRange: null,
			});
			this.setState({ matronId: null });
			this.setState({ matronGenes: null });
			this.setState({ matronGeneration: null });
			this.setState({ matronBirthTimestamp: null });
			console.log(this.state.matronId);
		}
	}

	constructor(props) {
		super(props);
		this.state = {
			loadingMetadata: false,
			awaitingBlockchainQueryResponse: false,
			queryHasBeenFired: false,
			account: null,
			cryptoKittiesContract: null,
			name: null,
			totalSupply: null,
			secondsPerBlock: null,
			totalNumberCurrentlyPregnantKitties: null,
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
					secondsPerBlock={this.state.secondsPerBlock}
					totalNumberCurrentlyPregnantKitties={this.state.totalNumberCurrentlyPregnantKitties}
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
					loadingMetadata={this.state.loadingMetadata}
					awaitingBlockchainQueryResponse={this.state.awaitingBlockchainQueryResponse}
					queryHasBeenFired={this.state.queryHasBeenFired}
				/>
			</div>
		);
	}
}

export default App;
