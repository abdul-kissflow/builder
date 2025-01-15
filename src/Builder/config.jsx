import styles from "./builder.module.css";
import PropTypes from "prop-types";
import {
  CONTROL_MARGIN_OPTION,
  CONTROL_TYPE,
  CONTROL_UNIT_OPTION,
  INITIAL_CONFIG
} from "./constant";
import { Control } from "./control";

export function Config({ config: localConfig, setConfig }) {
  const { COLUMN_COUNT, ROW_COUNT, ROW_HEIGHT, ROW_HEIGHT_UNIT, MARGIN_TYPE } =
    localConfig;

  function onChange(id, value) {
    setConfig((prevState) => {
      return { ...prevState, [id]: value };
    });
  }

  return (
    <div className={styles.rightNav}>
      <Control
        id="COLUMN_COUNT"
        type={CONTROL_TYPE.NUMBER}
        label="Column Count"
        value={COLUMN_COUNT}
        onChange={onChange}
        onReset={onChange}
        defaultValue={INITIAL_CONFIG.COLUMN_COUNT}
      />
      <Control
        id="ROW_COUNT"
        type={CONTROL_TYPE.NUMBER}
        label="Row Count"
        value={ROW_COUNT}
        onChange={onChange}
        onReset={onChange}
        defaultValue={INITIAL_CONFIG.ROW_COUNT}
      />
      <Control
        id="ROW_HEIGHT"
        label="Row Height"
        type={CONTROL_TYPE.NUMBER_UNIT}
        value={ROW_HEIGHT}
        onChange={onChange}
        onReset={onChange}
        defaultValue={INITIAL_CONFIG.ROW_HEIGHT}
        unit={ROW_HEIGHT_UNIT}
        defaultUnit={INITIAL_CONFIG.ROW_HEIGHT_UNIT}
        options={CONTROL_UNIT_OPTION}
      />
      <Control
        id="MARGIN_TYPE"
        type={CONTROL_TYPE.TOGGLE}
        label="Margin"
        value={MARGIN_TYPE}
        onChange={onChange}
        onReset={onChange}
        defaultValue={INITIAL_CONFIG.MARGIN_TYPE}
        options={CONTROL_MARGIN_OPTION}
      />
    </div>
  );
}

Config.propTypes = {
  config: PropTypes.object,
  setConfig: PropTypes.func
};
