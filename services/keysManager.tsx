"use client"
import { Keypair, PublicKey } from '@solana/web3.js'
import { Context, Dispatch, createContext, useContext, useState } from 'react';
interface KeypairName {
  name: string;
  keypair: Keypair;
}

class KeyManager {
  keys: Array<KeypairName> = [];
  private setList: Dispatch<any>;
  constructor(list: Array<KeypairName>, setList: Dispatch<any>) {
    this.keys = list;
    this.setList = setList;
  }
  newKey(name: string|undefined) {
    let keypair = Keypair.generate();
    this.addKey(
      name?name:keypair.publicKey.toBase58(),
      keypair
    );
  }
  addKey(name: string, keypair: Keypair) {
    const arr = [...this.keys, {
      keypair,
      name
    }];
    this.setList(arr);
    localStorage.setItem("KeyManager", JSON.stringify(arr))
  }
  removeKey(name: string) {
    const arr = this.keys.filter((v)=>v.name != name);
    this.setList(arr);
    localStorage.setItem("KeyManager", JSON.stringify(arr))
  }
}

const KeyManagerContext = createContext({} as KeyManager);

const KeyManagerProvider = (props: any) => {
  const json = localStorage.getItem("KeyManager");
  const [list, setList] = useState<Array<KeypairName>>(json?JSON.parse(json):[]);

  return (
    <KeyManagerContext.Provider value={new KeyManager(list, setList)}>
      {props.children}
    </KeyManagerContext.Provider>
  )
};

export {KeyManagerContext, KeyManagerProvider};