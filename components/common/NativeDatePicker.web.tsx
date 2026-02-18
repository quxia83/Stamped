import { format } from "date-fns";
import { colors } from "@/lib/constants";

type Props = {
  value: Date;
  onChange: (date: Date) => void;
  minimumDate?: Date;
  maximumDate?: Date;
};

export function NativeDatePicker({ value, onChange, minimumDate, maximumDate }: Props) {
  return (
    <input
      type="date"
      value={format(value, "yyyy-MM-dd")}
      min={minimumDate ? format(minimumDate, "yyyy-MM-dd") : undefined}
      max={maximumDate ? format(maximumDate, "yyyy-MM-dd") : undefined}
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
  fontSize: 15,
  color: colors.text,
  backgroundColor: colors.surface,
  borderStyle: "solid",
  width: "100%",
  boxSizing: "border-box",
};
