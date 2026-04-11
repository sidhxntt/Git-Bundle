const isHotspotFile = (path: string, name: string): boolean => {
  const hotspotPatterns = [
    /^src\/app\./i,
    /^src\/main\./i,
    /^src\/index\./i,
    /^app\./i,
    /^main\./i,
    /^index\./i,
    /package\.json$/i,
    /webpack\.config\./i,
    /vite\.config\./i,
    /tailwind\.config\./i,
    /\.env/i,
    /^src\/components\/app/i,
    /router/i,
    /routes/i,
  ];

  return hotspotPatterns.some(
    (pattern) => pattern.test(path) || pattern.test(name)
  );
};
export default isHotspotFile;
