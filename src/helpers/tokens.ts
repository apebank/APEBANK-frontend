import ETHICON from "../assets/tokens/ETH.png";
import USDTICON from "../assets/tokens/USDT.png";
import APEICON from "../assets/tokens/APE.png";
import BobaICON from "../assets/tokens/BOBA.png";
import USDTAPEICON from "../assets/tokens/USDT-APE.png";
import { getAddresses, Networks } from "src/constants";

export interface IToken {
    name: string;
    img: string;
    isETH?: boolean;
    decimals: number;
}

export const eth: IToken = {
    name: "ETH",
    isETH: true,
    img: ETHICON,
    decimals: 18,
};

const usdt: IToken = {
    name: "USDT",
    img: USDTICON,
    decimals: 6,
};

const boba: IToken = {
    name: "BOBA",
    img: BobaICON,
    decimals: 18,
};

const ape: IToken = {
    name: "APE",
    img: APEICON,
    decimals: 9,
};

export const sape: IToken = {
    name: "sAPE",
    img: APEICON,
    decimals: 9,
};

export const usdt_ape: IToken = {
    name: "USDT_APE_LP",
    img: USDTAPEICON,
    decimals: 18,
};

export const getTokenAddress = (networkId: number, name: string): string => {
    const addresses: any = getAddresses(networkId);
    const key: string = `${name}_ADDRESS`;
    if (addresses) {
        return addresses[key];
    }
    return "";
};

export default [eth, ape, sape, usdt, boba, usdt_ape];
