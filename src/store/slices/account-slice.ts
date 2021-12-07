import { ethers } from "ethers";
import { getAddresses } from "../../constants";
import { APETokenContract, sAPETokenContract, USDTTokenContract, wsAPETokenContract } from "../../abi";
import { setAll } from "../../helpers";

import { createSlice, createSelector, createAsyncThunk } from "@reduxjs/toolkit";
import { JsonRpcProvider, StaticJsonRpcProvider } from "@ethersproject/providers";
import { Bond } from "../../helpers/bond/bond";
import { Networks } from "../../constants/blockchain";
import React from "react";
import { RootState } from "../store";
import { getTokenAddress, IToken } from "../../helpers/tokens";

interface IGetBalances {
    address: string;
    networkID: Networks;
    provider: StaticJsonRpcProvider | JsonRpcProvider;
}

interface IAccountBalances {
    balances: {
        sape: string;
        ape: string;
        // wsape: string;
    };
}

export const getBalances = createAsyncThunk("account/getBalances", async ({ address, networkID, provider }: IGetBalances): Promise<IAccountBalances> => {
    const addresses = getAddresses(networkID);

    const sapeContract = new ethers.Contract(addresses.sAPE_ADDRESS, sAPETokenContract, provider);
    const sapeBalance = await sapeContract.balanceOf(address);
    const apeContract = new ethers.Contract(addresses.APE_ADDRESS, APETokenContract, provider);
    const apeBalance = await apeContract.balanceOf(address);
    // const wmemoContract = new ethers.Contract(addresses.wsAPE_ADDRESS, wsAPETokenContract, provider);
    // const wmemoBalance = await wmemoContract.balanceOf(address);

    return {
        balances: {
            sape: ethers.utils.formatUnits(sapeBalance, "gwei"),
            ape: ethers.utils.formatUnits(apeBalance, "gwei"),
            // wsape: ethers.utils.formatEther(wmemoBalance),
        },
    };
});

interface ILoadAccountDetails {
    address: string;
    networkID: Networks;
    provider: StaticJsonRpcProvider | JsonRpcProvider;
}

interface IUserAccountDetails {
    balances: {
        ape: string;
        sape: string;
        // wsape: string;
    };
    staking: {
        ape: number;
        sape: number;
    };
    // wrapping: {
    //     sape: number;
    // };
}

export const loadAccountDetails = createAsyncThunk("account/loadAccountDetails", async ({ networkID, provider, address }: ILoadAccountDetails): Promise<IUserAccountDetails> => {
    let apeBalance = 0;
    let sapeBalance = 0;

    let wmemoBalance = 0;
    let memoWmemoAllowance = 0;

    let stakeAllowance = 0;
    let unstakeAllowance = 0;

    const addresses = getAddresses(networkID);

    if (addresses.APE_ADDRESS) {
        const timeContract = new ethers.Contract(addresses.APE_ADDRESS, APETokenContract, provider);
        apeBalance = await timeContract.balanceOf(address);
        stakeAllowance = await timeContract.allowance(address, addresses.STAKING_HELPER_ADDRESS);
    }

    if (addresses.sAPE_ADDRESS) {
        const memoContract = new ethers.Contract(addresses.sAPE_ADDRESS, sAPETokenContract, provider);
        sapeBalance = await memoContract.balanceOf(address);
        unstakeAllowance = await memoContract.allowance(address, addresses.STAKING_ADDRESS);

        // if (addresses.wsAPE_ADDRESS) {
        //     memoWmemoAllowance = await memoContract.allowance(address, addresses.wsAPE_ADDRESS);
        // }
    }

    // if (addresses.wsAPE_ADDRESS) {
    //     const wmemoContract = new ethers.Contract(addresses.wsAPE_ADDRESS, wsAPETokenContract, provider);
    //     wmemoBalance = await wmemoContract.balanceOf(address);
    // }

    return {
        balances: {
            sape: ethers.utils.formatUnits(sapeBalance, "gwei"),
            ape: ethers.utils.formatUnits(apeBalance, "gwei"),
            // wsape: ethers.utils.formatEther(wmemoBalance),
        },
        staking: {
            ape: Number(stakeAllowance),
            sape: Number(unstakeAllowance),
        },
        // wrapping: {
        //     sape: Number(memoWmemoAllowance),
        // },
    };
});

interface ICalcUserBondDetails {
    address: string;
    bond: Bond;
    provider: StaticJsonRpcProvider | JsonRpcProvider;
    networkID: Networks;
}

export interface IUserBondDetails {
    allowance: number;
    balance: number;
    ethBalance: number;
    interestDue: number;
    bondMaturationBlock: number;
    pendingPayout: number; //Payout formatted in gwei.
}

export const calculateUserBondDetails = createAsyncThunk("account/calculateUserBondDetails", async ({ address, bond, networkID, provider }: ICalcUserBondDetails) => {
    if (!address) {
        return new Promise<any>(resevle => {
            resevle({
                bond: "",
                displayName: "",
                bondIconSvg: "",
                isLP: false,
                allowance: 0,
                balance: 0,
                interestDue: 0,
                bondMaturationBlock: 0,
                pendingPayout: "",
                ethBalance: 0,
            });
        });
    }

    const bondContract = bond.getContractForBond(networkID, provider);
    const reserveContract = bond.getContractForReserve(networkID, provider);

    let interestDue, pendingPayout, bondMaturationBlock;

    const bondDetails = await bondContract.bondInfo(address);
    interestDue = bondDetails.payout / Math.pow(10, 9);
    bondMaturationBlock = Number(bondDetails.vesting) + Number(bondDetails.lastBlock);
    pendingPayout = await bondContract.pendingPayoutFor(address);

    let allowance,
        balance = "0";

    allowance = await reserveContract.allowance(address, bond.getAddressForBond(networkID));
    balance = await reserveContract.balanceOf(address);
    const decimals = await reserveContract.decimals();
    const balanceVal = decimals == 18 ? ethers.utils.formatEther(balance) : Number(balance) / Math.pow(10, decimals);

    const ethBalance = await provider.getSigner().getBalance();
    const etherVal = ethers.utils.formatEther(ethBalance);

    const pendingPayoutVal = ethers.utils.formatUnits(pendingPayout, "gwei");

    return {
        bond: bond.name,
        displayName: bond.displayName,
        bondIconSvg: bond.bondIconSvg,
        isLP: bond.isLP,
        allowance: Number(allowance),
        balance: Number(balanceVal),
        ethBalance: Number(etherVal),
        interestDue,
        bondMaturationBlock,
        pendingPayout: Number(pendingPayoutVal),
    };
});

interface ICalcUserTokenDetails {
    address: string;
    token: IToken;
    provider: StaticJsonRpcProvider | JsonRpcProvider;
    networkID: Networks;
}

export interface IUserTokenDetails {
    allowance: number;
    balance: number;
    isETH?: boolean;
}

export const calculateUserTokenDetails = createAsyncThunk("account/calculateUserTokenDetails", async ({ address, token, networkID, provider }: ICalcUserTokenDetails) => {
    if (!address) {
        return new Promise<any>(resevle => {
            resevle({
                token: "",
                address: "",
                img: "",
                allowance: 0,
                balance: 0,
            });
        });
    }

    if (token.isETH) {
        const ethBalance = await provider.getSigner().getBalance();
        const etherVal = ethers.utils.formatEther(ethBalance);

        return {
            token: token.name,
            tokenIcon: token.img,
            balance: Number(etherVal),
            isETH: true,
        };
    }

    const addresses = getAddresses(networkID);
    const tokenAddress = getTokenAddress(networkID, token.name);

    const tokenContract = new ethers.Contract(tokenAddress, USDTTokenContract, provider);
    let allowance,
        balance = "0";

    allowance = 0; //await tokenContract.allowance(address, addresses.ZAPIN_ADDRESS);
    balance = await tokenContract.balanceOf(address);

    const balanceVal = Number(balance) / Math.pow(10, token.decimals);

    return {
        token: token.name,
        address: tokenAddress,
        img: token.img,
        allowance: Number(allowance),
        balance: Number(balanceVal),
    };
});

export interface IAccountSlice {
    bonds: { [key: string]: IUserBondDetails };
    balances: {
        sape: string;
        ape: string;
        wsape: string;
    };
    loading: boolean;
    staking: {
        ape: number;
        sape: number;
    };
    wrapping: {
        sape: number;
    };
    tokens: { [key: string]: IUserTokenDetails };
}

const initialState: IAccountSlice = {
    loading: true,
    bonds: {},
    balances: { sape: "", ape: "", wsape: "" },
    staking: { ape: 0, sape: 0 },
    wrapping: { sape: 0 },
    tokens: {},
};

const accountSlice = createSlice({
    name: "account",
    initialState,
    reducers: {
        fetchAccountSuccess(state, action) {
            setAll(state, action.payload);
        },
    },
    extraReducers: builder => {
        builder
            .addCase(loadAccountDetails.pending, state => {
                state.loading = true;
            })
            .addCase(loadAccountDetails.fulfilled, (state, action) => {
                setAll(state, action.payload);
                state.loading = false;
            })
            .addCase(loadAccountDetails.rejected, (state, { error }) => {
                state.loading = false;
                console.log(error);
            })
            .addCase(getBalances.pending, state => {
                state.loading = true;
            })
            .addCase(getBalances.fulfilled, (state, action) => {
                setAll(state, action.payload);
                state.loading = false;
            })
            .addCase(getBalances.rejected, (state, { error }) => {
                state.loading = false;
                console.log(error);
            })
            .addCase(calculateUserBondDetails.pending, (state, action) => {
                state.loading = true;
            })
            .addCase(calculateUserBondDetails.fulfilled, (state, action) => {
                if (!action.payload) return;
                const bond = action.payload.bond;
                state.bonds[bond] = action.payload;
                state.loading = false;
            })
            .addCase(calculateUserBondDetails.rejected, (state, { error }) => {
                state.loading = false;
                console.log(error);
            })
            .addCase(calculateUserTokenDetails.pending, (state, action) => {
                state.loading = true;
            })
            .addCase(calculateUserTokenDetails.fulfilled, (state, action) => {
                if (!action.payload) return;
                const token = action.payload.token;
                state.tokens[token] = action.payload;
                state.loading = false;
            })
            .addCase(calculateUserTokenDetails.rejected, (state, { error }) => {
                state.loading = false;
                console.log(error);
            });
    },
});

export default accountSlice.reducer;

export const { fetchAccountSuccess } = accountSlice.actions;

const baseInfo = (state: RootState) => state.account;

export const getAccountState = createSelector(baseInfo, account => account);
