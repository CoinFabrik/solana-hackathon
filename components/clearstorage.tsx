import React from "react";
import { Button } from "@/components/ui/button";

class ClearLocalStorageAndReload extends React.Component {
  handleClearAndReload = () => {
    localStorage.clear();
    window.location.reload();
  };

  render() {
    return (
      <div className="flex justify-center items-center h-screen">
        <Button
          onClick={this.handleClearAndReload}
          className="bg-purple-600 text-white hover:bg-purple-700"
        >
          CLEAR ALL
        </Button>
      </div>
    );
  }
}

export default ClearLocalStorageAndReload;
