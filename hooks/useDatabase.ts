import { useEffect, useState } from "react";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { db } from "@/db/client";
import migrations from "@/drizzle/migrations";
import { seedDatabase } from "@/db/seed";

export function useDatabase() {
  const { success, error } = useMigrations(db, migrations);
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    if (success) {
      seedDatabase().then(() => setSeeded(true));
    }
  }, [success]);

  return {
    isReady: success && seeded,
    error,
  };
}
