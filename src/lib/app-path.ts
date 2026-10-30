export const APP_BASE_PATH = "";

export function appPath(path: string = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return normalizedPath;
}

export function stripAppBasePath(pathname: string) {
  return pathname;
}
