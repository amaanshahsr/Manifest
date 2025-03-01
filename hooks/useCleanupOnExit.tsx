import { useIsFocused } from "@react-navigation/native";
import { useEffect } from "react";

/**
 * Custom hook to execute a cleanup function when the screen is exited.
 * @param cleanupFn Function to run when the user leaves the screen.
 */
const useCleanupOnExit = (cleanUp: () => void) => {
  const isFocused = useIsFocused();

  useEffect(() => {
    if (!isFocused) {
      cleanUp(); // Run cleanup when screen loses focus
    }
  }, [isFocused, cleanUp]);
};

export default useCleanupOnExit;
