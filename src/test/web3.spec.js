// Test connencting to web3 & return data (independent of App but using same functions)
const Web3 = require('web3');
const infuraProjectId = '494a5be2da0941a682ddaa9b49ba051a';
const CryptoKittiesAbi = require('../abis/CryptoKitties.json');
const CryptoKittiesAddress = '0x06012c8cf97bead5deae237070f9587f8e7a266d';
const web3 = new Web3(`wss://mainnet.infura.io/ws/v3/${infuraProjectId}`);

let contract, name, totalSupply, secondsPerBlock;
beforeAll(async () => {
	// load contract
	const cryptoKittiesContract = new web3.eth.Contract(CryptoKittiesAbi, CryptoKittiesAddress);
	contract = await cryptoKittiesContract;
});

// 1. Test cases for 'loadSmartContract'
// (a) contract name === 'CryptoKitties'
// (b) totalSupply is valid
// (c) secondsPerBlock === 15
describe('Load CryptoKitties contract metadata', () => {
	it('has correct contract name', async () => {
		name = await contract.methods.name().call();
		expect(name).toEqual('CryptoKitties');
	});

	it('has valid totalSupply', async () => {
		totalSupply = await contract.methods.totalSupply().call();
		expect(Boolean(totalSupply['_hex'])).toBe(true);
		expect(totalSupply._hex).toMatch(/^0x/, 'totalSupply._hex is a hex value');
		expect(parseInt(totalSupply._hex)).toBeGreaterThan(0, 'totalSupply is greater than 0');
	});

	it('has correct secondsPerBlock', async () => {
		secondsPerBlock = await contract.methods.secondsPerBlock().call();
		expect(parseInt(secondsPerBlock)).toEqual(15);
	});
});

// 2. Test cases for querying CryptoKitties smart contract
// (a) correct number of birthed kitties during block range
describe('Query CryptoKitties data', () => {
	describe('between blocks 11838307 and 11845776', () => {
		const fromBlock = 11838307;
		const toBlock = 11845776;
		it('has correct number of birthed kitties during range', async () => {
			const birthedKittiesArray = [];
			await contract.getPastEvents('Birth', { fromBlock, toBlock }, (error, events) => {
				if (!error) {
					let eventData = events;
					birthedKittiesArray.push(...eventData);
				} else {
					throw error;
				}
			});
			const numberOfBirthedKitties = birthedKittiesArray.length;
			expect(numberOfBirthedKitties).toEqual(4);
		});
	});
});
