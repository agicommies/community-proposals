import { useEffect, useMemo, useState } from "react";

import {
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
} from "@heroicons/react/20/solid";

import {
  DARK_THEME_CLASSNAME,
  LIGHT_THEME_CLASSNAME,
  SYSTEM_THEME_CLASSNAME,
  getCurrentTheme,
  isDarkSystemTheme,
  setTheme,
  type TThemes,
} from "~/styles/theming";

interface ThemeOptionProps {
  text: string;
  theme: TThemes;
  currentTheme: TThemes;
  icon: React.ReactNode;
  handleThemeChange: (theme: TThemes) => void;
}

const ThemeOption = ({
  text,
  icon,
  theme,
  currentTheme,
  handleThemeChange,
}: ThemeOptionProps) => {
  return (
    <div
      className={`${
        currentTheme === theme && "bg-gray-100 dark:bg-light-dark"
      } flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-black hover:bg-gray-200 dark:text-white dark:hover:bg-light-dark`}
      onClick={() => handleThemeChange(theme)}
    >
      <span>{icon}</span>
      <span>{text}</span>
    </div>
  );
};

export const DarkModeToggle = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const defaultTheme = useMemo(getCurrentTheme, []) as TThemes;
  const [currentTheme, setCurrentTheme] = useState<TThemes>(defaultTheme);

  const isDarkTheme = currentTheme === DARK_THEME_CLASSNAME;
  const isSystemTheme = currentTheme === SYSTEM_THEME_CLASSNAME;

  const Icon = useMemo(() => {
    const shouldUseSystemDarkTheme = isSystemTheme && isDarkSystemTheme();

    if (isDarkTheme || shouldUseSystemDarkTheme) {
      return <MoonIcon className={"h-6 dark:fill-white "} />;
    }

    return <SunIcon className={"h-6 dark:fill-white "} />;
  }, [isSystemTheme, isDarkTheme]);

  const handleThemeChange = (theme: TThemes) => {
    setCurrentTheme(theme);
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    setTheme(currentTheme);
  }, [currentTheme]);

  const themes = [
    {
      text: "Light",
      theme: LIGHT_THEME_CLASSNAME,
      icon: <SunIcon className={"h-6 dark:fill-white"} />,
    },
    {
      text: "Dark",
      theme: DARK_THEME_CLASSNAME,
      icon: <MoonIcon className={"h-6 dark:fill-white"} />,
    },
    {
      text: "System",
      theme: SYSTEM_THEME_CLASSNAME,
      icon: <ComputerDesktopIcon className={"h-6 dark:fill-white"} />,
    },
  ];

  return (
    <>
      <button
        type="button"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="inline-flex items-center justify-center rounded-xl p-1 dark:fill-white"
      >
        {Icon}
      </button>
      {isDropdownOpen && (
        <div className="absolute right-0 top-10 w-fit origin-top-right rounded-xl bg-white md:right-0 md:top-12 md:mt-4 dark:bg-dark">
          <div
            role="menu"
            className="py-1"
            aria-orientation="vertical"
            aria-labelledby="options-menu"
          >
            {themes.map((theme) => (
              <ThemeOption
                key={theme.text}
                text={theme.text}
                theme={theme.theme as TThemes}
                icon={theme.icon}
                currentTheme={currentTheme}
                handleThemeChange={handleThemeChange}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
};
