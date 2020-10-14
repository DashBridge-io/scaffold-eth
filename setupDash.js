/*
Executing this file will create a new Wallet, Identity, and Data Contract on the DASH EVO test 
Netork and replace tokens in /packages/react-app/src/components/DashTestamentStorage.jsx with
the appropriate values.
*/

const Dash = require('dash');
const delay = require('delay');
const replace = require("replace");

const clientOpts = {
    network: 'evonet',
    wallet: {
        mnemonic: null,
    }
};

const client = new Dash.Client(clientOpts);
var account;
var identity;

async function createWallet() {
    try {
        console.log('\nConnecting to Dash account...');
        account = await client.wallet.getAccount();
        await account.isReady();
        console.log('connected....creating new Dash wallet.');

        clientOpts.wallet.mnemonic = client.wallet.exportWallet();
        const address = account.getUnusedAddress();
    } catch (e) {
        console.error('Something went wrong:', e);
    }
    return clientOpts.wallet.mnemonic;
}

async function checkForFunds() {
    process.stdout.write('Waiting for funds');
    while (account.getTotalBalance() == 0) {
        funds = account.getTotalBalance();
        process.stdout.write(".");
        await delay(1000);
    }
    console.log('Funds received.');
}

const createIdentity = async function () {
    console.log('\nCreating DASH Identity...');
    try {
        const platform = client.platform;
        identity = await platform.identities.register();
        console.log("Created DASH identity: " + identity.id);
        return identity.id;
    } catch (e) {
        console.error('Something went wrong:', e);
    }
}

const registerContract = async function () {
    console.log("\nRegistering Data Contract...");
    try {
        const platform = client.platform;

        const contractDocuments = {
            attestation: {
                properties: {
                    statement: {
                        type: "string"
                    }
                },
                additionalProperties: false
            }
        };

        const contract = await platform.contracts.create(contractDocuments, identity);
        console.log("\nData contract" + contract.id + " created.");

        // Make sure contract passes validation checks
        const validationResult = await platform.dpp.dataContract.validate(contract);

        if (validationResult.isValid()) {
            console.log("\nContract validation passed, broadcasting contract..");
            // Sign and submit the data contract
            await platform.contracts.broadcast(contract, identity);
        } else {
            console.error(validationResult) // An array of detailed validation errors
            throw validationResult.errors[0];
        }
        console.log('\nData contract validation complete.');
        return contract.id;
    } catch (e) {
        console.error('Something went wrong:', e);
    } 
}

function replaceTokens(token, value) {
    replace({
        regex: token,
        replacement: value,
        paths: ['./packages/react-app/src/components/DashTestamentStorage.jsx'],
        silent: true
    });
}

async function setupDashStorage() {
    var wallet_mnemonic = await createWallet();
    console.log("\n\nGo to http://faucet.evonet.networks.dash.org/ and send funds to " + account.getUnusedAddress().address);
    await checkForFunds();
    console.log("Wallet Balance: " + (account.getTotalBalance() / 100000000) + " DASH");
    
    var identityId = await createIdentity();
    var contractId = await registerContract();

    console.log("replacing wallet mnemonic, identity ID and data contract ID in DashTestamentStorage.jsx");
    replaceTokens("<-- replace with wallet mnemonic -->", wallet_mnemonic);
    replaceTokens("<-- replace with DASH Identity Id -->", identityId);
    replaceTokens("<-- replace with DASH data contract ID -->", contractId);
    
    client.disconnect()
}

setupDashStorage()
