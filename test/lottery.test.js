const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const provider = ganache.provider();
const web3 = new Web3(provider);
const { interface, bytecode } = require('../compile');

let accounts;
let lottery;

beforeEach(async () => {
  // Get a list of all accounts, async...use await, screw promises
  accounts = await web3.eth.getAccounts();

  // Use one of those accounts to deploy the contract
  lottery = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ data: bytecode })
    .send({ from: accounts[0], gas: '1000000' });

  lottery.setProvider(provider);
  // console.log(lottery);
});


describe('Lottery', () => {

  it('deploys a contract', () => {
    assert.ok(lottery.options.address);
  });

  it('has a manager', async () => {
    const manager = await lottery.methods.manager().call();
    assert.equal(manager, accounts[0]);
  });

  it('allows accounts to enter lottery', async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('0.02', 'ether')
    });

    const players = await lottery.methods.getPlayers().call({
      from: accounts[0]
    });

    assert.equal(accounts[0], players[0]);
    assert.equal(1, players.length);

  });

  it('has gas on entry', async () => {
    try {
      await lottery.methods.enter().send({
        from: accounts[0],
        value: 0
      });
    }
    catch (err) {
      assert(err);
    };
  });

  it('only lets managers pick a winner', async () => {
    try {
      lottery.methods.pickWinner().send({
        from: accounts[1]
      });
    } 
    catch (err) {
      assert(err);
    };
  });

  it('sends money to winner', async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('2', 'ether')
    });

    const balanceInitial = await web3.eth.getBalance(accounts[0]);

    await lottery.methods.pickWinner().send({
      from: accounts[0]
    });

    const balanceFinal = await web3.eth.getBalance(accounts[0]);
    const difference = balanceFinal - balanceInitial
    assert(difference > web3.utils.toWei('0', 'ether'));
  });
});

