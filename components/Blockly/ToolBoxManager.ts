import { ToolboxDefinition, ToolboxInfo } from "blockly/core/utils/toolbox";
import { AccountName } from "@/services/accountsManager";
import { KeypairName } from "@/services/keysManager";
import { ProgramWAddress } from "@/services/programLoader";
import Blockly, { Block, Events, MenuOption, Toolbox } from "blockly/core";
import javascript, { Order, javascriptGenerator } from "blockly/javascript";
import { MutableRefObject } from "react";
import {
  Idl,
  IdlAccount,
  IdlAccountDef,
  IdlAccountItem,
  IdlEnumVariant,
  IdlField,
  IdlType,
  IdlTypeDef,
  IdlTypeDefined,
  isIdlAccounts,
} from "@coral-xyz/anchor/dist/cjs/idl";
import { logic } from "blockly/blocks";
import { BlockMove } from "blockly/core/events/events_block_move";
import { BlockChange } from "blockly/core/events/events_block_change";

const numberTypesSet = new Set([
  "u8",
  "i8",
  "u16",
  "i16",
  "u32",
  "i32",
  "f32",
  "f64",
]);
const bigIntTypesSet = new Set(["u64", "i64", "u128", "i128", "u256", "i256"]);

const colorInstruction = "#317EF3";
const colorAccount = "#6BC8FA";
const colorSigner = "#9B0C9B";
const colorEnum = "#FF4545";
const colorAssert = "#ED14F1";
const colorTest = "#F15614";
const colorGetAccount = "#317EF3";

class ToolboxManager {
  defaultToolbox: ToolboxInfo;
  accounts: Array<AccountName>;
  keypairs: Array<KeypairName>;
  programs: Array<ProgramWAddress> = [];
  enumTypes: Array<any> = [];
  structTypes: Array<any> = [];
  accountTypes: Array<any> = [];
  instructions: Array<any> = [];
  workspaceRef: MutableRefObject<Blockly.WorkspaceSvg>;
  constructor(
    workspaceRef: MutableRefObject<Blockly.WorkspaceSvg>,
    defaultToolbox: ToolboxInfo,
    accounts: Array<AccountName>,
    keypairs: Array<KeypairName>,
    programs: Array<ProgramWAddress>
  ) {
    this.workspaceRef = workspaceRef;
    this.defaultToolbox = { ...defaultToolbox };
    this.accounts = [...accounts];
    this.keypairs = [...keypairs];
    this.programs = [...programs];

    const accountsDropdownArr = () => {
      return this.accounts.map(
        (account) => [account.name, account.name] as MenuOption
      );
    };
    Blockly.Blocks["input_account"] = {
      init: function () {
        this.appendDummyInput()
          .appendField("Account")
          .appendField(
            new Blockly.FieldDropdown(accountsDropdownArr),
            "account"
          );
        this.setInputsInline(false);
        this.setOutput(true, "Account");
        this.setTooltip("");
        this.setHelpUrl("");
        this.setStyle("input_account");
      },
    };
    javascriptGenerator.forBlock["input_account"] = function (
      block: Blockly.Block,
      generator: any
    ) {
      var dropdown_options = block.getFieldValue("account");
      var code = `account_${dropdown_options}`;
      return [code, javascript.Order.MEMBER];
    };
    const signerDropdownArr = () => {
      return this.keypairs.map(
        (keypair) => [keypair.name, keypair.name] as MenuOption
      );
    };
    Blockly.Blocks["input_signer"] = {
      init: function () {
        this.appendDummyInput()
          .appendField("Signer")
          .appendField(new Blockly.FieldDropdown(signerDropdownArr), "signer");
        this.setInputsInline(false);
        this.setOutput(true, "Signer");
        this.setTooltip("");
        this.setHelpUrl("");
        this.setStyle("input_signer");
      },
    };
    javascriptGenerator.forBlock["input_signer"] = function (
      block: Blockly.Block,
      generator: any
    ) {
      var dropdown = block.getFieldValue("signer");
      var code = `keypair_${dropdown}.publicKey`;
      return [code, javascript.Order.MEMBER];
    };
    Blockly.Blocks["test_case"] = {
      init: function () {
        this.appendDummyInput()
          .appendField("Test")
          .appendField(new Blockly.FieldTextInput("#1"), "DESC");
        this.appendStatementInput("TEST_CONTENT").setCheck(null);
        this.setStyle("test_case");
        this.setTooltip("");
        this.setHelpUrl("");
      },
    };
    javascriptGenerator.forBlock["test_case"] = function (
      block: Blockly.Block,
      generator: any
    ) {
      var testDesc = block.getFieldValue("DESC");
      var testContent = generator.statementToCode(block, "TEST_CONTENT");
      var code = `it("${testDesc}", async() => {\n${testContent}\n});`;
      return code;
    };

    Blockly.Blocks["assert"] = {
      init: function () {
        this.appendValueInput("ASSERT")
          .setCheck("Boolean")
          .appendField("Assert");
        this.setStyle("assert");
        this.setTooltip("");
        this.setHelpUrl("");
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setInputsInline(true);
      },
    };
    javascriptGenerator.forBlock["assert"] = function (
      block: Blockly.Block,
      generator: any
    ) {
      var assertValue = generator.valueToCode(block, "ASSERT", Order.NONE);
      var code = `assert(${assertValue},"${assertValue}")\n`;
      return code;
    };
    Blockly.Blocks['get_from_array'] = {
      init: function() {
        this.appendValueInput("ARRAY")
            .setCheck(null)
            .appendField("get")
            .appendField(new Blockly.FieldNumber(0), "INDEX")
            .appendField("index from");
        this.setOutput(true, null);
        this.setColour(230);
     this.setTooltip("");
     this.setHelpUrl("");
      }
    };
    javascript.javascriptGenerator.forBlock['get_from_array'] = function (
      block: Blockly.Block,
      generator: any
    ) {
      var index = block.getFieldValue('INDEX');
      var array = generator.valueToCode(block, 'ARRAY', Order.ATOMIC);
      // TODO: Assemble javascript into code variable.
      var code = `${array}[${index}]`;
      return [code, Order.MEMBER];
    };

    Blockly.Blocks['get_pda'] = {
      init: function() {
        this.appendValueInput("ARRAY")
            .setCheck(null)
            .appendField("Derive pda from array");
        this.setInputsInline(true);
        this.setOutput(true, null);
        this.setColour(230);
      this.setTooltip("");
      this.setHelpUrl("");
      let thisBlock = this as Block;
      },
    };
    javascript.javascriptGenerator.forBlock['get_pda'] = function (
      block: Blockly.Block,
      generator: any
    ) {
      var array = generator.valueToCode(block, 'ARRAY', Order.NONE);
      // TODO: Assemble javascript into code variable.
      var code = `(await anchor.web3.PublicKey.findProgramAddress(
        ${array},
        program_pennies.programId
      ))[0]`;
      return [code, Order.MEMBER];
    };
    Blockly.Blocks['init_array'] = {
      init: function() {
        this.appendValueInput("VALUE")
            .setCheck(null)
            .appendField("Init array with value:");
        this.setOutput(true, null);
        this.setColour(230);
     this.setTooltip("");
     this.setHelpUrl("");
      }
    };
    javascript.javascriptGenerator.forBlock['init_array'] = function(
      block: Blockly.Block,
      generator: any
    ) {
      var value = generator.valueToCode(block, 'VALUE', Order.NONE);
      var code;
      if(!block.getChildren(false)[0]) {
         code = `[]`
      } else if(block.getChildren(false)[0].type == "text"){
        code = `[anchor.utils.bytes.utf8.encode(${value})]`;
      } else if(block.getChildren(false)[0].type == "input_account") {
        code = `[${value}.toBuffer()]`;
      } else if(block.getChildren(false)[0].type == "input_signer") {
        code = `[${value}.toBuffer()]`;
      } else code = `[${value}]`;
      return [code, Order.NONE];
    };
    Blockly.Blocks['push_into_array'] = {
      init: function() {
        this.appendValueInput("ITEM")
            .setCheck(null)
            .appendField("Push item");
        this.appendValueInput("ARRAY")
            .setCheck(null)
            .appendField("into array");
        this.setInputsInline(true);
        this.setColour(230);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
     this.setTooltip("");
     this.setHelpUrl("");
      }
    };
    javascript.javascriptGenerator.forBlock['push_into_array'] = function(
      block: Blockly.Block,
      generator: any
    ) {
      var array = generator.valueToCode(block, 'ARRAY', javascript.Order.ATOMIC);
      var value = generator.valueToCode(block, 'ITEM', javascript.Order.NONE);
      var code;
      if(!block.getChildren(true)[0]) {
         code = `${array}.push(${value});\n`;
      } else if(block.getChildren(true)[0].type == "text"){
        code = `${array}.push(anchor.utils.bytes.utf8.encode(${value}));\n`;
      } else if(block.getChildren(true)[0].type == "input_account") {
        code = `${array}.push(${value}.toBuffer());\n`;
      } else if(block.getChildren(true)[0].type == "input_signer") {
        code = `${array}.push(${value}.toBuffer());\n`;
      } else code = `${array}.push(${value}`;
      return code;
    };
  }
  generatePreamble() {
    let preamble = `async function requestAirdrop(wallet_pubkey){
      const signature = await connection.requestAirdrop(
        wallet_pubkey,
        1e9
      );
      await connection.confirmTransaction(signature, "finalized");
    }\n`;
    if(this.keypairs.length){
      preamble = this.keypairs.reduce((preamble, key)=>{
        return preamble+`const keypair_${key.name} = anchor.web3.Keypair.generate();\nawait requestAirdrop(keypair_${key.name}.publicKey);\n`
      }, preamble)
    }
    if(this.accounts.length){
      preamble = this.accounts.reduce((preamble, account)=>{
        return preamble+`const account_${account.name} = new anchor.web3.PublicKey("${account.address.toBase58()}");\n`
      }, preamble)
    }
    if(this.programs.length){
      preamble = this.programs.reduce((preamble, program)=>{
        return preamble+`const program_${program.idl.name} = await anchor.Program.at(\nnew anchor.web3.PublicKey("${program.address.toBase58()}")\n);\n`
      }, preamble)
    }
    return preamble;
  }
  setSigners(signers: Array<KeypairName>) {
    this.keypairs = [...signers];
    this.workspaceRef.current.updateToolbox(this.generateToolbox());
  }
  setAccounts(accounts: Array<AccountName>) {
    this.accounts = [...accounts];
    this.workspaceRef.current.updateToolbox(this.generateToolbox());
  }
  setPrograms(programs: Array<ProgramWAddress>) {
    this.programs = [...programs];
    this.enumTypes = [];
    programs.map((program) => {
      program.idl.types
        ?.filter((type: IdlTypeDef) => {
          return type.type.kind == "enum";
        })
        .map((type: any) => {
          this.enumTypes.push([
            type.name,
            type.type.variants.map((variant: IdlEnumVariant) => {
              return variant.name;
            }),
          ]);
        });
    });
    let enumtypes = this.enumTypes;
    this.enumTypes.map((enumType, i) => {
      Blockly.Blocks["input_" + enumType[0]] = {
        init: function () {
          this.appendDummyInput()
            .appendField(enumType[0])
            .appendField(
              new Blockly.FieldDropdown(() => {
                return enumtypes[i][1].map((val: string, i: number) => [
                  val,
                  i.toString(),
                ]);
              }),
              "enum_value"
            );
          this.setInputsInline(true);
          this.setOutput(true, "String");
          this.setStyle("enum_block");
          this.setTooltip("");
          this.setHelpUrl("");
        },
      };
      javascriptGenerator.forBlock["input_" + enumType[0]] = function (
        block: Blockly.Block,
        generator: any
      ) {
        var dropdown_options = block.getFieldValue("enum_value");
        var code = enumType[0] + "_enum_value:" + dropdown_options;
        return [code, javascript.Order.MEMBER];
      };
    });
    this.instructions = [];
    this.accountTypes = [];
    programs.map((program) => {
      console.log("program idl", program.idl);
      program.idl.instructions.map((instruction) => {
        let jsonDef = {
          type: "block_type",
          message0: instruction.name + "%1\nArguments:%2\n",
          args0: [
            {
              type: "input_dummy",
            },
            {
              type: "input_dummy",
            },
          ] as any[],
          previousStatement: null,
          nextStatement: null,
          colour: 230,
          tooltip: "",
          helpUrl: "",
        };
        instruction.args.map((arg: IdlField) => {
          if (numberTypesSet.has(arg.type.toString())) {
            jsonDef.args0.push(
              this.generateNumberField(arg.type.toString(), arg.name),
              {
                type: "input_dummy",
              },
            );
            jsonDef.message0 += arg.name + "%" + (jsonDef.args0.length-1) + "%" + jsonDef.args0.length;
          } else {
            jsonDef.args0.push({
              type: "input_value",
              name: arg.name,
              //aca hay que hacer un check con el tipo que deberia tener
            });
            jsonDef.message0 += arg.name + "%" + jsonDef.args0.length;
          }
        });
        jsonDef.args0.push({
          type: "input_dummy",
        });
        jsonDef.message0 += "Accounts:%" + jsonDef.args0.length + "\n";
        instruction.accounts = instruction.accounts.filter((acc)=>!("pda" in acc))
        instruction.accounts.map((account) => {
          if (!isIdlAccounts(account)) {
            jsonDef.args0.push({
              type: "input_value",
              name: account.name,
              check: account.isSigner ? "Signer" : ["Signer","Account"],
            });
            jsonDef.message0 += account.name + "%" + jsonDef.args0.length;
          }
        });
        jsonDef.args0.push({
          type: "input_value",
          name: "TX_SIGNER",
          check: "Signer",
        });
        jsonDef.message0 += "Transaction signer %" + jsonDef.args0.length;
        Blockly.Blocks[
          "program_" + program.idl.name + "_" + instruction.name
        ] = {
          init: function () {
            this.jsonInit(jsonDef);
            this.setInputsInline(false);
            this.setStyle("instruction_blocks");
          },
        };
        javascriptGenerator.forBlock[
          "program_" + program.idl.name + "_" + instruction.name
        ] = function (block: Blockly.Block, generator: any) {
          var args = instruction.args.map((arg) =>
            generator.valueToCode(block, arg.name, Order.MEMBER)
          );
          var accounts = instruction.accounts.reduce(
            (obj, acc: IdlAccountItem) =>

              `${obj}\n${acc.name}: ${generator.valueToCode(
                block,
                acc.name,
                Order.MEMBER
              )},`,
            ""
          );
          console.log("instruction.accounts", instruction.accounts);
          const signers = (
            instruction.accounts.filter(
              (acc: IdlAccountItem) => "isSigner" in acc && acc["isSigner"]
            ) as IdlAccount[]
          ).map(
            (acc: IdlAccount) =>
              block.getInputTargetBlock(acc.name)?.getFieldValue("signer")
          );
          const tx_signer = block
            .getInputTargetBlock("TX_SIGNER")
            ?.getFieldValue("signer");
          if (tx_signer && !signers.includes(tx_signer)) {
            signers.push(tx_signer);
          }
          var signers_code = signers.reduce((obj: string, signer: any) => {
            return signer ? `${obj}${"keypair_" + signer},` : obj;
          }, "");
          var code = `await program_${program.idl.name}.methods.${
            instruction.name
          }(${args})\n.accounts({${accounts.substring(
            0,
            accounts.length - 1
          )}\n})\n.signers([${signers_code.substring(
            0,
            signers_code.length - 1
          )}]).rpc({commitment:"finalized"});\n\n`;
          return code;
        };
        this.instructions.push(
          `program_${program.idl.name}_${instruction.name}`
        );
      });
      program.idl.accounts?.map((account) => {
        Blockly.Blocks[`get_${program.idl.name}_${account.name}`] = {
          init: function () {
            this.data = JSON.stringify({
              fields: account.type.fields,
              idl: program.idl
            })
            this.appendValueInput("ADDRESS").appendField(
              `get ${program.idl.name} ${account.name}`
            );
            this.setInputsInline(false);
            console.log("`${program.idl.name}_${account.name}`", `${program.idl.name}_${account.name}`)
            this.setOutput(true, `${program.idl.name}_${account.name}`);
            this.setStyle("get_account");
            this.setTooltip("");
            this.setHelpUrl("");
          },
        };
        this.accountTypes.push(`get_${program.idl.name}_${account.name}`);
        javascriptGenerator.forBlock[
          `get_${program.idl.name}_${account.name}`
        ] = function (block: Blockly.Block, generator: any) {
          var address = generator.valueToCode(block, "ADDRESS", Order.MEMBER);
          var code = `await program_${program.idl.name}.account.${account.name.toLowerCase()}.fetch(${address})`;
          return [code, javascript.Order.MEMBER];
        };
      });
    });
    const structs = programs.reduce((structs, program)=>{
      let programStructs = program.idl.accounts?.map((account)=>
        `${program.idl.name}_${account.name}`
      )
      if(programStructs?.length)
        structs.push(...programStructs)
      return structs;
    },[] as any[])
    console.log("structs", structs)
    Blockly.Blocks["field_from_struct"] = {
      init: function() {
        const thisBlock = this as Block;
        this.appendValueInput("STRUCT")
            .setCheck(structs)
            .appendField("return")
            .appendField(new Blockly.FieldDropdown(()=>{
              const jsonData = thisBlock.getInputTargetBlock("STRUCT")?.data;
              if(jsonData){
                const data = JSON.parse(jsonData)
                const fields = data?.fields?.map((field: IdlField)=>{
                  return [field.name, field.name] as MenuOption
                })
                if(fields) {
                  return fields;
                }
              }
              return [["",""]] as MenuOption[]
            }), "FIELD_NAME")
            .appendField("from");
        this.setInputsInline(false);
        this.setOutput(true, null);
        this.setColour(230);
      }
    }
    javascriptGenerator.forBlock["field_from_struct"] = function (
      block: Blockly.Block,
      generator: any
    ) {
      var struct = generator.valueToCode(block, "STRUCT", Order.ATOMIC);
      var fieldName = block.getFieldValue("FIELD_NAME");
      var code = `${struct}.${fieldName}`;
      return [code, javascript.Order.MEMBER];
    };
    this.workspaceRef.current.updateToolbox(this.generateToolbox());
  }
  private generateNumberField(type: string, name: string) {
    let bits = Number(type.substring(1));
    if (type.startsWith("f")) {
      return {
        type: "field_number",
        name: name,
        value: 0,
      };
    } else {
      if (type.startsWith("i")) {
        let min = -Math.pow(2, bits - 1);
        let max =  Math.pow(2, bits - 1) - 1;
        return {
          type: "field_number",
          name: name,
          value: 0,
          min: min,
          max: max,
          precision: 1,
        };
      } else {
        let max =  Math.pow(2, bits) - 1;
        return {
          type: "field_number",
          name: name,
          value: 0,
          min: 0,
          max: max,
          precision: 1,
        };
      }
    }
  }
  private generateToolbox(): ToolboxDefinition {
    console.log("this.defaultToolbox", this.defaultToolbox);
    let customContent = [];
    if (this.accounts.length > 0) {
      customContent.push({
        kind: "category",
        name: "Accounts",
        id: "ACCOUNTS",
        categorystyle: "accounts",
        contents: [
          {
            kind: "block",
            type: "input_account",
          },
        ],
      });
    }
    if (this.keypairs.length > 0) {
      customContent.push({
        kind: "category",
        name: "Signers",
        id: "SIGNERS",
        categorystyle: "signers",
        contents: [
          {
            kind: "block",
            type: "input_signer",
          },
        ],
      });
    }
    if (this.enumTypes.length > 0) {
      let enums = this.enumTypes.map((enumType, i) => {
        return {
          kind: "block",
          type: "input_" + enumType[0],
        };
      });
      customContent.push({
        kind: "category",
        name: "Enums",
        categorystyle: "enums",
        contents: enums,
      });
    }
    if (this.instructions.length > 0) {
      let instructions = this.instructions.map((instruction, i) => {
        return {
          kind: "block",
          type: instruction,
        };
      });
      customContent.push({
        kind: "category",
        name: "Instructions",
        categorystyle: "instructions",
        contents: instructions,
      });
    }
    if (this.accountTypes.length > 0) {
      let accountTypes = this.accountTypes.map((account, i) => {
        return {
          kind: "block",
          type: account,
        };
      });
      accountTypes.push({
        kind: "block",
        type: "field_from_struct",
      },{
        kind: "block",
        type: "get_from_array",
      },{
        kind: "block",
        type: "get_pda",
      })
      customContent.push({
        kind: "category",
        name: "Get account",
        contents: accountTypes,
        categorystyle: "get_account",
      });
    }
    let currentToolbox = {
      ...this.defaultToolbox,
      contents: [...this.defaultToolbox.contents, ...customContent],
    };
    return currentToolbox;
  }
}
export { ToolboxManager };
