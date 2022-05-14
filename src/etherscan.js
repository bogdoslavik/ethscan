const Axios = require("axios");

exports.API = (apiKey, apiUrl) => {
  if (!apiUrl) apiUrl = "https://api.etherscan.io";
  apiUrl = `${apiUrl}/api`;
  const axios = new Axios.Axios({ baseURL: apiUrl });

  const get = (module, action, address) =>
    axios
      .get(
        `?module=${module}&action=${action}&address=${address}&apikey=${apiKey}`
      )
      .then(parser);

  const parser = (response) => {
    const data = JSON.parse(response.data);
    if (!data.result) throw data.message;
    const result = data.result;
    if (typeof result === "string") return JSON.parse(result);
    return result;
  };

  const codeParser = (result) => {
    const data = result[0].SourceCode.slice(1, -1);
    if (data.startsWith('/ File:')) {
      const lines = data.split('\n');
      lines.splice(0, 1);
      const source = lines.join('\n');
      return {sources:{'all-in-one.sol':{content:source}}}
    } else {
      return JSON.parse(data);
    }
  };
  return {
    getAbi: (address) => get("contract", "getabi", address),
    getCode: (address) =>
      get("contract", "getsourcecode", address).then(codeParser),
  };
};
