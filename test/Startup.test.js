const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const compiledFactory = require('../ethereum/build/StartupFactory.json');
const compiledStartup = require('../ethereum/build/Startup.json');

let accounts;
let factory;
let startupAddress;
let startup;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();

  factory = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
    .deploy({ data: compiledFactory.bytecode })
    .send({ from: accounts[0], gas: '1000000' });

  await factory.methods.createStartup('100').send({
    from: accounts[0],
    gas: '1000000'
  });

  [startupAddress] = await factory.methods.getDeployedStartups().call();
  startup = await new web3.eth.Contract(
    JSON.parse(compiledStartup.interface),
    startupAddress
  );
});

describe('Startups', () => {
  it('deploys a factory and a startup', () => {
    assert.ok(factory.options.address);
    assert.ok(startup.options.address);
  });

  it('marks caller as the startup manager', async () => {
  	const manager = await startup.methods.manager().call();
  	assert.equal(accounts[0], manager);
  });
});
