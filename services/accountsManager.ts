import { Keypair, PublicKey } from '@solana/web3.js'
interface AccountName {
    name: string;
    address: PublicKey;
}
class AccountsManager {
    keys: Array<AccountName> = [];
    constructor() {
        let json = localStorage.getItem("AccountsManager");
        if (json) {
            this.keys = JSON.parse(json).keys;
        }
    }
    addAccount(name: string, address: PublicKey) {
        this.keys.push({
            address,
            name
        });
        localStorage.setItem("AccountsManager", JSON.stringify(this))
    }
    removeAccount(name: string) {
        this.keys.filter((v)=>v.name != name)
        localStorage.setItem("AccountsManager", JSON.stringify(this))
    }
}
const accountsManager = new AccountsManager();
export default accountsManager;