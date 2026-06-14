import { Link, Stack } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@/theme";

export default function NotFoundScreen() {
  const { t } = useTranslation();
  const styles = useStyles();
  return (
    <>
      <Stack.Screen options={{ title: t("notFound.title") }} />
      <View style={styles.container}>
        <Text style={styles.title}>{t("notFound.message")}</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>{t("notFound.goHome")}</Text>
        </Link>
      </View>
    </>
  );
}

const useStyles = makeStyles((t) => ({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: t.colors.background,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: t.colors.text,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 14,
    color: t.colors.accent,
  },
}));
