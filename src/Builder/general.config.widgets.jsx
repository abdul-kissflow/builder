import { useContext } from "react";
import PropTypes from "prop-types";

import TextArea from "antd/es/input/TextArea";

import { Control } from "./control";
import { CONTROL_TYPE } from "./constant";
import { BuilderContext } from "./context";

HeightInput.propTypes = {
  config: PropTypes.shape({
    source: PropTypes.array
  })
};

export function HeightInput({ config }) {
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
        onChange(e.target.value);
      }}
      value={widgetsConfig[selectedWidget]?.content || ""}
      placeholder="Write something here"
      autoSize
    />
  );
}
