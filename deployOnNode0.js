const { EVMLC, DataDirectory } = require('evm-lite-lib');

const path = require('path');
const os = require('os');

const compile = require('./classes/compile');
const ClaimHub = require('./classes/ClaimHub');

// Default from address
const from = '0X3F9D41ECEA757FC4E2B44BE3B38A788DE2F11AD7';

// EVMLC object
const evmlc = new EVMLC('evm0.capjupiter.com', 8080, {
  from,
  gas: 1000000,
  gasPrice: 0,
});

// Keystore object
const directory = new DataDirectory(
  path.join(os.homedir(), '.evmlc'),
);
const password = 'password';

// Get keystore object from the keystore directory
// For the from address so we can decrypt and sign
const accountDecrypt = async () => {
  const account = await directory.keystore.decryptAccount(
    evmlc.defaultFrom,
    password,
  );
  return account;
};

// Generate contract object with ABI and data
const loadContract = async () => {
  const compiled = compile.compile('claimHub', 'claimHub');
  const contract = await evmlc.contracts.load(compiled.abi, {
    data: compiled.bytecode,
  });
  return contract;
};

const deployContract = async () => {
  const account = await accountDecrypt();
  const contract = await loadContract();
  const claimHub = new ClaimHub.ClaimHub(contract, account);
  const response = await claimHub.deploy();
  return response;
};

deployContract()
  .then(res => console.log(res))
  .catch(error => console.log(error));