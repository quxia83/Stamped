import { Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

type Props = {
  value: Date;
  onChange: (date: Date) => void;
  minimumDate?: Date;
  maximumDate?: Date;
};

export function NativeDatePicker({ value, onChange, minimumDate, maximumDate }: Props) {
  return (
    <DateTimePicker
      value={value}
      mode="date"
      minimumDate={minimumDate}
      maximumDate={maximumDate}
      display={Platform.OS === "ios" ? "spinner" : "default"}
      onChange={(_, date) => {
        if (date) onChange(date);
      }}
    />
  );
}
