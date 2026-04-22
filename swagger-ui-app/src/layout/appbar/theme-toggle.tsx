import { ButtonIcon } from "@/components/button-icon";
import { useTheme } from "@/components/theme";
import { IconMoon } from "@/icons/moon";
import { IconSun } from "@/icons/sun";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  const toggleTheme = () => {
    setTheme((prev) => prev === "light" ? "dark" : "light")
  }
  
  return (
    <ButtonIcon onClick={toggleTheme}>
      {theme === "dark" ? <IconMoon /> : <IconSun />}
    </ButtonIcon>
  );
}