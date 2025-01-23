import { useContext } from "react";
import PropTypes from "prop-types";

import TextArea from "antd/es/input/TextArea";

import { Control } from "./control";
import { CONTROL_TYPE } from "./constant";
import { BuilderContext } from "./context";

HeightInput.propTypes = {
  type: PropTypes.string,
  config: PropTypes.shape({
    source: PropTypes.array
  })
};

export function HeightInput({ type, config }) {
  // const [value, setValue] = useState(config["source"][0].value);

  const { selectedWidget, widgetsConfig, updateWidgetConfig } =
    useContext(BuilderContext);

  function onChange(e, value) {
    updateWidgetConfig((prevState) => ({
      ...prevState,
      [selectedWidget]: {
        ...prevState[selectedWidget],
        heightType: value
      }
    }));
  }

  console.log(type, "Genenral config");

  return (
    <div>
      <Control
        id="MARGIN_TYPE"
        type={CONTROL_TYPE.TOGGLE}
        label="Height"
        value={widgetsConfig[selectedWidget]?.heightType || "fixed"}
        onChange={onChange}
        onReset={onChange}
        defaultValue={config["source"][0].value}
        options={config["source"]}
      />
    </div>
  );
}

TextInput.propTypes = {
  type: PropTypes.string
};

export function TextInput() {
  const { selectedWidget, widgetsConfig, updateWidgetConfig } =
    useContext(BuilderContext);

  function onChange(value) {
    updateWidgetConfig((prevState) => ({
      ...prevState,
      [selectedWidget]: {
        ...prevState[selectedWidget],
        content: value
      }
    }));
  }

  return (
    <TextArea
      onChange={(e) => {
        console.log(e.target.value, "value check");
        onChange(e.target.value);
      }}
      value={widgetsConfig[selectedWidget]?.content || ""}
      placeholder="Autosize"
      autoSize
    />
  );
}
