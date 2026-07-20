import Select from "react-select";
import countryList from "react-select-country-list";
import { useMemo } from "react";

const styles = {
  control: (base, state) => ({
    ...base,
    background: "#111",
    border: "1px solid #333",
    borderRadius: 10,
    minHeight: 46,
    boxShadow: state.isFocused
      ? "0 0 0 1px #7c3aed"
      : "none",
    cursor: "pointer",

    "&:hover": {
      borderColor: "#7c3aed",
    },
  }),

  menu: (base) => ({
    ...base,
    background: "#111",
    border: "1px solid #333",
    borderRadius: 10,
    overflow: "hidden",
  }),

  option: (base, state) => ({
    ...base,
    background: state.isFocused
      ? "#7c3aed"
      : "#111",
    color: "#fff",
    cursor: "pointer",
  }),

  singleValue: (base) => ({
    ...base,
    color: "#fff",
  }),

  input: (base) => ({
    ...base,
    color: "#fff",
  }),

  placeholder: (base) => ({
    ...base,
    color: "#777",
  }),

  menuList: (base) => ({
    ...base,
    maxHeight: 220,
  }),
};

export default function CountrySelect({
  value,
  onChange,
}) {
  const options = useMemo(
    () => countryList().getData(),
    []
  );

  return (
    <Select
      options={options}
      styles={styles}
      isSearchable
      placeholder="Country"
      value={options.find((o) => o.value === value)}
      onChange={(option) => onChange(option.value)}
    />
  );
}