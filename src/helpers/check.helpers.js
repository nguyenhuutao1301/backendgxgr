function isIpBlocked(ip, blocked) {
  return blocked.some((rule) => {
    // Nếu rule là prefix (không đủ 4 block), thì check startsWith
    if (rule.split(".").length < 4) {
      return ip.startsWith(rule + ".");
    }
    // Nếu đủ 4 block thì check exact
    return ip === rule;
  });
}
function isSlugBlock(slug, blocked) {
  if (!slug) return false;
  return blocked.includes(slug);
}
export { isIpBlocked, isSlugBlock };
