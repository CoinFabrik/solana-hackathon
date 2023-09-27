
import { AnchorProvider, Idl, Program } from '@coral-xyz/anchor';
import { PublicKey, Connection, Keypair } from '@solana/web3.js'
import VirtualWallet from './virtualWallet';
interface ProgramWAddress {
    idl: Idl;
    address: PublicKey;
}
class ProgramsManager {
    programs: Array<ProgramWAddress> = [];
    constructor() {
        let json = localStorage.getItem("ProgramsManager");
        if (json) {
            this.programs = JSON.parse(json).programs;
        }
    }
    async addProgram(address: PublicKey) {
        const provider = new AnchorProvider(
            new Connection("https://api.devnet.solana.com"),
            new VirtualWallet(Keypair.generate()),
            AnchorProvider.defaultOptions()
        )
        const programIdl = await Program.fetchIdl(address, provider);
        if (programIdl){
            this.programs.push({
                address: address,
                idl: programIdl,
            });
            localStorage.setItem("ProgramsManager", JSON.stringify(this))
        }
    }
    removeProgram(address: PublicKey) {
        this.programs = this.programs.filter((v)=>v.address != address);
        localStorage.setItem("ProgramsManager", JSON.stringify(this))
    }
}

const programsManager = new ProgramsManager();
export default programsManager;