import { Networks } from "../../constants/blockchain";
import { LPBond, CustomLPBond } from "./lp-bond";
import { StableBond, CustomBond } from "./stable-bond";

import USDTIcon from "../../assets/tokens/USDT.png";
import BobaIcon from "../../assets/tokens/BOBA.png";
import USDTAPEIcon from "../../assets/tokens/USDT-APE.png";

import { StableBondContract, LpBondContract, WavaxBondContract, StableReserveContract, LpReserveContract, BondDepositoryContract } from "../../abi";
import { getAddresses } from "src/constants";

export const usdt = new StableBond({
    name: "usdt",
    displayName: "USDC",
    bondToken: "USDT",
    decimals: 6,
    bondIconSvg: USDTIcon,
    bondContractABI: BondDepositoryContract,
    reserveContractAbi: StableReserveContract,
    networkAddrs: {
        [Networks.TESTNET]: {
            bondAddress: getAddresses(Networks.TESTNET).USDT_BOND_ADDRESS,
            reserveAddress: getAddresses(Networks.TESTNET).USDT_ADDRESS,
        },
        [Networks.MAINNET]: {
            bondAddress: getAddresses(Networks.MAINNET).USDT_BOND_ADDRESS,
            reserveAddress: getAddresses(Networks.MAINNET).USDT_ADDRESS,
        },
    },
    tokensInStrategy: "0",
});

export const boba = new CustomBond({
    name: "boba",
    displayName: "BOBA",
    bondToken: "BOBA",
    bondIconSvg: BobaIcon,
    bondContractABI: BondDepositoryContract,
    reserveContractAbi: StableReserveContract,
    networkAddrs: {
        [Networks.TESTNET]: {
            bondAddress: getAddresses(Networks.TESTNET).BOBA_BOND_ADDRESS,
            reserveAddress: getAddresses(Networks.TESTNET).BOBA_ADDRESS,
        },
        [Networks.MAINNET]: {
            bondAddress: getAddresses(Networks.MAINNET).BOBA_BOND_ADDRESS,
            reserveAddress: getAddresses(Networks.MAINNET).BOBA_ADDRESS,
        },
    },
    tokensInStrategy: "0",
});

export const usdtAPE = new LPBond({
    name: "usdt_ape_lp",
    displayName: "APE-USDC LP",
    bondToken: "APE",
    bondIconSvg: USDTAPEIcon,
    bondContractABI: BondDepositoryContract,
    reserveContractAbi: LpReserveContract,
    networkAddrs: {
        [Networks.TESTNET]: {
            bondAddress: getAddresses(Networks.TESTNET).USDT_APE_LP_BOND_ADDRESS,
            reserveAddress: getAddresses(Networks.TESTNET).USDT_APE_LP_ADDRESS,
        },
        [Networks.MAINNET]: {
            bondAddress: getAddresses(Networks.MAINNET).USDT_APE_LP_BOND_ADDRESS,
            reserveAddress: getAddresses(Networks.MAINNET).USDT_APE_LP_ADDRESS,
        },
    },
    lpUrl: "https://www.traderjoexyz.com/#/pool/0x130966628846BFd36ff31a822705796e8cb8C18D/0xb54f16fB19478766A268F172C9480f8da1a7c9C3",
});

// export const avaxTime = new CustomLPBond({
//     name: "avax_time_lp",
//     displayName: "TIME-AVAX LP",
//     bondToken: "AVAX",
//     bondIconSvg: AvaxTimeIcon,
//     bondContractABI: LpBondContract,
//     reserveContractAbi: LpReserveContract,
//     networkAddrs: {
//         [Networks.TESTNET]: {
//             bondAddress: "0xc26850686ce755FFb8690EA156E5A6cf03DcBDE1",
//             reserveAddress: "0xf64e1c5B6E17031f5504481Ac8145F4c3eab4917",
//         },
//         [Networks.MAINNET]: {
//             bondAddress: "0xc26850686ce755FFb8690EA156E5A6cf03DcBDE1",
//             reserveAddress: "0xf64e1c5B6E17031f5504481Ac8145F4c3eab4917",
//         },
//     },
//     lpUrl: "https://www.traderjoexyz.com/#/pool/AVAX/0xb54f16fB19478766A268F172C9480f8da1a7c9C3",
// });

export default [usdt, boba, usdtAPE];
// export default [boba];
