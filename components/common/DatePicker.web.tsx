import { format } from "date-fns";
import { useTheme } from "@/theme";

type Props = {
  value: Date;
  onChange: (date: Date) => void;
};

export function DatePicker({ value, onChange }: Props) {
  const theme = useTheme();

  const inputStyle: React.CSSProperties = {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingLeft: 14,
    paddingRight: 14,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 16,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
    borderStyle: "solid",
  };

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
