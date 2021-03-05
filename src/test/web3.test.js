const { assert } = require('chai');
const Web3 = require('web3');

const infuraProjectId = '494a5be2da0941a682ddaa9b49ba051a';
const CryptoKittiesAbi = require('../abis/CryptoKitties.json');
const CryptoKittiesAddress = '0x06012c8cf97bead5deae237070f9587f8e7a266d';

const web3 = new Web3(`wss://mainnet.infura.io/ws/v3/${infuraProjectId}`);

require('chai')
	.use(require('chai-as-promised'))
	.should();

// 1. Test cases for 'loadSmartContract'
// (a) contract name === 'CryptoKitties'
// (b) totalSupply is valid
// (c) secondsPerBlock === 15

describe('Load CryptoKitties contract metadata', async () => {
	let contract, name, totalSupply, secondsPerBlock;

	before(async () => {
		// load contract
		const cryptoKittiesContract = new web3.eth.Contract(CryptoKittiesAbi, CryptoKittiesAddress);
		contract = await cryptoKittiesContract;
	});

	it('has correct contract name', async () => {
		name = await contract.methods.name().call();
		assert.equal(name, 'CryptoKitties');
	});

	it('has valid totalSupply', async () => {
		totalSupply = await contract.methods.totalSupply().call();
		assert.property(totalSupply, '_hex', 'totalSupply has propery _hex');
		assert.match(totalSupply._hex, /^0x/, 'totalSupply._hex is a hex value');
		assert.isAbove(parseInt(totalSupply._hex), 0, 'totalSupply is greater than 0');
	});

	it('has correct secondsPerBlock', async () => {
		secondsPerBlock = await contract.methods.secondsPerBlock().call();
		assert.equal(secondsPerBlock, 15);
	});
});

// 2. Test cases for calling `blockQueryRangeStateHandler`
// (a) 11500000 to 11845776 => matronId (0x1e6bef), matronNumberOfBirthsDuringRange (10) , numberOfBirthedKitties (2520)
// (b) 6607985 to 6607985 => matronId (0x00), matronNumberOfBirthsDuringRange (3099) , numberOfBirthedKitties (186652)
// (c) 11838307 to 11845776 => matronId (null), matronNumberOfBirthsDuringRange (null) , numberOfBirthedKitties (4)
/*
describe('Load CryptoKitties contract metadata', async () => {
	let contract;

	before(async () => {
		// load contracts
		const cryptoKittiesContract = new web3.eth.Contract(CryptoKittiesAbi, CryptoKittiesAddress);
		contract = await cryptoKittiesContract;
	});

	it('has correct contract name', async () => {
		App.loadBlockchainData();
	});
});
*/
