import React, { useState } from "react";
import ComboBox from "react-responsive-combo-box";
import "react-responsive-combo-box/dist/index.css";

export default function SelectBox({ selectedOption, setSelectedOption }) {
  const [highlightedOption, setHighlightedOption] = useState("");
  const options = [
    "KING",
    "UPnL",
    "SNUGDC",
    "CAT&Dog",
    "G-POS",
    "HAJE",
    "PoolC",
    "STAFF",
  ];
  /*
  --background: #524fa1;
  --white: #ffffff;
  --yellow: #ffc700;
  --border: #d3cec4;
  --mint: #31b5b9;
  --light-purple: #7b78d5;
  --red: #fe5c00;
  */
  return (
    <ComboBox
      options={options}
      placeholder="선택"
      defaultIndex={0}
      optionsListMaxHeight={200}
      style={{
        width: "150px",
        marginLeft: "10px",
      }}
      editable={false}
      focusColor="#524FA1"
      highlightColor="#90D6D8"
      selectedOptionColor="#31b5b9"
      renderOptions={(option) => <div className="comboBoxOption">{option}</div>}
      onSelect={(option) => setSelectedOption(option)}
      onChange={(event) => console.log(event.target.value)}
      enableAutocomplete
      onOptionsChange={(option) => setHighlightedOption(option)}
    />
  );
}
