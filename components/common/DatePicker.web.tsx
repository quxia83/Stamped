import { StyleSheet } from "react-native";
import { format } from "date-fns";
import { colors } from "@/lib/constants";

type Props = {
  value: Date;
  onChange: (date: Date) => void;
};

export function DatePicker({ value, onChange }: Props) {
  return (
    <input
      type="date"
      value={format(value, "yyyy-MM-dd")}
      onChange={(e) => {
        const d = new Date(e.target.value + "T00:00:00");
        if (!isNaN(d.getTime())) onChange(d);
      }}
      style={inputStyle}
    />
  );
}

const inputStyle: React.CSSProperties = {
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: 8,
  paddingLeft: 14,
  paddingRight: 14,
  paddingTop: 10,
  paddingBottom: 10,
  fontSize: 16,
  color: colors.text,
  backgroundColor: colors.surface,
  borderStyle: "solid",
};
