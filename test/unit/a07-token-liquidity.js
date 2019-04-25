/*
  Unit and integration tests for the token-liquidity.js library
*/

'use strict'

const assert = require('chai').assert
const sinon = require('sinon')
const nock = require('nock')

const TokenLiquidity = require('../../src/lib/token-liquidity')

// const bitboxMock = require('bitbox-mock')
// const txMockData = require('./mocks/transactions')

// Used for debugging.
const util = require('util')
util.inspect.defaultOptions = { depth: 1 }

// Determine if this is a Unit or Integration test
// If not specified, default to unit test.
if (!process.env.APP_ENV) process.env.APP_ENV = 'test'
if (!process.env.TEST_ENV) process.env.TEST_ENV = 'unit'
// const REST_URL = `https://trest.bitcoin.com/v2/`

describe('#token-liquidity', () => {
  let sandbox
  let lib

  before(() => {})

  beforeEach(() => {
    lib = new TokenLiquidity()

    // mockedWallet = Object.assign({}, testwallet) // Clone the testwallet
    sandbox = sinon.createSandbox()

    // Activate nock if it's inactive.
    if (!nock.isActive()) nock.activate()
  })

  afterEach(() => {
    // Clean up HTTP mocks.
    nock.cleanAll() // clear interceptor list.
    nock.restore()

    sandbox.restore()
  })
  // Only run these tests for a unit test.
  if (process.env.TEST_ENV === 'unit') {
    describe('compareLastTransaction', () => {
      /*
        it(`should return false if transactions are the same`, async () => {
          const obj = {
            bchAddr: `bchtest:qq8wqgxq0uu4y6k92pw9f7s6hxzfp9umsvtg39pzqf`,
            txid: `9f56ba221d862e41f33b564e49ddffc66ec9b5bcaf4669d40e1d890ade4817bc`,
            bchBalance: 25,
            tokenBalance: 5000
          }

          const result = await lib.compareLastTransaction(obj, tknLib, bchLib, BITBOX)
          console.log(`result: ${util.inspect(result)}`)

          assert.equal(result, false, 'return false expected')
        })
        */
      /*
      it('should send BCH in exchange for tokens', async () => {
        const obj = {
          bchAddr: `bchtest:qq8wqgxq0uu4y6k92pw9f7s6hxzfp9umsvtg39pzqf`,
          txid: `298e9186a2113443f3b2064ee0bf0ae1973434ae48e9ec3c3e27bfea41d41b05`,
          bchBalance: 7.68905269,
          tokenBalance: 100000
        }

        const result = await lib.compareLastTransaction(obj)
        // console.log(`result: ${util.inspect(result)}`)

        // Should return the last transactions, as well as the new balance of BCH
        // and the token.
        assert.hasAllKeys(result, [
          'lastTransaction',
          'bchBalance'
          // 'tokenBalance'
        ])
      })

      it('should send tokens in exchange for BCH', async () => {
        const obj = {
          bchAddr: `bchtest:qq8wqgxq0uu4y6k92pw9f7s6hxzfp9umsvtg39pzqf`,
          txid: `a77762bb47c130e755cc053db51333bbd64596eefd18baffc08a447749863fa9`,
          bchBalance: 7.68905269,
          tokenBalance: 100000
        }
        //

        const result = await lib.compareLastTransaction(obj)
        // console.log(`result: ${util.inspect(result)}`)

        // Should return the last transactions, as well as the new balance of BCH
        // and the token.
        assert.hasAllKeys(result, [
          'lastTransaction',
          'bchBalance'
          // 'tokenBalance'
        ])
      })
      */
    })
  }
})
