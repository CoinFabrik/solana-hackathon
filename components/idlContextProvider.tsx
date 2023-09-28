'use client'

import React, { createContext, useState } from "react";


let IdlDataContext = createContext([null as any, null as any])

const IdlContextProvider = (props: any) => {
  const idl = useState(null as any);
  return (
    <IdlDataContext.Provider value={idl}>
        {props.children}
    </IdlDataContext.Provider>
  );
};
  
export {IdlContextProvider, IdlDataContext};