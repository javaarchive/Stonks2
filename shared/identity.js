// based on https://www.netlify.com/blog/2018/03/29/jamstack-architecture-on-netlify-how-identity-and-functions-work-together/

class IdentityAPI {
    constructor(apiURL) {
      this.apiURL = apiURL;
    }
  
    headers(headers = {},token) {
      return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        ...headers
      };
    }

    setURL(url){
        this.apiURL = url;
    }
  
    request(path,token, options = {}) {
      const headers = this.headers(options.headers || {}, token);
      let response = await fetch(this.apiURL + path, { ...options, headers });

      const contentType = response.headers.get("Content-Type");
      if (contentType && contentType.toLowerCase().endsWith("json")) {
          return (await response.json());
      }
      return (await response.text());
    }
  }

  module.exports = {IdentityAPI};