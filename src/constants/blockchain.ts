export const TOKEN_DECIMALS = 9;

export enum Networks {
    TESTNET = 3,
    MAINNET = 288,
}

export const DEFAULD_NETWORK = Number(process.env.REACT_APP_DEFAULT_NETWORK);

export const getDefaultNetwork = () => {
    if (DEFAULD_NETWORK == Number(Networks.TESTNET)) {
        return {
            chainId: "0x3",
            chainName: "Ethereum Testnet Ropsten",
            rpcUrls: ["https://ropsten.infura.io/v3/${INFURA_API_KEY}"],
            blockExplorerUrls: ["https://ropsten.etherscan.io"],
            nativeCurrency: {
                name: "ETH",
                symbol: "ETH",
                decimals: 18,
            },
        };
    }
    return {
        chainId: "0x1c",
        chainName: "Boba Network",
        rpcUrls: ["https://mainnet.boba.network/"],
        blockExplorerUrls: ["https://blockexplorer.boba.network/"],
        nativeCurrency: {
            name: "ETH",
            symbol: "ETH",
            decimals: 18,
        },
    };
};
