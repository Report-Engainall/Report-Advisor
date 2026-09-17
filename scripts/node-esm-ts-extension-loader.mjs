export async function resolve(specifier, context, nextResolve) {
  if ((specifier.startsWith('./') || specifier.startsWith('../') || specifier.startsWith('/')) && !/\.(?:[cm]?js|[cm]?ts|tsx|jsx|json)$/i.test(specifier)) {
    for (const extension of ['.ts', '.tsx', '.js', '.mjs']) {
      try {
        return await nextResolve(`${specifier}${extension}`, context);
      } catch {
        // Continue through the project-native extension candidates.
      }
    }
  }
  return nextResolve(specifier, context);
}
