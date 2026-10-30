export const APP_BASE_PATH = "/user";

export function appPath(path: string = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (normalizedPath === "/") {
    return APP_BASE_PATH || "/";
  }

  if (
    APP_BASE_PATH &&
    (normalizedPath === APP_BASE_PATH ||
      normalizedPath.startsWith(`${APP_BASE_PATH}/`))
  ) {
    return normalizedPath;
  }

  return `${APP_BASE_PATH}${normalizedPath}`;
}

export function stripAppBasePath(pathname: string) {
  if (!APP_BASE_PATH) return pathname;
  if (pathname === APP_BASE_PATH) return "/";
  if (pathname.startsWith(`${APP_BASE_PATH}/`)) {
    return pathname.slice(APP_BASE_PATH.length) || "/";
  }
  return pathname;
}
