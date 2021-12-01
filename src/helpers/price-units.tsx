import { SvgIcon } from "@material-ui/core";
import USDTImg from "../assets/tokens/USDT.png";
import { IAllBondData } from "../hooks/bonds";
import { usdt } from "../helpers/bond";

export const priceUnits = (bond: IAllBondData) => {
    // if (bond.name === usdt.name) return <SvgIcon component={USDTImg} viewBox="0 0 32 32" style={{ height: "15px", width: "15px" }} />;

    return "$";
};
