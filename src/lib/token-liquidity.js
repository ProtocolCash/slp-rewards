/*
  Library that contains the business logic specific to this token-liquidity app.
*/

'use strict'

const config = require('../../config')

// App utility functions library.
const TLUtils = require('./util')
const tlUtil = new TLUtils()

// SLP Token library
const SLP = require('./slp')
const slp = new SLP()

// BCH library
const BCH = require('./bch')
const bch = new BCH()

// Transactions library
const Transactions = require('./transactions')
const txs = new Transactions()

// const bchLib = require('./send-bch')

// Winston logger
const wlogger = require('../utils/logging')

// Used for debugging and iterrogating JS objects.
const util = require('util')
util.inspect.defaultOptions = { depth: 5 }

const BCH_ADDR1 = config.BCH_ADDR
// const TOKEN_ID = config.TOKEN_ID
const TOKENS_QTY_ORIGINAL = config.TOKENS_QTY_ORIGINAL
const BCH_QTY_ORIGINAL = config.BCH_QTY_ORIGINAL

const seenTxs = [] // Track processed TXIDs
let _this

class TokenLiquidity {
  constructor () {
    _this = this
  }

  // Checks the last TX associated with the BCH address. If it changed, then
  // the program reacts to it. Otherwise it exits.
  // Here is the general flow of this function:
  // -Organize the transactions and return an array of 1-conf transactions
  // -if there are no 1-conf transactions (2-conf or greater)...
  // --Retrieve the BCH and token balances from the blockchain and return those
  // -else loop through each transaction in the 1-conf array
  // --if the current transaction is different than the last processed transaction...
  // ---if the users address matches the app address, ignore and skip.
  // ---if the user sent tokens...
  // ----calculate and send BCH
  // ---if the user sent BCH...
  // ----calculate and send tokens
  // ---Calculate the new BCH and token balances and return them.
  async compareLastTransaction (obj) {
    try {
      const { bchAddr, txid, bchBalance, tokenBalance } = obj

      let newBchBalance = bchBalance
      let newTokenBalance = tokenBalance

      // Get an array of 1-conf transactions
      const lastTransactions = await txs.getLastConfirmedTransactions(bchAddr)

      // If there are no 0 or 1-conf transactions.
      const isOnly2Conf = await txs.only2Conf(BCH_ADDR1)
      if (isOnly2Conf) {
        // Retrieve the balances from the blockchain.
        const retObj2 = await _this.getBlockchainBalances(BCH_ADDR1)
        retObj2.lastTransaction = txid
        return retObj2
      }

      // Loop through each 1-conf transaction.
      for (let i = 0; i < lastTransactions.length; i++) {
        const lastTransaction = lastTransactions[i]

        // Check to see if this Tx has already been processed.
        const notSeen = seenTxs.indexOf(lastTransaction) === -1

        // Is this a new, unseen transaction?
        if (lastTransaction !== txid && notSeen) {
          wlogger.info(`New TXID ${lastTransaction} detected.`)

          // Get the sender's address for this transaction.
          const userAddr = await txs.getUserAddr(lastTransaction)
          wlogger.info(`userAddr: ${util.inspect(userAddr)}`)

          // Exit if the userAddr is the same as the bchAddr for this app.
          // This occurs when the app sends bch or tokens to the user.
          if (userAddr === bchAddr) {
            wlogger.info(`userAddr === app address. Exiting compareLastTransaction()`)
            seenTxs.push(lastTransaction)
            const retObj = {
              lastTransaction: lastTransaction,
              bchBalance: newBchBalance,
              tokenBalance: newTokenBalance
            }
            return retObj
          }

          // Process new txid.
          // const isTokenTx = await tokenTxInfo(lastTransaction, wormhole)
          const isTokenTx = await slp.tokenTxInfo(lastTransaction)
          wlogger.debug(`isTokenTx: ${isTokenTx}`)

          // User sent tokens.
          if (isTokenTx) {
            wlogger.info(`${isTokenTx} tokens recieved.`)
          // User sent BCH
          } else {
            // Get the BCH send amount.
            const bchQty = await bch.recievedBch(lastTransaction, BCH_ADDR1)
            wlogger.info(`${bchQty} BCH recieved.`)

            // Calculate the new balances
            // newBchBalance = retObj.bch2
            newBchBalance = tlUtil.round8(Number(bchBalance) + exchangeObj.bchIn)
            newTokenBalance = tlUtil.round8(Number(tokenBalance) - bchQty)
            wlogger.debug(`retObj: ${util.inspect(retObj)}`)
            wlogger.info(`New BCH balance: ${newBchBalance}`)
            wlogger.info(`New token balance: ${newTokenBalance}`)

            // Send Tokens 1:1 for received BCH
            const tokenConfig = await slp.createTokenTx(userAddr, bchQty)
            await slp.broadcastTokenTx(tokenConfig)
          }

          // Add the last transaction TXID to the seenTxs array so that it's not
          // processed twice. Allows processing of multiple transactions in the
          // same block.
          seenTxs.push(lastTransaction)

          const retObj = {
            lastTransaction: lastTransaction,
            bchBalance: tlUtil.round8(newBchBalance),
            tokenBalance: tlUtil.round8(newTokenBalance)
          }

          // Return the newly detected txid.
          return retObj
        }
      }

      // Return false to signal no detected change in txid.
      wlogger.debug(`compareLastTransaction returning false.`)
      return false
    } catch (err) {
      if (err.code === 'ENETUNREACH') {
        console.log(`Could not connect to rest.bitcoin.com. Will try again.`)
        return
      }

      wlogger.error(`Error in compareLastTransaction: `, err)
      wlogger.error(`obj: ${JSON.stringify(obj, null, 2)}`)
      // throw err
    }
  }

  // Retrieve the current BCH and token balances from the blockchain.
  async getBlockchainBalances (bchAddr) {
    try {
      // Get BCH balance from the blockchain
      const addressInfo = await bch.getBCHBalance(bchAddr, false)
      const currentBCHBalance = addressInfo.balance

      wlogger.debug(`Blockchain balance: ${currentBCHBalance} BCH`)

      return {
        bchBalance: currentBCHBalance
        // tokenBalance: tokenBalance
      }
    } catch (err) {
      wlogger.error(`Error in getBlockchainBalances()`)
      throw err
    }
  }
}

module.exports = TokenLiquidity
