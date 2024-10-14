import {
  TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
  decodeListState,
} from '@tensor-foundation/marketplace';
import { parseBase64RpcAccount } from '@solana/web3.js';
import { rpc } from './common';

export async function getAllListingsByOwner(owner: string) {
  // get all ListState accounts (via dataSize) that match the given owner address
  return await rpc
    .getProgramAccounts(TENSOR_MARKETPLACE_PROGRAM_ADDRESS, {
      encoding: 'base64',
      filters: [
        {
          dataSize: 317n,
        },
        {
          //@ts-ignore: web3.js-next typing inaccuracy?
          memcmp: {
            bytes: owner,
            encoding: 'base58',
            offset: 10n,
          },
        },
      ],
    })
    .send()
    // parse and decode all received ListState accounts
    .then((resp) => {
      //@ts-ignore: web3.js-next typing inaccuracy?
      return resp.map((acc) => {
        const parsedAcc = parseBase64RpcAccount(acc.pubkey, acc.account);
        return decodeListState(parsedAcc);
      });
    });
}
