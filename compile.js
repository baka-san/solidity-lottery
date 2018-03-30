// This file will take the contracts and compile them to generate 
// the bytecode and ABI

// path will generate a path that works on windows, mac, etc
const path = require('path')
// fs = file system, 
const fs = require('fs')
const solc = require('solc')

// build a path from here to contracts
const lotteryPath = path.resolve(__dirname, 'contracts', 'Lottery.sol')

// Store content from inbox.sol here
const source = fs.readFileSync(lotteryPath, 'utf8')

// Compile code

// console.log(solc.compile(source,1).contracts[':Lottery'])
module.exports = solc.compile(source,1).contracts[':Lottery']