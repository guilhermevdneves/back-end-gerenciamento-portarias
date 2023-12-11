const getCommonValues = (requestParams = [], allowedParams = []) => allowedParams.filter((param) => requestParams.includes(param));

module.exports = {
  getCommonValues,
};
