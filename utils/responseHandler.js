export const successResponse = (res, data) => {
  const response = {
    errorStatus: false,
    data: data,
  };
  res.status(200).json(response);
};

export const errorResponse = (res, data) => {
  const response = {
    errorStatus: true,
    msg: data,
  };
  res.status(200).json(response);
};

export const errorParamResponse = (res, data) => {
  const response = {
    errorStatus: true,
    msg: data,
  };
  res.status(400).json(response);
};

export const errorTokenResponse = (res) => {
  const response = {
    errorStatus: true,
    msg: "Unauthorized Access",
  };
  res.status(401).json(response);
};
