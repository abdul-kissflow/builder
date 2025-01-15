import { InputNumber, Segmented, Select } from "antd";

import styles from "./builder.module.css";
import PropTypes from "prop-types";
import { CONTROL_TYPE } from "./constant";

export function Control({
  id,
  type,
  label,
  value,
  unit,
  options,
  defaultValue,
  defaultUnit,
  onChange,
  onReset
}) {
  return (
    <div className={styles.control}>
      <label>
        {label}
        {(defaultValue !== value || (unit && unit !== defaultUnit)) && (
          <a
            className={styles.link}
            onClick={() => {
              if (type === CONTROL_TYPE.NUMBER_UNIT) {
                onReset(id + "_UNIT", defaultUnit);
              }
              onReset(id, defaultValue);
            }}
          >
            reset
          </a>
        )}
      </label>
      <div className={styles.inputContainer}>
        {[CONTROL_TYPE.NUMBER, CONTROL_TYPE.NUMBER_UNIT].includes(type) && (
          <InputNumber
            value={value}
            onChange={(value) => {
              onChange(id, Number(value));
            }}
            size="small"
            className={styles.inputNumber}
            changeOnBlur={false}
          />
        )}
        {[CONTROL_TYPE.TOGGLE].includes(type) && (
          <Segmented
            value={value}
            onChange={(value) => {
              onChange(id, value);
            }}
            options={options}
          />
        )}
        {unit && (
          <Select
            value={unit}
            onChange={(e) => {
              let { value } = JSON.parse(e);
              onChange(id + "_UNIT", value);
            }}
            size="small"
          >
            {options.map((opt) => (
              <Select.Option key={opt.value} value={JSON.stringify(opt)}>
                {opt.label}
              </Select.Option>
            ))}
          </Select>
        )}
      </div>
    </div>
  );
}

Control.propTypes = {
  id: PropTypes.string,
  label: PropTypes.string,
  type: PropTypes.string,
  unit: PropTypes.string,
  defaultUnit: PropTypes.string,
  options: PropTypes.array,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  prefix: PropTypes.string,
  onChange: PropTypes.func,
  onReset: PropTypes.func
};
