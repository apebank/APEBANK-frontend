import { BLOCK_RATE_SECONDS } from "./bond/constants";

export const secondsUntilBlock = (startBlock: number, endBlock: number) => {
    return (endBlock - startBlock) * BLOCK_RATE_SECONDS;
};
