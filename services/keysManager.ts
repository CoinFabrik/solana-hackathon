import { Keypair } from '@solana/web3.js'
interface KeypairName {
    name: string;
    keypair: Keypair;
}
class KeyManager {
    keys: Array<KeypairName> = [];
    constructor() {
        let json = localStorage.getItem("KeyManager");
        if (json) {
            this.keys = JSON.parse(json).keys;
        }
    }
    newKey(name: string|undefined) {
        let keypair = Keypair.generate();
        this.addKey(
            name?name:keypair.publicKey.toBase58(),
            keypair
        );
    }
    addKey(name: string, keypair: Keypair) {
        this.keys.push({
            keypair,
            name
        });
        localStorage.setItem("KeyManager", JSON.stringify(this))
    }
    removeKey(name: string) {
        this.keys.filter((v)=>v.name != name)
        localStorage.setItem("KeyManager", JSON.stringify(this))
    }
}
const keyManager = new KeyManager();
export default keyManager;