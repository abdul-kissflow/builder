import { useContext } from "react";
import PropTypes from "prop-types";

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
