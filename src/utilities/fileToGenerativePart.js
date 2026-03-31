function fileToGenerativePart(base64Str, mimeType) {
  return {
    inlineData: {
      data: base64Str,
      mimeType
    },
  };
}

export default fileToGenerativePart;