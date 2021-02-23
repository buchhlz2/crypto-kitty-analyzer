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

const infuraProjectId = process.env.REACT_APP_INFURA_PROJECT_ID;
const CryptoKittiesAbi = require('../abis/CryptoKitties.json');
const CryptoKittiesAddress = '0x06012c8cf97bead5deae237070f9587f8e7a266d';
class App extends Component {
	async componentWillMount() {
		// Load wallet / account (if already connected) and smart contract data
		await this.checkIfAccountConnected();
		await this.loadSmartContract();
	}

	// Check if user wallet has already authorized app before
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

	// Load user wallet when user clicks `Connect` button in (`Navbar` component)
	// Instantiate web3 using window.ethereum or check if it already exists (for legacy dapps)
	async connectAccount() {
		let web3;
		if (window.ethereum) {
			web3 = new Web3(window.ethereum);
			await window.ethereum.enable();
		} else if (window.web3) {
			web3 = new Web3(window.web3.currentProvider);
		} else {
			window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!');
		}
		// Load accounts
		const accounts = await web3.eth.getAccounts();
		return accounts[0];
	}

	// State helper used when user click on 'Connect' button in child component
	accountStateHandler = async (account) => {
		this.setState({ account });
	};

	// Instantiate smart contract & load metadata
	async loadSmartContract() {
		this.setState({ loadingMetadata: true });
		const web3 = new Web3(`wss://mainnet.infura.io/ws/v3/${infuraProjectId}`);

		// Load smart contract & miscellanous metadata
		const cryptoKittiesContract = new web3.eth.Contract(CryptoKittiesAbi, CryptoKittiesAddress);
		this.setState({ cryptoKittiesContract });
		const contractName = await cryptoKittiesContract.methods.name().call();
		this.setState({ contractName });
		const totalSupply = await cryptoKittiesContract.methods.totalSupply().call();
		this.setState({ totalSupply: parseInt(totalSupply._hex) });
		const secondsPerBlock = await cryptoKittiesContract.methods.secondsPerBlock().call();
		this.setState({ secondsPerBlock: parseInt(secondsPerBlock._hex) });
		const totalNumberCurrentlyPregnantKitties = await cryptoKittiesContract.methods.pregnantKitties().call();
		this.setState({ totalNumberCurrentlyPregnantKitties: parseInt(totalNumberCurrentlyPregnantKitties._hex) });

		this.setState({ loadingMetadata: false });
	}

	// Query Eth mainnet for event `Birth()` using user-specfied startingBlock and endingBlock
	// @dev The error is thrown (see below) if the Infura query limit is reached...further addressed in later code
	// `error.message === 'Node error: {"code":-32005,"message":"query returned more than 10000 results"}'`
	async queryCryptoKitties(fromBlock, toBlock) {
		const birthedKittiesArray = [];
		// Call `getPastEvents` for `Birth` event and add items to array of all birthed kitties during timerang
		await this.state.cryptoKittiesContract.getPastEvents('Birth', { fromBlock, toBlock }, (error, events) => {
			if (!error) {
				let eventData = events;
				birthedKittiesArray.push(...eventData);
			} else {
				throw error;
			}
		});

		return birthedKittiesArray;
	}

	// Helper function to determine the how to chunk the block ranges (find first chunk value that is <= 10000)
	getChunkSize(fromBlock, toBlock) {
		// Take the difference between the two blocks to determine the midpoint
		// If this midpoint is greater than 10000, recurse until a midpoint < 10000 is found
		// @dev Note that it's still possible to exceed 10000 events in a range, but it would take a large query size
		// Potential to change the value below to account for this
		let differenceBetweenBlocks = Math.round((toBlock - fromBlock) / 2);
		if (differenceBetweenBlocks < 10000) {
			return differenceBetweenBlocks;
		} else {
			return this.getChunkSize(fromBlock, fromBlock + differenceBetweenBlocks);
		}
	}

	// Helper function creates block ranges that are of equal size for every sub-array, except the final range
	// This ensures the Infura error (`return limit exceeded 10000`) is unlikely to occur
	chunkQueryBlockRange(fromBlock, toBlock) {
		// Get the `chunkSize` use to initalize the `currentFromBlock` and `nextBlock` values
		const chunkSize = this.getChunkSize(fromBlock, toBlock);
		let currentFromBlock = fromBlock;
		let nextBlock = currentFromBlock + chunkSize;
		let newQueryBlockRanges = [];
		// While the `nextBlock` exceeds the `chunkSize`, add new chunked query ranges to `newQueryBlockRanges`
		while (toBlock - (nextBlock + 1) > chunkSize) {
			newQueryBlockRanges.push([currentFromBlock, nextBlock]);
			currentFromBlock = nextBlock + 1;
			nextBlock = currentFromBlock + chunkSize;
		}
		// Lastly, add two final sub-arrays to `newQueryBlockRanges`
		// @param `endOfArrayBlockNumber` is the last value in all sub-array
		// Take `endOfArrayBlockNumber`, increase it by 1, and add the `chunkSize` -- this gives you the first of the two final sub-arrays
		// Basically, do this once more but up until the final block in query -- the original `toBlock`
		// Take these two sub-arrays and then push them before returning the `newQueryBlockRanges`
		let endOfArrayBlockNumber = newQueryBlockRanges[newQueryBlockRanges.length - 1][1];
		endOfArrayBlockNumber += 1;
		newQueryBlockRanges.push(
			[endOfArrayBlockNumber, endOfArrayBlockNumber + chunkSize],
			[endOfArrayBlockNumber + chunkSize + 1, toBlock]
		);

		return newQueryBlockRanges;
	}

	// Update query state based on user input from input form, using `fromBlock` & `toBlock`
	// @dev Created pagination-type feature since Infura does not allow more than 10000 query results
	/*
        DESIGN
        Based on sample event history, every ~10k blocks should have less then 10k events returned.
        Thus, the query should first at least attempt if the event data can be returned. If the '10000 results'
        error is thrown via Infura, then you must iterate by every 10k blocks at most, starting at `fromBlock` 
        and ending at `toBlock` -- each iteration should add to the `birthedKittiesArray`.

        There are fringe cases where the '10000 results' error is thrown; interestingly, this happens somewhere 
        around block 5000000, which is during the crypto 2017/2018 boom. Although the UI takes care of this 
        by asking for a new input range, there are comments on the `getChunkSize()` code that calls out how 
        to potentially fix this. There could also be further optimization by combining small chunked ranges 
        together, which would reduce the number of Infura calls.
    */
	blockQueryStateHandler = async ([fromBlock, toBlock]) => {
		// Set current query state while the query is running, which impacts component rendering
		this.setState({ queryHasBeenFired: true });
		this.setState({ awaitingBlockchainQueryResponse: true });
		this.setState({ queryProgress: 0 });
		this.setState({ queryError: false });
		// Reset state for matron & birthed kitty array
		this.setState({ matronId: null });
		this.setState({ matronNumberOfBirthsDuringRange: null });
		this.setState({ matronGenes: null });
		this.setState({ matronGeneration: null });
		this.setState({ matronBirthTimestamp: null });
		this.setState({ birthedKittiesArray: [] });
		this.setState({ numberOfBirthedKitties: null });

		// Save `fromBlock` & `toBlock` to state
		this.setState({ fromBlock });
		this.setState({ toBlock });

		// First, try to call `queryCryptoKitties` using the inital block ranges
		// If an Infura 'too many requests' error is thrown, chunk the query & call `queryCryptoKitties` with smaller block ranges
		try {
			const birthedKittiesArray = await this.queryCryptoKitties(fromBlock, toBlock);
			// Save the Birth() event data to state & execute further calculations
			this.setState({ birthedKittiesArray });
			this.setState({ numberOfBirthedKitties: birthedKittiesArray.length });
			this.calculateMatronWithMaxBirths();
		} catch (error) {
			try {
				if (
					error.message === 'Node error: {"code":-32005,"message":"query returned more than 10000 results"}'
				) {
					const blockRanges = this.chunkQueryBlockRange(fromBlock, toBlock);
					const birthedKittiesArray = [];
					// Use chunked block ranges to iteratively (1) updated birthed kitties array, and (2) update query progress as more sub-ranges are queried
					for (let i = 0; i < blockRanges.length; i++) {
						const kittiesDuringRange = await this.queryCryptoKitties(blockRanges[i][0], blockRanges[i][1]);
						birthedKittiesArray.push(...kittiesDuringRange);
						// Update state for query progress ==> expressed as function of `blockRanges` length
						this.setState({ queryProgress: (i / blockRanges.length) * 100 });
					}
					// Save the Birth() event data to state & execute further calculations
					this.setState({ birthedKittiesArray });
					this.setState({ numberOfBirthedKitties: birthedKittiesArray.length });
					this.calculateMatronWithMaxBirths();
				}
			} catch {
				// If an error is thrown, alert user to try reducing query size (via UI)
				console.log(error);
				this.setState({ queryError: true });
			}
		}
		this.setState({ awaitingBlockchainQueryResponse: false });
	};

	// Return the matron with most births (inclue birth timestamp, generation, & their genes)
	async calculateMatronWithMaxBirths() {
		const mapMatronToNumberOfBirths = {};
		const birthedKittiesArray = this.state.birthedKittiesArray;

		// For each value, check if the matronId exists -- this determines if it's added or incremented
		// Namely, use `birthedKittiesArray` and each item's `returnValues.matronId`
		for (let i = 0; i < birthedKittiesArray.length; i++) {
			let matronId = birthedKittiesArray[i].returnValues.matronId._hex;
			if (!mapMatronToNumberOfBirths[matronId]) {
				mapMatronToNumberOfBirths[matronId] = 1;
			} else {
				mapMatronToNumberOfBirths[matronId] += 1;
			}
		}

		// Validate that there is not an empty mapping, otherwise, subsequent code throws errors when iterating
		if (Object.keys(mapMatronToNumberOfBirths).length === 0) {
			return;
		}

		// Determine matron with most births using reducer comparing which key has a higher value
		const matronIdWithMaxBirths = Object.keys(mapMatronToNumberOfBirths).reduce(
			(a, b) => (mapMatronToNumberOfBirths[a] > mapMatronToNumberOfBirths[b] ? a : b),
			null
		);
		// Set the max number of births achieved
		const maxBirths = mapMatronToNumberOfBirths[matronIdWithMaxBirths];
		// Create a copy of the matron mapping & remove the matron that equals `matronIdWithMaxBirths`
		// This will be used for validation purposes that no other matrons have >= `maxBirths`
		const removeMaxMatronFromMapping = mapMatronToNumberOfBirths;
		delete removeMaxMatronFromMapping[matronIdWithMaxBirths];
		// If matrons in this copied mapping do not have values >= `maxBirths`, it returns with a value of `undefined`
		// Namely, `numberOfMaxBirthsIsUnique` is set to `true` if the `matronIdWithMaxBirths` has a unique, maximum number of births
		const numberOfMaxBirthsIsUnique =
			Object.values(removeMaxMatronFromMapping).find((numBirths) => numBirths >= maxBirths) === undefined
				? true
				: false;
		// Finally, use `numberOfMaxBirthsIsUnique` to validate the remaining logic
		if (numberOfMaxBirthsIsUnique) {
			// Query the CryptoKitties contract using `getKitty` getter, which takes `matronIdWithMaxBirths`
			const matronWithMaxBirthsData = await this.state.cryptoKittiesContract.methods
				.getKitty(matronIdWithMaxBirths)
				.call();
			// Get matron's generes, generation, and birth timestamp from the return values
			const matronGenes = await matronWithMaxBirthsData.genes._hex;
			const matronGeneration = parseInt(Number(matronWithMaxBirthsData.generation._hex), 10);
			let matronBirthTimestamp = parseInt(Number(matronWithMaxBirthsData.birthTime._hex), 10);
			matronBirthTimestamp = new Date(matronBirthTimestamp * 1000).toISOString();

			this.setState({ matronId: matronIdWithMaxBirths });
			this.setState({ matronNumberOfBirthsDuringRange: maxBirths });
			this.setState({ matronGenes });
			this.setState({ matronGeneration });
			this.setState({ matronBirthTimestamp });
		}
	}

	constructor(props) {
		super(props);
		this.state = {
			loadingMetadata: false,
			awaitingBlockchainQueryResponse: false,
			queryProgress: 0,
			queryHasBeenFired: false,
			queryError: false,
			account: null,
			cryptoKittiesContract: null,
			contractName: null,
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
					connectAccount={this.connectAccount}
					accountStateHandler={this.accountStateHandler}
				/>
				<Main
					cryptoKittiesContract={this.state.cryptoKittiesContract}
					loadingMetadata={this.state.loadingMetadata}
					contractName={this.state.contractName}
					totalSupply={this.state.totalSupply}
					secondsPerBlock={this.state.secondsPerBlock}
					totalNumberCurrentlyPregnantKitties={this.state.totalNumberCurrentlyPregnantKitties}
					awaitingBlockchainQueryResponse={this.state.awaitingBlockchainQueryResponse}
					queryProgress={this.state.queryProgress}
					queryHasBeenFired={this.state.queryHasBeenFired}
					queryError={this.state.queryError}
					fromBlock={this.state.fromBlock}
					toBlock={this.state.toBlock}
					numberOfBirthedKitties={this.state.numberOfBirthedKitties}
					blockQueryStateHandler={this.blockQueryStateHandler}
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
