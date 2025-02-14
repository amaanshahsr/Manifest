import { Truck, Company, Manifest, TableTypes } from "@/db/schema";
import { useDataFetch } from "@/hooks/useDataFetch";
import { useState, useEffect } from "react";
import DropDownPicker from "react-native-dropdown-picker";

interface DropDownProps<T extends Truck | Company | Manifest> {
  handleUpdate: (value: string) => void;
  table: TableTypes;
  schema: {
    label: keyof T;
    value: keyof T;
  };
}

export const DropDown = <T extends Truck | Company | Manifest>({
  handleUpdate,
  table,
  schema,
}: DropDownProps<T>) => {
  const { data } = useDataFetch<T>({ table });
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string | null>(null);
  const [items, setItems] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    if (data) {
      const transformedData = data.map((item) => ({
        label: String(item[schema.label]), // Ensure label is a string
        value: String(item[schema.value]), // Ensure value is a string
      }));
      setItems(transformedData);
    }
  }, [data]);

  return (
    <DropDownPicker
      style={{ marginBlock: 20 }}
      open={open}
      value={value}
      items={items}
      showBadgeDot={true}
      setOpen={setOpen}
      setValue={setValue}
      setItems={setItems}
      placeholder="Select an option"
      onChangeValue={(val) => (val ? handleUpdate(val) : null)}
    />
  );
};
