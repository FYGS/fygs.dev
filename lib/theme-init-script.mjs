/**
 * The script that applies the stored theme before the first paint, so a visitor who chose the light theme never sees a
 * dark flash. It is an inline script (it must run before the page is drawn), which a strict Content-Security-Policy only
 * allows with a nonce or a hash. The page is also rendered statically, where no nonce exists: it is allowed by its hash.
 *
 * It replaces the script next-themes writes by itself, whose text depends on how the bundler minifies the library (its
 * hash changed from one build to the next). This text is a constant, so its hash is stable: the unit test
 * tests/unit/theme-init-script.test.tsx recomputes it and fails with the new value when the text is edited.
 *
 * Same behaviour as next-themes for this site: class attribute, stored choice (light, dark, system) or the default, the
 * system choice resolved with prefers-color-scheme, `color-scheme` set on the root element.
 */

export const THEME_STORAGE_KEY = "fygs-theme";
export const DEFAULT_THEME = "dark";

export const THEME_INIT_SCRIPT =
  `(function(){try{var d=document.documentElement,t=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)})||${JSON.stringify(DEFAULT_THEME)};` +
  `if(t==="system")t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";` +
  `if(t!=="light"&&t!=="dark")t=${JSON.stringify(DEFAULT_THEME)};` +
  `d.classList.remove("light","dark");d.classList.add(t);d.style.colorScheme=t}catch(e){}})()`;

/** SHA-256 (base64) of THEME_INIT_SCRIPT, as the Content-Security-Policy spells it. Verified by the unit test. */
export const THEME_SCRIPT_SHA256 = "hKvKAmGTJyUFJmezbTtRvLcXsstWJFs9NAo5XTOyD60=";
