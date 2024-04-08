export function getCookie(name: string): string | undefined {
  const cookieDict: Record<string, string> = document.cookie
    .split(";")
    .map((x) => x.split("="))
    .reduce(
      (accum, current) => {
        if (current.length === 2 && current[0] && current[1]) {
          accum[current[0].trim()] = current[1].trim();
        }
        return accum;
      },
      {} as Record<string, string>,
    );

  return cookieDict[name];
}

export function setCookie(
  name: string,
  value: string,
  options: {
    path?: string;
    expires?: Date;
    sameSite?: "strict" | "lax" | "none";
    httpOnly?: boolean;
  } = {
    path: "/",
    sameSite: "lax",
    expires: undefined,
    httpOnly: false,
  },
) {
  let cookieText = `${name}=${value};`;

  if (options.path) {
    cookieText += ` Path=${options.path};`;
  }

  if (options.expires) {
    cookieText += ` Expires=${options.expires.toUTCString()};`;
  }

  if (options.sameSite) {
    cookieText += ` SameSite=${options.sameSite};`;
  }

  if (options.httpOnly) {
    cookieText += ` HttpOnly;`;
  }

  document.cookie = cookieText;
}
