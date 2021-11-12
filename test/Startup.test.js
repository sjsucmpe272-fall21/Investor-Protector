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
  it('Deploy a StartupFactory and a Startup', () => {
    assert.ok(factory.options.address);
    assert.ok(startup.options.address);
  });

  it('Mark caller as the Startup manager', async () => {
  	const manager = await startup.methods.manager().call();
  	assert.equal(accounts[0], manager);
  });

  it('Allow people to contribute money and marks them as approvers', async () =>{
    await startup.methods.contribute().send({
      value: '200',
      from: accounts[1]
    });
    const isContributor = await startup.methods.approvers(accounts[1]).call();
    assert(isContributor);
  });

  it('Require minimum contribution', async () => {
    try {
      await startup.methods.contribute().send({
        value: '5',
        from: accounts[1]
      });
      assert(false);
    } catch (err) {
      assert(err);
    }
  });

  it('Allows manager to make a payment request', async() => {
    await startup.methods.createRequest('Buy shoes', '100', accounts[1])
    .send({
      from: accounts[0],
      gas: '1000000'
    });
    const request = await startup.methods.requests(0).call();
    assert.equal('Buy shoes', request.description);
  });
});
