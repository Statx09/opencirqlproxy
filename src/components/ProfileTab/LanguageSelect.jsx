import Select from "react-select";

const languageOptions = [
  { value: "English", label: "English" },
  { value: "Afrikaans", label: "Afrikaans" },
  { value: "Zulu", label: "Zulu" },
  { value: "Xhosa", label: "Xhosa" },
  { value: "French", label: "French" },
  { value: "German", label: "German" },
  { value: "Spanish", label: "Spanish" },
  { value: "Portuguese", label: "Portuguese" },
  { value: "Mandarin", label: "Mandarin" },
  { value: "Japanese", label: "Japanese" },
];

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
    "&:hover": {
      borderColor: "#7c3aed",
    },
  }),

  menu: (base) => ({
    ...base,
    background: "#111",
    border: "1px solid #333",
    borderRadius: 10,
  }),

  menuList: (base) => ({
    ...base,
    maxHeight: 240,
  }),

  option: (base, state) => ({
    ...base,
    background: state.isFocused ? "#7c3aed" : "#111",
    color: "#fff",
  }),

  multiValue: (base) => ({
    ...base,
    background: "rgba(124,58,237,.25)",
    borderRadius: 999,
  }),

  multiValueLabel: (base) => ({
    ...base,
    color: "#fff",
  }),

  multiValueRemove: (base) => ({
    ...base,
    color: "#fff",
    ":hover": {
      background: "#ef4444",
      color: "#fff",
    },
  }),

  input: (base) => ({
    ...base,
    color: "#fff",
  }),

  placeholder: (base) => ({
    ...base,
    color: "#777",
  }),
};

export default function LanguageSelect({
  value,
  onChange,
}) {
  return (
    <Select
      isMulti
      options={languageOptions}
      styles={styles}
      placeholder="Languages"
      value={languageOptions.filter((o) =>
        value.includes(o.value)
      )}
      onChange={(selected) =>
        onChange(selected ? selected.map((o) => o.value) : [])
      }
    />
  );
}