// RolesSelect.tsx
import type { Control, FieldValues, Path } from "react-hook-form";
import { FormSelect, type SelectOption } from "../../shared/components/FormSelect";
import { useRoles } from "../../services/rolesServices";

type RolesSelectProps<T extends FieldValues> = {
  control: Control<T, any, T>;
  name: Path<T>;
  label?: string;
  requiredMessage?: string;
  placeholder?: string;
  className?: string;
};

export default function RolesSelect<T extends FieldValues>({
  control,
  name,
  label = "Selecciona un rol",
  requiredMessage = "El rol es obligatorio",
  placeholder = "-- Selecciona --",
  className,
}: RolesSelectProps<T>) {
  const { data, isLoading, isError } = useRoles();

  const options: SelectOption[] =
    data?.roles.map((r: any) => ({ value: r.rol, label: r.name_rol })) ?? [];

  if (isError) return <p className="text-error">Error al cargar roles</p>;

  return (
    <FormSelect<T>
      name={name}
      label={label}
      control={control}
      options={options}
      loading={isLoading}
      rules={{ required: requiredMessage }}
      placeholder={placeholder}
      className={className}
    />
  );
}
