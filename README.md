# 🏗 scaffold-eth Ethereum with Dash Storage Example

> This is a fork of [🏗 scaffold-eth](https://github.com/austintgriffith/scaffold-eth.git) drawing *heavily* on the [ipfs-example branch](https://github.com/austintgriffith/scaffold-eth/tree/ipfs-example).

---
## Quickstart  
#### more detail [can be found here.](https://succinctsoftware.com/2020/10/18/using-dash-drive-for-storage-in-an-ethereum-app/)

```bash 
git clone https://github.com/DashBridge-io/scaffold-eth dash-eth-example

cd dash-eth-example

git checkout dash-eth-example 
```

```bash

yarn install

```

> now setup a Dash wallet, identity, and data contract by running

```bash

node setupDash.js

```

> Follow the instructions to get Dash from the faucet and send it to the wallet that was created.
> now start the app by running

```bash

yarn start

```

> in a second terminal window, start a local Ethereum blockchain with:

```bash

yarn chain

```

> in a third terminal window, deploy the smart contract with:

```bash

yarn deploy

```

Smart contract is `Attestor.sol` in `packages/buidler/contracts`

Edit your frontend `App.jsx` in `packages/react-app/src`

Dash Drive interactions `DashTestamentStorage.jsx` in `packages/react-app/src/components/`

Open http://localhost:3000 to see the app

