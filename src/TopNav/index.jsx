import { useState, useLayoutEffect } from "react";
import darkLogo from "../assets/dark.svg";
import lightLogo from "../assets/light.svg";
import ltrLogo from "../assets/direction-ltr.svg";
import rtlLogo from "../assets/direction-rtl.svg";

import styles from "./topnav.module.css";

export function TopNav() {
  const [themeChecked, setThemeChecked] = useState(
    localStorage.getItem("theme") === "dark" ? true : false
  );
  const [rtlChecked, setRtlChecked] = useState(
    localStorage.getItem("dir") === "rtl" ? true : false
  );

  useLayoutEffect(() => {
    if (localStorage.getItem("theme") === "dark") {
      document.getElementsByTagName("HTML")[0].classList.add("dark");
    } else {
      document.getElementsByTagName("HTML")[0].classList.remove("dark");
    }
    if (localStorage.getItem("dir") === "rtl") {
      document.getElementsByTagName("HTML")[0].setAttribute("dir", "rtl");
    } else {
      document.getElementsByTagName("HTML")[0].setAttribute("dir", "ltr");
    }
  }, []);

  const toggleThemeChange = () => {
    if (!themeChecked) {
      localStorage.setItem("theme", "dark");
      document.getElementsByTagName("HTML")[0].classList.add("dark");
      setThemeChecked(true);
    } else {
      localStorage.setItem("theme", "light");
      document.getElementsByTagName("HTML")[0].classList.remove("dark");
      setThemeChecked(false);
    }
  };

  const toggleRTLChange = () => {
    if (!rtlChecked) {
      localStorage.setItem("dir", "rtl");
      document.getElementsByTagName("HTML")[0].setAttribute("dir", "rtl");
      setRtlChecked(true);
    } else {
      localStorage.setItem("dir", "ltr");
      document.getElementsByTagName("HTML")[0].setAttribute("dir", "ltr");
      setRtlChecked(false);
    }
  };

  return (
    <header className={styles.topnavContainer}>
      <h4 className={styles.title}>Page Builder</h4>
      <div className={styles.rightContainer}>
        <span className={styles.cursor} onClick={toggleThemeChange}>
          {themeChecked ? (
            <img src={darkLogo} className={styles.img} alt="logo dark" />
          ) : (
            <img src={lightLogo} className={styles.img} alt="logo light" />
          )}
        </span>
        <span className={styles.cursor} onClick={toggleRTLChange}>
          {rtlChecked ? (
            <img src={rtlLogo} className={styles.img} alt="logo rtl" />
          ) : (
            <img src={ltrLogo} className={styles.img} alt="logo ltr" />
          )}
        </span>
      </div>
    </header>
  );
}
