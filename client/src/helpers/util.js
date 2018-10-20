/**
 *
 * @param {string} host - The host URL
 * @param {object} query - Query parameters in Object form, in { parameter : value } pairs
 */

function assembleURI(host, query) {
  if (host.slice(-1) !== "?") {
    host += "?";
  }

  let queryParam = Object.entries(query)
    .map(arr => {
      const param = arr[0];
      const value = arr[1];
      return `${param}=${value}`;
    })
    .join("&");

  return host + queryParam;
}

module.exports = { assembleURI };
