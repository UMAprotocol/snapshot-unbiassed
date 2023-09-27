const { timelockDecrypt, timelockEncrypt } = require('tlock-js');
const { HttpChainClient, HttpCachingChain } = require('drand-client');

const fs = require('fs');

const testnetUnchainedUrl =
  'https://pl-eu.testnet.drand.sh/f3827d772c155f95a9fda8901ddd59591a082df5ac6efe3a479ddb1f5eeb202c';

const getFastestNode = async () => {
  const chain = new HttpCachingChain(testnetUnchainedUrl);
  const client = new HttpChainClient(chain);

  return client;
};

async function timelockEncryption(message) {
  const fastestNodeClient = await getFastestNode();
  const latestRound = await fastestNodeClient.latest();
  const chain = new HttpCachingChain(testnetUnchainedUrl);

  const result = await timelockEncrypt(
    latestRound.round + 1,
    Buffer.from(message),
    fastestNodeClient
  );

  return result;
}

async function timelockEncryptionForOshhhnap(message, proposalId, duration) {
  let result = await timelockEncryption(message, duration);

  console.log('TimeLock Encryption Result: ', result);

  // We need to append the ID to the ciphertext, so we can decrypt it later
  // and know which proposal it belongs to.
  result = `${result}__ID__${proposalId}`;

  return result;
}

async function timelockDecryption(ciphertext) {
  const fastestNodeClient = await getFastestNode();
  const result = await timelockDecrypt(ciphertext, fastestNodeClient);
  return result;
}

async function timelockDecryptionForOshhhnap(ciphertext) {
  const fastestNodeClient = await getFastestNode();
  const latestRound = await fastestNodeClient.latest();
  const chain = new HttpCachingChain(testnetUnchainedUrl);
  console.log('Current round ', latestRound.round);
  return await timelockDecryption(ciphertext);
}

// timelockEncryption('Hello World', 30).then(result => {
//   console.log(result);
// });

const main = async () => {
  const cypher = fs.readFileSync('./src/input.txt', 'utf8');

  const decrypted = await timelockDecryptionForOshhhnap(cypher);

  console.log('Decrypted: ', decrypted.toString());
};

main();
