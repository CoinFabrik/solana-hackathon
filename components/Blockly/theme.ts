import Blockly from "blockly/core";
const Color = require("color");

const darkenBy = 0.35;

const desaturateBy = 0.2;

const colorInstruction = Color("#9945FF").darken(darkenBy).hex();
const colorAccount = Color("#2082A6").darken(darkenBy).hex();
const colorSigner = Color("#2082A6").darken(darkenBy).hex();
const colorEnum = Color("#2082A6").darken(darkenBy).hex();
const colorAssert = Color("#FF4545").darken(darkenBy).hex();
const colorTest = Color("#2082A6").hex();
const colorGetAccount = Color("#F1A614").darken(darkenBy).hex();

const categoryStyles = {
  list_category: {
    colour: "#4a148c",
  },
  logic_category: {
    colour: "#01579b",
  },
  accounts: {
    colour: Color("#45CAFF").darken(darkenBy).desaturate(desaturateBy).hex(),
  },
  enums: {
    colour: Color("#ED14F1").darken(darkenBy).desaturate(desaturateBy).hex(),
  },
  signers: {
    colour: Color("#FF4545").darken(darkenBy).desaturate(desaturateBy).hex(),
  },
  instructions: {
    colour: Color("#146CF1").darken(darkenBy).desaturate(desaturateBy).hex(),
  },
  get_account: {
    colour: Color("#F1A614").darken(darkenBy).desaturate(desaturateBy).hex(),
  },
  test: {
    colour: Color("#F15614").darken(darkenBy).desaturate(desaturateBy).hex(),
  },
};

const componentStyles = {
  workspaceBackgroundColour: "#DeDeDe", // <----
  toolboxBackgroundColour: "#8e8e8e",
  flyoutBackgroundColour: "#8e8e8e",
  flyoutOpacity: 1,
};

const fontStyle = {
  family: "Georgia, sans-serif",
  size: 12,
};

const theme = Blockly.Theme.defineTheme("themeName", {
  name: "SOLBricks",
  base: Blockly.Themes.Classic,
  blockStyles: {
    logic_blocks: {
      colourPrimary: "#4a148c",
    },
    instruction_blocks: {
      colourPrimary: colorInstruction,
    },
    input_account: {
      colourPrimary: colorAccount,
    },
    input_signer: {
      colourPrimary: colorSigner,
    },
    test_case: {
      colourPrimary: colorTest,
    },
    assert: {
      colourPrimary: colorAssert,
    },
    enum_block: {
      colourPrimary: colorEnum,
    },
    get_account: {
      colourPrimary: colorGetAccount,
    },
  },
  componentStyles,
  categoryStyles,
  fontStyle,
  startHats: true,
});

export default theme;
