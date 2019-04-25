# slp-rewards
This is an application for providing SLP token rewards, when BCH is received. 
This application focuses on the [Simple Leger Protocol](https://simpleledger.cash/) for creating tokens on the BCH network.

Inspired by and branched from [token-liquidity](https://github.com/Permissionless-Software-Foundation/token-liquidity).

The idea is simple. This program monitors a BCH public address. If you send BCH to the address, the program will send you tokens as a reward.
The number of tokens rewarded is determined by simple input_bch to output_tokens ratio (e.g. 1:1 or 1:100).

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com)

[![Build Status](https://travis-ci.org/ProtocolCash/slp-rewards.svg?branch=master)](https://travis-ci.org/ProtocolCash/slp-rewards)

## License
MIT
