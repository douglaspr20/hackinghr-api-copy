function generateKeywords(str) {
  const strLower = str?.trim().toLowerCase() || "";
  const splitted = strLower.split(" ");
  const keywords = [strLower, ...splitted];

  for (let i = 0; i < strLower.length; i += 1) {
    for (let j = strLower.length; j > 2; j -= 1) {
      const keyword = strLower.substr(i, j);

      if (keyword.length > 2) {
        keywords.push(keyword);
      }
    }
  }

  return [...Array.from(new Set(keywords))].filter(Boolean);
}

module.exports = { generateKeywords };
