import { ethers } from "ethers";
import { LpReserveContract } from "../abi";
import { usdtAPE } from "../helpers/bond";
import { Networks } from "../constants/blockchain";
import { getAddresses } from "../constants/addresses";

export async function getMarketPrice(networkID: Networks, provider: ethers.Signer | ethers.providers.Provider): Promise<number> {
    const lpAddress = usdtAPE.getAddressForReserve(networkID);
    const pairContract = new ethers.Contract(lpAddress, LpReserveContract, provider);
    const reserves = await pairContract.getReserves();
    const token0: string = await pairContract.token0();
    const reserveApe = token0.toLowerCase() == getAddresses(networkID).USDT_ADDRESS ? reserves[1] : reserves[0];
    const reserveUSDT = token0.toLowerCase() == getAddresses(networkID).USDT_ADDRESS ? reserves[0] : reserves[1];
    const marketPrice = (reserveUSDT / reserveApe) * 1000; // 1000 = 10^9 / 10^6, while 9 is decimals of APE and 6 is decimals of USDT
    return marketPrice;
}
