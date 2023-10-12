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
  newKey(name: string|undefined): boolean {
    let keypair = Keypair.generate();
    return this.addKey(
      name?name:keypair.publicKey.toBase58(),
      keypair
    );
  }
  addKey(name: string, keypair: Keypair): boolean {
    if(this.keys.some((v)=>v.name==name)){
      return false
    }
    const arr = [...this.keys, {
      keypair,
      name
    }];
    this.setList(arr);
    if (typeof window !== 'undefined')
      localStorage.setItem("KeyManager", JSON.stringify(arr, (key, value)=>key==="keypair"?value.secretKey.toString():value))
    return true;
  }
  removeKey(name: string) {
    const arr = this.keys.filter((v)=>v.name != name);
    this.setList(arr);

    if (typeof window !== 'undefined')
      localStorage.setItem("KeyManager", JSON.stringify(arr, (key, value)=>key==="keypair"?value.secretKey.toString():value))
  }
}

const KeyManagerContext = createContext({} as KeyManager);

const KeyManagerProvider = (props: any) => {
  let json;
  if (typeof window !== 'undefined')
    json = localStorage.getItem("KeyManager");
  const [list, setList] = useState<Array<KeypairName>>(
    json?JSON.parse(json,(key, value)=>key==="keypair"?Keypair.fromSecretKey(new Uint8Array(value.split(','))):value)
    :[]
  );

  return (
    <KeyManagerContext.Provider value={new KeyManager(list, setList)}>
      {props.children}
    </KeyManagerContext.Provider>
  )
};

export { KeyManagerContext, KeyManagerProvider };
export type { KeypairName };
