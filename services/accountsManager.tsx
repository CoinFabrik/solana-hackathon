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
    localStorage.setItem("AccountsManager", JSON.stringify(arr));
  }
  removeAccount(name: string) {
    const arr = this.accounts.filter((v)=>v.name != name);
    this.setList(arr);
    localStorage.setItem("AccountsManager", JSON.stringify(arr));
  }
}

const AccountsManagerContext = createContext(null as AccountsManager|null);

const AccountsManagerProvider = (props: any) => {
  const json = localStorage.getItem("AccountsManager");
  const [list, setList] = useState<Array<AccountName>>(json?JSON.parse(json):[]);

  return (
    <AccountsManagerContext.Provider value={new AccountsManager(list, setList)}>
      {props.children}
    </AccountsManagerContext.Provider>
  )
};

export {AccountsManagerContext, AccountsManagerProvider};
