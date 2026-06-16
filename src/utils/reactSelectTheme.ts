import type { StylesConfig, GroupBase } from "react-select";

// Estilos para react-select que respetan el tema (light/dark) usando las
// variables CSS de DaisyUI (--color-base-*). Se adaptan solos al cambiar de tema.
export function daisyReactSelectStyles<
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
>(extra?: Partial<StylesConfig<Option, IsMulti, Group>>): StylesConfig<Option, IsMulti, Group> {
  return {
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
      backgroundColor: "var(--color-base-100)",
      color: "var(--color-base-content)",
      border: "1px solid var(--color-base-300)",
    }),
    control: (base, state) => ({
      ...base,
      minHeight: "calc(var(--size-field, 0.25rem) * 10)",
      height: "calc(var(--size-field, 0.25rem) * 10)",
      borderRadius: "var(--radius-field, 0.5rem)",
      backgroundColor: "var(--color-base-100)",
      borderColor: state.isFocused ? "var(--color-primary)" : "var(--color-base-300)",
      boxShadow: "none",
      ":hover": { borderColor: "var(--color-base-300)" },
    }),
    valueContainer: (base) => ({ ...base, height: "100%", paddingTop: 0, paddingBottom: 0 }),
    indicatorsContainer: (base) => ({ ...base, height: "100%" }),
    indicatorSeparator: (base) => ({ ...base, backgroundColor: "var(--color-base-300)" }),
    input: (base) => ({ ...base, color: "var(--color-base-content)" }),
    singleValue: (base) => ({ ...base, color: "var(--color-base-content)" }),
    placeholder: (base) => ({ ...base, color: "var(--color-base-content)", opacity: 0.5 }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "var(--color-primary)"
        : state.isFocused
        ? "var(--color-base-200)"
        : "transparent",
      color: state.isSelected ? "var(--color-primary-content)" : "var(--color-base-content)",
      ":active": { backgroundColor: "var(--color-base-300)" },
    }),
    noOptionsMessage: (base) => ({ ...base, color: "var(--color-base-content)", opacity: 0.6 }),
    loadingMessage: (base) => ({ ...base, color: "var(--color-base-content)", opacity: 0.6 }),
    ...(extra as any),
  };
}
