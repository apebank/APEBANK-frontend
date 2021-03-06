import axios from "axios";

const cache: { [key: string]: number } = {};

export const loadTokenPrices = async () => {
    const url = "https://api.coingecko.com/api/v3/simple/price?ids=usd-coin,boba-network&vs_currencies=usd";
    const { data } = await axios.get(url);

    cache["USDT"] = data["usd-coin"].usd;
    cache["BOBA"] = data["boba-network"].usd;
};

export const getTokenPrice = (symbol: string): number => {
    return Number(cache[symbol]);
};
