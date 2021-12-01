import usdtImg from "../assets/tokens/USDT.png";
import APEImg from "../assets/tokens/APE.png";

function toUrl(tokenPath: string): string {
    const host = window.location.origin;
    return `${host}/${tokenPath}`;
}

export function getTokenUrl(name: string) {
    if (name === "usdt") {
        return usdtImg.indexOf("data:image") > -1 ? usdtImg : toUrl(usdtImg);
    }
    console.log(toUrl(APEImg));
    if (name === "sape") {
        return APEImg.indexOf("data:image") > -1 ? APEImg : toUrl(APEImg);
    }

    if (name === "ape") {
        return APEImg.indexOf("data:image") > -1 ? APEImg : toUrl(APEImg);
    }

    throw Error(`Token url doesn't support: ${name}`);
}
