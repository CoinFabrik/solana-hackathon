"use client"
import { Dispatch, createContext, useState } from 'react';
import { AnchorProvider, Idl, Program } from '@coral-xyz/anchor';
import { PublicKey, Connection, Keypair } from '@solana/web3.js'
import VirtualWallet from './virtualWallet';
interface ProgramWAddress {
    idl: Idl;
    address: PublicKey;
    networkId: number;
}
interface networkInfo {
  selectedNetwork: number;
  networks: Array<{
    name: string,
    url: string
  }>
}
class ProgramsManager {
  programs: Array<ProgramWAddress> = [];
  private setList: Dispatch<any>;
  networkInfo: networkInfo;
  private setNetworkInfo: Dispatch<any>;
  constructor(
    list: Array<ProgramWAddress>,
    setList: Dispatch<any>,
    networks: networkInfo,
    setNetwork: Dispatch<any>
  ) {
    this.programs = list;
    this.setList = setList;
    this.networkInfo = networks;
    this.setNetworkInfo = setNetwork;
  }
  addNetwork(name: string, url: string) {
    let info = this.networkInfo;
    info.networks.push({
      name,
      url
    })
    this.setNetworkInfo(info);
  }
  selectNetwork(id: number){
    this.setNetworkInfo({
      selectedNetwork: id,
      networks: this.networkInfo.networks
    });
  }
  async addProgram(address: PublicKey) {
    const provider = new AnchorProvider(
      new Connection(this.networkInfo.networks[this.networkInfo.selectedNetwork].url),
      new VirtualWallet(Keypair.generate()),
      AnchorProvider.defaultOptions()
    )
    const programIdl = await Program.fetchIdl(address, provider);
    if (programIdl){
      const arr = [...this.programs, {
        address: address,
        idl: programIdl,
        networkId: this.networkInfo.selectedNetwork
      }]
      this.setList(arr);

      if (typeof window !== 'undefined')
        localStorage.setItem("ProgramsManager", JSON.stringify(arr))
    }
  }
  removeProgram(address: PublicKey) {
    const arr = this.programs.filter((v)=>v.address != address);
    this.setList(arr);
    localStorage.setItem("ProgramsManager", JSON.stringify(arr))
  }
  clear() {
    this.setList([])
    if (typeof window !== 'undefined')
      localStorage.setItem("ProgramsManager", JSON.stringify([]));
  }
}

const ProgramsManagerContext = createContext({} as ProgramsManager);

const ProgramsManagerProvider = (props: any) => {
  let json;
  if (typeof window !== 'undefined')
    json = localStorage.getItem("ProgramsManager");
  const [list, setList] = useState<Array<ProgramWAddress>>(json?JSON.parse(json,(key, value)=>key==="address"?new PublicKey(value):value):[]);
  const [networks, setNetworks] = useState({
    selectedNetwork: 1,
    networks:[
      {
        name: "localhost",
        url: "http://localhost:8899"
      },
      {
        name: "devnet",
        url: "https://api.devnet.solana.com"
      }
    ]
  });
  return (
    <ProgramsManagerContext.Provider value={new ProgramsManager(list, setList, networks, setNetworks)}>
      {props.children}
    </ProgramsManagerContext.Provider>
  )
};

export {ProgramsManagerContext, ProgramsManagerProvider};
export type { ProgramWAddress, networkInfo };