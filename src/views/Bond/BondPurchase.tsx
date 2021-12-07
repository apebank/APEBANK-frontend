import { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Box, OutlinedInput, InputAdornment, Slide, FormControl } from "@material-ui/core";
import { shorten, trim, prettifySeconds, secondsUntilBlock } from "../../helpers";
import { changeApproval, bondAsset, calcBondDetails } from "../../store/slices/bond-slice";
import { useWeb3Context } from "../../hooks";
import { IPendingTxn, isPendingTxn, txnButtonText } from "../../store/slices/pending-txns-slice";
import { Skeleton } from "@material-ui/lab";
import { IReduxState } from "../../store/slices/state.interface";
import { IAllBondData } from "../../hooks/bonds";
import useDebounce from "../../hooks/debounce";
import { messages } from "../../constants/messages";
import { warning } from "../../store/slices/messages-slice";

interface IBondPurchaseProps {
    bond: IAllBondData;
    slippage: number;
}

function BondPurchase({ bond, slippage }: IBondPurchaseProps) {
    const dispatch = useDispatch();
    const { provider, address, chainID, checkWrongNetwork } = useWeb3Context();

    const [quantity, setQuantity] = useState("");
    const [useETH, setUseETH] = useState(false);

    const isBondLoading = useSelector<IReduxState, boolean>(state => state.bonding.loading ?? true);
    const currentBlock = useSelector<IReduxState, number>(state => {
        return state.app.currentBlock;
    });
    const [zapinOpen, setZapinOpen] = useState(false);

    const pendingTransactions = useSelector<IReduxState, IPendingTxn[]>(state => {
        return state.pendingTransactions;
    });

    const vestingPeriod = () => {
        const vestingBlock = currentBlock + bond.vestingTerm;
        const seconds = secondsUntilBlock(currentBlock, vestingBlock);
        return prettifySeconds(seconds, "day");
        // return prettifySeconds(bond.vestingTerm, "day");
    };

    async function onBond() {
        if (await checkWrongNetwork()) return;

        if (quantity === "") {
            dispatch(warning({ text: messages.before_bonding }));
            //@ts-ignore
        } else if (isNaN(quantity)) {
            dispatch(warning({ text: messages.before_bonding }));
        } else if (bond.interestDue > 0 || bond.pendingPayout > 0) {
            const shouldProceed = window.confirm(messages.existing_bond);
            if (shouldProceed) {
                const trimBalance = trim(Number(quantity), 18);

                await dispatch(
                    bondAsset({
                        value: trimBalance,
                        slippage,
                        bond,
                        networkID: chainID,
                        provider,
                        address,
                        useETH,
                    }),
                );
                clearInput();
            }
        } else {
            const trimBalance = trim(Number(quantity), 18);
            await dispatch(
                bondAsset({
                    value: trimBalance,
                    slippage,
                    bond,
                    networkID: chainID,
                    provider,
                    address,
                    useETH,
                }),
            );
            clearInput();
        }
    }

    const clearInput = () => {
        setQuantity("");
    };

    const hasAllowance = useCallback(() => {
        return bond.allowance > 0;
    }, [bond.allowance]);

    const setMax = () => {
        let amount: any = Math.min(bond.maxBondPriceToken * 0.9999, useETH ? bond.ethBalance * 0.99 : bond.balance);
        console.log("before", amount);
        if (amount) {
            amount = trim(amount);
        }
        console.log("after", amount);

        setQuantity((amount || "").toString());
    };

    const bondDetailsDebounce = useDebounce(quantity, 1000);

    useEffect(() => {
        dispatch(calcBondDetails({ bond, value: quantity, provider, networkID: chainID }));
    }, [bondDetailsDebounce]);

    const onSeekApproval = async () => {
        if (await checkWrongNetwork()) return;

        dispatch(changeApproval({ address, bond, provider, networkID: chainID }));
    };

    const handleZapinOpen = () => {
        dispatch(calcBondDetails({ bond, value: "0", provider, networkID: chainID }));
        setZapinOpen(true);
    };

    const handleZapinClose = () => {
        dispatch(calcBondDetails({ bond, value: quantity, provider, networkID: chainID }));
        setZapinOpen(false);
    };

    const displayUnits = useETH ? "ETH" : bond.displayUnits;

    return (
        <Box display="flex" flexDirection="column">
            <Box display="flex" justifyContent="space-around" flexWrap="wrap">
                {bond.name === "weth" && (
                    <FormControl className="ohm-input" variant="outlined" color="primary" fullWidth>
                        <div className="avax-checkbox">
                            <input type="checkbox" checked={useETH} onClick={() => setUseETH(!useETH)} />
                            <p>Use ETH</p>
                        </div>
                    </FormControl>
                )}
                <FormControl className="bond-input-wrap" variant="outlined" color="primary" fullWidth>
                    <OutlinedInput
                        placeholder="Amount"
                        type="number"
                        value={quantity}
                        onChange={e => setQuantity(e.target.value)}
                        labelWidth={0}
                        className="bond-input"
                        endAdornment={
                            <InputAdornment position="end">
                                <div className="stake-input-btn" onClick={setMax}>
                                    <p>Max</p>
                                </div>
                            </InputAdornment>
                        }
                    />
                </FormControl>
                {hasAllowance() || useETH ? (
                    <div
                        className="transaction-button bond-approve-btn"
                        onClick={async () => {
                            if (isPendingTxn(pendingTransactions, "bond_" + bond.name)) return;
                            await onBond();
                        }}
                    >
                        <p>{txnButtonText(pendingTransactions, "bond_" + bond.name, "Bond")}</p>
                    </div>
                ) : (
                    <div
                        className="transaction-button bond-approve-btn"
                        onClick={async () => {
                            if (isPendingTxn(pendingTransactions, "approve_" + bond.name)) return;
                            await onSeekApproval();
                        }}
                    >
                        <p>{txnButtonText(pendingTransactions, "approve_" + bond.name, "Approve")}</p>
                    </div>
                )}

                {/* <div className="transaction-button bond-approve-btn" onClick={handleZapinOpen}>
                    <p>Zap</p>
                </div> */}

                {!hasAllowance() && !useETH && (
                    <div className="help-text">
                        <p className="help-text-desc">
                            Note: The "Approve" transaction is only needed when bonding for the first time; subsequent minting only requires you to perform the "Bond" transaction.
                        </p>
                    </div>
                )}
            </Box>

            <Slide direction="left" in={true} mountOnEnter unmountOnExit {...{ timeout: 533 }}>
                <Box className="bond-data">
                    <div className="data-row">
                        <p className="bond-balance-title">Your Balance</p>
                        <p className="bond-balance-title">
                            {isBondLoading ? (
                                <Skeleton width="100px" />
                            ) : (
                                <>
                                    {trim(useETH ? bond.ethBalance : bond.balance, 10)} {displayUnits}
                                </>
                            )}
                        </p>
                    </div>

                    <div className="data-row">
                        <p className="bond-balance-title">You Will Get</p>
                        <p className="price-data bond-balance-title">{isBondLoading ? <Skeleton width="100px" /> : `${trim(bond.bondQuote, 4)} APE`}</p>
                    </div>

                    <div className={`data-row`}>
                        <p className="bond-balance-title">Max You Can Buy</p>
                        <p className="price-data bond-balance-title">{isBondLoading ? <Skeleton width="100px" /> : `${trim(bond.maxBondPrice, 4)} APE`}</p>
                    </div>

                    <div className="data-row">
                        <p className="bond-balance-title">ROI</p>
                        <p className="bond-balance-title">{isBondLoading ? <Skeleton width="100px" /> : `${trim(bond.bondDiscount * 100, 2)}%`}</p>
                    </div>

                    <div className="data-row">
                        <p className="bond-balance-title">Vesting Term</p>
                        <p className="bond-balance-title">{isBondLoading ? <Skeleton width="100px" /> : vestingPeriod()}</p>
                    </div>

                    <div className="data-row">
                        <p className="bond-balance-title">Minimum purchase</p>
                        <p className="bond-balance-title">0.01 APE</p>
                    </div>
                </Box>
            </Slide>
        </Box>
    );
}

export default BondPurchase;
