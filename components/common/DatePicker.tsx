import { useState } from "react";
import { Pressable, Text, Platform, StyleSheet } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import { colors } from "@/lib/constants";

type Props = {
  value: Date;
  onChange: (date: Date) => void;
};

export function DatePicker({ value, onChange }: Props) {
  const [show, setShow] = useState(false);

  return (
    <>
      <Pressable style={styles.button} onPress={() => setShow(true)}>
        <Text style={styles.text}>{format(value, "MMM d, yyyy")}</Text>
      </Pressable>
      {show && (
        <DateTimePicker
          value={value}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(_, date) => {
            setShow(Platform.OS === "ios");
            if (date) onChange(date);
          }}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.surface,
  },
  text: {
    fontSize: 16,
    color: colors.text,
  },
});
