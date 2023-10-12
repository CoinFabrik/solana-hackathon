"use client"
import { Keypair, PublicKey } from '@solana/web3.js'
import { Context, Dispatch, createContext, useContext, useState } from 'react';


interface AccountName {
    name: string;
    address: PublicKey;
}

class AccountsManager {
  accounts: Array<AccountName> = [];
  private setList: Dispatch<any>;
  constructor(list: Array<AccountName>, setList: Dispatch<any>) {
    this.accounts = list;
    this.setList = setList;
  }
  addAccount(name: string, address: PublicKey) {
    const arr = [...this.accounts, {
      address,
      name
    }];
    this.setList(arr);
    if (typeof window !== 'undefined')
      localStorage.setItem("AccountsManager", JSON.stringify(arr));
  }
  removeAccount(name: string) {
    const arr = this.accounts.filter((v)=>v.name != name);
    this.setList(arr);
    if (typeof window !== 'undefined')
      localStorage.setItem("AccountsManager", JSON.stringify(arr));
  }
  clear() {
    this.setList([])
    if (typeof window !== 'undefined')
      localStorage.setItem("AccountsManager", JSON.stringify([]));
  }
}

const AccountsManagerContext = createContext({} as AccountsManager);

const AccountsManagerProvider = (props: any) => {
  let json;
  if (typeof window !== 'undefined')
    json = localStorage.getItem("AccountsManager");
  const [list, setList] = useState<Array<AccountName>>(
    json?JSON.parse(json,(key, value)=>key==="address"?new PublicKey(value):value)
    :[]
  );

  return (
    <AccountsManagerContext.Provider value={new AccountsManager(list, setList)}>
      {props.children}
    </AccountsManagerContext.Provider>
  )
};

export { AccountsManagerContext, AccountsManagerProvider };
export type { AccountName };

