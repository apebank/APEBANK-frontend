import { getDefaultNetwork } from "../constants/blockchain";

const switchRequest = () => {
    return window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: getDefaultNetwork().chainId }],
    });
};

const addChainRequest = () => {
    return window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [getDefaultNetwork()],
    });
};

export const swithNetwork = async () => {
    if (window.ethereum) {
        try {
            let res = await switchRequest();
            if (res && res.error) {
                await addChainRequest();
            }
        } catch (error: any) {
            if (error.code === 4902) {
                try {
                    await addChainRequest();
                    await switchRequest();
                } catch (addError) {
                    console.log(error);
                }
            }
            console.log(error);
        }
    }
};
