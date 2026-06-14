import { useState } from "react";
import { Pressable, Text, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import { makeStyles } from "@/theme";

type Props = {
  value: Date;
  onChange: (date: Date) => void;
};

export function DatePicker({ value, onChange }: Props) {
  const [show, setShow] = useState(false);
  const styles = useStyles();

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

const useStyles = makeStyles((t) => ({
  button: {
    borderWidth: 1,
    borderColor: t.colors.border,
    borderRadius: t.radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: t.colors.surface,
  },
  text: {
    fontSize: 16,
    color: t.colors.text,
  },
}));
