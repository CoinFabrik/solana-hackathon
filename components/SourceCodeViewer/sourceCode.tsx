'use client'
// @ts-ignore
import codePrettify from "code-prettify";

import React, { useState } from "react";
import './sourceCode.css';

const SourceCode = ({source, ...props}: {source: any}) => {
  return (
    <div>
      <pre className="prettyprint">
        <code className="javascript" dangerouslySetInnerHTML={{__html: codePrettify.prettyPrintOne(source)}}>
        </code>
      </pre>
    </div>
  );
};
  
export default SourceCode;