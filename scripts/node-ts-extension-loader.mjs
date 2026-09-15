const RELATIVE = /^(?:\.\.?\/|\/)/;
const EXTENSIONS = ['.ts', '.tsx', '.js', '.mjs'];

export async function resolve(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context);
  } catch (error) {
    if (!RELATIVE.test(specifier) || error?.code !== 'ERR_MODULE_NOT_FOUND' || /\.[a-z0-9]+$/i.test(specifier)) {
      throw error;
    }
    for (const extension of EXTENSIONS) {
      try {
        return await nextResolve(`${specifier}${extension}`, context);
      } catch {
        // Continue to the next explicit source extension.
      }
    }
    throw error;
  }
}
